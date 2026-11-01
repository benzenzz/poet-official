/** Shared constants for the donations Worker. */

export const MIN_AMOUNT = 10000;
export const MAX_AMOUNT = 20000000;

export const PROD_RETURN_URL = 'https://www.poetnpo.site/ung-ho/return.html';
export const PROD_CANCEL_URL = 'https://www.poetnpo.site/ung-ho/cancel.html';
export const ADMIN_MOVED_URL = 'https://www.poetnpo.site/admin/';

export const PAYMENT_TTL_SECONDS = 30 * 60;
export const ORDER_CODE_MIN = 100000000;
export const ORDER_CODE_MAX = 999999999;

export const RATE_LIMIT_MAX_PER_HOUR = 5;
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export const PUBLIC_WALL_LIMIT = 30;
export const ADMIN_LIST_LIMIT = 100;
export const ADMIN_AUTH_MAX_PER_HOUR = 10;
