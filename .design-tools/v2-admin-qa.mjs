// admin + fundraising card QA. Headless Edge via the project-local playwright.
// No live API traffic: every Worker call is intercepted. Nothing is submitted.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(path.resolve(process.cwd(), 'package.json'));
const { chromium } = require('playwright');

const ROOT = path.resolve(process.cwd(), '..'); // .design-tools -> repo root
const OUT = path.join(process.cwd(), 'output', 'v2-admin-qa');
fs.mkdirSync(OUT, { recursive: true });

const server = spawn('python3', ['-m', 'http.server', '8137', '--directory', ROOT, '--bind', '127.0.0.1'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok: !!ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
};

const hex32 = 'ab'.repeat(16);
const donations = [
  { orderCode: 482917364, amount: 100000, displayName: 'Lan', message: 'Chúc POET', anonymous: false, status: 'success', hidden: false, createdAt: '2026-10-20T03:00:00Z', paidAt: '2026-10-20T03:05:00Z' },
  { orderCode: 482917365, amount: 50000, displayName: 'Bình', message: '', anonymous: true, status: 'success', hidden: true, createdAt: '2026-10-19T03:00:00Z', paidAt: '2026-10-19T03:05:00Z' },
  { orderCode: 482917368, amount: 200000, displayName: 'Gia', message: 'Ủng hộ', anonymous: false, status: 'success', hidden: false, payosReference: 'manual:admin|Mã tham chiếu 123', payosDescription: 'manual:admin|Mã tham chiếu 123', createdAt: '2026-10-18T03:00:00Z', paidAt: '2026-10-18T03:05:00Z' },
  { orderCode: 482917366, amount: 20000, displayName: 'Cường', message: '', anonymous: false, status: 'pending', hidden: false, createdAt: new Date(Date.now() - 10 * 60000).toISOString(), paidAt: null },
  { orderCode: 482917367, amount: 20000, displayName: 'Dũng', message: '', anonymous: false, status: 'pending', hidden: false, createdAt: new Date(Date.now() - 40 * 60000).toISOString(), paidAt: null },
];
const deals = [
  { id: hex32, businessName: 'Công ty Bách Hoá Xanh', contactName: 'Lan', contactEmail: 'lan@bhx.vn', contactPhone: '0900000000', taxCode: '03123456', amount: 2000000, status: 'received', note: 'Đã ký hợp đồng', createdAt: '2026-10-21T01:00:00Z', updatedAt: '2026-10-22T01:00:00Z', createdBy: 'admin' },
  { id: 'cd'.repeat(16), businessName: 'Nhà phân phối Đông', contactName: '', contactEmail: '', contactPhone: '', taxCode: '', amount: 500000, status: 'pledged', note: '', createdAt: '2026-10-21T02:00:00Z', updatedAt: '2026-10-21T02:00:00Z', createdBy: 'admin' },
  { id: 'be'.repeat(16), businessName: 'Công ty Cẩm La', contactName: 'Hà', contactEmail: 'ha@camla.vn', contactPhone: '', taxCode: '', amount: 1500000, status: 'received', note: '', createdAt: '2026-10-21T03:00:00Z', updatedAt: '2026-10-21T03:00:00Z', createdBy: 'admin' },
];
let dealsState = structuredClone(deals);
const calls = [];

function adminRoutes(page, { failPatchOnce = false } = {}) {
  let patchFailed = false;
  return page.route('**poet-donations.poetnpo.workers.dev/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname, m = req.method();
    calls.push(`${m} ${p}${url.search}`);
    const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (p === '/api/admin/me') return json({ username: 'admin' });
    if (p === '/api/admin/settings' && m === 'GET') return json({ donationsEnabled: true });
    if (p === '/api/admin/settings' && m === 'POST') return json({ ok: true, donationsEnabled: JSON.parse(req.postData()).donationsEnabled });
    if (p === '/api/admin/donations' && m === 'GET') {
      // Matches listDonationsForAdmin: only success rows are hidden-filtered.
      const hidden = url.searchParams.get('hidden') || 'all';
      const rows = hidden === 'all'
        ? donations
        : donations.filter((d) => d.status === 'success' && Boolean(d.hidden) === (hidden === 'hidden'));
      return json({ donations: rows, totalReceived: 350000, receivedCount: 3 });
    }
    if (/^\/api\/admin\/donations\/\d+\/(hide|show)$/.test(p)) {
      const code = Number(p.split('/')[4]);
      const d = donations.find((x) => x.orderCode === code);
      if (d) d.hidden = p.endsWith('/hide');
      return json({ ok: true });
    }
    if (p === '/api/admin/business-deals' && m === 'GET') {
      const received = dealsState.filter((d) => d.status === 'received');
      return json({ deals: dealsState, receivedAmount: received.reduce((s, d) => s + d.amount, 0), receivedCount: received.length });
    }
    if (p === '/api/admin/business-deals' && m === 'POST') {
      const body = JSON.parse(req.postData());
      dealsState.unshift({ id: 'ff'.repeat(16), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin', ...body });
      return json(dealsState[0], 201);
    }
    if (/^\/api\/admin\/business-deals\/[0-9a-f]+$/.test(p) && m === 'PATCH') {
      if (failPatchOnce && !patchFailed) { patchFailed = true; return json({ error: 'Máy chủ bận, thử lại nhé.' }, 500); }
      const id = p.split('/')[4];
      const body = JSON.parse(req.postData());
      const deal = dealsState.find((d) => d.id === id);
      if (!deal) return json({ error: 'Không tìm thấy khoản doanh nghiệp.' }, 404);
      Object.assign(deal, body, { updatedAt: new Date().toISOString() });
      return json(deal);
    }
    if (/^\/api\/admin\/business-deals\/[0-9a-f]+$/.test(p) && m === 'DELETE') {
      const id = p.split('/')[4];
      dealsState = dealsState.filter((d) => d.id !== id);
      return json({ ok: true });
    }
    return json({ error: 'Không tìm thấy.' }, 404);
  });
}

function fundraisingRoute(page, payload) {
  return page.route('**poet-donations.poetnpo.workers.dev/api/donations*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) }));
}
const oldShape = { donations: [], totalAmount: 555000, totalCount: 3 };
const newShape = {
  donations: [], totalAmount: 555000, totalCount: 3,
  fundraising: { individualAmount: 555000, individualCount: 3, businessAmount: 2000000, businessCount: 4, raisedAmount: 2555000 },
};

const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

try {
  // ---------- A. Logged-out admin ----------
  for (const [label, width, height] of [['desktop', 1280, 900], ['narrow', 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:8137/admin/');
    await page.waitForTimeout(300);
    check(`login form visible (${label})`, await page.locator('#login-form').isVisible());
    check(`no horizontal overflow (${label})`, (await overflow(page)) <= 0, `delta=${await overflow(page)}`);
    check(`first-run hint (${label})`, (await page.locator('.admin-hint').first().innerText()).includes('admin / admin'));
    await page.screenshot({ path: path.join(OUT, `admin-login-${label}.png`), fullPage: true });

    if (label === 'desktop') {
      // Empty submit -> Vietnamese error.
      await page.getByRole('button', { name: 'Đăng nhập' }).click();
      check('empty login shows Vietnamese error', await page.locator('#login-error').innerText() === 'Nhập tên đăng nhập và mật khẩu.');
      // Keyboard: tab through, open the recovery disclosure, focus outline is the 3px site style.
      await page.keyboard.press('Tab');
      const outlined = await page.evaluate(() => {
        const a = document.activeElement;
        const s = getComputedStyle(a);
        return { tag: a.id || a.tagName, w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
      });
      check('focus outline 3px on first tab stop', outlined.style === 'solid' && outlined.w === '3px', JSON.stringify(outlined));
      await page.locator('.admin-recover summary').focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
      check('recovery disclosure opens via keyboard', await page.locator('#recover-token').isVisible());
      await page.locator('#recover-submit').click();
      check('empty recovery shows Vietnamese error', await page.locator('#recover-error').innerText() === 'Nhập mã khôi phục ADMIN_TOKEN.');
    }
    await ctx.close();
  }

  // ---------- B. Home card, old Worker shape (no fundraising object) ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await fundraisingRoute(page, oldShape);
    await page.goto('http://127.0.0.1:8137/');
    await page.waitForTimeout(800);
    const card = page.locator('[data-fund-animate]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2200);
    const state = await page.evaluate(() => {
      const c = document.querySelector('[data-fund-animate]');
      return {
        raised: c.dataset.raised, provisional: c.dataset.provisional ?? null,
        counts: [...c.querySelectorAll('[data-fund-count]')].map((s) => s.dataset.fundCount),
        sr: [...c.querySelectorAll('.supporter-stats .sr-only')].map((s) => s.textContent),
        noteHidden: c.querySelector('.fund-preview-note')?.hidden ?? null,
        noteText: c.querySelector('.fund-preview-note')?.textContent ?? null,
        goal: c.querySelector('[data-fund-target]')?.textContent,
      };
    });
    check('old shape: amount follows totalAmount', state.raised === '555000', state.raised);
    check('old shape: counts stay 248/14', state.counts.join(',') === '248,14', state.counts.join(','));
    check('old shape: preview note stays', state.noteHidden === false && state.noteText === 'Số liệu minh họa');
    check('goal stays 121.950.000', state.goal === '121.950.000', state.goal);
    await page.screenshot({ path: path.join(OUT, 'home-old-shape.png') });
    await ctx.close();
  }

  // ---------- C. Home card, new fundraising object ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await fundraisingRoute(page, newShape);
    await page.goto('http://127.0.0.1:8137/');
    await page.waitForTimeout(800);
    const card = page.locator('[data-fund-animate]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2600);
    const state = await page.evaluate(() => {
      const c = document.querySelector('[data-fund-animate]');
      const described = c.querySelector('[aria-describedby]');
      return {
        raised: c.dataset.raised, provisional: c.dataset.provisional ?? null,
        kinds: [...c.querySelectorAll('[data-fund-count]')].map((s) => `${s.dataset.fundKind}:${s.dataset.fundCount}:${s.textContent}`),
        sr: [...c.querySelectorAll('.supporter-stats .sr-only')].map((s) => s.textContent),
        noteDisplay: c.querySelector('.fund-preview-note') ? getComputedStyle(c.querySelector('.fund-preview-note')).display : 'absent',
        describedby: described ? described.getAttribute('aria-describedby') : null,
        remaining: c.querySelector('[data-fund-remaining]')?.textContent,
      };
    });
    check('new shape: raised = 2.555.000', state.raised === '2555000', state.raised);
    check('new shape: kinds written (individual:3, business:4)', /individual:3:3/.test(state.kinds.join(' ')) && /business:4:4/.test(state.kinds.join(' ')), state.kinds.join(' | '));
    check('new shape: sr-only updated', state.sr.join(' | ') === '3 người | 4 đối tác', state.sr.join(' | '));
    check('new shape: provisional removed', state.provisional === null);
    check('new shape: preview note hidden', state.noteDisplay === 'none' || state.noteDisplay === 'absent', state.noteDisplay);
    check('new shape: aria-describedby dropped', state.describedby === null || !String(state.describedby).includes('home-fund-preview-note'), String(state.describedby));
    check('new shape: remaining recomputed', state.remaining.includes('119.395.000'), state.remaining);
    await page.screenshot({ path: path.join(OUT, 'home-new-shape.png') });

    // ?fundraisingPreview wins on localhost and skips the live write.
    await page.goto('http://127.0.0.1:8137/?fundraisingPreview=99999999');
    await page.waitForTimeout(2000);
    const preview = await page.evaluate(() => {
      const c = document.querySelector('[data-fund-animate]');
      return { raised: c.dataset.raised, local: c.dataset.localPreview, counts: [...c.querySelectorAll('[data-fund-count]')].map((s) => s.dataset.fundCount) };
    });
    check('preview override wins for amount', preview.raised === '99999999' && preview.local === 'true', preview.raised);
    check('preview override skips live counts', preview.counts.join(',') === '248,14', preview.counts.join(','));

    // prefers-reduced-motion: final values render, no motion.
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const page2 = await ctx2.newPage();
    await fundraisingRoute(page2, newShape);
    await page2.goto('http://127.0.0.1:8137/');
    await page2.waitForTimeout(1200);
    const reduced = await page2.evaluate(() => {
      const c = document.querySelector('[data-fund-animate]');
      return {
        counts: [...c.querySelectorAll('[data-fund-count]')].map((s) => s.textContent),
        raised: c.querySelector('[data-fund-raised]')?.textContent,
      };
    });
    check('reduced motion: final values render', reduced.counts.join(',') === '3,4' && reduced.raised === '2.555.000', JSON.stringify(reduced));
    await page2.screenshot({ path: path.join(OUT, 'home-reduced-motion.png') });
    await ctx2.close();
    await ctx.close();
  }

  // ---------- D. Dự án card ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await fundraisingRoute(page, newShape);
    await page.goto('http://127.0.0.1:8137/du-an/');
    await page.waitForTimeout(800);
    await page.locator('[data-fund-animate]').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2600);
    const state = await page.evaluate(() => {
      const c = document.querySelector('[data-fund-animate]');
      return {
        raised: c.dataset.raised,
        kinds: [...c.querySelectorAll('[data-fund-count]')].map((s) => `${s.dataset.fundKind}:${s.dataset.fundCount}`),
        timeline: Boolean(c.querySelector('.fund-timeline')),
      };
    });
    check('du-an: raised 2.555.000', state.raised === '2555000', state.raised);
    check('du-an: kinds written', state.kinds.join(' ') === 'individual:3 business:4', state.kinds.join(' '));
    check('du-an: timeline still present', state.timeline);
    await page.screenshot({ path: path.join(OUT, 'du-an-new-shape.png') });
    await ctx.close();
  }

  // ---------- E. Logged-in admin, mocked API ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await adminRoutes(page);
    await page.addInitScript(() => {
      sessionStorage.setItem('poetAdminToken', 'test-token');
      sessionStorage.setItem('poetAdminUser', 'admin');
    });
    const dialogs = [];
    page.on('dialog', async (d) => { dialogs.push(d.message()); await d.accept(); });
    await page.goto('http://127.0.0.1:8137/admin/');
    await page.waitForTimeout(500);

    check('dashboard visible when session token exists', await page.locator('#dashboard').isVisible());
    check('top bar shows user', (await page.locator('#current-user').innerText()) === 'admin');
    check('no donate button in the admin shell', (await page.locator('#dashboard [data-donate]').count()) === 0);

    // Summary line
    const summary = await page.locator('#fund-summary').innerText();
    check('summary: individual 350.000 đ', summary.includes('350.000 đ'), summary);
    check('summary: business 3.500.000 đ', summary.includes('3.500.000 đ'));
    check('summary: total 3.850.000 đ', summary.includes('3.850.000 đ'));
    check('summary: goal 121.950.000 đ', summary.includes('121.950.000 đ'));

    // Individual table
    check('expired chip shows hết hạn', (await page.locator('#history-body').innerText()).includes('hết hạn'));
    check('manual tag present', (await page.locator('#history-body .admin-tag').count()) >= 1);
    const totals = await page.locator('#individual-totals').innerText();
    check('totals: server received 350.000 đ (3 khoản)', totals.includes('350.000 đ') && totals.includes('3 khoản'), totals);
    check('totals: filtered view present', totals.includes('Đang xem'));
    // Status filter is client-side
    await page.selectOption('#status-filter', 'success');
    const successRows = await page.locator('#history-body tr').count();
    check('status filter narrows to success rows', successRows === 3, String(successRows));
    await page.selectOption('#status-filter', '');
    // Hidden filter refetches (server-side)
    await page.selectOption('#hidden-filter', 'hidden');
    await page.waitForTimeout(400);
    const hiddenRows = await page.locator('#history-body tr').count();
    check('hidden filter refetches, 1 hidden row', hiddenRows === 1, String(hiddenRows));
    await page.selectOption('#hidden-filter', 'all');
    await page.waitForTimeout(400);
    // Hide/show action
    await page.getByRole('button', { name: 'Ẩn lời nhắn' }).first().click();
    await page.waitForTimeout(400);
    check('hide action refetched list', calls.some((c) => c.startsWith('POST /api/admin/donations/482917364/hide')));
    // Search
    await page.fill('#search-input', 'manual');
    await page.waitForTimeout(200);
    check('search narrows rows', (await page.locator('#history-body tr').count()) === 1);
    await page.fill('#search-input', '');
    // Excel export (individual)
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Xuất Excel' }).first().click()]);
    check('individual Excel downloads', (await download.suggestedFilename()).startsWith('poet-donations-'), await download.suggestedFilename());

    // Subtabs + hash
    await page.getByRole('tab', { name: 'Doanh nghiệp' }).click();
    check('hash set to #doanh-nghiep', await page.evaluate(() => location.hash === '#doanh-nghiep'));
    check('business rows render', (await page.locator('#business-body tr').count()) === 3);
    check('business summary shows received', (await page.locator('#business-summary').innerText()).includes('3.500.000 đ'));
    await page.reload();
    await page.waitForTimeout(500);
    check('hash restores doanh-nghiep subtab after reload', await page.getByRole('tabpanel', { name: /doanh/i }).isVisible() || await page.locator('#doanh-nghiep').isVisible());
    check('hash restores same panel after reload', await page.evaluate(() => document.getElementById('doanh-nghiep') && !document.getElementById('doanh-nghiep').hidden));

    // Status select: pledged -> cancelled needs confirm; PATCH carries {status} only
    dialogs.length = 0;
    await page.locator('#business-body .admin-status-select').nth(1).selectOption('cancelled');
    await page.waitForTimeout(400);
    check('pledged->cancelled asks confirm', dialogs.length === 1 && dialogs[0].includes('Nhà phân phối Đông'), JSON.stringify(dialogs));
    const patchCall = calls.find((c) => c.startsWith('PATCH /api/admin/business-deals/cd'));
    check('PATCH sent', Boolean(patchCall), patchCall || 'none');
    await ctx.close();

    // Status revert on failure
    const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page3 = await ctx3.newPage();
    const patchBodies = [];
    await adminRoutes(page3, { failPatchOnce: true });
    // wrap fetch to record PATCH bodies
    await page3.addInitScript(() => {
      sessionStorage.setItem('poetAdminToken', 'test-token');
      sessionStorage.setItem('poetAdminUser', 'admin');
      const orig = window.fetch;
      window.fetch = (...args) => {
        const [res, init] = args;
        const url = typeof res === 'string' ? res : res.url;
        if (init && init.method === 'PATCH') window.__patchBodies = (window.__patchBodies || []).concat([init.body]);
        return orig(...args);
      };
    });
    const dialogs3 = [];
    page3.on('dialog', async (d) => { dialogs3.push(d.message()); await d.accept(); });
    await page3.goto('http://127.0.0.1:8137/admin/#doanh-nghiep');
    await page3.waitForTimeout(500);
    const selects = page3.locator('#business-body .admin-status-select');
    await selects.nth(0).selectOption('pledged'); // received -> pledged, confirm + fail
    await page3.waitForTimeout(400);
    check('failed PATCH reverts select to received', await selects.nth(0).inputValue() === 'received');
    check('failed PATCH shows error in panel status line', (await page3.locator('#business-summary').innerText()).includes('Máy chủ bận'));
    check('PATCH body is status only', (await page3.evaluate(() => window.__patchBodies)).join('|') === '{"status":"pledged"}');
    check('received->pledged asked confirm', dialogs3.length === 1 && dialogs3[0].includes('rời') === false && dialogs3[0].includes('tổng công khai'), JSON.stringify(dialogs3));
    // received -> cancelled confirm mentions leaving the public total
    await selects.nth(0).selectOption('cancelled');
    await page3.waitForTimeout(300);
    check('received->cancelled confirm mentions money leaving', dialogs3.at(-1).includes('tổng công khai'), dialogs3.at(-1));
    // Delete a still-received deal: confirm names the business + amount leaves public total
    const camlaRow = page3.locator('#business-body tr').filter({ hasText: 'Cẩm La' });
    await camlaRow.getByRole('button', { name: 'Xoá' }).click();
    check('delete confirm names business and amount', /Cẩm La/.test(dialogs3.at(-1)) && /1\.500\.000 đ/.test(dialogs3.at(-1)), dialogs3.at(-1));
    await page3.waitForTimeout(400);
    check('delete refetches; row removed', !(await page3.locator('#business-body').innerText()).includes('Cẩm La'));
    // Empty state once the last deal is removed
    while ((await page3.getByRole('button', { name: 'Xoá' }).count()) > 0) {
      await page3.getByRole('button', { name: 'Xoá' }).first().click();
      await page3.waitForTimeout(400);
    }
    check('empty state when last removed', (await page3.locator('#business-body').innerText()).includes('Chưa có khoản doanh nghiệp.'));
    // Add dialog
    await page3.getByRole('button', { name: 'Thêm doanh nghiệp' }).click();
    check('dialog opens with received default', await page3.locator('#business-status').inputValue() === 'received');
    await page3.locator('#business-submit').click();
    check('dialog empty submit shows Vietnamese error', await page3.locator('#business-error').innerText() === 'Nhập tên doanh nghiệp.');
    await page3.locator('#business-name').fill('Công ty QA');
    await page3.locator('#business-amount').fill('12345678');
    await page3.getByRole('button', { name: 'Lưu', exact: true }).click();
    await page3.waitForTimeout(400);
    check('created deal appears', (await page3.locator('#business-body').innerText()).includes('Công ty QA'));
    // password panel
    await page3.getByRole('button', { name: 'Mật khẩu' }).click();
    check('hash #mat-khau', await page3.evaluate(() => location.hash === '#mat-khau'));
    await page3.locator('#password-submit').click();
    check('empty password submit error', await page3.locator('#password-error').innerText() === 'Nhập mật khẩu hiện tại.');
    await page3.fill('#current-password', 'old-pass-1');
    await page3.fill('#new-password', 'abc');
    await page3.fill('#confirm-password', 'abd');
    await page3.locator('#password-submit').click();
    check('short password error', await page3.locator('#password-error').innerText() === 'Mật khẩu mới phải từ 4 đến 72 ký tự.');
    await ctx3.close();

    // ---------- F. Logged-in admin at 390px ----------
    const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageM = await ctxM.newPage();
    await adminRoutes(pageM);
    await pageM.addInitScript(() => {
      sessionStorage.setItem('poetAdminToken', 'test-token');
      sessionStorage.setItem('poetAdminUser', 'admin');
    });
    await pageM.goto('http://127.0.0.1:8137/admin/');
    await pageM.waitForTimeout(500);
    check('narrow: no horizontal overflow', (await overflow(pageM)) <= 0, `delta=${await overflow(pageM)}`);
    check('narrow: side items become a row', await pageM.evaluate(() => {
      const side = document.querySelector('.admin-side');
      const first = side.getBoundingClientRect();
      const btns = [...side.querySelectorAll('.admin-side-btn')].map((b) => b.getBoundingClientRect());
      return btns.length === 2 && btns[0].top < first.bottom && Math.abs(btns[0].top - btns[1].top) < 2 && btns[1].left > btns[0].right;
    }));
    check('narrow: stacked cards replace the table', await pageM.locator('#history-cards').isVisible() && !(await pageM.locator('#history-table').isVisible()));
    check('narrow: Chi tiết details present', (await pageM.locator('#history-cards details summary').allInnerTexts()).every((t) => t.includes('Chi tiết')));
    await pageM.locator('#history-cards details').first().locator('summary').click();
    check('narrow: Chi tiết opens', await pageM.locator('#history-cards details').first().locator('dl').isVisible());
    check('narrow: card block has code, name, amount, status', await pageM.evaluate(() => {
      const card = document.querySelector('.admin-card-row');
      return Boolean(card.querySelector('.admin-card-row-code') && card.querySelector('.admin-card-row-name') && card.querySelector('.admin-card-row-amount') && card.querySelector('.admin-card-row-status'));
    }));
    await pageM.screenshot({ path: path.join(OUT, 'admin-dashboard-narrow.png'), fullPage: true });
    await ctxM.close();
    const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pageD = await ctxD.newPage();
    await adminRoutes(pageD);
    await pageD.addInitScript(() => {
      sessionStorage.setItem('poetAdminToken', 'test-token');
      sessionStorage.setItem('poetAdminUser', 'admin');
    });
    await pageD.goto('http://127.0.0.1:8137/admin/');
    await pageD.waitForTimeout(500);
    await pageD.screenshot({ path: path.join(OUT, 'admin-dashboard-desktop.png'), fullPage: true });
    await ctxD.close();
  }
} catch (e) {
  check('script completed without crash', false, String(e && e.stack || e).slice(0, 400));
} finally {
  server.kill();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
fs.writeFileSync(path.join(OUT, 'qa-results.json'), JSON.stringify(results, null, 2) + '\n');
process.exit(failed.length ? 1 : 0);
