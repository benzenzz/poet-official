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

// Real transfer text from the sheet, 2026-11-06.
const real = `Tiến độ,9.72%
Ngày,Mã giao dịch,Tên hiển thị,Nội dung,Số tiền
10/10/2026,POET-001,,DO HOAI PHUONG Qamnrg9568 APPMB1 1 BANK ACCOUNT TESTING 101026,"2,000 VNĐ"
18/10/2026,POET-002,,HO KINH DOANH MOC AN Qamnrg9568 APPMB1 1 Quyen gop du an Thien nguyen Big Joy Moc An FT26 292893280972,"1,000,000 VNĐ"
18/10/2026,POET-003,,DO HOAI PHUONG Qamnrg9568 APPMB1 1 AM CA PHE UNG HO THIEN NGUYEN CHO POET 181026,"1,000,000 VNĐ"
24/10/2026,POET-004,,VND-TGTT-QUACH TUAN KIET Qamnrg9568 APPMB1 1 QUACH TUAN KI ET chuyen tien FT26297420105924,"1,000,000 VNĐ"
27/10/2026,POET-005,,NGUYEN THI THANH THUY cai coc me I2TB5EAM/878554,"2,000,000 VNĐ"
27/10/2026,POET-006,,CONG TY CO PHAN DICH VU DI DONG TRU Qamnrg9568 APPMB1 1 153832306616 Dinh Chuong gui tien quyen gop than g 9 10 11 MOMO153832306616MOMO. TU: M SERVICE JSC,"1,500,000 VNĐ"
28/10/2026,POET-007,,HA CHIEU XUAN MBVCB.16751226518.413185.quyen gop du an thien nguyen Big Joy Nubake ri.CT tu 1023294412,"1,000,000 VNĐ"
28/10/2026,POET-008,,LE NGOC YEN NHI MB 5421452059473 Quyen gop du an th ien nguyen Big Joy Room44- Ma GD A CSP/ Q3039602,"2,000,000 VNĐ"
29/10/2026,POET-009,,PHAN THI THUY TRANG QAMNRG9568 APPMB1 1 PHAN THI THUY TRANG thanh toan.,"56,000 VNĐ"
01/11/2026,POET-011,,VO KIM THAM Qamnrg9568 APPMB1 1 QUYEN GOP CA NHAN PEACE 011126,"3,000,000 VNĐ"
01/11/2026,POET-012,,HA CHIEU XUAN MBVCB.16818357889.144383.quyen gop du an thien nguyen big joy nubake ri.CT tu 1023294412,"100,000 VNĐ"
`;

describe('parseSheet (fundraising-live.mjs)', () => {
  it('classifies real bank text: skips tests, unmasks MoMo, dedupes businesses', () => {
    assert.deepEqual(parseSheet(real), { percent: 9.72, individual: 4, business: 5 });
  });
  it('does not read a surname ending in "am" as the AM CA PHE shop', () => {
    assert.equal(parseSheet('Tiến độ,1%\n,Mã giao dịch\n,POET-1,,VO KIM THAM ca phe sang').individual, 1);
  });
  it('counts a company sender without Big Joy as a business', () => {
    assert.deepEqual(parseSheet('Tiến độ,1%\n,Mã giao dịch\n,POET-1,,CONG TY TNHH ABC ung ho'), { percent: 1, individual: 0, business: 1 });
  });
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
