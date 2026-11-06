/**
 * Business-deal validation. Pure: no D1, no fetch, no PayOS.
 * Unlike donation display text, business names are never published, so the
 * public-wall masker does NOT run here. Control characters are still rejected
 * the same way (hasUnsafeControlChars), and every string is trimmed.
 */
import { hasUnsafeControlChars } from './mask.js';

export const BUSINESS_STATUSES = ['pledged', 'received', 'cancelled'];

/** Contract money, not a PayOS link: the 10.000–20.000.000 cap does not apply. */
export const BUSINESS_MAX_AMOUNT = 2_000_000_000;

export const BUSINESS_COUNT_MAX = 100_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+$/;
const TAX_CODE_RE = /^[0-9-]*$/;

const AMOUNT_ERROR = 'Số tiền phải là số nguyên từ 1 đến 2.000.000.000 đồng.';
const STATUS_ERROR = 'Trạng thái không hợp lệ.';

function cleanText(value, field, max, required) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    if (required) return { error: `${field} không được để trống.` };
    // Empty optional fields are stored as NULL, not ''.
    return { value: null };
  }
  if (raw.length > max) return { error: `${field} tối đa ${max} ký tự.` };
  if (hasUnsafeControlChars(raw)) {
    return { error: `${field} chứa nội dung không được phép.` };
  }
  return { value: raw };
}

export function validateBusinessAmount(amount) {
  if (!Number.isInteger(amount) || amount < 1 || amount > BUSINESS_MAX_AMOUNT) {
    return AMOUNT_ERROR;
  }
  return null;
}

/** The public partner count typed in /admin; independent of the deal ledger. */
export function validateBusinessCount(count) {
  if (!Number.isInteger(count) || count < 0 || count > BUSINESS_COUNT_MAX) {
    return 'Số doanh nghiệp phải là số nguyên từ 0 đến 100.000.';
  }
  return null;
}

export function validateBusinessStatus(status) {
  if (!BUSINESS_STATUSES.includes(status)) return STATUS_ERROR;
  return null;
}

/** Rule for one editable field. Returns { value, error } for a single field. */
function validateField(key, raw) {
  switch (key) {
    case 'businessName':
      return { key: 'businessName', ...cleanText(raw, 'Tên doanh nghiệp', 160, true) };
    case 'contactName':
      return { key: 'contactName', ...cleanText(raw, 'Người liên hệ', 80, false) };
    case 'contactEmail': {
      const out = cleanText(raw, 'Email', 120, false);
      if (out.value !== null && out.value !== undefined && !EMAIL_RE.test(out.value)) {
        return { key: 'contactEmail', error: 'Email không hợp lệ.' };
      }
      return { key: 'contactEmail', ...out };
    }
    case 'contactPhone':
      return { key: 'contactPhone', ...cleanText(raw, 'Số điện thoại', 30, false) };
    case 'taxCode': {
      const out = cleanText(raw, 'Mã số thuế', 20, false);
      if (out.value !== null && out.value !== undefined && !TAX_CODE_RE.test(out.value)) {
        return { key: 'taxCode', error: 'Mã số thuế chỉ gồm chữ số và dấu gạch ngang.' };
      }
      return { key: 'taxCode', ...out };
    }
    case 'note':
      return { key: 'note', ...cleanText(raw, 'Ghi chú nội bộ', 500, false) };
    case 'amount': {
      const error = validateBusinessAmount(raw);
      return { key: 'amount', value: raw, error };
    }
    case 'status': {
      const error = validateBusinessStatus(raw);
      return { key: 'status', value: raw, error };
    }
    default:
      return null; // not editable; silently ignored
  }
}

const EDITABLE_KEYS = [
  'businessName', 'contactName', 'contactEmail', 'contactPhone',
  'taxCode', 'amount', 'status', 'note',
];

/**
 * Full deal payload for POST: every field must be valid.
 * Returns { value, error } where value holds trimmed strings, null for empty
 * optionals, and typed amount/status.
 */
export function validateBusinessDeal(body) {
  if (!body || typeof body !== 'object') return { value: null, error: 'Dữ liệu không hợp lệ.' };
  const value = {};
  for (const key of EDITABLE_KEYS) {
    const out = validateField(key, body[key]);
    if (!out) continue;
    if (out.error) return { value: null, error: out.error };
    if (out.value === undefined) return { value: null, error: 'Dữ liệu không hợp lệ.' };
    value[key] = out.value;
  }
  return { value, error: null };
}

/**
 * PATCH payload: any subset of the editable fields. Unknown keys are ignored;
 * a body with no editable field is an error. Returns { value, error }.
 */
export function validateBusinessPatch(body) {
  if (!body || typeof body !== 'object') return { value: null, error: 'Dữ liệu không hợp lệ.' };
  const value = {};
  for (const key of EDITABLE_KEYS) {
    if (!(key in body)) continue;
    const out = validateField(key, body[key]);
    if (!out) continue;
    if (out.error) return { value: null, error: out.error };
    if (out.value === undefined) return { value: null, error: 'Dữ liệu không hợp lệ.' };
    value[key] = out.value;
  }
  if (Object.keys(value).length === 0) {
    return { value: null, error: 'Không có trường nào cần cập nhật.' };
  }
  return { value, error: null };
}
