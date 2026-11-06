// The home count-up must wait for live numbers and never show the baked fixture.
// Run with the preview up: node tools/tests/fund-live-hold-browser.mjs [baseUrl]
// Needs Playwright from .design-tools (npm ci --prefix .design-tools --include=dev --ignore-scripts).
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const base = process.argv[2] || 'http://127.0.0.1:8766/';
const { chromium } = createRequire(new URL('../../.design-tools/package.json', import.meta.url))('playwright');
const cors = { 'Access-Control-Allow-Origin': '*' };
const browser = await chromium.launch({ channel: 'msedge', headless: true });

async function run(fail) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const slow = (route, reply) => setTimeout(() => (fail ? route.abort() : reply()).catch(() => {}), 1200);
  await context.route('**/api/donations*', (route) => slow(route, () => route.fulfill({
    status: 200, headers: cors, contentType: 'application/json',
    body: JSON.stringify({ donations: [], fundraising: { individualCount: 4, businessCount: 5 } }),
  })));
  await context.route('**docs.google.com/**', (route) => slow(route, () => route.fulfill({
    status: 200, headers: cors, contentType: 'text/csv', body: 'Tiến độ,9.72%\n',
  })));
  await page.goto(base + '?heroMotion=respect');
  await page.locator('[data-fund-animate]').first().scrollIntoViewIfNeeded();
  // Sample every painted frame while the numbers load and count.
  const seen = await page.evaluate(() => new Promise((resolve) => {
    const card = document.querySelector('[data-fund-animate]'), frames = new Set();
    const stop = performance.now() + 5000;
    const tick = () => {
      const shown = card.dataset.fundMotion === 'pending' ? '0' : [...card.querySelectorAll('[data-fund-count]')].map((n) => n.textContent).join('/');
      frames.add(`${shown}|${getComputedStyle(card.querySelector('.fund-status')).visibility}|${card.querySelector('.fund-status').textContent}`);
      if (performance.now() < stop) requestAnimationFrame(tick); else resolve([...frames]);
    };
    tick();
  }));
  const last = seen.at(-1);
  await context.close();
  return { seen, last };
}

const ok = await run(false);
assert.ok(ok.last.startsWith('4/5|visible|Đạt 9,72%'), ok.last);
for (const frame of ok.seen) {
  const [shown, visibility, badge] = frame.split('|');
  const [individual, business = 0] = shown.split('/').map(Number);
  assert.ok(individual <= 4 && business <= 5, `fixture leaked: ${frame}`);
  assert.ok(visibility === 'hidden' || badge === 'Đạt 9,72%', `old badge leaked: ${frame}`);
}
const down = await run(true);
assert.ok(down.last.startsWith('248/14|'), `fallback must still resolve: ${down.last}`);
await browser.close();
console.log(`ok: ${ok.seen.length} distinct frames, none above 4/5; offline falls back to ${down.last}`);
