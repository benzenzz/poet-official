import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { partner } from '../site-templates.mjs';
import { fundForFunSection } from '../fund-for-fun-template.mjs';
import {
  fundForFunBenefits,
  fundForFunPhaseOrder,
  fundForFunTerms,
  fundForFunTiers,
  fundForFunValidation,
} from '../../data/fund-for-fun.mjs';

const source = fs.readFileSync(new URL('../../reference/source/ER_FUND_FOR_FUN_MASTER.tsv', import.meta.url), 'utf8')
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/);
if (source.at(-1) === '') source.pop();
const split = line => line.split('\t');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

test('FUND FOR FUN maps every benefit field directly from its TSV row', () => {
  const sourceRows = source.slice(4, 27).map((line, index) => ({ line: index + 5, cells: split(line) }));
  assert.equal(fundForFunBenefits.length, 23);
  assert.deepEqual(fundForFunBenefits.map(item => item.id), sourceRows.map(row => row.cells[0]));
  for (let index = 0; index < sourceRows.length; index++) {
    const row = sourceRows[index];
    const item = fundForFunBenefits[index];
    assert.equal(item.sourceRow, row.line);
    assert.equal(item.phase, row.cells[1]);
    assert.equal(item.category, row.cells[2]);
    assert.equal(item.description, row.cells[3]);
    assert.deepEqual(item.tierValues, {
      diamond: row.cells[4],
      gold: row.cells[5],
      silver: row.cells[6],
    });
    assert.equal(item.delivery, row.cells[7]);
  }
});

test('source phases, tier totals, contribution thresholds, and MOU term reconcile', () => {
  assert.deepEqual(fundForFunValidation.phaseCounts, {
    [fundForFunPhaseOrder[0]]: 9,
    [fundForFunPhaseOrder[1]]: 6,
    [fundForFunPhaseOrder[2]]: 8,
  });
  assert.deepEqual(fundForFunPhaseOrder, [...new Set(source.slice(4, 27).map(line => split(line)[1]))]);
  assert.deepEqual(fundForFunTiers.map(tier => tier.label), ['DIAMOND', 'GOLD', 'SILVER']);
  assert.deepEqual(fundForFunTiers.map(tier => tier.vietnamese), ['KIM CƯƠNG', 'VÀNG', 'BẠC']);
  assert.deepEqual(fundForFunTiers.map(tier => tier.sourceTotal), ['23', '16', '11']);
  assert.deepEqual(fundForFunTiers.map(tier => tier.sourceTotal), split(source[27]).slice(4, 7));
  assert.deepEqual(fundForFunTiers.map(tier => tier.contribution), split(source[3]).slice(4, 7));
  assert.equal(fundForFunTerms, split(source[3])[7]);
  assert.equal(fundForFunValidation.blankTierCells.length, 0);
  assert.deepEqual(fundForFunTiers.map(tier => fundForFunValidation.tierCounts[tier.key].explicit), [23, 16, 11]);
});

test('QL07 and QL18 source records remain intact internally', () => {
  const ql07 = fundForFunBenefits.find(item => item.id === 'QL07');
  const ql18 = fundForFunBenefits.find(item => item.id === 'QL18');
  assert.ok(ql07);
  assert.ok(ql18);
  assert.equal(ql07.tierValues.diamond, split(source[10])[4]);
  assert.equal(ql07.delivery, split(source[10])[7]);
  assert.equal(ql18.delivery, '');
  assert.equal(ql18.delivery, split(source[21])[7]);
});

test('unconfirmed benefits are absent from public output and visible counts exclude them', () => {
  const html = fundForFunSection();
  const publicIds = [...html.matchAll(/data-benefit-id="([^"]+)"/g)].map(match => match[1]);
  const phaseSections = [...html.matchAll(/<section class="fund-for-fun__phase[^\"]*"[\s\S]*?<\/section>/g)]
    .map(match => match[0]);

  assert.equal(publicIds.length, 21);
  assert.equal(new Set(publicIds).size, 21);
  assert.ok(!publicIds.includes('QL07'));
  assert.ok(!publicIds.includes('QL18'));
  assert.doesNotMatch(html, /fund-for-fun__source-notes|QL07|QL18/);
  assert.doesNotMatch(html, /Video review sản phẩm tài trợ trên kênh POET/);
  assert.doesNotMatch(html, /Xuất hiện trong Video TikTok Recap hành trình thiện nguyện/);
  assert.match(html, /21 đầu mục quyền lợi/);
  assert.deepEqual(phaseSections.map(section => [...section.matchAll(/data-benefit-id=/g)].length), [8, 6, 7]);
  assert.deepEqual([...html.matchAll(/class="fund-for-fun__count">(\d+) quyền lợi áp dụng/g)].map(match => Number(match[1])), [21, 15, 11]);

  for (const item of fundForFunBenefits.filter(benefit => !['QL07', 'QL18'].includes(benefit.id))) {
    const row = html.match(new RegExp(`<tr class="fund-for-fun__benefit-row" data-benefit-id="${item.id}"[\\s\\S]*?<\\/tr>`))?.[0];
    assert.ok(row, `${item.id} should have a public benefit row`);
    assert.ok(row.includes(escapeHtml(item.description)), `${item.id} description should be unchanged`);
    for (const value of Object.values(item.tierValues)) {
      assert.ok(row.includes(escapeHtml(value)), `${item.id} tier value ${value} should be unchanged`);
    }
    assert.ok(row.includes(escapeHtml(item.delivery)), `${item.id} delivery text should be unchanged`);
  }
});

test('FUND FOR FUN appears on the sponsorship route, not the volunteer route', () => {
  const sponsorshipPage = partner('../');
  const volunteerPage = partner('../', 'tinh-nguyen-vien');
  assert.match(sponsorshipPage, /id="fund-for-fun"/);
  assert.match(sponsorshipPage, /id="quyen-loi"/);
  assert.doesNotMatch(volunteerPage, /id="fund-for-fun"/);
});
