// Live campaign numbers. Percent: the public donation sheet (ER updates it twice
// a week). Counts: the Worker, where individual = successful QR donations and
// business = the number typed into /admin. The baked values stay as the no-JS /
// offline fallback; ?fundraisingPreview overrides win locally. Both sources must
// answer: otherwise the counts read "—" (never the fixture, never a half-live mix)
// and the percent keeps its baked value.
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

/** "Tiến độ" percent from the sheet CSV, or null without a valid row. */
export function sheetPercent(csv) {
  const cell=csvRows(String(csv)).find(r=>r[0]?.trim()==='Tiến độ')?.[1]?.match(/^\s*([\d.,]+)\s*%/);
  if(!cell)return null;
  const raw=cell[1],percent=Number(raw.includes(',')&&!raw.includes('.')?raw.replace(',','.'):raw.replace(/,/g,''));
  return Number.isFinite(percent)?percent:null;
}

/** { individual, business } from the Worker payload, or null if either is unusable. */
export function parseCounts(data) {
  const individual=data?.fundraising?.individualCount,business=data?.fundraising?.businessCount;
  const valid=n=>Number.isSafeInteger(n)&&n>=0;
  return valid(individual)&&valid(business)?{individual,business}:null;
}

const KIND_SUFFIX = { individual: 'người', business: 'đối tác' };
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

/** Live numbers unavailable: counts read "—" (empty data-fund-count) instead of the baked fixture. */
function showUnavailable(card) {
  for (const counter of card.querySelectorAll('[data-fund-count]')) {
    counter.dataset.fundCount = '';
    const label = counter.closest('strong')?.querySelector('.sr-only');
    if (label) label.textContent = 'đang cập nhật';
  }
}

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
  const base=window.POET_API_BASE;
  if(!cards.length||!base||typeof fetch!=='function'||typeof AbortSignal?.timeout!=='function')return false;
  // Holds the count-up (fundraising-reveal) until these fetches settle, either way.
  const live=[...cards].filter(card=>card.dataset.localPreview!=='true');
  for(const card of live)card.dataset.fundLoading='true';
  const get=(url,read)=>fetch(url,{signal:AbortSignal.timeout(10000)}).then(r=>r.ok?read(r):null);
  Promise.all([get(SHEET_CSV,r=>r.text()),get(`${base}/api/donations?sort=new`,r=>r.json())]).then(([csv,data])=>{
    const percent=sheetPercent(csv),counts=parseCounts(data);
    if(percent===null||!counts)throw new Error('live numbers unavailable');
    for(const card of live)applyToCard(card,{percent,...counts});
  }).catch(()=>{for(const card of live)showUnavailable(card);}).finally(()=>{
    for(const card of live)delete card.dataset.fundLoading;
  });
  return true;
}
