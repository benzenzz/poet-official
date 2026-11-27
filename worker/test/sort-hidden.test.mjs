import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleListPublic } from '../src/routes-donations.js';
import { handleAdminList } from '../src/routes-admin.js';
import worker from '../src/index.js';

function fakeEnv() {
  const log = [], bindings = [];
  const stmt = (sql) => ({
    sql, args: [],
    bind(...a) { this.args = a; bindings.push({ sql, args: a }); return this; },
    async first() { log.push(sql); return { totalReceived: 0, receivedCount: 0 }; },
    async all() { log.push(sql); return { results: [{ orderCode: 1, hidden: 1 }] }; },
    async run() { log.push(sql); return { meta: { changes: 0 } }; },
  });
  const DB = {
    prepare: stmt,
    async batch(list) {
      for (const s of list) log.push(s.sql);
      return [{ results: [] }, { results: [{ totalAmount: 0, totalCount: 0 }] }];
    },
  };
  return { env: { DB, PAYOS_CHECKSUM_KEY: 'k', ALLOWED_ORIGIN: 'https://maiphh.github.io' }, log, bindings };
}
const norm = (s) => s.replace(/\s+/g, ' ');

describe('public wall sort param', () => {
  it('default sorts by paid_at, one batch, hidden messages blanked', async () => {
    const { env, log } = fakeEnv();
    const res = await handleListPublic(env, null, new URL('http://w/api/donations'));
    assert.equal(res.status, 200);
    // Wall list + wall totals + business aggregate, one D1 batch.
    assert.equal(log.length, 3);
    assert.match(norm(log[0]), /CASE WHEN hidden = 1 THEN '' ELSE message END/);
    assert.match(norm(log[0]), /ORDER BY paid_at DESC, order_code DESC LIMIT 30 OFFSET \?/);
    assert.match(norm(log[2]), /FROM business_deals WHERE status = 'received'/);
  });
  it('sort=amount orders by amount DESC with same limit, hidden still blanked', async () => {
    const { env, log } = fakeEnv();
    const res = await handleListPublic(env, null, new URL('http://w/api/donations?sort=amount'));
    assert.equal(res.status, 200);
    assert.equal(log.length, 3);
    assert.match(norm(log[0]), /WHERE status = 'success' ORDER BY amount DESC, paid_at DESC, order_code DESC LIMIT 30 OFFSET \?/);
    assert.match(norm(log[0]), /CASE WHEN hidden = 1 THEN '' ELSE message END/);
  });
  it('offset loads the next 30-row window using a bound parameter', async () => {
    const { env, log, bindings } = fakeEnv();
    const res = await handleListPublic(env, null, new URL('http://w/api/donations?offset=30'));
    assert.equal(res.status, 200);
    assert.match(norm(log[0]), /ORDER BY paid_at DESC, order_code DESC LIMIT 30 OFFSET \?/);
    assert.deepEqual(bindings[0].args, [30]);
  });
  for (const offset of ['-1', '1.5', 'not-a-number', '9007199254740992']) {
    it(`offset=${JSON.stringify(offset)} -> 400 without a database read`, async () => {
      const { env, log } = fakeEnv();
      const res = await handleListPublic(env, null, new URL('http://w/api/donations?offset=' + encodeURIComponent(offset)));
      assert.equal(res.status, 400);
      assert.equal(log.length, 0);
    });
  }
  for (const bad of ['AMOUNT', 'amount;drop', 'old', '']) {
    it(`sort=${JSON.stringify(bad)} -> ${bad === '' ? 200 : 400}, no reads on 400`, async () => {
      const { env, log } = fakeEnv();
      const res = await handleListPublic(env, null, new URL('http://w/api/donations?sort=' + encodeURIComponent(bad)));
      if (bad === '') { assert.equal(res.status, 200); return; }
      assert.equal(res.status, 400);
      assert.equal(log.length, 0);
    });
  }
});

describe('admin hidden filter', () => {
  const run = async (q) => {
    const { env, log } = fakeEnv();
    const res = await handleAdminList(env, new URL('http://w/api/admin/donations' + q));
    return { res, sql: log.map(norm) };
  };
  it('all: no WHERE', async () => {
    const { res, sql } = await run('');
    assert.equal(res.status, 200);
    assert.doesNotMatch(sql[0], /WHERE/);
  });
  it('hidden: success AND hidden = 1', async () => {
    const { sql } = await run('?hidden=hidden');
    assert.match(sql[0], /WHERE status = 'success' AND hidden = 1 ORDER BY created_at DESC LIMIT 100/);
  });
  it('visible: success AND hidden = 0', async () => {
    const { sql } = await run('?hidden=visible');
    assert.match(sql[0], /WHERE status = 'success' AND hidden = 0 ORDER BY/);
  });
  it('bad value -> 400', async () => {
    const { res, sql } = await run('?hidden=yes');
    assert.equal(res.status, 400);
    assert.equal(sql.length, 0);
  });
  it('returns hidden flag as boolean', async () => {
    const { res } = await run('?hidden=hidden');
    assert.equal((await res.json()).donations[0].hidden, true);
  });
});

describe('router', () => {
  it('admin list requires auth even with filter', async () => {
    const { env } = fakeEnv();
    const res = await worker.fetch(new Request('http://w/api/admin/donations?hidden=hidden'), env, {});
    assert.equal(res.status, 401);
  });
});

import { validateDisplayName } from '../src/validation.js';
describe('anonymous wording', () => {
  it('stores "Một nhà hảo tâm"', () => assert.equal(validateDisplayName('Lan', true).displayName, 'Một nhà hảo tâm'));
});
