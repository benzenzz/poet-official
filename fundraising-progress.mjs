// Shared ES module for the static builder and browser. Amounts are the source of truth.
import {createFundraisingReveal} from './fundraising-reveal.mjs?v=home-005-5';
export const fundraisingMilestones = [
  {name:'coral',color:'#EF8A7D',tint:'#fff8f5',border:'#f0c4bd',ink:'#843c33'},
  {name:'yellow',color:'#FEE161',tint:'#fffdf2',border:'#eddfa0',ink:'#665112'},
  {name:'green',color:'#399F78',tint:'#f4faf6',border:'#b5ddc7',ink:'#235d46'},
  {name:'blue',color:'#5CA6D4',tint:'#f4f9fc',border:'#bad8eb',ink:'#285a78'}
];

export function fundraisingState(raised,target) {
  const known=Number.isFinite(raised)&&Number.isFinite(target)&&target>0&&raised>=0;
  const progress=known?Math.max(0,Math.min(100,raised/target*100)):0;
  return {known,progress,remaining:known?Math.max(0,target-raised):null,
    milestone:fundraisingMilestones[Math.min(3,Math.floor(progress/25))]};
}

export function fundraisingStyle(state) {
  const m=state.milestone;
  return `--progress:${state.progress}%;--milestone-color:${m.color};--milestone-tint:${m.tint};--milestone-border:${m.border};--milestone-ink:${m.ink}`;
}

export function initFundraisingProgress(scope=document) {
  const reveals=new WeakMap();
  const number=n=>new Intl.NumberFormat('vi-VN').format(n);
  const amount=(card,key)=>{
    const value=card.getAttribute(key);
    return value===null||value.trim()===''?null:Number(value);
  };
  const render=card=>{
    const raised=amount(card,'data-raised'),target=amount(card,'data-target');
    const state=fundraisingState(raised,target),m=state.milestone;
    card.dataset.milestone=m.name;
    card.style.setProperty('--progress',`${state.progress}%`);
    for(const [key,value] of Object.entries({color:m.color,tint:m.tint,border:m.border,ink:m.ink}))card.style.setProperty(`--milestone-${key}`,value);
    const bar=card.querySelector('.fund-progress-track'),badge=card.querySelector('.fund-status');
    if(state.known){
      bar.setAttribute('role','progressbar');
      bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
      bar.setAttribute('aria-valuenow',String(+state.progress.toFixed(2)));
      bar.setAttribute('aria-valuetext',`${number(+state.progress.toFixed(2))}%${card.dataset.provisional==='true'?' — số liệu minh họa, chưa xác nhận':''}`);
      bar.setAttribute('aria-label',card.dataset.progressLabel);
    }else{
      bar.setAttribute('role','img');bar.setAttribute('aria-label','Tiến độ gây quỹ đang chờ số liệu xác nhận');
      ['aria-valuemin','aria-valuemax','aria-valuenow','aria-valuetext'].forEach(key=>bar.removeAttribute(key));
    }
    if(badge)badge.textContent=state.known?`Đạt ${number(+state.progress.toFixed(2))}%`:'Chờ cập nhật';
    const total=card.querySelector('[data-fund-raised]'),remaining=card.querySelector('[data-fund-remaining]');
    if(total)total.textContent=state.known?number(raised):'—';
    if(remaining)remaining.textContent=state.known?`${number(+state.remaining.toFixed(2))}%`:'chờ cập nhật';
    reveals.get(card)?.update(state,raised);
  };
  const observers=[...scope.querySelectorAll('[data-fundraising]')].map(card=>{
    const reveal=createFundraisingReveal(card);
    if(reveal)reveals.set(card,reveal);
    render(card);
    reveal?.observe();
    const observer=new MutationObserver(()=>render(card));
    observer.observe(card,{attributes:true,attributeFilter:['data-raised','data-target','data-provisional','data-fund-loading']});
    return {disconnect(){observer.disconnect();reveal?.disconnect();}};
  });
  return ()=>observers.forEach(observer=>observer.disconnect());
}
