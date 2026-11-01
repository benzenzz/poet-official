// Second half of the Home stall → message wall hand-off (world.js plays the first ~0.3s
// and sets the flag). The head script already painted html.wave-in, a flat pink cover, so
// the page never flashes; this swaps it for the same curved wave and lifts it away.
export function initPageWave(){
  const root=document.documentElement;
  try{sessionStorage.removeItem('poet-wave-in');}catch{/* Private mode. */}
  if(!root.classList.contains('wave-in'))return;
  const wave=document.createElement('div');wave.className='page-wave';wave.setAttribute('aria-hidden','true');
  // Same curve as the Home curtain (waveB in world.js), so the motion reads as one.
  wave.innerHTML='<svg viewBox="0 0 1440 1200" preserveAspectRatio="none" focusable="false"><path d="M0 110 C240 250 480 10 720 135 C960 260 1200 50 1440 170 L1440 1010 C1200 1150 960 930 720 1055 C480 1180 240 970 0 1110 Z"/></svg>';
  document.body.append(wave);root.classList.remove('wave-in');
  const h=innerHeight;
  wave.animate([{transform:`translateY(${-.3*h}px)`},{transform:`translateY(${-1.9*h}px)`}],{duration:200,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'})
    .finished.catch(()=>{}).then(()=>wave.remove());
}
