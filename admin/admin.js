/* POET v2 admin. Same Worker API and session keys as /admin (poetAdminToken,
 * poetAdminUser in sessionStorage), restyled to the v2 editorial system and
 * extended with a manual business-deal ledger. Classic script; config.js has
 * already defined window.POET_API_BASE. */
(() => {
  const API_BASE = window.POET_API_BASE;
  const TOKEN_KEY = 'poetAdminToken';
  const USER_KEY = 'poetAdminUser';

  // Public campaign goal: a content fact owned by data/content.mjs
  // (season.targetAmount). This page only labels it — never edits it.
  const PUBLIC_GOAL = 121950000;

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  // ---- Shared session helpers ----

  function token() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function authHeaders(extra = {}) {
    return { ...extra, Authorization: `Bearer ${token()}` };
  }

  function money(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
  }

  function fmtTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('vi-VN');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('vi-VN');
  }

  // ---- Element refs ----

  const loginSection = document.getElementById('login-section');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginUser = document.getElementById('login-username');
  const loginPass = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const loginSubmit = document.getElementById('login-submit');
  const currentUserEl = document.getElementById('current-user');
  const logoutBtn = document.getElementById('logout-btn');

  const toggle = document.getElementById('donations-toggle');
  const toggleLabel = document.getElementById('donations-toggle-label');
  const settingsStatus = document.getElementById('settings-status');
  const businessCountForm = document.getElementById('business-count-form');
  const businessCountInput = document.getElementById('business-count');
  const businessCountSubmit = document.getElementById('business-count-submit');
  const businessCountStatus = document.getElementById('business-count-status');

  const sumIndividual = document.getElementById('sum-individual');
  const sumBusiness = document.getElementById('sum-business');
  const sumTotal = document.getElementById('sum-total');
  const sumGoal = document.getElementById('sum-goal');

  const subtabButtons = [...document.querySelectorAll('.admin-subtabs [role="tab"]')];
  const subpanels = [...document.querySelectorAll('.admin-subpanel')];

  const statusFilter = document.getElementById('status-filter');
  const hiddenFilter = document.getElementById('hidden-filter');
  const searchInput = document.getElementById('search-input');
  const reloadBtn = document.getElementById('reload-btn');
  const exportBtn = document.getElementById('export-btn');
  const historySummary = document.getElementById('history-summary');
  const historyBody = document.getElementById('history-body');
  const historyCards = document.getElementById('history-cards');
  const totalReceivedEl = document.getElementById('total-received');
  const totalReceivedCountEl = document.getElementById('total-received-count');
  const totalFilteredEl = document.getElementById('total-filtered');

  const businessStatusFilter = document.getElementById('business-status-filter');
  const businessSearch = document.getElementById('business-search');
  const businessReloadBtn = document.getElementById('business-reload-btn');
  const businessExportBtn = document.getElementById('business-export-btn');
  const businessAddBtn = document.getElementById('business-add-btn');
  const businessSummary = document.getElementById('business-summary');
  const businessBody = document.getElementById('business-body');

  const businessDialog = document.getElementById('business-dialog');
  const businessForm = document.getElementById('business-form');
  const businessError = document.getElementById('business-error');
  const businessSubmit = document.getElementById('business-submit');
  const businessCancelBtn = document.getElementById('business-cancel-btn');

  const passwordForm = document.getElementById('password-form');
  const currentPass = document.getElementById('current-password');
  const newPass = document.getElementById('new-password');
  const confirmPass = document.getElementById('confirm-password');
  const passwordError = document.getElementById('password-error');
  const passwordStatus = document.getElementById('password-status');
  const passwordSubmit = document.getElementById('password-submit');

  const recoverForm = document.getElementById('recover-form');
  const recoverUser = document.getElementById('recover-username');
  const recoverToken = document.getElementById('recover-token');
  const recoverPass = document.getElementById('recover-password');
  const recoverConfirm = document.getElementById('recover-confirm');
  const recoverError = document.getElementById('recover-error');
  const recoverStatus = document.getElementById('recover-status');
  const recoverSubmit = document.getElementById('recover-submit');

  const sideButtons = [...document.querySelectorAll('.admin-side-btn')];
  const panels = [...document.querySelectorAll('.admin-panel')];

  let allDonations = [];
  let allDeals = [];

  // Combined summary: individual figures come from the admin donation list,
  // business figures from the business-deal ledger. null = not loaded yet.
  const summaryState = { individual: null, individualCount: null, business: null, businessCount: null };

  // ---- Tabs (side list) and subtabs ----

  function switchTab(tab) {
    if (!tab) return;
    sideButtons.forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === tab;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  function selectSub(id, { update = false } = {}) {
    subtabButtons.forEach((btn) => {
      const active = btn.getAttribute('aria-controls') === id;
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
    });
    subpanels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
    if (update) history.replaceState(null, '', `#${id}`);
  }

  function applyHash() {
    let h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (h === 'mat-khau') {
      switchTab('mat-khau');
    } else if (h === 'ca-nhan' || h === 'doanh-nghiep') {
      switchTab('ung-ho');
      selectSub(h);
    }
  }

  sideButtons.forEach((btn) => btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
    history.replaceState(null, '', `#${btn.dataset.tab}`);
  }));

  subtabButtons.forEach((btn) => btn.addEventListener('click', () => selectSub(btn.getAttribute('aria-controls'), { update: true })));

  // Arrow keys on the subtab rail, same contract as the site's tab lists.
  const subtabList = document.querySelector('.admin-subtabs');
  if (subtabList) {
    subtabList.addEventListener('keydown', (event) => {
      const i = subtabButtons.indexOf(document.activeElement);
      if (i < 0) return;
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % subtabButtons.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + subtabButtons.length) % subtabButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = subtabButtons.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectSub(subtabButtons[next].getAttribute('aria-controls'), { update: true });
        subtabButtons[next].focus();
      }
    });
  }

  window.addEventListener('hashchange', applyHash);

  // ---- Show / hide sections ----

  function showLogin() {
    loginSection.hidden = false;
    dashboard.hidden = true;
  }

  function showDashboard(username) {
    loginSection.hidden = true;
    dashboard.hidden = false;
    currentUserEl.textContent = username || '';
    applyHash();
    const anyPanel = panels.find((p) => p.classList.contains('is-active'));
    if (!anyPanel) switchTab('ung-ho');
    if (!subpanels.find((p) => !p.hidden)) selectSub('ca-nhan');
    loadSettings();
    loadHistory();
    loadBusinessDeals();
  }

  // ---- Auth ----

  function logout(localOnly) {
    const t = token();
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    showLogin();
    if (!localOnly && t) {
      fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {});
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (res.status === 401) {
      logout(true);
      throw new Error('Phiên đăng nhập hết hạn. Đăng nhập lại nhé.');
    }
    return res;
  }

  // ---- Login ----

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setLoginError('');
    const username = loginUser.value.trim();
    const password = loginPass.value;
    if (!username || !password) {
      setLoginError('Nhập tên đăng nhập và mật khẩu.');
      return;
    }
    loginSubmit.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setLoginError(data.error || 'Đăng nhập thất bại.');
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(USER_KEY, data.username || username);
      loginPass.value = '';
      showDashboard(data.username || username);
    } catch {
      setLoginError('Không kết nối được máy chủ. Thử lại giúp nhé.');
    } finally {
      loginSubmit.disabled = false;
    }
  });

  logoutBtn.addEventListener('click', () => logout(false));

  function setLoginError(text) {
    loginError.hidden = !text;
    loginError.textContent = text || '';
  }

  function setPasswordError(text) {
    passwordError.hidden = !text;
    passwordError.textContent = text || '';
  }

  function setPasswordStatus(text) {
    passwordStatus.textContent = text || '';
  }

  function setRecoverError(text) {
    recoverError.hidden = !text;
    recoverError.textContent = text || '';
  }

  function setRecoverStatus(text) {
    recoverStatus.textContent = text || '';
  }

  function setSettingsStatus(text) {
    settingsStatus.textContent = text || '';
  }

  // ---- Password recovery (dev ADMIN_TOKEN) ----

  recoverForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setRecoverError('');
    setRecoverStatus('');
    const username = recoverUser.value.trim() || 'admin';
    const recoveryToken = recoverToken.value.trim();
    const next = recoverPass.value;
    const confirm = recoverConfirm.value;
    if (!recoveryToken) {
      setRecoverError('Nhập mã khôi phục ADMIN_TOKEN.');
      return;
    }
    if (next.length < 4 || next.length > 72) {
      setRecoverError('Mật khẩu mới phải từ 4 đến 72 ký tự.');
      return;
    }
    if (next !== confirm) {
      setRecoverError('Hai mật khẩu mới chưa khớp.');
      return;
    }
    recoverSubmit.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/api/admin/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryToken, username, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRecoverError(data.error || 'Khôi phục thất bại.');
        return;
      }
      recoverToken.value = '';
      recoverPass.value = '';
      recoverConfirm.value = '';
      setRecoverStatus(`Đã đặt lại mật khẩu cho ${data.username || username}. Đăng nhập lại nhé.`);
      loginUser.value = data.username || username;
    } catch {
      setRecoverError('Không kết nối được máy chủ. Thử lại giúp nhé.');
    } finally {
      recoverSubmit.disabled = false;
    }
  });

  // ---- On/off toggle ----

  async function loadSettings() {
    setSettingsStatus('');
    toggle.disabled = true;
    toggleLabel.textContent = 'Đang tải…';
    try {
      const res = await api('/api/admin/settings', { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'bad status');
      applySettingsState(data.donationsEnabled !== false);
      if (Number.isInteger(data.businessCount)) businessCountInput.value = data.businessCount;
    } catch (err) {
      toggleLabel.textContent = 'Chưa tải được trạng thái.';
      setSettingsStatus(err.message || 'Không tải được cài đặt.');
    } finally {
      toggle.disabled = false;
    }
  }

  function applySettingsState(enabled) {
    toggle.checked = enabled;
    toggleLabel.textContent = enabled
      ? 'Đang nhận ủng hộ — form Ủng hộ mở.'
      : 'Đang tạm tắt — form Ủng hộ ẩn.';
  }

  toggle.addEventListener('change', async () => {
    const next = toggle.checked;
    toggle.disabled = true;
    setSettingsStatus('Đang lưu…');
    try {
      const res = await api('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ donationsEnabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại.');
      applySettingsState(data.donationsEnabled !== false);
      setSettingsStatus('Đã lưu.');
    } catch (err) {
      toggle.checked = !next;
      setSettingsStatus(err.message || 'Lưu thất bại.');
    } finally {
      toggle.disabled = false;
    }
  });

  // ---- Public business count (typed by hand, not counted from the ledger) ----

  businessCountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    businessCountSubmit.disabled = true;
    businessCountStatus.textContent = 'Đang lưu…';
    try {
      const res = await api('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ businessCount: businessCountInput.valueAsNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại.');
      businessCountInput.value = data.businessCount;
      businessCountStatus.textContent = 'Đã lưu. Web sẽ cập nhật trong khoảng 1 phút.';
    } catch (err) {
      businessCountStatus.textContent = err.message || 'Lưu thất bại.';
    } finally {
      businessCountSubmit.disabled = false;
    }
  });

  // ---- Combined fundraising summary ----

  function renderFundSummary() {
    const individual = summaryState.individual;
    const business = summaryState.business;
    sumIndividual.textContent = individual === null ? '—' : money(individual);
    sumBusiness.textContent = business === null ? '—' : money(business);
    sumTotal.textContent = individual === null || business === null ? '—' : money(individual + business);
    sumGoal.textContent = money(PUBLIC_GOAL);
  }

  // ---- Individual donations ----

  // Display only: PayOS links expire after 30 min (PAYMENT_TTL_SECONDS).
  // The row stays 'pending' in D1 so a late webhook can still mark it paid.
  const PAYMENT_TTL_MS = 30 * 60 * 1000;
  function isExpiredPending(d) {
    if (d.status !== 'pending' || !d.createdAt) return false;
    const t = Date.parse(d.createdAt);
    return Number.isFinite(t) && Date.now() - t > PAYMENT_TTL_MS;
  }
  function isManual(d) {
    return /^manual:/.test(d.payosReference || '') || /^manual:/.test(d.payosDescription || '');
  }
  function statusLabel(d) {
    if (isExpiredPending(d)) return 'hết hạn';
    if (d.status === 'success' && isManual(d)) return 'success · thủ công';
    return d.status || '—';
  }
  function manualNote(d) {
    if (!isManual(d) || !d.payosDescription) return '';
    // Drop the leading 'manual:<admin> | ' marker when PayOS later filled the reference.
    return d.payosDescription.replace(/^manual:[^|]*\|?\s*/, '').trim();
  }

  function filteredDonations() {
    const status = statusFilter.value;
    const q = searchInput.value.trim().toLowerCase();
    return allDonations.filter((d) => {
      if (status === 'expired') {
        if (!isExpiredPending(d)) return false;
      } else if (status === 'pending') {
        if (d.status !== 'pending' || isExpiredPending(d)) return false;
      } else if (status && d.status !== status) {
        return false;
      }
      if (!q) return true;
      const hay = [
        d.displayName,
        d.message,
        d.orderCode,
        d.status,
        statusLabel(d),
        d.counterAccountName,
        d.counterAccountNumber,
        d.counterAccountBankName,
        d.payosReference,
        d.payosAccountNumber,
        d.payosDescription,
        d.virtualAccountName,
        d.virtualAccountNumber,
        d.paymentLinkId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function updateTotals(rows) {
    totalReceivedEl.textContent = money(summaryState.individual ?? 0);
    totalReceivedCountEl.textContent = ` (${summaryState.individualCount ?? 0} khoản)`;
    const filteredSum = rows.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    totalFilteredEl.textContent = `${rows.length} khoản · ${money(filteredSum)}`;
  }

  function manualCellExtras(d) {
    const who = (/^manual:([^|\s]+)/.exec(d.payosReference || '') ||
      /^manual:([^|\s]+)/.exec(d.payosDescription || '') || [])[1] || 'admin';
    const note = manualNote(d);
    const wrap = el('div');
    const tag = el('span', 'admin-tag', 'thủ công');
    tag.title = `Xác nhận thủ công bởi ${who}`;
    wrap.appendChild(tag);
    if (note) wrap.appendChild(el('div', 'admin-manual-note', `Ghi chú: ${note}`));
    return wrap;
  }

  function statusChip(d) {
    // Manual rows show a plain "success" chip plus the "thủ công" tag (as in the original admin);
    // statusLabel keeps " · thủ công" for the search haystack.
    const chip = el('span', 'status', d.status === 'success' && isManual(d) ? 'success' : statusLabel(d));
    if (isExpiredPending(d)) {
      chip.classList.add('is-expired');
      chip.title = 'Link thanh toán đã hết hạn (quá 30 phút), vẫn giữ trạng thái pending';
    }
    return chip;
  }

  function buildAction(d) {
    const actions = el('div', 'admin-actions');
    if (d.status === 'success' && !d.hidden) {
      const hideBtn = el('button', 'btn btn--outline', 'Ẩn lời nhắn');
      hideBtn.type = 'button';
      hideBtn.addEventListener('click', () => actOn(d.orderCode, 'hide', hideBtn));
      actions.appendChild(hideBtn);
    } else if (d.status === 'success' && d.hidden) {
      const showBtn = el('button', 'btn btn--outline', 'Hiện lời nhắn');
      showBtn.type = 'button';
      showBtn.addEventListener('click', () => actOn(d.orderCode, 'show', showBtn));
      actions.appendChild(showBtn);
    } else {
      actions.appendChild(el('span', 'admin-meta', '—'));
    }
    return actions;
  }

  function renderHistory() {
    const rows = filteredDonations();
    updateTotals(rows);
    historySummary.textContent = `${rows.length}/${allDonations.length} khoản khớp bộ lọc.`;
    if (narrowQuery.matches) renderHistoryCards(rows);
    else renderHistoryTable(rows);
  }

  function renderHistoryTable(rows) {
    historyCards.hidden = true;
    historyBody.textContent = '';
    historyCards.textContent = '';
    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 10;
      td.className = 'admin-empty';
      td.textContent = allDonations.length ? 'Không có khoản nào khớp bộ lọc.' : 'Chưa có khoản nào khớp.';
      tr.appendChild(td);
      historyBody.appendChild(tr);
      return;
    }
    rows.forEach((d) => {
      const tr = document.createElement('tr');
      if (d.hidden) tr.classList.add('is-hidden-row');
      if (isExpiredPending(d)) tr.classList.add('is-expired-row');

      const code = el('td', 'admin-meta', d.orderCode != null ? `#${d.orderCode}` : '—');
      const statusTd = el('td');
      statusTd.appendChild(statusChip(d));
      if (d.status === 'success' && isManual(d)) statusTd.appendChild(manualCellExtras(d));
      const amount = el('td', 'admin-amount', money(d.amount));
      const name = el('td', '', d.displayName || '—');
      const message = el('td', 'admin-message', d.message || '—');
      const hidden = el('td', '', d.status === 'success' ? (d.hidden ? 'ẩn' : 'hiện') : '—');
      const anonymous = el('td', '', d.anonymous ? 'có' : 'không');
      const createdAt = el('td', 'admin-meta', fmtTime(d.createdAt));
      const paidAt = el('td', 'admin-meta', fmtTime(d.paidAt));
      const actionsTd = el('td');
      actionsTd.appendChild(buildAction(d));

      [code, statusTd, amount, name, message, hidden, anonymous, createdAt, paidAt, actionsTd]
        .forEach((td) => tr.appendChild(td));
      historyBody.appendChild(tr);
    });
  }

  // Under 700px: stacked block — mã, tên, số tiền, trạng thái, then the action.
  // The remaining fields sit in a "Chi tiết" disclosure.
  function renderHistoryCards(rows) {
    historyCards.hidden = false;
    historyCards.textContent = '';
    historyBody.textContent = '';
    if (!rows.length) {
      historyCards.appendChild(el('p', 'admin-empty', allDonations.length ? 'Không có khoản nào khớp bộ lọc.' : 'Chưa có khoản nào khớp.'));
      return;
    }
    rows.forEach((d) => {
      const card = el('article', 'admin-card-row');
      if (d.hidden) card.classList.add('is-hidden-row');

      const top = el('div', 'admin-card-row-top');
      top.appendChild(el('span', 'admin-card-row-code', d.orderCode != null ? `#${d.orderCode}` : '—'));
      top.appendChild(el('strong', 'admin-card-row-name', d.displayName || '—'));
      top.appendChild(el('span', 'admin-card-row-amount', money(d.amount)));
      const chip = statusChip(d);
      if (d.status === 'success' && isManual(d)) {
        const wrap = el('span', 'admin-card-row-status');
        wrap.appendChild(chip);
        wrap.appendChild(manualCellExtras(d));
        top.appendChild(wrap);
      } else {
        chip.classList.add('admin-card-row-status');
        top.appendChild(chip);
      }

      card.appendChild(top);
      card.appendChild(buildAction(d));

      const details = document.createElement('details');
      details.appendChild(el('summary', '', 'Chi tiết'));
      const dl = document.createElement('dl');
      const addRow = (label, value) => {
        dl.appendChild(el('dt', '', label));
        dl.appendChild(el('dd', '', value));
      };
      addRow('Lời nhắn', d.message || '—');
      addRow('Ẩn', d.status === 'success' ? (d.hidden ? 'ẩn' : 'hiện') : '—');
      addRow('Ẩn danh', d.anonymous ? 'có' : 'không');
      addRow('Tạo lúc', fmtTime(d.createdAt));
      addRow('Trả lúc', fmtTime(d.paidAt));
      details.appendChild(dl);
      card.appendChild(details);
      historyCards.appendChild(card);
    });
  }

  async function loadHistory() {
    historySummary.textContent = 'Đang tải lịch sử…';
    try {
      // Hidden filter runs on the server (the list is row-limited).
      const hf = hiddenFilter ? hiddenFilter.value : 'all';
      const q = hf === 'all' ? '' : `?hidden=${encodeURIComponent(hf)}`;
      const res = await api(`/api/admin/donations${q}`, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không tải được lịch sử.');
      allDonations = data.donations || [];
      summaryState.individual = Number(data.totalReceived) || 0;
      summaryState.individualCount = Number(data.receivedCount) || 0;
      renderFundSummary();
      renderHistory();
    } catch (err) {
      historySummary.textContent = err.message || 'Không tải được lịch sử.';
      totalReceivedEl.textContent = '—';
      totalReceivedCountEl.textContent = '';
      totalFilteredEl.textContent = '—';
    }
  }

  async function actOn(orderCode, action, btn) {
    btn.disabled = true;
    try {
      const res = await api(`/api/admin/donations/${orderCode}/${action}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại.');
      await loadHistory();
    } catch (err) {
      historySummary.textContent = err.message || 'Thao tác thất bại.';
      btn.disabled = false;
    }
  }

  statusFilter.addEventListener('change', renderHistory);
  if (hiddenFilter) hiddenFilter.addEventListener('change', loadHistory);
  searchInput.addEventListener('input', renderHistory);
  reloadBtn.addEventListener('click', loadHistory);
  exportBtn.addEventListener('click', exportIndividualExcel);

  // ---- Business deals ----

  const BUSINESS_STATUSES = ['pledged', 'received', 'cancelled'];
  const BUSINESS_LABELS = { pledged: 'Đang thương lượng', received: 'Đã nhận', cancelled: 'Đã huỷ' };

  function setBusinessSummary(text) {
    businessSummary.textContent = text || '';
  }

  function filteredDeals() {
    const status = businessStatusFilter.value;
    const q = businessSearch.value.trim().toLowerCase();
    return allDeals.filter((d) => {
      if (status && d.status !== status) return false;
      if (!q) return true;
      const hay = [
        d.businessName, d.contactName, d.contactEmail,
        d.contactPhone, d.note,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function renderBusinessSummary(rows) {
    const received = allDeals.filter((d) => d.status === 'received');
    const sum = received.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    setBusinessSummary(
      `${rows.length}/${allDeals.length} khoản khớp bộ lọc · Đã nhận: ${money(sum)} (${received.length} đối tác).`,
    );
  }

  function renderBusiness() {
    const rows = filteredDeals();
    renderBusinessSummary(rows);
    businessBody.textContent = '';
    if (!allDeals.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.className = 'admin-empty';
      td.textContent = 'Chưa có khoản doanh nghiệp.';
      tr.appendChild(td);
      businessBody.appendChild(tr);
      return;
    }
    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.className = 'admin-empty';
      td.textContent = 'Không có khoản nào khớp bộ lọc.';
      tr.appendChild(td);
      businessBody.appendChild(tr);
      return;
    }
    rows.forEach((d) => {
      const tr = document.createElement('tr');

      const name = el('td');
      const strong = el('strong', '', d.businessName || '—');
      name.appendChild(strong);
      if (d.note) {
        name.appendChild(el('div', 'admin-manual-note', d.note));
      }

      const contact = el('td');
      contact.appendChild(el('div', '', d.contactName || '—'));
      if (d.contactEmail || d.contactPhone) {
        contact.appendChild(el('div', 'admin-manual-note',
          [d.contactEmail, d.contactPhone].filter(Boolean).join(' · ')));
      }

      const amount = el('td', 'admin-amount', money(d.amount));

      const statusTd = el('td');
      const select = el('select', 'admin-status-select');
      select.setAttribute('aria-label', `Trạng thái của ${d.businessName || 'khoản này'}`);
      BUSINESS_STATUSES.forEach((s) => {
        const option = el('option', '', BUSINESS_LABELS[s]);
        option.value = s;
        select.appendChild(option);
      });
      select.value = d.status;
      select.addEventListener('change', () => changeDealStatus(d, select));
      statusTd.appendChild(select);

      const updatedAt = el('td', 'admin-meta', fmtDate(d.updatedAt));

      const actionsTd = el('td');
      const actions = el('div', 'admin-row-actions');
      const editBtn = el('button', 'btn btn--outline', 'Sửa');
      editBtn.type = 'button';
      editBtn.addEventListener('click', () => openBusinessDialog(d));
      const deleteBtn = el('button', 'btn btn--outline', 'Xoá');
      deleteBtn.type = 'button';
      deleteBtn.addEventListener('click', () => deleteDeal(d));
      actions.append(editBtn, deleteBtn);
      actionsTd.appendChild(actions);

      [name, contact, amount, statusTd, updatedAt, actionsTd].forEach((td) => tr.appendChild(td));
      businessBody.appendChild(tr);
    });
  }

  async function loadBusinessDeals() {
    setBusinessSummary('Đang tải sổ doanh nghiệp…');
    try {
      const res = await api('/api/admin/business-deals', { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không tải được sổ doanh nghiệp.');
      allDeals = data.deals || [];
      summaryState.business = Number(data.receivedAmount) || 0;
      summaryState.businessCount = Number(data.receivedCount) || 0;
      renderFundSummary();
      renderBusiness();
    } catch (err) {
      setBusinessSummary(err.message || 'Không tải được sổ doanh nghiệp.');
    }
  }

  async function changeDealStatus(deal, select) {
    const next = select.value;
    const prev = deal.status;
    if (next === prev) return;
    // Leaving `received` (or going to `cancelled`) changes the public total.
    const leavingReceived = prev === 'received' && next !== 'received';
    if (leavingReceived || next === 'cancelled') {
      const message = leavingReceived
        ? `"${deal.businessName}" đang tính vào tổng công khai với số tiền ${money(deal.amount)}. Chuyển sang "${BUSINESS_LABELS[next]}"?`
        : `Đánh dấu "${deal.businessName}" là ${BUSINESS_LABELS[next]}? Tiếp tục?`;
      if (!window.confirm(message)) {
        select.value = prev;
        return;
      }
    }
    select.disabled = true;
    select.classList.add('is-busy');
    try {
      const res = await api(`/api/admin/business-deals/${encodeURIComponent(deal.id)}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại.');
      deal.status = next;
      await loadBusinessDeals();
    } catch (err) {
      select.value = prev;
      setBusinessSummary(err.message || 'Cập nhật thất bại.');
    } finally {
      select.disabled = false;
      select.classList.remove('is-busy');
    }
  }

  function deleteDeal(deal) {
    const extra = deal.status === 'received'
      ? ` Khoản này đang "Đã nhận": ${money(deal.amount)} sẽ rời khỏi tổng công khai.`
      : '';
    if (!window.confirm(`Xoá "${deal.businessName || 'khoản này'}" khỏi sổ doanh nghiệp?${extra}`)) return;
    (async () => {
      try {
        const res = await api(`/api/admin/business-deals/${encodeURIComponent(deal.id)}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Xoá thất bại.');
        await loadBusinessDeals();
      } catch (err) {
        setBusinessSummary(err.message || 'Xoá thất bại.');
      }
    })();
  }

  // ---- Business dialog (create / edit) ----

  let editingDeal = null;

  function openBusinessDialog(deal) {
    editingDeal = deal || null;
    businessError.hidden = true;
    businessError.textContent = '';
    businessForm.reset();
    document.getElementById('business-dialog-title').textContent = deal
      ? 'Sửa khoản doanh nghiệp'
      : 'Thêm doanh nghiệp';
    if (deal) {
      businessForm.elements.businessName.value = deal.businessName || '';
      businessForm.elements.contactName.value = deal.contactName || '';
      businessForm.elements.contactEmail.value = deal.contactEmail || '';
      businessForm.elements.contactPhone.value = deal.contactPhone || '';
      businessForm.elements.amount.value = deal.amount ?? '';
      businessForm.elements.status.value = deal.status || 'received';
      businessForm.elements.note.value = deal.note || '';
    } else {
      // Default status: Đã nhận, for money that is already in.
      businessForm.elements.status.value = 'received';
    }
    businessDialog.showModal();
    businessForm.elements.businessName.focus();
  }

  businessAddBtn.addEventListener('click', () => openBusinessDialog(null));
  businessCancelBtn.addEventListener('click', () => businessDialog.close());
  businessReloadBtn.addEventListener('click', loadBusinessDeals);
  businessStatusFilter.addEventListener('change', renderBusiness);
  businessSearch.addEventListener('input', renderBusiness);
  businessExportBtn.addEventListener('click', exportBusinessExcel);

  function setBusinessError(text) {
    businessError.hidden = !text;
    businessError.textContent = text || '';
  }

  function readBusinessForm() {
    const name = businessForm.elements.businessName.value.trim();
    if (!name) return { error: 'Nhập tên doanh nghiệp.' };
    if (name.length > 160) return { error: 'Tên doanh nghiệp tối đa 160 ký tự.' };
    const contactName = businessForm.elements.contactName.value.trim();
    if (contactName.length > 80) return { error: 'Người liên hệ tối đa 80 ký tự.' };
    const email = businessForm.elements.contactEmail.value.trim();
    if (email) {
      if (email.length > 120) return { error: 'Email tối đa 120 ký tự.' };
      if (!/^[^\s@]+@[^\s@]+$/.test(email)) return { error: 'Email không hợp lệ.' };
    }
    const phone = businessForm.elements.contactPhone.value.trim();
    if (phone.length > 30) return { error: 'Số điện thoại tối đa 30 ký tự.' };
    const amountRaw = businessForm.elements.amount.value.trim();
    const amount = Number(amountRaw);
    // Contract money: any integer up to 2.000.000.000, not the PayOS cap.
    if (!amountRaw || !Number.isInteger(amount) || amount < 1 || amount > 2000000000) {
      return { error: 'Số tiền phải là số nguyên từ 1 đến 2.000.000.000 đồng.' };
    }
    const status = businessForm.elements.status.value;
    if (!BUSINESS_STATUSES.includes(status)) return { error: 'Chọn trạng thái.' };
    const note = businessForm.elements.note.value.trim();
    if (note.length > 500) return { error: 'Ghi chú nội bộ tối đa 500 ký tự.' };
    return {
      value: {
        businessName: name,
        contactName,
        contactEmail: email,
        contactPhone: phone,
        amount,
        status,
        note,
      },
    };
  }

  businessForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setBusinessError('');
    const { value, error: vErr } = readBusinessForm();
    if (vErr) {
      setBusinessError(vErr);
      return;
    }
    businessSubmit.disabled = true;
    try {
      const path = editingDeal
        ? `/api/admin/business-deals/${encodeURIComponent(editingDeal.id)}`
        : '/api/admin/business-deals';
      const res = await api(path, {
        method: editingDeal ? 'PATCH' : 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(value),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại.');
      businessDialog.close();
      await loadBusinessDeals();
    } catch (err) {
      setBusinessError(err.message || 'Lưu thất bại.');
    } finally {
      businessSubmit.disabled = false;
    }
  });

  businessDialog.addEventListener('close', () => {
    editingDeal = null;
    businessForm.reset();
    setBusinessError('');
  });

  // ---- Excel (stored-ZIP xlsx writer, same as /admin) ----

  function xmlEscape(value) {
    return String(value == null ? '' : value).replace(
      /[&<>"'\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,
      (ch) => {
        if (ch === '&') return '&amp;';
        if (ch === '<') return '&lt;';
        if (ch === '>') return '&gt;';
        if (ch === '"') return '&quot;';
        if (ch === "'") return '&apos;';
        return '';
      },
    );
  }

  function colName(index) {
    let name = '';
    let n = index + 1;
    while (n > 0) {
      const rem = (n - 1) % 26;
      name = String.fromCharCode(65 + rem) + name;
      n = Math.floor((n - 1) / 26);
    }
    return name;
  }

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32Bytes(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // Minimal ZIP writer (stored, no compression) — enough for a valid .xlsx.
  function zipStore(files) {
    const enc = new TextEncoder();
    const chunks = [];
    let offset = 0;
    const pushU16 = (v) => chunks.push([v & 0xff, (v >>> 8) & 0xff]);
    const pushU32 = (v) => chunks.push([v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]);
    const pushBytes = (bytes) => chunks.push(Array.from(bytes));

    const centralStartCounts = [];
    files.forEach(({ name, data }) => {
      const nameBytes = enc.encode(name);
      const crc = crc32Bytes(data);
      const localOffset = offset;
      const local = [];
      const w16 = (v) => local.push(v & 0xff, (v >>> 8) & 0xff);
      const w32 = (v) => local.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
      // Local file header
      w32(0x04034b50);
      w16(20);
      w16(0x0800); // UTF-8 filenames
      w16(0); // stored
      w16(0);
      w16(0x21); // DOS date/time placeholder
      w32(crc);
      w32(data.length);
      w32(data.length);
      w16(nameBytes.length);
      w16(0);
      const header = new Uint8Array(local);
      const record = new Uint8Array(header.length + nameBytes.length + data.length);
      record.set(header, 0);
      record.set(nameBytes, header.length);
      record.set(data, header.length + nameBytes.length);
      pushBytes(record);
      offset += record.length;
      centralStartCounts.push({ nameBytes, crc, size: data.length, localOffset });
    });

    const centralOffset = offset;
    const centralBytes = [];
    centralStartCounts.forEach(({ nameBytes, crc, size, localOffset }) => {
      const c = [];
      const w16 = (v) => c.push(v & 0xff, (v >>> 8) & 0xff);
      const w32 = (v) => c.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
      w32(0x02014b50);
      w16(20);
      w16(20);
      w16(0x0800);
      w16(0);
      w16(0);
      w16(0x21);
      w32(crc);
      w32(size);
      w32(size);
      w16(nameBytes.length);
      w16(0);
      w16(0);
      w16(0);
      w16(0);
      w32(0);
      w32(localOffset);
      const header = new Uint8Array(c);
      const record = new Uint8Array(header.length + nameBytes.length);
      record.set(header, 0);
      record.set(nameBytes, header.length);
      for (let i = 0; i < record.length; i++) centralBytes.push(record[i]);
    });
    pushBytes(new Uint8Array(centralBytes));
    offset += centralBytes.length;

    const end = [];
    const e16 = (v) => end.push(v & 0xff, (v >>> 8) & 0xff);
    const e32 = (v) => end.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
    e32(0x06054b50);
    e16(0);
    e16(0);
    e16(files.length);
    e16(files.length);
    e32(centralBytes.length);
    e32(centralOffset);
    e16(0);
    pushBytes(new Uint8Array(end));

    const flat = [];
    chunks.forEach((arr) => {
      for (let i = 0; i < arr.length; i++) flat.push(arr[i]);
    });
    return new Uint8Array(flat);
  }

  function buildXlsx(rows, headers, sheetName = 'Donations') {
    const enc = new TextEncoder();
    const sheetRows = [];
    sheetRows.push(
      `    <row r="1">${headers
        .map((h, i) => `<c r="${colName(i)}1" s="1" t="inlineStr"><is><t>${xmlEscape(h)}</t></is></c>`)
        .join('')}</row>`,
    );
    rows.forEach((values, r) => {
      const rowNum = r + 2;
      const cells = values
        .map((value, i) => {
          const ref = `${colName(i)}${rowNum}`;
          if (value != null && value.type === 'n') {
            return `<c r="${ref}"><v>${value.v}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value != null && value.type === 's' ? value.v : value)}</t></is></c>`;
        })
        .join('');
      sheetRows.push(`    <row r="${rowNum}">${cells}</row>`);
    });

    const sheetXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<cols><col min="1" max="' +
      headers.length +
      '" width="20" customWidth="1"/></cols>' +
      '<sheetData>\n' +
      sheetRows.join('\n') +
      '\n</sheetData></worksheet>';

    const contentTypes =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '</Types>';

    const rels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
      '</Relationships>';

    const workbook =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/relationships">' +
      `<sheets><sheet name="${xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;

    const workbookRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/package/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/styles" Target="styles.xml"/>' +
      '</Relationships>';

    const styles =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
      '</styleSheet>';

    const appProps =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
      '<Application>POET Admin</Application></Properties>';

    const coreProps =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>POET donations</dc:title><cp:revision>1</cp:revision></cp:coreProperties>';

    return zipStore([
      { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
      { name: '_rels/.rels', data: enc.encode(rels) },
      { name: 'docProps/app.xml', data: enc.encode(appProps) },
      { name: 'docProps/core.xml', data: enc.encode(coreProps) },
      { name: 'xl/workbook.xml', data: enc.encode(workbook) },
      { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(workbookRels) },
      { name: 'xl/styles.xml', data: enc.encode(styles) },
      { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheetXml) },
    ]);
  }

  function downloadXlsx(bytes, filename) {
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('{stamp}', stamp);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportIndividualExcel() {
    const rows = filteredDonations();
    if (!rows.length) {
      historySummary.textContent = 'Không có dữ liệu để xuất.';
      return;
    }

    const headers = [
      'orderCode',
      'status',
      'hidden',
      'amount',
      'displayName',
      'message',
      'anonymous',
      'createdAt',
      'paidAt',
      'payosReference',
      'payosAccountNumber',
      'counterAccountBankId',
      'counterAccountBankName',
      'counterAccountName',
      'counterAccountNumber',
      'virtualAccountName',
      'virtualAccountNumber',
      'payosDescription',
      'payosTransactionTime',
      'payosCurrency',
      'paymentLinkId',
    ];

    const numericKeys = new Set(['orderCode', 'amount', 'anonymous', 'hidden']);
    const data = rows.map((d) =>
      headers.map((key) => {
        let raw = d[key];
        if (key === 'anonymous') raw = d.anonymous ? 1 : 0;
        if (key === 'hidden') raw = d.hidden ? 1 : 0;
        if (numericKeys.has(key) && raw !== '' && raw != null && Number.isFinite(Number(raw))) {
          return { type: 'n', v: String(Number(raw)) };
        }
        return { type: 's', v: raw == null ? '' : String(raw) };
      }),
    );

    downloadXlsx(buildXlsx(data, headers), `poet-donations-{stamp}.xlsx`);
    historySummary.textContent = `Đã xuất ${rows.length} khoản.`;
  }

  function exportBusinessExcel() {
    const rows = filteredDeals();
    if (!rows.length) {
      setBusinessSummary('Không có dữ liệu để xuất.');
      return;
    }

    const headers = [
      'id',
      'businessName',
      'contactName',
      'contactEmail',
      'contactPhone',
      'amount',
      'status',
      'note',
      'createdAt',
      'updatedAt',
      'createdBy',
    ];

    const numericKeys = new Set(['amount']);
    const data = rows.map((d) =>
      headers.map((key) => {
        const raw = d[key];
        if (numericKeys.has(key) && raw !== '' && raw != null && Number.isFinite(Number(raw))) {
          return { type: 'n', v: String(Number(raw)) };
        }
        return { type: 's', v: raw == null ? '' : String(raw) };
      }),
    );

    downloadXlsx(buildXlsx(data, headers, 'Business deals'), `poet-business-deals-{stamp}.xlsx`);
    setBusinessSummary(`Đã xuất ${rows.length} khoản.`);
  }

  // ---- Change password ----

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordStatus('');
    const cur = currentPass.value;
    const next = newPass.value;
    const confirm = confirmPass.value;
    if (!cur) {
      setPasswordError('Nhập mật khẩu hiện tại.');
      return;
    }
    if (next.length < 4 || next.length > 72) {
      setPasswordError('Mật khẩu mới phải từ 4 đến 72 ký tự.');
      return;
    }
    if (next !== confirm) {
      setPasswordError('Hai mật khẩu mới chưa khớp.');
      return;
    }
    passwordSubmit.disabled = true;
    try {
      const res = await api('/api/admin/change-password', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data.error || 'Đổi mật khẩu thất bại.');
        return;
      }
      currentPass.value = '';
      newPass.value = '';
      confirmPass.value = '';
      setPasswordStatus('Đã đổi mật khẩu.');
    } catch (err) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      passwordSubmit.disabled = false;
    }
  });

  // ---- Mobile stacked rows ----

  const narrowQuery = window.matchMedia('(max-width: 700px)');
  const onNarrowChange = () => {
    if (dashboard.hidden) return;
    renderHistory();
  };
  if (typeof narrowQuery.addEventListener === 'function') {
    narrowQuery.addEventListener('change', onNarrowChange);
  } else if (typeof narrowQuery.addListener === 'function') {
    narrowQuery.addListener(onNarrowChange);
  }

  // ---- Boot ----

  (async () => {
    if (!token()) {
      showLogin();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, { headers: authHeaders() });
      if (res.status === 401) {
        logout(true);
        showLogin();
        return;
      }
      const data = await res.json().catch(() => ({}));
      showDashboard(data.username || sessionStorage.getItem(USER_KEY) || 'admin');
    } catch {
      showDashboard(sessionStorage.getItem(USER_KEY) || 'admin');
    }
  })();
})();
