// Live campaign numbers from the public donation sheet (ER updates it twice a week).
// The baked values stay as the no-JS / offline fallback; ?fundraisingPreview
// overrides win locally. On any failure the static numbers remain untouched.
const SHEET_CSV='https://docs.google.com/spreadsheets/d/1k-oYOOFK3krtO41jEGkyks04ZdyUIyW6lgqOVbOnYUg/export?format=csv&gid=2115322398';

function csvRows(text) {
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else quoted=false;}else cell+=c;}
    else if(c==='"')quoted=true;
    else if(c===','){row.push(cell);cell='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  row.push(cell);rows.push(row);
  return rows;
}

/**
 * { percent, individual, business } from the sheet CSV, or null without a valid
 * "Tiến độ" row. Each donation row (has a transaction code) counts by its
 * "Nội dung": "cá nhân" -> individual, "Big Joy Little Joy" -> business.
 */
export function parseSheet(csv) {
  const rows=csvRows(String(csv));
  const cell=rows.find(r=>r[0]?.trim()==='Tiến độ')?.[1]?.match(/^\s*([\d.,]+)\s*%/);
  if(!cell)return null;
  const raw=cell[1],percent=Number(raw.includes(',')&&!raw.includes('.')?raw.replace(',','.'):raw.replace(/,/g,''));
  if(!Number.isFinite(percent))return null;
  const head=rows.findIndex(r=>r[1]?.trim()==='Mã giao dịch'),kind={individual:0,business:0};
  for(const r of head<0?[]:rows.slice(head+1)){
    const content=(r[3]||'').toLowerCase();
    if(!r[1]?.trim())continue;
    if(content.includes('big joy little joy'))kind.business++;
    else if(content.includes('cá nhân'))kind.individual++;
  }
  return {percent,...kind};
}

const KIND_SUFFIX = { individual: 'người', business: 'đối tác' };
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

/** One card: counts by explicit kind (never DOM order), then the percent. */
function applyToCard(card, f) {
  for (const counter of card.querySelectorAll('[data-fund-count]')) {
    const kind = counter.dataset.fundKind;
    counter.dataset.fundCount = String(f[kind]);
    const label = counter.closest('strong')?.querySelector('.sr-only');
    if (label) label.textContent = `${fmt(f[kind])} ${KIND_SUFFIX[kind]}`;
  }
  // Counts must land before data-raised: fundraising-reveal's update() reads
  // dataset.fundCount when an observed attribute changes. Dropping
  // data-provisional is such a change, so counters refresh even if the percent is unchanged.
  if (card.dataset.provisional === 'true') delete card.dataset.provisional;
  card.dataset.raised = String(f.percent);
  // "Số liệu minh họa" note and every aria-describedby pointing at it.
  const note = card.querySelector('.fund-preview-note');
  if (note) {
    note.hidden = true;
    if (note.id) {
      for (const el of card.querySelectorAll('[aria-describedby]')) {
        const ids = el.getAttribute('aria-describedby').split(/\s+/);
        if (!ids.includes(note.id)) continue;
        const rest = ids.filter((id) => id !== note.id).join(' ');
        if (rest) el.setAttribute('aria-describedby', rest);
        else el.removeAttribute('aria-describedby');
      }
    }
  }
}

export function initFundraisingLive(scope=document) {
  const cards=scope.querySelectorAll('[data-fundraising]');
  if(!cards.length||typeof fetch!=='function'||typeof AbortSignal?.timeout!=='function')return false;
  fetch(SHEET_CSV,{signal:AbortSignal.timeout(10000)}).then(r=>r.ok?r.text():'').then(csv=>{
    const f=parseSheet(csv);
    if(f)for(const card of cards)if(card.dataset.localPreview!=='true')applyToCard(card,f);
  }).catch(()=>{/* keep the baked numbers */});
  return true;
}
