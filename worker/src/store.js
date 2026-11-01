/**
 * D1 access layer. All SQL lives here so route handlers stay I/O-light
 * and readable. Callers pass `env` (expects `env.DB`).
 */
import { ADMIN_LIST_LIMIT, PUBLIC_WALL_LIMIT } from './config.js';
import { hashPassword, randomHex } from './crypto.js';

/* -- settings -- */

export async function getSetting(env, key, fallback) {
  try {
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind(key)
      .first();
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(env, key, value) {
  await env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
    .bind(key, value)
    .run();
}

export async function isDonationsEnabled(env) {
  return (await getSetting(env, 'donations_enabled', '1')) !== '0';
}

/* -- admin users / sessions -- */

/**
 * First-run seed: user 'admin' with a random, never-revealed password, so
 * there is no default login. Set the first real password with
 * POST /api/admin/recover-password using the ADMIN_TOKEN secret.
 */
export async function ensureAdminSeeded(env) {
  try {
    // LIMIT 1 reads one row instead of scanning the whole table.
    const row = await env.DB.prepare('SELECT 1 AS x FROM admin_users LIMIT 1').first();
    if (row) return;
    const nowIso = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?)',
    )
      .bind('admin', await hashPassword(randomHex(32)), nowIso)
      .run();
  } catch {
    // Tables may not be migrated yet; login will surface the error.
  }
}

export async function findAdminUser(env, username) {
  return env.DB.prepare('SELECT username, password_hash FROM admin_users WHERE username = ?')
    .bind(username)
    .first();
}

export async function upsertAdminPassword(env, username, passwordHash, nowIso) {
  await env.DB.prepare(
    'INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?) ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at',
  )
    .bind(username, passwordHash, nowIso)
    .run();
}

export async function createAdminSession(env, token, username, createdAt, expiresAt) {
  await env.DB.prepare(
    'INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)',
  )
    .bind(token, username, createdAt, expiresAt)
    .run();
}

/** Drop expired sessions. Called on login only, not on every admin request. */
export async function pruneExpiredAdminSessions(env, nowIso) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(nowIso).run();
}

export async function deleteAdminSession(env, token) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
}

export async function deleteOtherAdminSessions(env, username, keepToken) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE username = ? AND token != ?')
    .bind(username, keepToken)
    .run();
}

export async function deleteAdminSessionsForUser(env, username) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE username = ?').bind(username).run();
}

/* -- rate limiting -- */

/** Global cleanup of old attempt rows (all IPs). Called on admin login. */
export async function pruneAllAttempts(env, beforeIso) {
  await env.DB.prepare('DELETE FROM create_attempts WHERE created_at < ?').bind(beforeIso).run();
}


export async function pruneAttempts(env, ipHash, beforeIso) {
  await env.DB.prepare('DELETE FROM create_attempts WHERE ip_hash = ? AND created_at < ?')
    .bind(ipHash, beforeIso)
    .run();
}

export async function countRecentAttempts(env, ipHash, sinceIso) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM create_attempts WHERE ip_hash = ? AND created_at >= ?',
  )
    .bind(ipHash, sinceIso)
    .first();
  return row?.c || 0;
}

export async function recordAttempt(env, ipHash, nowIso) {
  await env.DB.prepare('INSERT INTO create_attempts (ip_hash, created_at) VALUES (?, ?)')
    .bind(ipHash, nowIso)
    .run();
}

/* -- donations -- */

export async function insertPendingDonation(env, { orderCode, amount, displayName, message, anonymous, gift = null, sticker = null, nowIso }) {
  // Optional columns are only named when used, so a DB missing migration
  // 0004 (gift) or 0006 (sticker) fails loudly instead of losing the value.
  const cols = ['order_code', 'amount', 'display_name', 'message', 'anonymous', 'created_at'];
  const args = [orderCode, amount, displayName, message, anonymous ? 1 : 0, nowIso];
  if (gift) cols.push('gift_id', 'gift_qty'), args.push(gift.id, gift.qty);
  if (sticker) cols.push('sticker'), args.push(sticker);
  await env.DB.prepare(
    `INSERT INTO donations (${cols.join(', ')}, status) VALUES (${cols.map(() => '?').join(', ')}, 'pending')`,
  )
    .bind(...args)
    .run();
}

export async function deleteDonation(env, orderCode) {
  await env.DB.prepare('DELETE FROM donations WHERE order_code = ?').bind(orderCode).run();
}

export async function setPaymentLinkId(env, orderCode, paymentLinkId) {
  await env.DB.prepare('UPDATE donations SET payment_link_id = ? WHERE order_code = ?')
    .bind(paymentLinkId, orderCode)
    .run();
}

function publicListStatements(env, withGift, withBusiness, sort, withSticker = true) {
  // sort=amount uses idx_donations_success_amount (status, amount).
  const order = sort === 'amount' ? 'amount DESC, paid_at DESC' : 'paid_at DESC';
  const statements = [
    env.DB.prepare(
      `SELECT display_name AS displayName,
              CASE WHEN hidden = 1 THEN '' ELSE message END AS message,
              amount, paid_at AS paidAt${withGift ? ',\n              gift_id AS giftId, gift_qty AS giftQty' : ''}${withSticker ? ', sticker' : ''}
       FROM donations
       WHERE status = 'success'
       ORDER BY ${order}
       LIMIT ${PUBLIC_WALL_LIMIT}`,
    ),
    env.DB.prepare(
      `SELECT COALESCE(SUM(amount), 0) AS totalAmount, COUNT(*) AS totalCount
       FROM donations
       WHERE status = 'success'`,
    ),
  ];
  if (withBusiness) {
    // Fundraising object: only `received` deals count (migration 0005).
    statements.push(
      env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) AS businessAmount, COUNT(*) AS businessCount
         FROM business_deals
         WHERE status = 'received'`,
      ),
    );
  }
  return statements;
}

export async function listPublicDonations(env, sort = 'new') {
  // One round trip for every query. idx_donations_success_amount makes the
  // SUM/COUNT an index-only scan instead of reading whole donation rows.
  // Falls back progressively: pre-0004 columns when the gift migration is not
  // applied, and zero business figures when business_deals is missing, so an
  // old database never breaks the wall response.
  let list;
  let totals;
  let businessRow;
  let withGift = true;
  let withBusiness = true;
  let withSticker = true;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      [list, totals, businessRow] = await env.DB.batch(
        publicListStatements(env, withGift, withBusiness, sort, withSticker),
      );
      break;
    } catch (err) {
      const msg = String(err?.message || err);
      let retry = false;
      if (withGift && /gift_/i.test(msg)) {
        withGift = false;
        retry = true;
      }
      if (withSticker && /sticker/i.test(msg)) {
        withSticker = false;
        retry = true;
      }
      if (withBusiness && /business_deals/i.test(msg)) {
        withBusiness = false;
        retry = true;
      }
      if (!retry) throw err;
    }
  }
  const results = list.results;
  const totalRow = totals.results?.[0];
  const business = businessRow?.results?.[0] || {};
  const individualAmount = Number(totalRow?.totalAmount) || 0;
  const individualCount = Number(totalRow?.totalCount) || 0;
  const businessAmount = Number(business.businessAmount) || 0;
  const businessCount = Number(business.businessCount) || 0;

  return {
    donations: results || [],
    totalAmount: individualAmount,
    totalCount: individualCount,
    fundraising: {
      individualAmount,
      individualCount,
      businessAmount,
      businessCount,
      raisedAmount: individualAmount + businessAmount,
    },
  };
}

export async function findDonationStatus(env, orderCode) {
  try {
    return await env.DB.prepare(
      'SELECT status, hidden, amount FROM donations WHERE order_code = ?',
    )
      .bind(orderCode)
      .first();
  } catch {
    return env.DB.prepare('SELECT status, amount FROM donations WHERE order_code = ?')
      .bind(orderCode)
      .first();
  }
}

export async function findDonationForWebhook(env, orderCode) {
  try {
    return await env.DB.prepare(
      'SELECT order_code, amount, status, hidden, payos_reference FROM donations WHERE order_code = ?',
    )
      .bind(orderCode)
      .first();
  } catch {
    return env.DB.prepare(
      'SELECT order_code, amount, status FROM donations WHERE order_code = ?',
    )
      .bind(orderCode)
      .first();
  }
}

/**
 * Mark an unpaid donation as success with PayOS audit fields. A valid paid
 * webhook can arrive after the 30-min link expiry, so pending and legacy
 * expired/cancelled rows all move to success. Does not touch hidden.
 * Already-success rows are left alone (idempotent).
 * Falls back to the minimal update on DBs without the audit migration.
 */
/** Statuses a late, valid PayOS 'paid' webhook may still settle. */
export const UNPAID_STATUSES = ['pending', 'expired', 'cancelled'];
const UNPAID_SQL = UNPAID_STATUSES.map((s) => `'${s}'`).join(', ');

export async function markDonationPaid(env, orderCode, data, paidAtIso) {
  const audit = {
    payos_reference: data.reference ?? null,
    paid_at: paidAtIso,
    payos_account_number: data.accountNumber ?? null,
    payos_transaction_time: data.transactionDateTime ?? null,
    payos_description: data.description ?? null,
    payos_currency: data.currency ?? null,
    counter_account_bank_id: data.counterAccountBankId ?? null,
    counter_account_bank_name: data.counterAccountBankName ?? null,
    counter_account_name: data.counterAccountName ?? null,
    counter_account_number: data.counterAccountNumber ?? null,
    virtual_account_name: data.virtualAccountName ?? null,
    virtual_account_number: data.virtualAccountNumber ?? null,
  };
  try {
    await env.DB.prepare(
      `UPDATE donations
       SET status = 'success', payos_reference = ?, paid_at = ?,
           payos_account_number = ?, payos_transaction_time = ?,
           payos_description = ?, payos_currency = ?,
           counter_account_bank_id = ?, counter_account_bank_name = ?,
           counter_account_name = ?, counter_account_number = ?,
           virtual_account_name = ?, virtual_account_number = ?,
           payment_link_id = COALESCE(payment_link_id, ?)
       WHERE order_code = ? AND status IN (${UNPAID_SQL})`,
    )
      .bind(
        audit.payos_reference,
        audit.paid_at,
        audit.payos_account_number,
        audit.payos_transaction_time,
        audit.payos_description,
        audit.payos_currency,
        audit.counter_account_bank_id,
        audit.counter_account_bank_name,
        audit.counter_account_name,
        audit.counter_account_number,
        audit.virtual_account_name,
        audit.virtual_account_number,
        data.paymentLinkId ?? null,
        orderCode,
      )
      .run();
  } catch {
    await env.DB.prepare(
      `UPDATE donations
       SET status = 'success', payos_reference = ?, paid_at = ?
       WHERE order_code = ? AND status IN (${UNPAID_SQL})`,
    )
      .bind(data.reference || null, paidAtIso, orderCode)
      .run();
  }
}

function withHiddenFlag(row) {
  if (!row) return row;
  return { ...row, hidden: Boolean(row.hidden) };
}

export async function listDonationsForAdmin(env, hiddenFilter = null) {
  // hiddenFilter: 'hidden' | 'visible' | null (all).
  const where = hiddenFilter === 'hidden' ? "WHERE status = 'success' AND hidden = 1"
    : hiddenFilter === 'visible' ? "WHERE status = 'success' AND hidden = 0" : '';
  try {
    const { results } = await env.DB.prepare(
      `SELECT order_code AS orderCode, amount, display_name AS displayName,
              message, anonymous, status, hidden, paid_at AS paidAt, created_at AS createdAt,
              payment_link_id AS paymentLinkId, payos_reference AS payosReference,
              payos_account_number AS payosAccountNumber,
              payos_transaction_time AS payosTransactionTime,
              payos_description AS payosDescription, payos_currency AS payosCurrency,
              counter_account_bank_id AS counterAccountBankId,
              counter_account_bank_name AS counterAccountBankName,
              counter_account_name AS counterAccountName,
              counter_account_number AS counterAccountNumber,
              virtual_account_name AS virtualAccountName,
              virtual_account_number AS virtualAccountNumber
       FROM donations
       ${where}
       ORDER BY created_at DESC
       LIMIT ${ADMIN_LIST_LIMIT}`,
    ).all();
    return (results || []).map(withHiddenFlag);
  } catch {
    // DB without the audit/hidden migration: select the base columns only.
    const { results } = await env.DB.prepare(
      `SELECT order_code AS orderCode, amount, display_name AS displayName,
              message, anonymous, status, paid_at AS paidAt, created_at AS createdAt
       FROM donations
       ORDER BY created_at DESC
       LIMIT ${ADMIN_LIST_LIMIT}`,
    ).all();
    if (hiddenFilter === 'hidden') return [];
    return (results || []).map((row) => withHiddenFlag({ ...row, hidden: 0 }));
  }
}

export async function totalsForAdmin(env) {
  return env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS totalReceived, COUNT(*) AS receivedCount
     FROM donations
     WHERE status = 'success'`,
  ).first();
}

/** Set message visibility. Caller must ensure status = success. */
export async function setDonationHidden(env, orderCode, hidden) {
  await env.DB.prepare('UPDATE donations SET hidden = ? WHERE order_code = ? AND status = ?')
    .bind(hidden ? 1 : 0, orderCode, 'success')
    .run();
}

export async function updateAdminPassword(env, username, passwordHash, nowIso) {
  await env.DB.prepare(
    'UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = ?',
  )
    .bind(passwordHash, nowIso, username)
    .run();
}

export async function findAdminPasswordHash(env, username) {
  return env.DB.prepare('SELECT password_hash FROM admin_users WHERE username = ?')
    .bind(username)
    .first();
}

/* -- business deals (migration 0005) -- */

const BUSINESS_LIST_LIMIT = 500;

const BUSINESS_SELECT = `SELECT id, business_name AS businessName,
    contact_name AS contactName, contact_email AS contactEmail,
    contact_phone AS contactPhone, tax_code AS taxCode,
    amount, status, note, created_at AS createdAt, updated_at AS updatedAt,
    created_by AS createdBy
 FROM business_deals`;

export async function listBusinessDeals(env) {
  const { results } = await env.DB.prepare(
    `${BUSINESS_SELECT} ORDER BY updated_at DESC LIMIT ${BUSINESS_LIST_LIMIT}`,
  ).all();
  return results || [];
}

/** Public aggregate: only `received` deals count toward the fundraising total. */
export async function businessReceivedTotals(env) {
  try {
    const row = await env.DB.prepare(
      `SELECT COALESCE(SUM(amount), 0) AS businessAmount, COUNT(*) AS businessCount
       FROM business_deals WHERE status = 'received'`,
    ).first();
    return {
      businessAmount: Number(row?.businessAmount) || 0,
      businessCount: Number(row?.businessCount) || 0,
    };
  } catch {
    // Migration not applied yet: the wall keeps working with zero business money.
    return { businessAmount: 0, businessCount: 0 };
  }
}

export async function createBusinessDeal(env, deal, username, nowIso) {
  const id = randomHex(16);
  await env.DB.prepare(
    `INSERT INTO business_deals (
       id, business_name, contact_name, contact_email, contact_phone,
       tax_code, amount, status, note, created_at, updated_at, created_by
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, deal.businessName, deal.contactName, deal.contactEmail, deal.contactPhone,
      deal.taxCode, deal.amount, deal.status, deal.note, nowIso, nowIso, username,
    )
    .run();
  return findBusinessDeal(env, id);
}

export async function findBusinessDeal(env, id) {
  return env.DB.prepare(`${BUSINESS_SELECT} WHERE id = ?`).bind(id).first();
}

const BUSINESS_COLUMNS = {
  businessName: 'business_name',
  contactName: 'contact_name',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  taxCode: 'tax_code',
  amount: 'amount',
  status: 'status',
  note: 'note',
};

/** fields is a validated subset from business.js; updated_at is bumped here. */
export async function updateBusinessDeal(env, id, fields, nowIso) {
  const keys = Object.keys(fields).filter((key) => BUSINESS_COLUMNS[key]);
  const sets = keys.map((key) => `${BUSINESS_COLUMNS[key]} = ?`);
  sets.push('updated_at = ?');
  const res = await env.DB.prepare(
    `UPDATE business_deals SET ${sets.join(', ')} WHERE id = ?`,
  )
    .bind(...keys.map((key) => fields[key]), nowIso, id)
    .run();
  return res.meta?.changes ? findBusinessDeal(env, id) : null;
}

export async function deleteBusinessDeal(env, id) {
  const res = await env.DB.prepare('DELETE FROM business_deals WHERE id = ?').bind(id).run();
  return Boolean(res.meta?.changes);
}

