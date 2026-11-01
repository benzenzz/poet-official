import './config.js';
import './ung-ho/checkout.js';
import {initLocalFundraisingPreview} from './fundraising-preview.mjs';
import {initFundraisingProgress} from './fundraising-progress.mjs?v=home-005-3';
import {initFundraisingLive} from './fundraising-live.mjs?v=fund-live-2';
initLocalFundraisingPreview();
initFundraisingProgress();
initFundraisingLive();
const base=new URL('.',import.meta.url),root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const money=n=>new Intl.NumberFormat('vi-VN').format(n)+' đ';
const byId=id=>document.getElementById(id);
// Lucide icons as inline SVG drawn with currentColor: text glyphs like ↗ become emoji on iOS.
const LUCIDE={'arrow-up-right':'<path d="M7 7h10v10"/><path d="M7 17 17 7"/>','check':'<path d="M20 6 9 17l-5-5"/>'};
const arrowSvg=(name,cls='')=>`<svg${cls?` class="${cls}"`:''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LUCIDE[name]}</svg>`;
const toast=document.createElement('div');toast.className='site-toast';toast.setAttribute('role','status');document.body.append(toast);
let toastTimer;
function notify(text){toast.textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.textContent='';},3500);}
function trapFocus(modal){modal.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusable=[...modal.querySelectorAll('a[href],button,input,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});}

// Nested, deep-linkable tabs. No JS means every panel remains readable.
const tabControllers=[];
document.querySelectorAll('[role=tablist]').forEach(list=>{
  const tabs=[...list.querySelectorAll('[role=tab]')];
  function select(tab,{focus=false,update=false}={}){
    tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;byId(t.getAttribute('aria-controls')).hidden=!on;});
    // A deep-linked nested tab may become visible only after its parent is selected.
    // Scroll the tab rail horizontally on the next frame without moving the page.
    requestAnimationFrame(()=>{const rail=list.getBoundingClientRect(),item=tab.getBoundingClientRect();if(rail.width&&(item.left<rail.left||item.right>rail.right))list.scrollLeft+=item.left-rail.left-Math.max(0,(rail.width-item.width)/2);});
    if(focus){tab.focus();tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
    if(update)history.replaceState(null,'','#'+tab.getAttribute('aria-controls'));
  }
  list.addEventListener('click',e=>{const t=e.target.closest('[role=tab]');if(t)select(t,{update:!list.hasAttribute('data-no-hash')});});
  list.addEventListener('keydown',e=>{
    const i=tabs.indexOf(document.activeElement);if(i<0)return;
    let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();select(tabs[next],{focus:true,update:!list.hasAttribute('data-no-hash')});}
  });
  tabControllers.push({tabs,select});
  const preferred=list.dataset.defaultTab||document.querySelector('[data-default-tab]')?.dataset.defaultTab;
  select(tabs.find(t=>t.getAttribute('aria-controls')===preferred)||tabs[0]);
});
function revealHash(scroll=false){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=byId(id);if(!target)return;
  let node=target;
  while(node){
    if(node.matches?.('[role=tabpanel]')){const c=tabControllers.find(c=>c.tabs.some(t=>t.getAttribute('aria-controls')===node.id));if(c)c.select(c.tabs.find(t=>t.getAttribute('aria-controls')===node.id));}
    if(node instanceof HTMLDetailsElement)node.open=true;
    node=node.parentElement;
  }
  if(scroll)target.scrollIntoView({block:'start',behavior:'instant'});
}
revealHash(Boolean(location.hash));addEventListener('hashchange',()=>revealHash(true));
document.querySelectorAll('.story-card a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const detail=byId(a.hash.slice(1));if(detail instanceof HTMLDetailsElement)detail.open=true;}));

import './activity-carousel.js?v=home-005-5';
import './press-strip.js?v=poet-v3-1';

// Reveal once, with readable fallback; no global animation loop.
const reveals=document.querySelectorAll('[data-reveal]');
// Local previews play entrances even when the OS reports reduced motion, as world.js does; ?heroMotion=respect opts out.
const previewMotion=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('heroMotion')!=='respect';
if('IntersectionObserver'in window&&(!reduced.matches||previewMotion)){
  document.documentElement.classList.add('reveal-motion');
  // Wide screens show both archive cards together (CSS staggers the second); narrow screens reveal each card as it arrives.
  const wide=matchMedia('(min-width:761px)');
  const show=(entries,observer)=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const group=wide.matches&&entry.target.closest('.archive-grid');for(const el of group?group.querySelectorAll('[data-reveal]'):[entry.target]){el.classList.add('is-revealed');observer.unobserve(el);}});
  // Archive cards wait until clearly on screen so their entrance is actually seen.
  const io=new IntersectionObserver(show,{threshold:.08}),late=new IntersectionObserver(show,{threshold:.3});
  reveals.forEach(el=>{el.classList.add('will-reveal');(el.closest('.archive-grid')?late:io).observe(el);});
  reduced.addEventListener('change',e=>{if(e.matches&&!previewMotion){document.documentElement.classList.remove('reveal-motion');reveals.forEach(el=>el.classList.add('is-revealed'));io.disconnect();late.disconnect();}});
}
// Mission cards: rise in once at 25% visibility; hover, focus or click opens a card and it stays open.
const missionSection=document.querySelector('[data-mission]');
if(missionSection){
  const cards=[...missionSection.querySelectorAll('.mission-card')];
  missionSection.classList.add('is-interactive');
  cards.forEach(card=>['pointerenter','focus','click'].forEach(type=>card.addEventListener(type,()=>card.classList.add('is-open'))));
  if(document.documentElement.classList.contains('reveal-motion')){
    missionSection.classList.add('will-enter');
    const io=new IntersectionObserver(([entry],observer)=>{if(entry.isIntersecting){missionSection.classList.add('is-in');observer.disconnect();}},{threshold:.25});
    io.observe(missionSection);
  }
}
// Counters inside [data-counter-group] start together (staggered) when the group is visible; others count alone.
const counters=[...document.querySelectorAll('[data-counter]')].filter(el=>!el.closest('[data-counter-group]'));
const formatCount=n=>n<1000?String(n):new Intl.NumberFormat('vi-VN').format(n);
if('IntersectionObserver'in window){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;io.unobserve(entry.target);const el=entry.target,n=Number(el.dataset.counter);
    if(reduced.matches)return;const start=performance.now();let frame;
    const tick=time=>{const t=Math.min(1,(time-start)/1350),value=Math.round(n*(1-(1-t)**3));el.textContent=new Intl.NumberFormat('vi-VN').format(value);if(t<1&&!reduced.matches)frame=requestAnimationFrame(tick);else el.textContent=new Intl.NumberFormat('vi-VN').format(n);};
    frame=requestAnimationFrame(tick);addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
  }),{threshold:.5});counters.forEach(el=>io.observe(el));
  const easeOutExpo=t=>t===1?1:1-2**(-10*t);
  const groups=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;groups.unobserve(entry.target);
    if(reduced.matches&&!previewMotion)return;
    const group=entry.target,values=[...group.querySelectorAll('[data-counter]')];if(!values.length)return;
    // Zero only now, so the page, no-JS and thumbnails always show final values.
    values.forEach(el=>{el.textContent='0';});group.classList.add('is-counting');void group.offsetWidth;
    const frames=new Set();const start=performance.now();
    requestAnimationFrame(()=>group.classList.add('is-drawing'));
    values.forEach((el,i)=>{const n=Number(el.dataset.counter);
      const tick=time=>{const t=Math.min(1,Math.max(0,(time-start-i*150)/1800));el.textContent=formatCount(Math.round(n*easeOutExpo(t)));
        if(t<1){frames.add(requestAnimationFrame(tick));}else if(i===values.length-1)group.classList.remove('is-counting');};
      frames.add(requestAnimationFrame(tick));});
    addEventListener('pagehide',()=>{frames.forEach(cancelAnimationFrame);values.forEach(el=>{el.textContent=formatCount(Number(el.dataset.counter));});group.classList.remove('is-counting');},{once:true});
  }),{threshold:.4});
  document.querySelectorAll('[data-counter-group]').forEach(el=>groups.observe(el));
}

// UI-011: pins drop 01→04 while bé Hoa walks to today's stage and the road tiles light behind her. Runs once, only while the tab is visible.
document.querySelectorAll('[data-journey]').forEach(root=>{
  const stages=JSON.parse(root.querySelector('[data-journey-data]').textContent),NS='http://www.w3.org/2000/svg',AT=[.09,.42,.745,.995],TILE=36;
  const svg=root.querySelector('.journey-board svg'),road=svg.querySelector('.road'),L=road.getTotalLength(),hoa=svg.querySelector('[data-journey-hoa]'),ov=root.querySelector('.journey-overlay');
  const today=Date.now(),cur=stages.reduce((c,s,i)=>today>=Date.parse(s.start+'T00:00:00+07:00')?i:c,0);
  const P=(x,y)=>({x:(x-y)*.866,y:(x+y)*.5}),on=len=>{const q=road.getPointAtLength(Math.max(0,Math.min(L,len)));return P(q.x,q.y);};
  const pct=(x,y)=>({left:(x+560)/1120*100+'%',top:(y-20)/640*100+'%'}),tag=i=>`Chặng 0${i+1} · ${stages[i].date}`;
  const tiles=[];
  for(let k=0;k*TILE<L;k++){const t=document.createElementNS(NS,'path');t.setAttribute('class','journey-tile');t.setAttribute('d',road.getAttribute('d'));t.setAttribute('stroke',['var(--board-coral)','var(--poet-blue)','var(--poet-yellow)','var(--poet-green)'][k%4]);t.setAttribute('stroke-dasharray',`34 ${Math.ceil(L)+200}`);t.setAttribute('stroke-dashoffset',-k*TILE);tiles.push(t);}
  svg.querySelector('[data-journey-tiles]').append(...tiles);
  const e=P(520,70),st=P(70,530);
  svg.querySelector('.journey-flag').innerHTML=`<line x1="${e.x+34}" y1="${e.y-6}" x2="${e.x+34}" y2="${e.y-86}" stroke="#7a6a52" stroke-width="4" stroke-linecap="round"/><path d="M${e.x+36} ${e.y-86} l44 12 l-44 14 z" fill="var(--poet-yellow)" stroke="#c98a00" stroke-width="2"/><ellipse cx="${st.x}" cy="${st.y+2}" rx="30" ry="14" fill="none" stroke="#9d9586" stroke-width="2" stroke-dasharray="4 5"/>`;
  const tip=document.createElement('div');tip.className='journey-tip';tip.setAttribute('aria-hidden','true');ov.append(tip);
  const pts=AT.map(a=>on(L*a)),pins=[],leads=[],labels=[];
  const show=i=>{pins.forEach((g,j)=>g.classList.toggle('open',j===i));tip.innerHTML=`<small>${tag(i)}</small>${stages[i].note}`;Object.assign(tip.style,pct(pts[i].x,pts[i].y-(i===cur?118:80)));tip.classList.add('show');labels.forEach((l,j)=>{l.style.visibility=j===i?'hidden':'';});};
  const hide=()=>{pins.forEach(g=>g.classList.remove('open'));tip.classList.remove('show');labels.forEach(l=>{l.style.visibility='';});};
  const isOpen=i=>tip.classList.contains('show')&&pins[i].classList.contains('open');
  // Mouse opens on hover, keyboard on focus-visible or Enter, touch on tap; a second tap/Enter closes.
  const bind=(el,i)=>{
    el.setAttribute('tabindex','0');el.setAttribute('role','button');
    el.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse')show(i);});
    el.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse')hide();});
    el.addEventListener('focus',()=>{if(el.matches(':focus-visible'))show(i);});
    el.addEventListener('blur',hide);
    el.addEventListener('click',ev=>{if(ev.pointerType!=='mouse')isOpen(i)?hide():show(i);});
    el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();isOpen(i)?hide():show(i);}else if(ev.key==='Escape')hide();});
  };
  stages.forEach((s,i)=>{
    const p=pts[i],state=i<cur?'done':i===cur?'cur':'next';
    const ln=document.createElementNS(NS,'line');ln.setAttribute('class','journey-lead');ln.setAttribute('x1',p.x);ln.setAttribute('y1',p.y-58);ln.setAttribute('x2',p.x);ln.setAttribute('y2',p.y-140);leads.push(ln);
    const g=document.createElementNS(NS,'g');g.setAttribute('class','journey-pin');g.setAttribute('aria-label',`Chặng 0${i+1}: ${s.name}, ${s.date}. ${s.note}`);
    g.innerHTML=`<ellipse cx="${p.x}" cy="${p.y}" rx="22" ry="10" fill="rgba(51,43,39,.14)"/>${state==='cur'?`<circle class="pulse" cx="${p.x}" cy="${p.y}" r="20" fill="none" stroke="var(--board-coral)" stroke-width="4"/>`:''}<g class="head"><path class="ring" d="M${p.x} ${p.y-4} C ${p.x-6} ${p.y-16} ${p.x-26} ${p.y-30} ${p.x-26} ${p.y-50} A 26 26 0 1 1 ${p.x+26} ${p.y-50} C ${p.x+26} ${p.y-30} ${p.x+6} ${p.y-16} ${p.x} ${p.y-4} Z" stroke-width="3" fill="${{done:'var(--poet-green)',cur:'var(--board-coral)',next:'#fff'}[state]}" stroke="${{done:'#2f8463',cur:'#d9705f',next:'#b9a57c'}[state]}"/><circle class="dot" cx="${p.x}" cy="${p.y-50}" r="10" fill="${state==='next'?'#e9d8b6':'#fff'}"/></g>`;
    bind(g,i);pins.push(g);
    const lb=document.createElement('div');lb.className=`journey-label ${state}`;Object.assign(lb.style,pct(p.x,p.y-146));lb.innerHTML=`<small>${tag(i)}</small><b>${s.name}</b>`;labels.push(lb);
  });
  svg.querySelector('[data-journey-leads]').append(...leads);svg.querySelector('[data-journey-pins]').append(...pins);ov.append(...labels);
  // Bé Hoa covers the current pin, so she opens that stage's note too.
  bind(hoa,cur);hoa.setAttribute('aria-label',`Bé Hoa đang ở chặng 0${cur+1}: ${stages[cur].name}. ${stages[cur].note}`);
  root.querySelector('[data-journey-now]').textContent=`Chặng 0${cur+1} · ${stages[cur].name}`;
  root.querySelector('[data-journey-stops]').innerHTML=stages.map((s,i)=>`<li class="${i<cur?'done':i===cur?'cur':''}"><span class="n">${i<cur?arrowSvg('check'):'0'+(i+1)}</span><b>${s.name}</b><small>${s.date}</small>${i===cur?`<p>${s.note}</p>`:''}</li>`).join('');
  root.classList.add('is-ready');
  const place=(len,t)=>{const p=on(len),ahead=on(len+4),bob=t?Math.abs(Math.sin(t/110))*-9:0,lit=Math.floor(Math.max(0,len)/TILE)+1;
    hoa.setAttribute('transform',`translate(${p.x} ${p.y-26+bob}) scale(${ahead.x<p.x-.01?-1:1} 1)`);tiles.forEach((t,k)=>t.classList.toggle('on',k<lit));};
  const target=L*AT[cur],drop=els=>els.forEach(el=>el.classList.add('in'));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){drop([...pins,...leads,...labels]);place(target);return;}
  place(0);
  let raf=0,timers=[],seen=false;
  const intro=()=>{timers.forEach(clearTimeout);cancelAnimationFrame(raf);
    timers=stages.flatMap((s,i)=>[setTimeout(()=>drop([pins[i],leads[i]]),300+i*700),setTimeout(()=>drop([labels[i]]),480+i*700)]);
    timers.push(setTimeout(()=>{const dur=cur*700+1400,t0=performance.now();
      // rAF time can precede t0; clamp k or the easing throws bé Hoa past the finish.
      const step=now=>{const k=Math.max(0,Math.min(1,(now-t0)/dur)),q=k<.5?2*k*k:1-(-2*k+2)**2/2;place(target*q,k<1?now:0);if(k<1)raf=requestAnimationFrame(step);};
      raf=requestAnimationFrame(step);},300));};
  const tryIntro=()=>{if(seen&&document.visibilityState==='visible'){io.disconnect();document.removeEventListener('visibilitychange',tryIntro);intro();}};
  const io=new IntersectionObserver(es=>{seen=es.some(en=>en.isIntersecting);tryIntro();},{threshold:.35});
  io.observe(svg);document.addEventListener('visibilitychange',tryIntro);
});

// UI-012: tier ladder. The slider picks a tier through its tab, lower tiers get the check mark, "Xem thêm" opens a column, and the compose draft stays in the browser (nothing is sent).
document.querySelectorAll('.tier-section').forEach(section=>{
  const list=section.querySelector('[role=tablist]'),cards=[...list.querySelectorAll('[role=tab]')],box=section.querySelector('[data-tier-compose-box]');
  const msg=box.querySelector('textarea'),mail=box.querySelector('[data-tier-mail]'),copy=box.querySelector('[data-copy]'),email=mail.getAttribute('href').replace('mailto:','');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const range=section.querySelector('.tier-range');
  range?.addEventListener('input',()=>cards[+range.value].click());
  let picked=null;
  const letter=()=>`Chào POET,\n\nMình là [Tên] từ [Tên thương hiệu]. Thương hiệu mình muốn đồng hành cùng POET trong chiến dịch Big Joy Little Joy. POET gửi giúp mình thông tin chi tiết và lịch trao đổi nhé.\n\nCảm ơn POET!`;
  // Gmail compose in a new tab: a mailto link does nothing on machines without a mail app.
  const fill=()=>{mail.href=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Đồng hành Big Joy Little Joy')}&body=${encodeURIComponent(msg.value)}`;copy.dataset.copy=msg.value;};
  msg.addEventListener('input',fill);
  // Follows aria-selected, so tab clicks, arrow keys and deep links all update the ladder the same way.
  const sync=()=>{
    const i=cards.findIndex(c=>c.getAttribute('aria-selected')==='true');
    cards.forEach((c,k)=>c.classList.toggle('is-included',k<i));
    picked={amount:cards[i].getAttribute('aria-controls').replace('tier-',''),name:cards[i].querySelector('.tier-card__name').textContent};
    if(range){range.value=i;range.parentElement.style.setProperty('--p',(i/(cards.length-1)).toFixed(4));range.setAttribute('aria-valuetext',`${picked.name} / ${picked.amount} triệu`);section.querySelectorAll('.tier-stop').forEach((d,k)=>d.classList.toggle('is-passed',k<=i));}
    if(!box.hidden){msg.value=letter();fill();}
  };
  new MutationObserver(sync).observe(list,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  sync();
  section.querySelectorAll('[data-tier-compose]').forEach(btn=>btn.addEventListener('click',()=>{
    picked={amount:btn.dataset.tierCompose,name:btn.dataset.tierName};
    msg.value=letter();fill();box.hidden=false;
    msg.focus({preventScroll:true});
    box.scrollIntoView({block:'nearest',behavior:reduced?'auto':'smooth'});
  }));
  section.querySelectorAll('.tier-toggle').forEach(btn=>btn.addEventListener('click',()=>{
    const phase=btn.closest('.tier-phase'),open=phase.classList.toggle('open');
    btn.setAttribute('aria-expanded',String(open));
    btn.querySelector('span').textContent=open?'Thu gọn':`Xem thêm ${phase.querySelectorAll('li.is-more').length} quyền lợi`;
  }));
});

// UI-018: countdown on the campaign card. The build renders the same state; this recalculates it in Vietnam time on load.
document.querySelectorAll('[data-campaign-timeline]').forEach(el=>{
  const start=Date.parse(el.dataset.prep+'T00:00:00+07:00'),trip=Date.parse(el.dataset.trip+'T00:00:00+07:00'),end=Date.parse(el.dataset.end+'T23:59:59+07:00');
  const now=Date.now();let pct=100,msg='Chuyến đi đã hoàn thành';
  if(now<start){pct=0;msg='Sắp bắt đầu chuẩn bị';}
  else if(now<trip){pct=(now-start)/(trip-start)*100;msg=`Còn <b>${Math.ceil((trip-now)/864e5)} ngày</b> đến chuyến đi`;}
  else if(now<=end){msg='Đoàn đang ở điểm trường';}
  el.querySelector('.fund-timeline-text').innerHTML=msg;
  el.querySelector('.fund-timeline-track i').style.width=pct+'%';
  el.querySelector('.fund-timeline-track b').style.left=pct+'%';
});

// UI-021: hovering a budget row lights its segment on the allocation bar and dims the rest.
document.querySelectorAll('.budget-sec').forEach(sec=>{
  const stack=sec.querySelector('.budget-stack');
  const mark=k=>{stack.classList.toggle('is-focus',k!==null);stack.querySelectorAll('i').forEach(i=>i.classList.toggle('is-on',i.dataset.k===k));};
  sec.querySelectorAll('tbody tr').forEach(tr=>{
    tr.addEventListener('mouseenter',()=>mark(tr.dataset.k));
    tr.addEventListener('mouseleave',()=>mark(null));
  });
});

// UI-023: "Một khoảng sân" story. Without this script every line and photo is visible; this only adds the reveal, the distance fade and the photo crossfade.
document.querySelectorAll('.project-story').forEach(sec=>{
  if(root.classList.contains('m-ready'))return; // motion/story.mjs owns the story when it loaded
  sec.classList.add('is-enhanced');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const once=(el,cls,threshold)=>{const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){el.classList.add(cls);io.disconnect();}},{threshold});io.observe(el);};
  document.querySelectorAll('.story-open').forEach(h=>{h.classList.add('is-enhanced');once(h,'is-in',.3);});
  sec.querySelectorAll('.story-step').forEach(st=>once(st,'is-shown',.2));

  const desk=matchMedia('(min-width:901px)');
  const lines=[...sec.querySelectorAll('.story-line')],frames=[...sec.querySelectorAll('.story-frame')];
  let cur=0,raf=0;
  const update=()=>{
    raf=0;
    if(!desk.matches){lines.forEach(l=>{l.style.opacity='';});return;}
    const mid=innerHeight/2;let best=0,bestD=Infinity;
    lines.forEach((l,i)=>{
      const r=l.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);
      const t=Math.min(1,Math.max(0,(d/innerHeight-.06)/.44)),op=reduced?(d<innerHeight*.3?1:.15):1-.85*t*t*(3-2*t);
      l.style.opacity=op.toFixed(3);
      if(d<bestD){bestD=d;best=i;}
    });
    if(best!==cur){
      const prev=cur;cur=best;
      frames.forEach(f=>f.classList.remove('is-on','is-prev'));
      frames[prev].classList.add('is-prev');
      frames[cur].classList.add('is-on');
    }
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  update();
});

// UI-024: the page hero photo follows the chosen status tab (one photo for now; each tab carries data-hero-<panel id>).
// The hero copy follows it too: each .story-open-text carries data-hero-for=<panel id>.
document.querySelectorAll('.hero-tabs').forEach(list=>{
  const hero=list.closest('.story-open'),img=hero.querySelector('img');
  const sync=()=>{
    const tab=list.querySelector('[role=tab][aria-selected=true]');if(!tab)return;
    const id=tab.getAttribute('aria-controls'),src=img.getAttribute('data-hero-'+id);
    if(src&&img.getAttribute('src')!==src)img.src=src;
    hero.querySelectorAll('[data-hero-for]').forEach(t=>{t.hidden=t.dataset.heroFor!==id;});
  };
  new MutationObserver(sync).observe(list,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  sync();
});
// Đồng hành foot: the jump links pick the way, mirror the hero tabs and bring the reader back to the top of the page.
document.querySelectorAll('.partner-jump').forEach(nav=>{
  const links=[...nav.querySelectorAll('a')],tabFor=a=>byId('tab-'+a.hash.slice(1));
  const sync=()=>links.forEach(a=>{const on=tabFor(a)?.getAttribute('aria-selected')==='true';if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
  links.forEach(a=>a.addEventListener('click',e=>{const tab=tabFor(a);if(!tab)return;e.preventDefault();tab.click();scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'});}));
  const list=tabFor(links[0])?.closest('[role=tablist]');
  if(list)new MutationObserver(sync).observe(list,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  sync();
});
// UI-015: video rail on mobile steps one card at a time. Buttons refresh when the tab shows, since hidden panels measure as zero.
document.querySelectorAll('.volunteer-videos').forEach(wrap=>{
  const rail=wrap.querySelector('[data-v-rail]'),prev=wrap.querySelector('[data-v-prev]'),next=wrap.querySelector('[data-v-next]');
  if(!rail||!prev||!next)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step=()=>rail.querySelector('li').offsetWidth+12;
  const move=d=>rail.scrollBy({left:d*step(),behavior:reduced?'auto':'smooth'});
  const update=()=>{prev.disabled=rail.scrollLeft<4;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4;};
  prev.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  rail.addEventListener('scroll',update,{passive:true});
  new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))update();}).observe(rail);
});
// TikTok's player loads only after a click: the card is swapped for the iframe in place.
document.querySelectorAll('[data-v-tiktok]').forEach(card=>card.addEventListener('click',()=>{
  const f=document.createElement('iframe');
  f.className=card.className+' v-frame';f.title='Video TikTok của POET';f.loading='lazy';f.allowFullscreen=true;
  f.allow='autoplay; fullscreen; encrypted-media';f.src=`https://www.tiktok.com/player/v1/${card.dataset.vTiktok}?autoplay=1`;
  card.replaceWith(f);f.focus();
}));

// Client-side correspondence only. The reviewed draft opens in Gmail compose (new tab); nothing is submitted.
// Shared copy feedback: buttons with .copy-idle/.copy-done swap to "Đã sao chép" for 1.6s.
function flashCopied(b){const idle=b.querySelector('.copy-idle'),done=b.querySelector('.copy-done');if(!idle||!done)return;idle.hidden=true;done.hidden=false;clearTimeout(b.copyTimer);b.copyTimer=setTimeout(()=>{idle.hidden=false;done.hidden=true;},1600);}
document.querySelectorAll('[data-partner-form]').forEach(partnerForm=>{
  const draft=partnerForm.querySelector('.partner-draft'),text=partnerForm.elements.draft,mail=partnerForm.querySelector('[data-partner-mail]'),copyDraft=draft.querySelector('[data-copy]'),email=mail.getAttribute('href').replace('mailto:','');
  const sync=()=>{mail.href=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Đồng hành POET Mùa 6 — '+partnerForm.elements.company.value.trim())}&body=${encodeURIComponent(text.value)}`;copyDraft.dataset.copy=text.value;};
  partnerForm.addEventListener('submit',e=>{
    e.preventDefault();if(!partnerForm.reportValidity())return;
    const f=partnerForm.elements,v=n=>f[n].value.trim(),phone=v('phone');
    text.value=`Chào POET,\n\nMình là ${v('contact')}, đại diện ${v('company')}.\nEmail liên hệ: ${v('email')}${phone?`\nSĐT/Zalo: ${phone}`:''}\nHình thức quan tâm: ${f.package.value}\n\n${v('message')||'Nhờ POET tư vấn hình thức đồng hành phù hợp với đơn vị.'}\n\nCảm ơn POET!`;
    draft.hidden=false;sync();text.focus();
  });
  text.addEventListener('input',sync);
  document.querySelectorAll('[data-partner-package]').forEach(a=>a.addEventListener('click',()=>{partnerForm.elements.package.value=a.dataset.partnerPackage;draft.hidden=true;partnerForm.elements.company.focus({preventScroll:true});}));
});

// Same ids/labels as messageWall.glyphs (data/content.mjs) and STICKERS in the Worker.
const WALL_STICKERS=[['xe-rua','Xe rùa'],['cap-sach','Cặp sách'],['cau-tuot','Cầu tuột'],['dep-lao','Dép lào']];
// Native modal supplies focus trapping, Escape and focus restoration.
const dialog=document.createElement('dialog');dialog.className='site-dialog';dialog.id='donation-dialog';dialog.setAttribute('aria-labelledby','donation-heading');
dialog.innerHTML=`<div class="site-dialog-inner"><button type="button" class="dialog-close" aria-label="Đóng hộp ủng hộ">×</button><div class="donate-aside"><p class="eyebrow">Ủng hộ cùng POET</p><h3>Một đóng góp nhỏ.<br>Một niềm vui lớn.</h3><p>Thanh toán an toàn qua PayOS. Mã QR và thông tin chuyển khoản sẽ hiển thị ở bước tiếp theo.</p><p>Bạn chỉ hoàn tất ủng hộ sau khi thanh toán được xác nhận.</p><img src="${new URL('assets/mascot/be-cuc/vui-tuoi.webp',base)}" width="150" height="175" alt=""></div><form class="donate-form"><h2 id="donation-heading">Ủng hộ ngay</h2><label for="support-amount">Số tiền (VNĐ)</label><input id="support-amount" name="amount" type="number" inputmode="numeric" min="10000" max="20000000" step="1000" value="100000" required aria-describedby="amount-help"><div class="amount-chips">${[50000,100000,200000,500000].map(n=>`<button type="button" data-amount="${n}" aria-pressed="${n===100000}">${money(n)}</button>`).join('')}</div><p class="fine-print" id="amount-help">Từ 10.000 đ đến 20.000.000 đ, theo bội số 1.000 đ.</p><label for="support-name">Tên hiển thị</label><input id="support-name" name="displayName" autocomplete="name" maxlength="40" required><label class="check-label"><input type="checkbox" name="anonymous"> Tôi muốn ủng hộ ẩn danh</label><label for="support-note">Lời nhắn (không bắt buộc)</label><textarea id="support-note" name="message" maxlength="160" rows="2" aria-describedby="note-help"></textarea><p class="fine-print" id="note-help">Tối đa 160 ký tự. Tên và lời nhắn có thể xuất hiện trên tường sau khi thanh toán được xác nhận.</p><fieldset class="sticker-pick"><legend>Chọn sticker dán lên tường</legend><div class="sticker-options">${WALL_STICKERS.map(([id,label],i)=>`<label><input type="radio" name="sticker" value="${id}"${i?'':' checked'}><img src="${new URL('assets/icons/hand-drawn/'+id+'.webp',base)}" width="36" height="36" alt=""><span>${label}</span></label>`).join('')}</div></fieldset><p class="donate-error" role="alert" hidden></p><button class="btn" type="submit">Tiếp tục đến mã QR${arrowSvg('arrow-up-right','link-arrow')}</button><p class="fine-print">Cần hỗ trợ? <a href="${new URL('dong-hanh/#lien-he',base)}" data-dialog-contact>Liên hệ POET</a>.</p></form></div>`;
document.body.append(dialog);
trapFocus(dialog);
let donationsEnabled=null,opener;
const form=dialog.querySelector('form'),submit=form.querySelector('[type=submit]'),error=form.querySelector('.donate-error');
function closeDialog(){if(submit.dataset.busy)return;dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',closeDialog);
// On the partner page the contact link is an in-page jump, so the modal must close first.
dialog.querySelector('[data-dialog-contact]').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
dialog.addEventListener('cancel',e=>{if(submit.dataset.busy)e.preventDefault();});
dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});
document.addEventListener('click',async e=>{
  const a=e.target.closest('[data-donate]');if(!a)return;e.preventDefault();opener=a;dialog.showModal();document.body.style.overflow='hidden';error.hidden=true;
  form.elements.amount.focus();
  if(donationsEnabled===null){submit.disabled=true;submit.textContent='Vui lòng chờ…';try{const response=await fetch(`${window.POETCheckout.API_BASE}/api/settings`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const data=await response.json();donationsEnabled=data.donationsEnabled!==false;submit.disabled=!donationsEnabled;submit.textContent=donationsEnabled?'Tiếp tục đến mã QR':'Đang tạm dừng nhận ủng hộ';}catch{submit.disabled=false;submit.textContent='Tiếp tục đến mã QR';error.textContent='Chưa kiểm tra được trạng thái nhận ủng hộ. Bạn có thể thử tiếp hoặc liên hệ POET.';error.hidden=false;/* The checkout endpoint remains authoritative. */}}
});
form.querySelectorAll('[data-amount]').forEach(b=>b.addEventListener('click',()=>{form.elements.amount.value=b.dataset.amount;form.querySelectorAll('[data-amount]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));}));
form.elements.amount.addEventListener('input',()=>form.querySelectorAll('[data-amount]').forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.amount===form.elements.amount.value))));
form.elements.anonymous.addEventListener('change',()=>{form.elements.displayName.disabled=form.elements.anonymous.checked;form.elements.displayName.required=!form.elements.anonymous.checked;});
form.addEventListener('submit',async e=>{
  e.preventDefault();if(submit.dataset.busy||donationsEnabled===false)return;
  const amount=Number(form.elements.amount.value),anonymous=form.elements.anonymous.checked,name=form.elements.displayName.value.trim(),message=form.elements.message.value.trim(),sticker=form.elements.sticker.value;
  if(!Number.isInteger(amount)||amount<10000||amount>20000000||amount%1000){form.elements.amount.setCustomValidity('Chọn từ 10.000 đ đến 20.000.000 đ, theo bội số 1.000 đ.');form.elements.amount.reportValidity();form.elements.amount.setCustomValidity('');return;}
  if(!anonymous&&!name){form.elements.displayName.focus();error.textContent='Bạn điền tên hoặc chọn ủng hộ ẩn danh nhé.';error.hidden=false;return;}
  submit.dataset.busy='1';submit.disabled=true;submit.textContent='Đang mở thanh toán…';error.hidden=true;
  try{await window.POETCheckout.open({amount,displayName:anonymous?'':name,message,anonymous,sticker},{resultBase:new URL('ung-ho/',base)});}catch(err){error.textContent=err instanceof TypeError?'Chưa kết nối được máy chủ. Bạn thử lại nhé.':err.message;error.hidden=false;delete submit.dataset.busy;submit.disabled=false;submit.textContent='Tiếp tục đến mã QR';error.tabIndex=-1;error.focus();}
});

// Copy controls include a selectable fallback when clipboard permission is unavailable.
document.addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);notify('Đã sao chép');flashCopied(b);}catch{
  const d=document.createElement('dialog');d.className='site-dialog copy-fallback';d.setAttribute('aria-label','Sao chép nội dung');d.innerHTML='<h2>Sao chép nội dung</h2><p>Chọn nội dung bên dưới và sao chép.</p><textarea readonly aria-label="Nội dung cần sao chép"></textarea><button type="button" class="btn">Đóng</button>';document.body.append(d);trapFocus(d);d.querySelector('textarea').value=b.dataset.copy;d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();b.focus();});d.showModal();d.querySelector('textarea').select();
}});

// Read-only real message data (UI-009 board). Render untrusted donor text via textContent only.
const wall=document.querySelector('[data-message-wall]');
// TODO(UI-009-backend): send {name,place,message,paper,glyph} to a reviewed-note endpoint once one exists in worker/. Until then nothing leaves the browser.
async function submitWallNote(payload){return {ok:false,reason:'composer-not-open',payload};}
if(wall){
  const board=wall.closest('[data-board]'),pagesNav=board.querySelector('[data-wall-pages]'),prev=board.querySelector('[data-wall-prev]'),next=board.querySelector('[data-wall-next]'),range=board.querySelector('[data-wall-range]'),retry=board.querySelector('[data-wall-retry]'),search=board.querySelector('[data-wall-search]'),sortButtons=[...board.querySelectorAll('[data-wall-sort]')],count=document.querySelector('[data-wall-count]');
  const iconBase=wall.dataset.iconBase,papers=wall.dataset.papers.split(' '),glyphs=wall.dataset.glyphs.split(' ');
  const phone=matchMedia('(max-width:640px)');
  const cache={},fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').replace(/đ/gi,'d').toLowerCase();
  let sort='new',query='',page=1,loaded=false,list=[];
  // Test mode until TODO(UI-009-backend): notes written in the composer stay in this browser only.
  const LOCAL_KEY='poet-wall-test-notes';
  const readLocal=()=>{try{const v=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');return Array.isArray(v)?v.map(n=>({...n,local:true})):[];}catch{return [];}};
  const writeLocal=notes=>{try{localStorage.setItem(LOCAL_KEY,JSON.stringify(notes.slice(0,50)));}catch{}};
  const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.codePointAt(0),16777619);return h>>>0;};
  const ago=iso=>{const t=Date.parse(iso);if(!Number.isFinite(t))return '';const h=(Date.now()-t)/36e5;if(h<1)return 'Vừa xong';if(h<24)return `${Math.floor(h)} giờ trước`;if(h<24*7)return `${Math.floor(h/24)} ngày trước`;if(h<24*35)return `${Math.floor(h/168)} tuần trước`;return new Date(t).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});};
  const nameOf=d=>d.displayName&&d.displayName!=='Ẩn danh'?d.displayName:'Một nhà hảo tâm';
  const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null){e.textContent=text;e.dir='auto';}return e;};
  // Shared with the composer preview: {name,place,message,paper,glyph,amount,paidAt}.
  function noteCard(n){
    const card=el('article','message-card');card.style.setProperty('--paper',`var(--paper-${n.paper})`);
    const who=el('div','message-who'),glyph=el('span','message-glyph'),icon=el('img'),names=el('div');
    icon.src=`${iconBase}${glyphs.includes(n.glyph)?n.glyph:glyphs[0]}.webp`;icon.alt='';icon.width=icon.height=30;glyph.append(icon);
    names.append(el('strong','',n.name));if(n.place)names.append(el('small','',n.place));who.append(glyph,names);
    const foot=el('div','message-foot');foot.append(el('span','',n.when));if(n.amount)foot.append(el('span','message-amount','+'+money(n.amount)));
    card.append(who,el('p','message-text',`“${n.message}”`),foot);return card;
  }
  const fromDonation=d=>{const h=hash(`${d.displayName||''}|${d.paidAt||''}`);return{name:nameOf(d),place:'',message:d.message||'Một đóng góp gửi đến POET.',paper:papers[h%papers.length],glyph:glyphs.includes(d.sticker)?d.sticker:glyphs[Math.floor(h/papers.length)%glyphs.length],amount:Number(d.amount),when:ago(d.paidAt)};};
  const state=text=>{wall.replaceChildren(el('p','wall-state',text));};
  function pageList(total,cur){
    if(phone.matches)return Array.from({length:Math.min(3,total)},(_,i)=>Math.max(1,Math.min(cur-1,total-2))+i); // narrow row: current page and its neighbours only
    if(total<=7)return Array.from({length:total},(_,i)=>i+1);
    const out=[1];if(cur-1>2)out.push('…');for(let i=Math.max(2,cur-1);i<=Math.min(total-1,cur+1);i++)out.push(i);if(cur+1<total-1)out.push('…');out.push(total);return out;
  }
  // Centre the outside arrows on the notes (desktop) or on the page-number row (phone).
  function placeArrows(){const target=phone.matches?pagesNav:wall,b=board.getBoundingClientRect(),r=target.getBoundingClientRect();board.style.setProperty('--wall-nav-y',`${r.top-b.top+r.height/2}px`);}
  function render(){
    const per=phone.matches?3:6,q=fold(query.trim()),shown=q?list.filter(d=>fold(d.local?d.name:nameOf(d)).includes(q)):list,total=Math.max(1,Math.ceil(shown.length/per));
    page=Math.min(page,total);
    if(!list.length)state(wall.dataset.empty);else if(!shown.length)state(wall.dataset.noMatch);
    else wall.replaceChildren(...shown.slice((page-1)*per,page*per).map(d=>noteCard(d.local?{...d,when:ago(d.paidAt)}:fromDonation(d))));
    range.textContent=shown.length?`${(page-1)*per+1}–${Math.min(page*per,shown.length)} / ${shown.length} lời nhắn`:'';
    pagesNav.replaceChildren(...(shown.length>per?pageList(total,page):[]).map(n=>{if(n==='…')return el('span','wall-gap','…');const b=el('button');b.type='button';b.textContent=n;b.setAttribute('aria-label',`Trang ${n}`);if(n===page)b.setAttribute('aria-current','page');b.addEventListener('click',()=>go(n));return b;}));
    prev.hidden=next.hidden=shown.length<=per;prev.disabled=page<=1;next.disabled=page>=total;placeArrows();
  }
  function go(n){page=n;render();if(board.getBoundingClientRect().top<0)board.scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});}
  async function load(){
    retry.hidden=true;
    if(!cache[sort]){state('Đang tải lời nhắn…');try{const response=await fetch(`${window.POETCheckout.API_BASE}/api/donations?sort=${sort}`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const data=await response.json();cache[sort]=(Array.isArray(data.donations)?data.donations:[]).filter(d=>Number.isFinite(Number(d.amount))&&Number(d.amount)>0);if(Number.isFinite(Number(data.totalCount))){count.textContent=`${new Intl.NumberFormat('vi-VN').format(Number(data.totalCount))} lời nhắn`;count.hidden=false;}}catch{const mine=readLocal();if(mine.length){loaded=true;list=mine;render();retry.hidden=false;return;}state(wall.dataset.error);retry.hidden=false;return;}}
    loaded=true;list=[...readLocal(),...cache[sort]];render();
  }
  prev.addEventListener('click',()=>go(page-1));next.addEventListener('click',()=>go(page+1));retry.addEventListener('click',load);
  sortButtons.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.wallSort===sort)return;sort=b.dataset.wallSort;page=1;sortButtons.forEach(x=>x.setAttribute('aria-pressed',x===b));load();}));
  let typing;search.addEventListener('input',()=>{clearTimeout(typing);typing=setTimeout(()=>{query=search.value;page=1;if(loaded)render();},150);});
  phone.addEventListener('change',()=>{page=1;if(loaded)render();});
  if('ResizeObserver'in window)new ResizeObserver(placeArrows).observe(board);
  if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!loaded){io.disconnect();load();}},{rootMargin:'200px'});io.observe(wall);}else load();

  // Composer: client-side only until TODO(UI-009-backend) lands.
  const toggle=document.querySelector('[data-wall-toggle]'),composer=document.querySelector('[data-wall-composer]');
  if(toggle&&composer){
    const form=composer.querySelector('[data-wall-form]'),label=toggle.querySelector('span:last-child'),openText=label.textContent,message=form.elements.message,countdown=form.querySelector('[data-wall-countdown]'),error=form.querySelector('[data-wall-error]'),status=form.querySelector('[data-wall-status]'),preview=form.querySelector('[data-wall-preview]'),soon=form.querySelector('[data-wall-soon]');
    const pick={paper:papers[0],glyph:glyphs[0]};
    const sync=()=>{form.querySelectorAll('[data-paper]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.paper===pick.paper));form.querySelectorAll('[data-glyph]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.glyph===pick.glyph));countdown.textContent=`${message.value.length}/280`;preview.replaceChildren(noteCard({name:form.elements.name.value.trim()||'Một nhà hảo tâm',place:form.elements.place.value.trim(),message:message.value.trim()||'Lời nhắn của bạn sẽ hiện ở đây.',paper:pick.paper,glyph:pick.glyph,when:'Vừa xong'}));};
    const setOpen=open=>{composer.classList.toggle('is-open',open);composer.inert=!open;toggle.setAttribute('aria-expanded',open);label.textContent=open?toggle.dataset.closeLabel:openText;if(open)form.elements.name.focus({preventScroll:true});else if(composer.contains(document.activeElement))toggle.focus();};
    toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
    form.addEventListener('click',e=>{const b=e.target.closest('[data-paper],[data-glyph]');if(!b)return;if(b.dataset.paper)pick.paper=b.dataset.paper;else pick.glyph=b.dataset.glyph;sync();});
    form.addEventListener('input',()=>{if(message.value.trim()){error.textContent='';message.removeAttribute('aria-invalid');}sync();});
    form.addEventListener('submit',async e=>{e.preventDefault();status.replaceChildren();
      if(!message.value.trim()){error.textContent='Bạn viết vài dòng lời nhắn trước khi dán lên tường nhé.';message.setAttribute('aria-invalid','true');message.focus();return;}
      const result=await submitWallNote({name:form.elements.name.value.trim(),place:form.elements.place.value.trim(),message:message.value.trim(),paper:pick.paper,glyph:pick.glyph});
      if(result.ok)return;
      // No backend yet: pin the note on this browser's wall so the flow can be tried end to end.
      const note={name:form.elements.name.value.trim()||'Một nhà hảo tâm',place:form.elements.place.value.trim(),message:message.value.trim(),paper:pick.paper,glyph:pick.glyph,paidAt:new Date().toISOString()};
      writeLocal([note,...readLocal()]);
      list=[...readLocal(),...(cache[sort]||[])];loaded=true;query='';search.value='';page=1;render();
      form.elements.name.value='';form.elements.place.value='';message.value='';sync();
      status.append(el('p','wall-sent','Đã dán lên tường! Bản thử: lời nhắn chỉ hiện trên trình duyệt này, chưa gửi tới POET.'));
      board.scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});});
    sync();
  }
}
