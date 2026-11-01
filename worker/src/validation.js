/**
 * Donation input validation. Returns sanitized values or a Vietnamese
 * error message. Masking (link/curse) lives in mask.js.
 */
import { MAX_AMOUNT, MIN_AMOUNT } from './config.js';
import { hasUnsafeControlChars, maskDonationText } from './mask.js';
import { GIFTS } from './gifts.js';

export function validateAmount(amount) {
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return 'Số tiền phải từ 10.000 đến 20.000.000 đồng.';
  }
  return null;
}

/**
 * Amount + optional gift. With a gift: giftId in GIFTS, giftQty integer >= 1,
 * amount === price * qty exactly and <= MAX_AMOUNT. Without a gift (custom
 * amount): integer, multiple of 1.000, MIN..MAX. Gift fields of any wrong
 * type (including giftId without giftQty or vice versa) are rejected.
 * Returns { gift: { id, qty } | null, error }.
 */
export function validateAmountAndGift(body) {
  const amount = body?.amount;
  const hasId = body?.giftId !== undefined && body?.giftId !== null;
  const hasQty = body?.giftQty !== undefined && body?.giftQty !== null;
  if (hasId || hasQty) {
    const bad = { gift: null, error: 'Món quà không hợp lệ.' };
    if (!hasId || !hasQty) return bad;
    const id = body.giftId;
    const qty = body.giftQty;
    if (typeof id !== 'string' || !Object.prototype.hasOwnProperty.call(GIFTS, id)) return bad;
    if (typeof qty !== 'number' || !Number.isSafeInteger(qty) || qty < 1) {
      return { gift: null, error: 'Số lượng quà không hợp lệ.' };
    }
    const total = GIFTS[id] * qty;
    if (total > MAX_AMOUNT) return { gift: null, error: 'Tối đa 20.000.000 đ.' };
    if (amount !== total) return { gift: null, error: 'Số tiền không khớp với món quà.' };
    return { gift: { id, qty }, error: null };
  }
  const amountError = validateAmount(amount);
  if (amountError) return { gift: null, error: amountError };
  if (amount % 1000 !== 0) return { gift: null, error: 'Số tiền phải là bội số của 1.000 đ.' };
  return { gift: null, error: null };
}

export function validateDisplayName(rawName, anonymous) {
  if (anonymous) return { displayName: 'Một nhà hảo tâm', error: null };
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (name.length < 1 || name.length > 40) {
    return { displayName: null, error: 'Tên hiển thị phải từ 1 đến 40 ký tự.' };
  }
  if (hasUnsafeControlChars(name)) {
    return { displayName: null, error: 'Tên hiển thị chứa nội dung không được phép.' };
  }
  const displayName = maskDonationText(name).slice(0, 40);
  if (!displayName) {
    return { displayName: null, error: 'Tên hiển thị phải từ 1 đến 40 ký tự.' };
  }
  return { displayName, error: null };
}

export function validateMessage(rawMessage) {
  const text = typeof rawMessage === 'string' ? rawMessage.trim() : '';
  if (text.length === 0) return { message: '', error: null }; // optional (N1)
  if (text.length > 160) {
    return { message: null, error: 'Lời nhắn tối đa 160 ký tự.' };
  }
  if (hasUnsafeControlChars(text)) {
    return { message: null, error: 'Lời nhắn chứa nội dung không được phép.' };
  }
  const message = maskDonationText(text).slice(0, 160);
  return { message, error: null };
}

/** Wall sticker ids; must match messageWall.glyphs in data/content.mjs. */
export const STICKERS = Object.freeze(['xe-rua', 'cap-sach', 'cau-tuot', 'dep-lao']);

/** Optional sticker: absent/null -> null, otherwise one of STICKERS. */
export function validateSticker(raw) {
  if (raw === undefined || raw === null || raw === '') return { sticker: null, error: null };
  if (typeof raw !== 'string' || !STICKERS.includes(raw)) return { sticker: null, error: 'Sticker không hợp lệ.' };
  return { sticker: raw, error: null };
}
