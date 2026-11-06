// Pure check of the parsers in fundraising-live.mjs: no DOM, no fetch.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCounts, sheetPercent } from '../../fundraising-live.mjs';

const sheet = (pct) => `,,,
Chỉ số,Giá trị,,
Tiến độ,${pct},,
,,,
Ngày,Mã giao dịch,Tên hiển thị,Nội dung,Số tiền
02/11/2026,POET-001,Nguyễn Văn Mười,Quyên góp cá nhân,"500,000 VNĐ"
`;

describe('sheetPercent (fundraising-live.mjs)', () => {
  it('reads the Tiến độ row', () => {
    assert.equal(sheetPercent(sheet('4.51%')), 4.51);
  });
  it('accepts a comma-decimal percent', () => {
    assert.equal(sheetPercent(sheet('"4,51%"')), 4.51);
  });
  it('returns null without a Tiến độ row or without a sheet', () => {
    assert.equal(sheetPercent('Mục tiêu,"121,950,000 VNĐ"'), null);
    assert.equal(sheetPercent(null), null);
  });
});

describe('parseCounts (fundraising-live.mjs)', () => {
  it('takes QR donations and the typed business count from the Worker', () => {
    assert.deepEqual(parseCounts({ fundraising: { individualCount: 4, businessCount: 0 } }), { individual: 4, business: 0 });
  });
  it('rejects a missing or malformed payload', () => {
    for (const data of [null, {}, { fundraising: { individualCount: 4 } }, { fundraising: { individualCount: -1, businessCount: 0 } }, { fundraising: { individualCount: '4', businessCount: 0 } }]) {
      assert.equal(parseCounts(data), null);
    }
  });
});
