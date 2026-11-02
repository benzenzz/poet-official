// Pure check of the sheet parser in fundraising-live.mjs: no DOM, no fetch.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSheet } from '../../fundraising-live.mjs';

const sheet = (pct) => `,,,
Chỉ số,Giá trị,,
Tiến độ,${pct},,
,,,
Ngày,Mã giao dịch,Tên hiển thị,Nội dung,Số tiền
02/11/2026,POET-001,Nguyễn Văn Mười,Quyên góp cá nhân,"500,000 VNĐ"
02/11/2026,POET-002,Omaika,Big Joy Little Joy,"5,000,000 VNĐ"
02/11/2026,POET-003,Lan,quyên góp Cá nhân,"100,000 VNĐ"
02/11/2026,,,Quyên góp cá nhân,
`;

describe('parseSheet (fundraising-live.mjs)', () => {
  it('reads percent and counts rows by Nội dung', () => {
    assert.deepEqual(parseSheet(sheet('4.51%')), { percent: 4.51, individual: 2, business: 1 });
  });
  it('accepts a comma-decimal percent', () => {
    assert.equal(parseSheet(sheet('"4,51%"')).percent, 4.51);
  });
  it('returns null without a Tiến độ row', () => {
    assert.equal(parseSheet('Mục tiêu,"121,950,000 VNĐ"'), null);
  });
});
