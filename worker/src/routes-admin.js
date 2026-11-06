/** Admin routes: login/logout, password, settings, donation moderation. */
import { ADMIN_AUTH_MAX_PER_HOUR, ADMIN_SESSION_TTL_MS } from './config.js';
import { error, json, readJsonBody } from './http.js';
import { hashPassword, randomHex, verifyPassword } from './crypto.js';
import { timingSafeEqual } from './payos.js';
import { requireAdmin } from './auth.js';
import { checkRateLimit, purgePublicListCache } from './routes-donations.js';
import {
  validateBusinessCount,
  validateBusinessDeal,
  validateBusinessPatch,
} from './business.js';
import {
  createAdminSession,
  createBusinessDeal,
  deleteAdminSession,
  deleteAdminSessionsForUser,
  deleteBusinessDeal,
  deleteOtherAdminSessions,
  findBusinessDeal,
  listBusinessDeals,
  businessReceivedTotals,
  pruneAllAttempts,
  pruneExpiredAdminSessions,
  recordAttempt,
  ensureAdminSeeded,
  findAdminPasswordHash,
  findAdminUser,
  findDonationStatus,
  getBusinessCount,
  isDonationsEnabled,
  listDonationsForAdmin,
  setDonationHidden,
  setSetting,
  totalsForAdmin,
  updateAdminPassword,
  updateBusinessDeal,
  upsertAdminPassword,
} from './store.js';

export async function handleAdminLogin(request, env) {
  // Only failed logins count toward the limit (separate bucket from recover).
  const limit = await checkRateLimit(
    request, env, 'login:', ADMIN_AUTH_MAX_PER_HOUR,
    'Bạn đã nhập sai quá nhiều lần. Đăng nhập tạm khoá, vui lòng thử lại sau tối đa 1 giờ.',
  );
  if (limit.response) return limit.response;

  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;

  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!username || !password) {
    return error('Nhập tên đăng nhập và mật khẩu.', 400);
  }

  await ensureAdminSeeded(env);
  let user;
  try {
    user = await findAdminUser(env, username);
  } catch (err) {
    console.error(String(err?.message || err));
    return error('Chưa có bảng tài khoản. Hãy chạy migration schema mới.', 500);
  }
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await recordAttempt(env, limit.ipHash, limit.nowIso);
    return error('Tên đăng nhập hoặc mật khẩu không đúng.', 401);
  }

  const token = randomHex(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_TTL_MS).toISOString();
  // Login is the housekeeping point: a few cheap deletes, rarely run.
  await pruneExpiredAdminSessions(env, now.toISOString());
  await pruneAllAttempts(env, new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString());
  await createAdminSession(env, token, user.username, now.toISOString(), expiresAt);
  return json({ token, username: user.username, expiresAt });
}

export async function handleAdminLogout(request, env, session) {
  if (!session.legacy && session.token) {
    await deleteAdminSession(env, session.token);
  }
  return json({ ok: true });
}

export async function handleAdminChangePassword(request, env, session) {
  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;

  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < 4 || newPassword.length > 72) {
    return error('Mật khẩu mới phải từ 4 đến 72 ký tự.', 400);
  }

  if (session.legacy) {
    // Old static-token sessions have no password to check against.
    const username =
      typeof body?.username === 'string' && body.username.trim()
        ? body.username.trim()
        : 'admin';
    await ensureAdminSeeded(env);
    await upsertAdminPassword(env, username, await hashPassword(newPassword), new Date().toISOString());
    await deleteAdminSessionsForUser(env, username);
    return json({ ok: true });
  }

  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  if (!currentPassword) return error('Nhập mật khẩu hiện tại.', 400);

  const user = await findAdminPasswordHash(env, session.username);
  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    return error('Mật khẩu hiện tại không đúng.', 401);
  }
  await updateAdminPassword(
    env,
    session.username,
    await hashPassword(newPassword),
    new Date().toISOString(),
  );
  // Keep the current session, drop the rest.
  await deleteOtherAdminSessions(env, session.username, session.token);
  return json({ ok: true });
}

/**
 * Dev recovery: reset admin password with the Worker ADMIN_TOKEN secret
 * when the interactive password is lost. Does not require a session.
 */
export async function handleAdminRecoverPassword(request, env) {
  // Only failed recovery attempts count (separate bucket from login).
  const limit = await checkRateLimit(
    request, env, 'recover:', ADMIN_AUTH_MAX_PER_HOUR,
    'Bạn đã nhập sai mã khôi phục quá nhiều lần. Vui lòng thử lại sau tối đa 1 giờ.',
  );
  if (limit.response) return limit.response;

  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;

  const recoveryToken =
    typeof body?.recoveryToken === 'string' ? body.recoveryToken.trim() : '';
  const adminToken = String(env.ADMIN_TOKEN || '').trim();
  if (!adminToken || !recoveryToken || !timingSafeEqual(recoveryToken, adminToken)) {
    await recordAttempt(env, limit.ipHash, limit.nowIso);
    return error('Mã khôi phục không đúng.', 401);
  }

  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < 4 || newPassword.length > 72) {
    return error('Mật khẩu mới phải từ 4 đến 72 ký tự.', 400);
  }

  const username =
    typeof body?.username === 'string' && body.username.trim()
      ? body.username.trim()
      : 'admin';

  await ensureAdminSeeded(env);
  await upsertAdminPassword(env, username, await hashPassword(newPassword), new Date().toISOString());
  await deleteAdminSessionsForUser(env, username);
  return json({ ok: true, username });
}

export async function handleAdminList(env, url) {
  // Full donate history for audit: every status, newest first.
  // Donor bank fields are admin-only; the public wall never sees them.
  // ?hidden=hidden|visible|all filters on the server (list is row-limited).
  const hidden = url?.searchParams.get('hidden') || 'all';
  if (!['all', 'hidden', 'visible'].includes(hidden)) return error('Bộ lọc không hợp lệ.', 400);
  const donations = await listDonationsForAdmin(env, hidden === 'all' ? null : hidden);
  const totalRow = await totalsForAdmin(env);
  return json({
    donations,
    totalReceived: Number(totalRow?.totalReceived) || 0,
    receivedCount: Number(totalRow?.receivedCount) || 0,
  });
}

async function readSettings(env) {
  return {
    donationsEnabled: await isDonationsEnabled(env),
    businessCount: await getBusinessCount(env),
  };
}

export async function handleGetAdminSettings(env) {
  return json(await readSettings(env));
}

/** Accepts donationsEnabled, businessCount, or both. */
export async function handleUpdateAdminSettings(request, env, url) {
  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;
  const hasToggle = typeof body?.donationsEnabled === 'boolean';
  const hasCount = body?.businessCount !== undefined;
  if (!hasToggle && !hasCount) return error('Thiếu dữ liệu cài đặt.', 400);
  if (hasCount) {
    const bad = validateBusinessCount(body.businessCount);
    if (bad) return error(bad, 400);
    await setSetting(env, 'business_count', String(body.businessCount));
    await purgePublicListCache(url);
  }
  if (hasToggle) await setSetting(env, 'donations_enabled', body.donationsEnabled ? '1' : '0');
  return json({ ok: true, ...(await readSettings(env)) });
}

/* -- business deals: manual ledger, never on the public wall -- */

/** Admin list: newest `updated_at` first, capped at 500, plus received totals. */
export async function handleBusinessList(env) {
  const [deals, totals] = await Promise.all([
    listBusinessDeals(env),
    businessReceivedTotals(env),
  ]);
  return json({
    deals,
    receivedAmount: totals.businessAmount,
    receivedCount: totals.businessCount,
  });
}

export async function handleBusinessCreate(request, env, session, url) {
  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;
  const { value, error: vErr } = validateBusinessDeal(body);
  if (vErr) return error(vErr, 400);
  const nowIso = new Date().toISOString();
  const row = await createBusinessDeal(env, value, session.username, nowIso);
  // Status changes the public total only for `received`, but purging is cheap
  // and keeps every deal mutation on the same cache path.
  await purgePublicListCache(url);
  return json(row, 201);
}

/** PATCH accepts any subset of the editable fields; unknown id -> 404. */
export async function handleBusinessUpdate(request, env, session, id, url) {
  const existing = await findBusinessDeal(env, id);
  if (!existing) return error('Không tìm thấy khoản doanh nghiệp.', 404);
  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;
  const { value, error: vErr } = validateBusinessPatch(body);
  if (vErr) return error(vErr, 400);
  const row = await updateBusinessDeal(env, id, value, new Date().toISOString());
  if (!row) return error('Không tìm thấy khoản doanh nghiệp.', 404);
  await purgePublicListCache(url);
  return json(row);
}

export async function handleBusinessDelete(env, id, url) {
  const removed = await deleteBusinessDeal(env, id);
  if (!removed) return error('Không tìm thấy khoản doanh nghiệp.', 404);
  await purgePublicListCache(url);
  return json({ ok: true });
}

/** Show a gift's message on the public wall (hidden = 0). */
export async function handleAdminShow(env, orderCode, url) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await findDonationStatus(env, code);
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  if (row.status !== 'success') {
    return error('Chỉ có thể hiện lời nhắn của khoản đã nhận.', 400);
  }
  await setDonationHidden(env, code, false);
  await purgePublicListCache(url);
  return json({ ok: true, status: 'success', hidden: false });
}

export async function handleAdminHide(env, orderCode, url) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await findDonationStatus(env, code);
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  if (row.status !== 'success') {
    return error('Chỉ có thể ẩn lời nhắn của khoản đã nhận.', 400);
  }
  await setDonationHidden(env, code, true);
  await purgePublicListCache(url);
  return json({ ok: true, status: 'success', hidden: true });
}

/** Small wrapper so the router stays flat: auth gate + handler in one call. */
export async function withAdmin(request, env, handler) {
  const { response: denied, session } = await requireAdmin(request, env);
  if (denied) return denied;
  return handler(session);
}
