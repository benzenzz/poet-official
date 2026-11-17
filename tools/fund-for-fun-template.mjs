import {
  fundForFunBenefits,
  fundForFunBenefitHeading,
  fundForFunPhaseOrder,
  fundForFunTerms,
  fundForFunTiers,
  fundForFunTimelineHeading,
} from '../data/fund-for-fun.mjs';

const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

// Keep every source row in fundForFunBenefits, but do not publish rows pending confirmation.
const hiddenPendingBenefitIds = new Set(['QL07', 'QL18']);
const publicBenefits = fundForFunBenefits.filter(item => !hiddenPendingBenefitIds.has(item.id));
const publicTierCounts = Object.fromEntries(fundForFunTiers.map(tier => [tier.key,
  publicBenefits.filter(item => {
    const value = item.tierValues[tier.key];
    return value !== '' && value.trim() !== '-';
  }).length,
]));

function categories(items) {
  const groups = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (!last || last.category !== item.category) groups.push({ category: item.category, items: [item] });
    else last.items.push(item);
  }
  return groups;
}

function phaseTable(phase, index) {
  const items = publicBenefits.filter(item => item.phase === phase);
  const body = categories(items).map(group => `
    <tr class="fund-for-fun__category-row"><th scope="rowgroup" colspan="5">${esc(group.category)}</th></tr>
    ${group.items.map(item => `<tr class="fund-for-fun__benefit-row" data-benefit-id="${esc(item.id)}">
      <th scope="row" class="fund-for-fun__benefit">
        <span class="fund-for-fun__id">${esc(item.id)}</span>
        <span class="fund-for-fun__description">${esc(item.description)}</span>
      </th>
      ${fundForFunTiers.map(tier => {
        const value = item.tierValues[tier.key];
        return `<td class="fund-for-fun__tier-value" data-label="${esc(tier.label)} — ${esc(tier.vietnamese)}"${value === '' ? ' aria-label="Ô nguồn để trống"' : ''}><span class="fund-for-fun__mobile-label" aria-hidden="true">${esc(tier.label)} — ${esc(tier.vietnamese)}</span><span class="fund-for-fun__value">${esc(value)}</span></td>`;
      }).join('')}
      <td class="fund-for-fun__delivery" data-label="${esc(fundForFunTimelineHeading)}"${item.delivery === '' ? ' aria-label="Ô nguồn để trống"' : ''}><span class="fund-for-fun__mobile-label" aria-hidden="true">${esc(fundForFunTimelineHeading)}</span><span>${esc(item.delivery)}</span></td>
    </tr>`).join('')}`).join('');

  return `<section class="fund-for-fun__phase fund-for-fun__phase--${index + 1}" id="fund-for-fun-phase-${index + 1}" aria-labelledby="fund-for-fun-heading-${index + 1}">
    <h3 id="fund-for-fun-heading-${index + 1}">${esc(phase)}</h3>
    <div class="fund-for-fun__table-wrap">
      <table class="fund-for-fun__table">
        <caption>${esc(phase)} — quyền lợi theo hạng tài trợ</caption>
        <colgroup><col class="fund-for-fun__col-benefit"><col><col><col><col class="fund-for-fun__col-delivery"></colgroup>
        <thead><tr>
          <th scope="col">${esc(fundForFunBenefitHeading)}</th>
          ${fundForFunTiers.map(tier => `<th scope="col"><span>${esc(tier.label)}</span><small>${esc(tier.vietnamese)}</small></th>`).join('')}
          <th scope="col">${esc(fundForFunTimelineHeading)}</th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  </section>`;
}

export function fundForFunSection() {
  return `<section class="section-shell fund-for-fun" id="fund-for-fun" aria-labelledby="fund-for-fun-title">
    <header class="fund-for-fun__head">
      <p class="eyebrow">FUND FOR FUN</p>
      <h2 id="fund-for-fun-title">Bảng quyền lợi nhà tài trợ</h2>
      <p class="lead">${publicBenefits.length} đầu mục quyền lợi, chia theo ba giai đoạn của chuyến đi.</p>
    </header>
    <div class="fund-for-fun__tiers" aria-label="Mức đóng góp theo hạng gói">
      ${fundForFunTiers.map(tier => `<article class="fund-for-fun__tier-card fund-for-fun__tier-card--${tier.key}">
        <h3><span>${esc(tier.label)}</span><small>${esc(tier.vietnamese)}</small></h3>
        <p>${esc(tier.contribution)}</p>
        <small class="fund-for-fun__count">${publicTierCounts[tier.key]} quyền lợi áp dụng</small>
      </article>`).join('')}
    </div>
    <p class="fund-for-fun__terms">${esc(fundForFunTerms)}</p>
    <nav class="fund-for-fun__phase-nav" aria-label="Chọn giai đoạn quyền lợi">
      ${fundForFunPhaseOrder.map((phase, index) => `<a href="#fund-for-fun-phase-${index + 1}">${esc(phase)}</a>`).join('')}
    </nav>
    ${fundForFunPhaseOrder.map(phaseTable).join('')}
  </section>`;
}
