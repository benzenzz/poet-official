import fs from 'node:fs';

// The TSV is the source of truth for FUND FOR FUN. Keep cell text unchanged so
// quantities, dashes, blanks, spacing, and delivery notes remain distinguishable.
const sourceUrl = new URL('../reference/source/ER_FUND_FOR_FUN_MASTER.tsv', import.meta.url);
const sourceText = fs.readFileSync(sourceUrl, 'utf8').replace(/^\uFEFF/, '');
const lines = sourceText.split(/\r?\n/);
if (lines.at(-1) === '') lines.pop();

const cells = line => line.split('\t');
const header = cells(lines[2] ?? '');
const contributionRow = cells(lines[3] ?? '');
const totalRow = cells(lines[27] ?? '');
const tierColumns = [4, 5, 6];

if (lines.length !== 28 || header.length !== 8 || contributionRow.length !== 8 || totalRow.length !== 8) {
  throw new Error('FUND FOR FUN TSV structure changed: expected 28 rows and 8 columns.');
}

export const fundForFunTiers = [
  { key: 'diamond', label: 'DIAMOND', vietnamese: 'KIM CƯƠNG', sourceHeader: header[4], contribution: contributionRow[4], sourceTotal: totalRow[4] },
  { key: 'gold', label: 'GOLD', vietnamese: 'VÀNG', sourceHeader: header[5], contribution: contributionRow[5], sourceTotal: totalRow[5] },
  { key: 'silver', label: 'SILVER', vietnamese: 'BẠC', sourceHeader: header[6], contribution: contributionRow[6], sourceTotal: totalRow[6] },
];

export const fundForFunTerms = contributionRow[7];
export const fundForFunBenefitHeading = header[3];
export const fundForFunTimelineHeading = header[7];

export const fundForFunBenefits = lines.slice(4, 27).map((line, index) => {
  const row = cells(line);
  if (row.length !== 8) throw new Error(`FUND FOR FUN TSV row ${index + 5} does not have 8 columns.`);
  return {
    id: row[0],
    phase: row[1],
    category: row[2],
    description: row[3],
    tierValues: Object.fromEntries(fundForFunTiers.map((tier, i) => [tier.key, row[tierColumns[i]]])),
    delivery: row[7],
    sourceRow: index + 5,
  };
});

export const fundForFunPhaseOrder = [
  'TRƯỚC CHUYẾN ĐI',
  'TRONG CHUYẾN ĐI',
  'SAU CHUYẾN ĐI',
];

export const fundForFunValidation = (() => {
  const phaseCounts = Object.fromEntries(fundForFunPhaseOrder.map(phase => [
    phase,
    fundForFunBenefits.filter(item => item.phase === phase).length,
  ]));
  const blankTierCells = fundForFunBenefits.flatMap(item => fundForFunTiers
    .filter(tier => item.tierValues[tier.key] === '')
    .map(tier => ({ id: item.id, tier: tier.key })));
  const tierCounts = Object.fromEntries(fundForFunTiers.map(tier => [tier.key, {
    explicit: fundForFunBenefits.filter(item => {
      const value = item.tierValues[tier.key];
      return value !== '' && value.trim() !== '-';
    }).length,
    blank: blankTierCells.filter(cell => cell.tier === tier.key).length,
    declared: Number(tier.sourceTotal),
  }]));
  return { lineCount: lines.length, benefitCount: fundForFunBenefits.length, phaseCounts, blankTierCells, tierCounts };
})();

if (fundForFunBenefits.length !== 23 || fundForFunPhaseOrder.some((phase, i) => fundForFunValidation.phaseCounts[phase] !== [9, 6, 8][i])) {
  throw new Error('FUND FOR FUN benefit count or phase distribution differs from the required source mapping.');
}
