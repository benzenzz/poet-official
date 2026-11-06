import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateBusinessDeal,
  validateBusinessPatch,
  validateBusinessAmount,
  validateBusinessCount,
  BUSINESS_MAX_AMOUNT,
} from '../src/business.js';
import { handleListPublic } from '../src/routes-donations.js';
import {
  handleBusinessCreate,
  handleBusinessUpdate,
  handleBusinessDelete,
  handleUpdateAdminSettings,
} from '../src/routes-admin.js';
import worker from '../src/index.js';

const ok = (b) => assert.equal(validateBusinessDeal(b).error, null, JSON.stringify(b));
const bad = (b) => assert.ok(validateBusinessDeal(b).error, 'should reject ' + JSON.stringify(b));

const baseDeal = () => ({
  businessName: 'Công ty ABC',
  contactName: 'Lan',
  contactEmail: 'lan@abc.vn',
  contactPhone: '0900000000',
  taxCode: '0312-3456',
  amount: 5000000,
  status: 'received',
  note: 'Đã ký hợp đồng',
});

describe('validateBusinessDeal', () => {
  it('accepts a normal deal and trims fields', () => {
    const { value, error } = validateBusinessDeal(baseDeal());
    assert.equal(error, null);
    assert.equal(value.businessName, 'Công ty ABC');
    assert.equal(value.status, 'received');
    assert.equal(value.amount, 5000000);
  });
  it('stores null for empty optional fields', () => {
    const deal = baseDeal();
    deal.contactName = '   ';
    deal.contactEmail = '';
    delete deal.note;
    const { value, error } = validateBusinessDeal(deal);
    assert.equal(error, null);
    assert.equal(value.contactName, null);
    assert.equal(value.contactEmail, null);
    assert.equal(value.note, null);
  });
  it('accepts name + amount + status with phone, email and MST omitted', () => {
    const { value, error } = validateBusinessDeal({
      businessName: 'Công ty XYZ',
      amount: 1000000,
      status: 'received',
    });
    assert.equal(error, null);
    assert.equal(value.businessName, 'Công ty XYZ');
    assert.equal(value.contactEmail, null);
    assert.equal(value.contactPhone, null);
    assert.equal(value.taxCode, null);
    assert.equal(value.contactName, null);
    assert.equal(value.note, null);
  });
  it('rejects an empty name and over-length fields', () => {
    bad({ ...baseDeal(), businessName: '   ' });
    bad({ ...baseDeal(), businessName: 'x'.repeat(161) });
    bad({ ...baseDeal(), note: 'x'.repeat(501) });
  });
  it('rejects control characters like donation text', () => {
    bad({ ...baseDeal(), businessName: 'Công ty\x00ABC' });
    bad({ ...baseDeal(), businessName: 'Công ty <ABC>' });
  });
  it('rejects a bad email, tax code letters, unknown status', () => {
    bad({ ...baseDeal(), contactEmail: 'khong-ro' });
    bad({ ...baseDeal(), contactEmail: 'a@b c' });
    bad({ ...baseDeal(), taxCode: '031234AB' });
    bad({ ...baseDeal(), status: 'paid' });
    bad({ ...baseDeal(), status: 'RECEIVED' });
  });
  it('rejects fractional, zero, negative and over-cap amounts', () => {
    bad({ ...baseDeal(), amount: 5000000.5 });
    bad({ ...baseDeal(), amount: 0 });
    bad({ ...baseDeal(), amount: -1 });
    bad({ ...baseDeal(), amount: BUSINESS_MAX_AMOUNT + 1 });
    bad({ ...baseDeal(), amount: '5000000' });
    assert.equal(validateBusinessAmount(1), null);
    assert.equal(validateBusinessAmount(BUSINESS_MAX_AMOUNT), null);
  });
  it('does not mask links (this text is never public)', () => {
    const { value, error } = validateBusinessDeal({ ...baseDeal(), note: 'Hợp đồng tại abc.vn' });
    assert.equal(error, null);
    assert.equal(value.note, 'Hợp đồng tại abc.vn');
  });
});

describe('validateBusinessPatch', () => {
  it('accepts a status-only patch', () => {
    const { value, error } = validateBusinessPatch({ status: 'pledged' });
    assert.equal(error, null);
    assert.deepEqual(value, { status: 'pledged' });
  });
  it('accepts any subset', () => {
    const { value, error } = validateBusinessPatch({ amount: 1, note: 'ok' });
    assert.equal(error, null);
    assert.deepEqual(value, { amount: 1, note: 'ok' });
  });
  it('rejects an empty patch and unknown-only patches', () => {
    bad({});
    bad({ season: 'season-6' });
    bad({ status: 'nope' });
    bad({ amount: 0 });
  });
});

// Scripted fake D1 keyed on the SQL text, gift.test.mjs style.
function fakePublicEnv({ hasBusinessTable = true } = {}) {
  const log = [];
  const stmt = (sql) => ({ sql, args: [], bind(...a) { this.args = a; return this; } });
  const DB = {
    prepare: stmt,
    async batch(statements) {
      const sqls = statements.map((s) => s.sql);
      if (!hasBusinessTable && sqls.some((s) => /business_deals/.test(s))) {
        // D1 batches fail wholesale when one statement names a missing table.
        throw new Error('D1_ERROR: no such table: business_deals');
      }
      log.push(...sqls);
      // One result block per statement, like real D1.
      return sqls.map((sql) => {
        if (/business_deals/.test(sql)) {
          return { results: [{ businessAmount: 500000, businessCount: 1 }] };
        }
        if (/AS totalAmount/.test(sql)) {
          return { results: [{ totalAmount: 300000, totalCount: 2, businessCount: '7' }] };
        }
        return { results: [
          { displayName: 'Lan', message: 'Hi', amount: 100000, paidAt: 'x' },
          { displayName: 'Bình', message: '', amount: 200000, paidAt: 'y' },
        ] };
      });
    },
  };
  return { env: { DB, PAYOS_CHECKSUM_KEY: 'k', ALLOWED_ORIGIN: 'https://maiphh.github.io' }, log };
}

describe('public payload adds fundraising without touching the wall fields', () => {
  it('individual figures equal the wall totals; business count is the typed setting, not the ledger', async () => {
    const { env } = fakePublicEnv();
    const res = await handleListPublic(env, null, new URL('http://w/api/donations'));
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalAmount, 300000);
    assert.equal(data.totalCount, 2);
    assert.deepEqual(data.fundraising, {
      individualAmount: 300000,
      individualCount: 2,
      businessAmount: 500000,
      businessCount: 7,
      raisedAmount: 800000,
    });
  });
  it('missing business_deals table: wall stays intact, business money is 0', async () => {
    const { env, log } = fakePublicEnv({ hasBusinessTable: false });
    const res = await handleListPublic(env, null, new URL('http://w/api/donations'));
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalAmount, 300000);
    assert.deepEqual(data.fundraising, {
      individualAmount: 300000,
      individualCount: 2,
      businessAmount: 0,
      businessCount: 7,
      raisedAmount: 300000,
    });
    // The retried batch drops only the business statement.
    assert.equal(log.filter((s) => /business_deals/.test(s)).length, 0);
  });
});

describe('typed business count in admin settings', () => {
  const settingsEnv = () => {
    const store = new Map();
    const DB = { prepare: (sql) => ({
      bind(...a) { this.args = a; return this; },
      async first() { return store.has(this.args[0]) ? { value: store.get(this.args[0]) } : null; },
      async run() { store.set(this.args[0], this.args[1]); assert.match(sql, /INSERT INTO settings/); },
    }) };
    return { env: { DB }, store };
  };
  const post = (env, body) => handleUpdateAdminSettings(
    new Request('http://w/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
    new URL('http://w/api/admin/settings'),
  );

  it('accepts whole numbers in range only', () => {
    for (const n of [0, 14, 100000]) assert.equal(validateBusinessCount(n), null);
    for (const n of [-1, 1.5, 100001, '3', null]) assert.ok(validateBusinessCount(n), String(n));
  });
  it('saving the count leaves the toggle alone, and the reverse', async () => {
    const { env, store } = settingsEnv();
    const data = await (await post(env, { businessCount: 14 })).json();
    assert.equal(data.businessCount, 14);
    assert.equal(data.donationsEnabled, true);
    assert.equal(store.has('donations_enabled'), false);
    const off = await (await post(env, { donationsEnabled: false })).json();
    assert.deepEqual([off.businessCount, off.donationsEnabled], [14, false]);
  });
  it('rejects a bad count without writing, and an empty body', async () => {
    const { env, store } = settingsEnv();
    assert.equal((await post(env, { businessCount: -1 })).status, 400);
    assert.equal((await post(env, {})).status, 400);
    assert.equal(store.size, 0);
  });
});

function fakeAdminEnv(dealsById = {}, { rowForUnknown = null } = {}) {
  const log = [];
  const stmt = (sql) => ({
    sql, args: [],
    bind(...a) { this.args = a; return this; },
    async first() {
      log.push([this.sql, this.args]);
      if (/WHERE id = \?/.test(this.sql) && /business_deals/.test(this.sql)) {
        return dealsById[this.args[0]] || rowForUnknown;
      }
      return null;
    },
    async run() {
      log.push([this.sql, this.args]);
      // Mimic D1: a DELETE of a missing row changes nothing.
      const missing = this.sql.startsWith('DELETE FROM business_deals') && !dealsById[this.args[0]];
      return { meta: { changes: missing ? 0 : 1 } };
    },
    async all() {
      log.push([this.sql, this.args]);
      return { results: [] };
    },
  });
  const DB = { prepare: stmt, async batch() { throw new Error('unexpected batch'); } };
  return { env: { DB, PAYOS_CHECKSUM_KEY: 'k' }, log };
}

const ID = 'a'.repeat(32); // business ids are randomHex(16): 32 hex chars
const DEALS = { [ID]: { id: ID, businessName: 'ABC', amount: 5000000, status: 'pledged' } };

const patchRequest = (id = ID) =>
  new Request(`http://w/api/admin/business-deals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'received' }),
  });

describe('admin business routes', () => {
  it('PATCH of an unknown id -> 404', async () => {
    const { env } = fakeAdminEnv({});
    const res = await handleBusinessUpdate(patchRequest(ID), env, { username: 'admin' }, ID, new URL('http://w'));
    assert.equal(res.status, 404);
  });
  it('status change is the only field required; SQL updates status + updated_at', async () => {
    const { env, log } = fakeAdminEnv(DEALS);
    const res = await handleBusinessUpdate(patchRequest(), env, { username: 'admin' }, ID, new URL('http://w'));
    assert.equal(res.status, 200);
    const update = log.find(([sql]) => sql.startsWith('UPDATE business_deals'));
    assert.match(update[0], /status = \?/);
    assert.match(update[0], /updated_at = \?/);
    assert.equal(update[0].split('SET')[1].split('WHERE')[0].trim().split(',').length, 2);
    assert.equal(update[1][0], 'received');
    assert.equal(update[1][2], ID);
  });
  it('empty patch body -> 400, no SQL writes', async () => {
    const { env, log } = fakeAdminEnv(DEALS);
    const req = new Request(`http://w/api/admin/business-deals/${ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unrelated: true }),
    });
    const res = await handleBusinessUpdate(req, env, { username: 'admin' }, ID, new URL('http://w'));
    assert.equal(res.status, 400);
    assert.equal(log.filter(([sql]) => sql.startsWith('UPDATE')).length, 0);
  });
  it('DELETE names the deal, 404 when unknown', async () => {
    const missing = fakeAdminEnv({});
    assert.equal((await handleBusinessDelete(missing.env, ID, new URL('http://w'))).status, 404);
    const { env, log } = fakeAdminEnv(DEALS);
    const res = await handleBusinessDelete(env, ID, new URL('http://w'));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.ok(log.some(([sql]) => sql.startsWith('DELETE FROM business_deals')));
  });
  it('create stores createdBy as the session username and returns the row', async () => {
    const row = { id: ID };
    const { env, log } = fakeAdminEnv({}, { rowForUnknown: row });
    const req = new Request('http://w/api/admin/business-deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baseDeal()),
    });
    const res = await handleBusinessCreate(req, env, { username: 'phuong' }, new URL('http://w'));
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), row);
    const insert = log.find(([sql]) => sql.startsWith('INSERT INTO business_deals'));
    assert.equal(insert[1][11], 'phuong'); // created_by, last bound value
    assert.match(insert[1][0], /^[0-9a-f]{32}$/); // randomHex(16) id
  });
  it('router requires auth for GET/PATCH/DELETE', async () => {
    for (const [method, path] of [
      ['GET', '/api/admin/business-deals'],
      ['POST', '/api/admin/business-deals'],
      ['PATCH', `/api/admin/business-deals/${ID}`],
      ['DELETE', `/api/admin/business-deals/${ID}`],
    ]) {
      const { env } = fakeAdminEnv(DEALS);
      const res = await worker.fetch(new Request('http://w' + path, { method }), env, {});
      assert.equal(res.status, 401, method + ' ' + path);
    }
  });
});
