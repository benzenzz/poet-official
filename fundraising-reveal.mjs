// Home-only presentation. Financial calculation and checkout stay elsewhere.
const AMOUNT_MS=1400,COUNT_MS=1600,COUNT_DELAY_MS=200;
const easeOutExpo=t=>t===1?1:1-2**(-10*t);
export function createFundraisingReveal(card) {
  if(!card.hasAttribute('data-fund-animate'))return null;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  // Explicit loopback-only motion review; public pages retain OS preferences.
  const fullPreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('homeMotion')==='full';
  const reduceMotion=()=>reduced.matches&&!fullPreview;
  const format=n=>new Intl.NumberFormat('vi-VN').format(n);
  let frame,observer,running=false,disposed=false,wanted=false,played=card.dataset.fundAnimated==='true',state,raised;
  const total=card.querySelector('[data-fund-raised]');
  const counters=[...card.querySelectorAll('[data-fund-count]')];
  function reserveNumbers(){
    const ctx=document.createElement('canvas').getContext('2d');
    for(const number of card.querySelectorAll('.fund-number')){
      ctx.font=getComputedStyle(number).font;
      const widest=[...'0123456789'].reduce((a,b)=>ctx.measureText(a).width>=ctx.measureText(b).width?a:b);
      number.dataset.fundReserve=number.dataset.fundFinal.replace(/\d/g,widest);
    }
  }
  function finalValues(){
    total.textContent=state.known?format(raised):'—';
    for(const counter of counters)counter.textContent=format(Number(counter.dataset.fundCount));
    card.style.removeProperty('--fund-display-progress');
  }
  function finish(){
    cancelAnimationFrame(frame);running=false;played=true;card.dataset.fundAnimated='true';
    finalValues();card.dataset.fundMotion='done';observer?.disconnect();
  }
  function start(){
    if(played)return;
    // Counting now would run up to the baked fixture, then snap to the live numbers.
    wanted=card.hasAttribute('data-fund-loading');
    if(wanted)return;
    if(reduceMotion()||!state.known){finish();return;}
    played=true;running=true;card.dataset.fundAnimated='true';observer?.disconnect();
    // Write the first frame before exposing the numeric layer: no final-value flash.
    total.textContent='0';counters.forEach(counter=>counter.textContent='0');
    card.style.setProperty('--fund-display-progress','0%');card.dataset.fundMotion='running';
    const startTime=performance.now();
    const tick=now=>{
      // Amount and bar share one eased clock so the fill tracks the number; counters follow 150ms apart.
      const elapsed=Math.max(0,now-startTime),amountProgress=easeOutExpo(Math.min(1,elapsed/AMOUNT_MS));
      total.textContent=format(amountProgress===1?raised:Math.round(raised*amountProgress));
      card.style.setProperty('--fund-display-progress',`${state.progress*amountProgress}%`);
      let counting=amountProgress<1;
      counters.forEach((counter,i)=>{const value=Number(counter.dataset.fundCount),t=Math.min(1,Math.max(0,(elapsed-COUNT_DELAY_MS-i*150)/COUNT_MS)),p=easeOutExpo(t);if(t<1)counting=true;counter.textContent=format(p===1?value:Math.round(value*p));});
      if(counting)frame=requestAnimationFrame(tick);else finish();
    };
    frame=requestAnimationFrame(tick);
  }
  function update(next,amount){
    const interrupted=running;
    state=next;raised=amount;
    finalValues();
    card.querySelector('[data-fund-raised-label]').textContent=state.known?`${format(raised)}%`:'Tiến độ đang chờ cập nhật';
    for(const number of card.querySelectorAll('.fund-number'))number.dataset.fundFinal=number.querySelector('span').textContent;
    reserveNumbers();
    if(interrupted){finish();return;}
    if(played||reduceMotion())finish();
    else if(wanted)start();
  }
  const onMotionChange=()=>{if(reduceMotion())finish();};
  reduced.addEventListener('change',onMotionChange);
  return {update,observe(){
    if(played||reduceMotion()||!('IntersectionObserver'in window)){finish();return;}
    document.fonts.ready.then(()=>{
      if(disposed)return;
      reserveNumbers();
      observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.35))start();},{threshold:[0,.35]});
      observer.observe(card);
    });
  },disconnect(){disposed=true;cancelAnimationFrame(frame);observer?.disconnect();reduced.removeEventListener('change',onMotionChange);}};
}
