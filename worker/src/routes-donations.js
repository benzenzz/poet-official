/**
 * Public donation routes: create a pending gift + PayOS link,
 * published wall, per-order status, public on/off flag.
 */
import { PAYMENT_TTL_SECONDS, RATE_LIMIT_MAX_PER_HOUR } from './config.js';
import { error, json, readJsonBody } from './http.js';
import { randomOrderCode } from './crypto.js';
import { resolvePayosReturnUrls } from './callback-urls.js';
import { createPaymentLink, hmacSha256Hex, verifyDataSignature } from './payos.js';
import { validateAmountAndGift, validateDisplayName, validateMessage, validateSticker } from './validation.js';
import {
  countRecentAttempts,
  deleteDonation,
  findDonationStatus,
  insertPendingDonation,
  isDonationsEnabled,
  listPublicDonations,
  pruneAttempts,
  recordAttempt,
  setPaymentLinkId,
} from './store.js';

/**
 * Per-IP hourly limit backed by create_attempts. `scope` namespaces the
 * hashed key ('' keeps donation rows identical to before; 'admin:' for
 * login/recover), so no schema change is needed.
 */
export async function checkRateLimit(
  request,
  env,
  scope = '',
  max = RATE_LIMIT_MAX_PER_HOUR,
  tooManyMessage = 'Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau một giờ.',
) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return { response: error('Không xác định được địa chỉ IP.', 400) };

  const ipHashFull = await hmacSha256Hex(env.PAYOS_CHECKSUM_KEY, scope + ip);
  const ipHash = scope + ipHashFull.slice(0, 32);
  const now = new Date();
  const nowIso = now.toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  // Pruning on every create cost a write each time; 1 in 10 is plenty
  // because the count below only looks at the last hour anyway.
  if (Math.random() < 0.1) await pruneAttempts(env, ipHash, twoHoursAgo);
  if ((await countRecentAttempts(env, ipHash, oneHourAgo)) >= max) {
    return { response: error(tooManyMessage, 429) };
  }
  return { ipHash, nowIso };
}

async function insertWithRetry(env, base) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const orderCode = randomOrderCode();
    try {
      await insertPendingDonation(env, { ...base, orderCode });
      return orderCode;
    } catch (err) {
      const msg = String(err?.message || err);
      if (!/UNIQUE|constraint|PRIMARY/i.test(msg)) throw err;
    }
  }
  return null;
}

export async function handleCreateDonation(request, env) {
  if (!(await isDonationsEnabled(env))) {
    return error('Trang ủng hộ đang tạm tắt. Quay lại sau giúp nhé.', 403);
  }

  const limit = await checkRateLimit(request, env);
  if (limit.response) return limit.response;

  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;

  const { gift, error: amountError } = validateAmountAndGift(body);
  if (amountError) return error(amountError, 400);

  const anonymous = Boolean(body?.anonymous);
  const { displayName, error: nameError } = validateDisplayName(body?.displayName, anonymous);
  if (nameError) return error(nameError, 400);

  const { message, error: messageError } = validateMessage(body?.message);
  if (messageError) return error(messageError, 400);

  const { sticker, error: stickerError } = validateSticker(body?.sticker);
  if (stickerError) return error(stickerError, 400);

  const resolved = resolvePayosReturnUrls({
    origin: request.headers.get('Origin'),
    allowedOrigin: env.ALLOWED_ORIGIN,
    returnUrl: body?.returnUrl,
    cancelUrl: body?.cancelUrl,
  });
  if (!resolved) return error('Địa chỉ quay lại không hợp lệ.', 400);

  await recordAttempt(env, limit.ipHash, limit.nowIso);

  const orderCode = await insertWithRetry(env, {
    amount: body.amount,
    displayName,
    message,
    anonymous,
    gift,
    sticker,
    nowIso: limit.nowIso,
  });
  if (!orderCode) return error('Không tạo được mã đơn. Vui lòng thử lại.', 500);

  // Bank message is the 9-digit orderCode itself (e.g. "482917364").
  // Unique per gift, fits the 9-char limit on unlinked PayOS accounts,
  // and is what donors/admins search for in the bank app or sao ke.
  // The donor's loi nhan stays on the wall and never goes in this field.
  const payosBody = {
    orderCode,
    amount: body.amount,
    description: String(orderCode),
    returnUrl: resolved.returnUrl,
    cancelUrl: resolved.cancelUrl,
    expiredAt: Math.floor(Date.now() / 1000) + PAYMENT_TTL_SECONDS,
    items: [{ name: 'Ung ho POET', quantity: 1, price: body.amount }],
  };

  let payosRes;
  try {
    payosRes = await createPaymentLink(env, payosBody);
  } catch {
    await deleteDonation(env, orderCode);
    return error('Không kết nối được PayOS.', 502);
  }

  const okCode = payosRes?.code === '00';
  const sigOk =
    payosRes?.data &&
    (await verifyDataSignature(payosRes.data, payosRes.signature, env.PAYOS_CHECKSUM_KEY));
  if (!okCode || !sigOk) {
    await deleteDonation(env, orderCode);
    return error('PayOS từ chối yêu cầu thanh toán.', 502);
  }

  await setPaymentLinkId(env, orderCode, payosRes.data.paymentLinkId);
  return json({ orderCode, checkoutUrl: payosRes.data.checkoutUrl });
}

const PUBLIC_CACHE_SECONDS = 30;

/**
 * Public wall, cached at the edge for 30s (caches.default) so a busy page
 * does not hit D1 on every load. Falls back to a direct read if the Cache
 * API is unavailable. Response contains no order codes or bank fields.
 */
export const PUBLIC_SORTS = ['new', 'amount'];

function publicCacheKey(origin, sort) {
  return new Request(sort === 'new' ? `${origin}/api/donations` : `${origin}/api/donations?sort=${sort}`);
}

export async function handleListPublic(env, ctx, url) {
  const sort = url.searchParams.get('sort') || 'new';
  if (!PUBLIC_SORTS.includes(sort)) return error('Kiểu sắp xếp không hợp lệ.', 400);
  // Key on the Worker's real host so the Cache API actually matches in prod.
  // One key per sort; any other query params are ignored.
  const cacheKey = publicCacheKey(url.origin, sort);
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  if (cache) {
    try {
      const hit = await cache.match(cacheKey);
      if (hit) return new Response(hit.body, hit);
    } catch {}
  }
  const { donations, totalAmount, totalCount, fundraising } = await listPublicDonations(env, sort);
  const res = json(
    { donations, totalAmount, totalCount, fundraising },
    200,
    { 'Cache-Control': `public, max-age=${PUBLIC_CACHE_SECONDS}` },
  );
  if (cache) {
    const put = cache.put(cacheKey, res.clone()).catch(() => {});
    if (ctx?.waitUntil) ctx.waitUntil(put);
    else await put;
  }
  return res;
}

/** Drop the cached wall after a payment or hide/show (same colo only; TTL covers others). */
export async function purgePublicListCache(url) {
  try {
    if (url && typeof caches !== 'undefined') {
      await Promise.all(PUBLIC_SORTS.map((s) => caches.default.delete(publicCacheKey(url.origin, s))));
    }
  } catch {}
}

export async function handleGetStatus(env, orderCode) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await findDonationStatus(env, code);
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  return json({
    status: row.status,
    hidden: row.status === 'success' ? Boolean(row.hidden) : false,
  });
}

export async function handleGetPublicSettings(env) {
  return json(
    { donationsEnabled: await isDonationsEnabled(env) },
    200,
    { 'Cache-Control': 'public, max-age=30' },
  );
}
