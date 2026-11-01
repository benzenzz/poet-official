import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateAmountAndGift, validateMessage } from '../src/validation.js';
import { GIFTS } from '../src/gifts.js';
import { handleCreateDonation } from '../src/routes-donations.js';
import { insertPendingDonation, listPublicDonations } from '../src/store.js';

const v = (b) => validateAmountAndGift(b);
const ok = (b) => assert.equal(v(b).error, null, JSON.stringify(b));
const bad = (b) => assert.ok(v(b).error, 'should reject ' + JSON.stringify(b));

describe('validateAmountAndGift: with gift', () => {
  it('accepts price*qty', () => {
    ok({ amount: 100000, giftId: 'tap', giftQty: 5 });
    ok({ amount: 10000, giftId: 'but', giftQty: 1 });
    ok({ amount: 60000, giftId: 'tap', giftQty: 3 });
    assert.deepEqual(v({ amount: 60000, giftId: 'tap', giftQty: 3 }).gift, { id: 'tap', qty: 3 });
  });
  it('allows qty above 10 (no count cap)', () => {
    ok({ amount: 110000, giftId: 'but', giftQty: 11 });
    ok({ amount: 20000000, giftId: 'balo', giftQty: 40 });
  });
  it('rejects totals above 20.000.000 (41 Balo)', () => bad({ amount: 20500000, giftId: 'balo', giftQty: 41 }));
  it('rejects forged "100 Balo for 10.000"', () => bad({ amount: 10000, giftId: 'balo', giftQty: 100 }));
  it('rejects amount not equal to price*qty', () => {
    bad({ amount: 100001, giftId: 'tap', giftQty: 5 });
    bad({ amount: 90000, giftId: 'tap', giftQty: 5 });
    bad({ amount: '100000', giftId: 'tap', giftQty: 5 });
  });
  it('rejects unknown or wrong-typed giftId', () => {
    for (const giftId of ['xe', '', 'BALO', '__proto__', 'toString', 5, ['tap'], { id: 'tap' }, true]) {
      bad({ amount: 20000, giftId, giftQty: 1 });
    }
  });
  it('rejects bad qty: 0, -1, 3.5, "5", NaN, true, huge', () => {
    for (const giftQty of [0, -1, 3.5, '5', NaN, true, [5], 2 ** 60]) {
      bad({ amount: 100000, giftId: 'tap', giftQty });
    }
  });
  it('rejects half a gift (id without qty or qty without id)', () => {
    bad({ amount: 20000, giftId: 'tap' });
    bad({ amount: 20000, giftQty: 1 });
  });
});

describe('validateAmountAndGift: custom amount (no gift)', () => {
  it('accepts whole thousands in range', () => {
    ok({ amount: 10000 }); ok({ amount: 15000 }); ok({ amount: 250000 }); ok({ amount: 20000000 });
  });
  it('rejects 12345, out of range, non-integer, strings', () => {
    for (const amount of [12345, 10500, 9000, 20001000, 15000.5, '15000', null, undefined]) bad({ amount });
  });
});

describe('message is optional (N1)', () => {
  it('accepts empty', () => assert.deepEqual(validateMessage(''), { message: '', error: null }));
  it('accepts missing', () => assert.equal(validateMessage(undefined).error, null));
  it('still caps length', () => assert.ok(validateMessage('x'.repeat(161)).error));
});

// Fake D1 that records statements, for handler + store tests.
function fakeEnv({ hasGiftColumns = true } = {}) {
  const log = [];
  const stmt = (sql) => ({
    sql, args: [],
    bind(...a) { this.args = a; return this; },
    async first() { log.push([sql, this.args]); return /COUNT\(\*\) AS c/.test(sql) ? { c: 0 } : null; },
    async run() {
      log.push([sql, this.args]);
      if (!hasGiftColumns && /gift_/.test(sql)) throw new Error('D1_ERROR: table donations has no column named gift_id');
      return { meta: { changes: 1 } };
    },
  });
  const DB = {
    prepare: stmt,
    async batch(list) {
      for (const s of list) {
        log.push([s.sql, s.args]);
        if (!hasGiftColumns && /gift_/.test(s.sql)) throw new Error('D1_ERROR: no such column: gift_id');
      }
      return [{ results: [{ displayName: 'Lan', message: 'Hi', amount: 100000, paidAt: 'x', ...(hasGiftColumns ? { giftId: 'tap', giftQty: 5 } : {}) }] },
        { results: [{ totalAmount: 100000, totalCount: 1 }] }];
    },
  };
  return { env: { DB, PAYOS_CHECKSUM_KEY: 'test-key', ALLOWED_ORIGIN: 'https://maiphh.github.io' }, log };
}

function post(body) {
  return new Request('https://w.example/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9', Origin: 'https://maiphh.github.io' },
    body: JSON.stringify(body),
  });
}

describe('handleCreateDonation rejects before any insert or PayOS call', () => {
  const base = { displayName: 'Lan', message: '', anonymous: false };
  const cases = [
    ['forged 100 Balo for 10.000', { amount: 10000, giftId: 'balo', giftQty: 100 }],
    ['bad giftId', { amount: 20000, giftId: 'xe', giftQty: 1 }],
    ['qty 0', { amount: 0, giftId: 'tap', giftQty: 0 }],
    ['qty 3.5', { amount: 70000, giftId: 'tap', giftQty: 3.5 }],
    ['qty "5"', { amount: 100000, giftId: 'tap', giftQty: '5' }],
    ['41 Balo', { amount: 20500000, giftId: 'balo', giftQty: 41 }],
    ['custom 12345', { amount: 12345 }],
  ];
  for (const [name, b] of cases) {
    it(name + ' -> 400', async () => {
      const { env, log } = fakeEnv();
      const realFetch = globalThis.fetch;
      globalThis.fetch = () => { throw new Error('PayOS must not be called'); };
      try {
        const res = await handleCreateDonation(post({ ...base, ...b }), env);
        assert.equal(res.status, 400);
        assert.ok(!log.some(([sql]) => /INSERT INTO donations/.test(sql)));
      } finally { globalThis.fetch = realFetch; }
    });
  }
});

describe('store gift columns', () => {
  it('insert stores gift_id/gift_qty when a gift is given', async () => {
    const { env, log } = fakeEnv();
    await insertPendingDonation(env, { orderCode: 123456789, amount: 100000, displayName: 'Lan', message: '', anonymous: false, gift: { id: 'tap', qty: 5 }, nowIso: 'now' });
    const [sql, args] = log.at(-1);
    assert.match(sql, /gift_id, gift_qty/);
    assert.deepEqual(args.slice(-2), ['tap', 5]);
  });
  it('insert without gift uses the old statement', async () => {
    const { env, log } = fakeEnv();
    await insertPendingDonation(env, { orderCode: 123456789, amount: 15000, displayName: 'Lan', message: '', anonymous: false, nowIso: 'now' });
    assert.doesNotMatch(log.at(-1)[0], /gift_/);
  });
  it('public list returns giftId/giftQty in one batch', async () => {
    const { env, log } = fakeEnv();
    const r = await listPublicDonations(env);
    assert.equal(r.donations[0].giftId, 'tap');
    assert.equal(r.donations[0].giftQty, 5);
    assert.equal(log.length, 3); // wall list + totals + business aggregate, one batch
  });
  it('public list falls back if migration 0004 is missing', async () => {
    const { env } = fakeEnv({ hasGiftColumns: false });
    const r = await listPublicDonations(env);
    assert.equal(r.totalCount, 1);
    assert.equal(r.donations[0].giftId, undefined);
  });
});

describe('wall sticker', () => {
  it('validateSticker accepts known ids and empty, rejects others', async () => {
    const { validateSticker } = await import('../src/validation.js');
    assert.deepEqual(validateSticker(undefined), { sticker: null, error: null });
    assert.deepEqual(validateSticker('cau-tuot'), { sticker: 'cau-tuot', error: null });
    assert.ok(validateSticker('<img>').error);
    assert.ok(validateSticker(3).error);
  });
  it('insert stores sticker after gift columns', async () => {
    const { env, log } = fakeEnv();
    await insertPendingDonation(env, { orderCode: 123456789, amount: 15000, displayName: 'Lan', message: '', anonymous: false, sticker: 'dep-lao', nowIso: 'now' });
    const [sql, args] = log.at(-1);
    assert.match(sql, /, sticker, status\) VALUES/);
    assert.equal(args.at(-1), 'dep-lao');
  });
  it('public list asks for sticker', async () => {
    const { env, log } = fakeEnv();
    await listPublicDonations(env);
    assert.match(log[0][0], /sticker/);
  });
});
