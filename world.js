/* POET: one GSAP master, then a small set of owned ambient timelines.
   Static SVG is the final scene. No layout coordinates are animated or remeasured. */
(() => {
  'use strict';
  const debug=window.POETHeroDebug;
  const query=new URLSearchParams(location.search),localPreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  // The user requested full playback on the plain local V2 preview, including
  // VS Code webviews reporting reduced motion. Public hosts still honor the OS.
  const previewMotion=localPreview&&query.get('heroMotion')!=='respect'&&query.get('heroDebug')!=='0';
  if(localPreview&&query.get('heroMotion')==='respect'){
    try{sessionStorage.removeItem('poet:hero:preview-motion');}catch(_){}
  }
  const trace=(event,extra)=>debug?.log(event,extra);
  trace('HERO_SCRIPT_LOADED',{script:document.currentScript?.src});
  if (window.POETWorld?.engine === 'gsap' && window.POETWorld.state !== 'stopped') return;
  const root=document.documentElement,hero=document.querySelector('.hero--world');
  if(!hero)return root.classList.remove('intro-pending');
  const gsap=window.gsap,MotionPathPlugin=window.MotionPathPlugin;
  trace('GSAP_AVAILABLE',{available:!!gsap,motionPathAvailable:!!MotionPathPlugin});
  if(!gsap||!MotionPathPlugin){root.classList.remove('intro-pending');root.dataset.worldState='fallback';return;}
  gsap.registerPlugin(MotionPathPlugin);

  function createHeroController(forceIntro=false){
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
    // Local review defaults to full; ?heroMotion=respect and public pages honor the OS.
    const reduceMotion=()=>reduced.matches&&!(debug?.forceMotion||previewMotion);
    const select=s=>[...hero.querySelectorAll(s)],q=s=>hero.querySelector(s);
    const world=q('.world-drift'),slot=document.querySelector('.mascot-slot');
    const floating=q('.world-float');
    const introScene=q('.poet-intro'),introCopy=q('.intro-copy'),curtain=q('.intro-curtain'),introLines=select('[data-intro-line]');
    introLines.forEach(line=>{
      if(line.dataset.prepared)return;
      const text=line.textContent.trim(),parts=text.split(/\s+/);
      line.setAttribute('aria-label',text);line.dataset.prepared='true';line.replaceChildren();
      parts.forEach((part,i)=>{if(i)line.append(' ');const mask=document.createElement('span'),ink=document.createElement('span');mask.className='intro-word';mask.setAttribute('aria-hidden','true');ink.textContent=part;mask.append(ink);line.append(mask);});
    });
    const introWords=select('.intro-word > span'),joinLink=q('.join-joy-link'),joinHover=q('.join-joy-hover'),cue=q('.join-joy-cue'),cuePaths=select('.join-joy-cue path');
    const tiles=select('.tile').sort((a,b)=>+a.dataset.routeIndex-+b.dataset.routeIndex);
    const tileByOrder=new Map(tiles.map(tile=>[+tile.dataset.order,tile])),tileGlows=select('.tile-activation'),glowTweens=new Map();
    const groups=select('.build-item'),pivots=select('.swing-seat,.seesaw-plank,.flower-sway,.character-body');
    const flowerHovers=select('.flower-hover'),flowerTweens=new Map(),hoveredFlowers=new Set();
    const leaves=select('.wind-leaf'),leafShapes=select('.leaf-shape'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
    const routeStops=tiles.map(tile=>{const[u,v]=tile.dataset.center.split(',').map(Number);return{order:+tile.dataset.order,u,v,x:765+(u-v)*Math.cos(Math.PI/6),y:80+.44*(u+v)-10};});
    const mark=q('.intro-mark'),shadow=q('.board-shadow'),route=q('#poet-mascot-route');
    const owned=[...new Set([...groups,...pivots,...flowerHovers,...leaves,...leafShapes,...tileGlows,...introLines,...introWords,...cuePaths,introScene,introCopy,curtain,joinHover,cue,floating,world,mark,shadow].filter(Boolean))];
    const snapshots=new Map(owned.map(el=>[el,{style:el.getAttribute('style'),transform:el.getAttribute('transform'),svgOrigin:el.getAttribute('data-svg-origin')}]));
    const slotVisibility=slot?.style.visibility;
    const ambientTimelines=[],entries=[],phaseEvents=[];
    let master=null,pathLoop=null,cueTimeline=null,hoverTween=null,pointerSettle=null,resolved=false,destroyed=false,onScreen=false,pageSuspended=false,introNotified=false,playingReported=false,driftX=null,driftY=null;
    let activeTile=null,joinHovered=false,joinFocused=false,handoff=null;
    let resolveIntro;const introFinished=new Promise(resolve=>{resolveIntro=resolve;});
    let INTRO=.56;
    const TILE_DURATION=.30,TILE_BATCH=.85,TILE_STAGGER=(TILE_BATCH-TILE_DURATION)/Math.max(1,tiles.length-1);
    const tileEnds=new Map();
    const tileRun={};let suppressTileNotes=false;
    const tileEvent=(name,detail={})=>hero.dispatchEvent(new CustomEvent('poet:tile-'+name,{detail:{run:tileRun,...detail}}));
    const phase=name=>{root.dataset.worldState=name;phaseEvents.push({name,time:master?.time()||0});if(name==='tiles')trace('TILE_ASSEMBLY_STARTED',{element:debug?.elementState(tiles[0])});if(name==='playground')trace('WORLD_POP_STARTED');};

    function notifyIntroComplete(){
      if(introNotified)return;introNotified=true;
      introScene?.setAttribute('aria-hidden','true');
      trace('INTRO_COMPLETE',{introDuration:INTRO});
      resolveIntro();hero.dispatchEvent(new CustomEvent('poet:intro-complete',{bubbles:true}));
    }
    function svgOrigin(el){
      if(el?.dataset.origin)gsap.set(el,{svgOrigin:el.dataset.origin,smoothOrigin:false,force3D:false});
    }
    function prepareHeroAnimation(){
      tileEvent('assembly-start');
      // Batch attribute writes; defer SVG bounding-box work to each staggered entrance.
      // Initializing every SVG transform here caused a long task under CPU throttling.
      for(const[el,values]of snapshots){
        for(const[attr,value]of[['style',values.style],['transform',values.transform],['data-svg-origin',values.svgOrigin]]){
          if(el.getAttribute(attr)===value)continue;
          value===null?el.removeAttribute(attr):el.setAttribute(attr,value);
        }
        if(el._gsap)el._gsap.uncache=1;
      }
      hero.classList.add('world-building');
      if(mark)gsap.set(mark,{opacity:0,y:0,scale:.95,transformOrigin:'50% 50%'});
      if(introScene)gsap.set(introScene,{autoAlpha:0});
      if(joinLink){joinLink.setAttribute('tabindex','-1');joinLink.setAttribute('aria-disabled','true');}
      if(cue)gsap.set(cue,{opacity:0});
      root.classList.remove('intro-pending');
    }
    function createIntro(reducedVersion=false){
      if(!introScene)return null;
      gsap.set(introScene,{autoAlpha:1});gsap.set(introLines,{visibility:'visible'});introScene.setAttribute('aria-hidden','false');
      const intro=gsap.timeline();
      gsap.set(introWords,{yPercent:0,rotation:0,opacity:1});
      gsap.set(introCopy,{y:0,opacity:1});gsap.set(introLines,{y:0,opacity:1});
      if(reducedVersion){
        intro.to(introCopy,{opacity:0,duration:.15},1.65).set(introScene,{autoAlpha:0},1.8).call(notifyIntroComplete);
        return intro;
      }
      gsap.set(introLines,{y:8,opacity:0});
      intro.to(introLines,{y:0,opacity:1,duration:.35,stagger:.24,ease:'power2.out'},0)
        .to(introCopy,{y:-6,opacity:0,duration:.25,ease:'sine.inOut'},1.65)
        .call(()=>trace('INTRO_HANDOFF_STARTED'),null,1.65)
        .to(curtain,{yPercent:-110,duration:.45,ease:'sine.inOut'},1.65)
        .addLabel('world-open',1.9).call(notifyIntroComplete,null,'world-open')
        .set(introScene,{autoAlpha:0},2.1);
      return intro;
    }
    function record(el,kind,start,duration,extra={}){
      entries.push({name:el.dataset.obj||kind,kind,start,end:start+duration,...extra});
    }
    function animateTileAssembly(){
      // Short upward translation in screen space, adapted to this fixed SVG camera.
      const sceneScale=q('.playground').getBoundingClientRect().width/1530;
      const rise=Math.min(28,18/Math.max(.5,sceneScale));
      tiles.forEach((tile,i)=>{
        const at=INTRO+i*TILE_STAGGER;
        tileEnds.set(tile.dataset.obj,at+TILE_DURATION);
        master.fromTo(tile,{y:rise,opacity:0,scale:1,svgOrigin:tile.dataset.origin,smoothOrigin:false,force3D:false},
          {y:0,opacity:1,duration:TILE_DURATION,ease:'power2.out',immediateRender:false,onComplete(){
            if(!suppressTileNotes&&!destroyed&&!reduceMotion()&&!document.hidden&&!pageSuspended&&onScreen&&master.isActive())tileEvent('settled',{tile});
            if(i===tiles.length-1)tileEvent('assembled');
          }},at);
        record(tile,'tile',at,TILE_DURATION,{order:+tile.dataset.order,rise});
      });
      const at=Math.max(0,INTRO-.1);
      master.fromTo(q('.board'),{y:12,opacity:0,svgOrigin:q('.board').dataset.origin,smoothOrigin:false},
        {y:0,opacity:1,duration:.3,ease:'power2.out',immediateRender:false},at)
        .fromTo(shadow,{opacity:0},{opacity:.07,duration:.3,ease:'power2.out',immediateRender:false},at);
      record(q('.board'),'board',at,.3);
    }
    function pop(el,kind,at){
      if(!el)return;
      const duration=kind==='character'?.48:.42;
      master.fromTo(el,{y:kind==='character'?14:20,scale:1,rotation:0,opacity:0,svgOrigin:el.dataset.origin,smoothOrigin:false,force3D:false},
        {y:0,opacity:1,duration,ease:'power2.out',immediateRender:false},at);
      record(el,kind,at,duration);
    }
    function animateWorldReveal(){
      ['slide','swing','seesaw','roundabout'].forEach((name,i)=>pop(q('[data-obj="'+name+'"]'),'equipment',INTRO+.16+i*.09));
      select('.building,.vegetation,.prop').forEach((el,i)=>{
        const kind=el.matches('.building')?'building':el.dataset.obj==='have-fun-sign'?'sign':el.dataset.obj.startsWith('flowers-')||el.dataset.obj.startsWith('meadow-')?'detail':'environment';
        const supports=(el.dataset.supportTiles||'').split(' ').filter(Boolean);
        const supportedAt=Math.max(0,...supports.map(id=>tileEnds.get(id)||0));
        const at=supports.length?supportedAt+.08:INTRO+.25+(i%3)*.09;
        pop(el,kind,at);entries.at(-1).supports=supports;
      });
    }
    function animateMascotEntry(){
      select('.character').forEach((el,i)=>pop(el,'character',INTRO+.9+i*.1));

    }
    function stopGlowTween(glow){glowTweens.get(glow)?.kill();glowTweens.delete(glow);}
    function deactivateTile(){
      if(!activeTile)return;
      const{tile,glow}=activeTile;activeTile=null;tile.removeAttribute('data-mascot-active');stopGlowTween(glow);
      const tween=gsap.to(glow,{opacity:0,scale:1,duration:.24,ease:'power2.out',id:'poet-tile-release',onComplete(){if(glowTweens.get(glow)===tween)glowTweens.delete(glow);}});
      glowTweens.set(glow,tween);
    }
    function activateTile(order){
      if(destroyed||!resolved||reduceMotion())return;
      deactivateTile();
      const tile=tileByOrder.get(order),glow=tile?.querySelector('.tile-activation');if(!glow)return;
      stopGlowTween(glow);svgOrigin(glow);activeTile={order,tile,glow};tile.dataset.mascotActive='true';
      const pulse=gsap.timeline({id:'poet-tile-activation',onComplete(){if(glowTweens.get(glow)===pulse)glowTweens.delete(glow);}});
      pulse.to(glow,{opacity:1,scale:1.035,duration:.12,ease:'power2.out'})
        .to(glow,{opacity:.8,scale:1,duration:.16,ease:'sine.inOut'});
      glowTweens.set(glow,pulse);trace('TILE_ACTIVATED',{order});
    }
    function resetTileActivation(){
      const touched=new Set([...glowTweens.keys(),activeTile?.glow].filter(Boolean));
      glowTweens.forEach(tween=>tween.kill());glowTweens.clear();
      touched.forEach(glow=>gsap.set(glow,{opacity:0,scale:1}));
      activeTile?.tile.removeAttribute('data-mascot-active');activeTile=null;
    }
    function startWind(){
      const paths=['M-70 180C250 55 435 170 650 90S1160 165 1590 45','M-100 540C180 620 300 500 520 610S1160 710 1620 650','M-80 340C160 190 300 300 520 245S1060 300 1600 170','M-100 720C240 590 420 810 720 735S1230 800 1640 610'];
      leaves.forEach((el,i)=>{
        const leafScale=(.9+i*.12)*1.2,duration=12+i*1.7,tl=gsap.timeline({paused:true,repeat:-1,repeatDelay:4+i*1.3,delay:i*3.4,id:'poet-wind-'+i});
        tl.to(el,{duration,motionPath:{path:paths[i],autoRotate:false},ease:'none'},0)
          .fromTo(el,{opacity:0},{opacity:i<2?.3:.42,duration:1.4,ease:'sine.inOut',immediateRender:false},0)
          .to(el,{opacity:0,duration:1.5,ease:'sine.inOut'},duration-1.5)
          .fromTo(el.querySelector('.leaf-shape'),{rotation:-35,scale:leafScale,svgOrigin:'0 0'},{rotation:70+i*12,scale:leafScale,duration,ease:'sine.inOut',immediateRender:false},0);
        ambientTimelines.push(tl);
      });
    }
    function stopDrift(){
      pointerSettle?.kill();pointerSettle=null;
      driftX?.tween.kill();driftY?.tween.kill();driftX=driftY=null;
      gsap.set(world,{x:0,y:0});
    }
    function showStaticCue(){
      if(!cue)return;
      gsap.set(cue,{opacity:1});gsap.set(cuePaths,{strokeDasharray:'none',strokeDashoffset:0});
    }
    function startDestinationCue(){
      if(!cue||cueTimeline)return;
      if(reduceMotion())return showStaticCue();
      cuePaths.forEach(path=>{const length=path.getTotalLength();gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});});
      cueTimeline=gsap.timeline({paused:true,delay:.3,id:'poet-destination-cue',onStart:()=>trace('JOIN_JOY_ARROW_STARTED'),onComplete:()=>trace('JOIN_JOY_ARROW_COMPLETE')});
      cueTimeline.set(cue,{opacity:1},0).to(cuePaths[0],{strokeDashoffset:0,duration:.85,ease:'power1.inOut'},0)
        .to(cuePaths[1],{strokeDashoffset:0,duration:.25,ease:'power2.out'},.8);
      syncMotion();
    }
    function resetDestination(){
      cueTimeline?.kill();cueTimeline=null;hoverTween?.kill();hoverTween=null;
      joinLink?.classList.remove('is-engaged');
      if(joinHover)gsap.set(joinHover,{scale:1});
      if(cue)gsap.set(cue,{opacity:0});
    }
    function updateJoinInteraction(instant=false){
      const engaged=resolved&&(joinHovered||joinFocused);
      joinLink?.classList.toggle('is-engaged',engaged);hoverTween?.kill();hoverTween=null;
      if(!joinHover)return;
      svgOrigin(joinHover);
      const scale=engaged&&!reduceMotion()?1.12:1;
      if(instant||reduceMotion()){gsap.set(joinHover,{scale});return;}
      hoverTween=gsap.to(joinHover,{scale,duration:engaged&&joinHovered?.46:.28,ease:engaged&&joinHovered?'back.out(4.5)':'power2.out',overwrite:true});
    }
    function resetFlowerHovers(){
      if(!flowerTweens.size&&!hoveredFlowers.size)return;
      flowerTweens.forEach(tween=>tween.kill());flowerTweens.clear();hoveredFlowers.clear();
      gsap.set(flowerHovers,{scale:1,y:0});
    }
    function reactFlower(node,enter){
      if(enter&&(!resolved||destroyed||!onScreen||document.hidden||pageSuspended||handoff||hero.dataset.mascotDragging||!finePointer.matches))return;
      if(enter&&hoveredFlowers.has(node))return;
      flowerTweens.get(node)?.kill();flowerTweens.delete(node);
      enter?hoveredFlowers.add(node):hoveredFlowers.delete(node);
      svgOrigin(node);
      if(reduceMotion())return void gsap.set(node,{scale:enter?1.035:1,y:0});
      let tween;
      const complete=()=>{if(flowerTweens.get(node)===tween)flowerTweens.delete(node);};
      if(enter){
        tween=gsap.timeline({onComplete:complete})
          .to(node,{scaleX:1.025,scaleY:.97,y:1,duration:.075,ease:'sine.out'})
          .to(node,{scaleX:1.205,scaleY:1.205,y:-10,duration:.22,ease:'power2.out'})
          .to(node,{scaleX:1.17,scaleY:1.17,y:-7,duration:.3,ease:'back.out(1.25)'});
      }else tween=gsap.to(node,{scaleX:1,scaleY:1,y:0,duration:.3,ease:'power2.out',onComplete:complete});
      flowerTweens.set(node,tween);
    }
    function startDrift(){
      if(driftX||!finePointer.matches)return;
      driftX=gsap.quickTo(world,'x',{duration:.45,ease:'power3.out'});
      driftY=gsap.quickTo(world,'y',{duration:.45,ease:'power3.out'});
      pointerSettle=gsap.delayedCall(.7,()=>{driftX?.(0);driftY?.(0);}).pause();
    }
    function startAmbientMotion(){
      if(destroyed||reduceMotion()||ambientTimelines.length)return syncMotion();
      pivots.forEach(svgOrigin);
      if(floating){
        const idle=gsap.timeline({paused:true,repeat:-1,id:'poet-board-float'});
        idle.to(floating,{x:1.1,y:-2.2,duration:3.2,ease:'sine.inOut'})
          .to(floating,{x:-1.1,y:1.6,duration:6.4,ease:'sine.inOut'})
          .to(floating,{x:0,y:0,duration:3.2,ease:'sine.inOut'});
        ambientTimelines.push(idle);
      }
      const swing=gsap.timeline({paused:true,repeat:-1,repeatDelay:2.2,id:'poet-swing'});
      swing.to(q('.swing-seat'),{rotation:-2,duration:.9,ease:'sine.inOut'})
        .to(q('.swing-seat'),{rotation:2,duration:1.8,ease:'sine.inOut'})
        .to(q('.swing-seat'),{rotation:0,duration:.9,ease:'sine.inOut'});
      ambientTimelines.push(swing);
      const seesaw=gsap.timeline({paused:true,repeat:-1,repeatDelay:5.5,delay:2.5,id:'poet-seesaw'});
      seesaw.to(q('.seesaw-plank'),{rotation:-2,duration:.85,ease:'sine.inOut'})
        .to(q('.seesaw-plank'),{rotation:0,duration:.85,ease:'sine.inOut'},'+=1');
      ambientTimelines.push(seesaw);
      select('.flower-sway').forEach((el,i)=>{
        const tl=gsap.timeline({paused:true,repeat:-1,repeatDelay:3+i*.5,delay:1.2+i*1.1,id:'poet-flower-'+i});
        tl.to(el,{rotation:1.2,duration:.8,ease:'sine.inOut'}).to(el,{rotation:-1.2,duration:1.6,ease:'sine.inOut'}).to(el,{rotation:0,duration:.8,ease:'sine.inOut'});
        ambientTimelines.push(tl);
      });
      select('.character .character-body').forEach((el,i)=>{
        const tilt=[3.4,-4,3.1][i%3],bounce=[6,5,7][i%3],half=[1.05,1.2,.95][i%3];
        const tl=gsap.timeline({paused:true,repeat:-1,delay:i*.37,id:'poet-idle-'+i});
        tl.to(el,{rotation:tilt,y:-bounce,duration:half,ease:'sine.inOut'})
          .to(el,{rotation:-tilt,y:0,duration:half,ease:'sine.inOut'});
        ambientTimelines.push(tl);
      });
      startWind();syncMotion();
    }
    function stopAmbientMotion(){
      resetFlowerHovers();
      ambientTimelines.forEach(tl=>tl.kill());ambientTimelines.length=0;pathLoop=null;
      resetTileActivation();
      stopDrift();gsap.set(pivots,{x:0,y:0,rotation:0,scale:1});gsap.set(leaves,{opacity:0});
      if(floating)gsap.set(floating,{x:0,y:0});
    }
    function syncMotion(){
      if(destroyed)return;
      const paused=!onScreen||document.hidden||pageSuspended||reduceMotion()||Boolean(handoff);
      if(paused)resetFlowerHovers();
      if(handoff?.timeline)(document.hidden||pageSuspended)?handoff.timeline.pause():handoff.timeline.resume();
      ambientTimelines.forEach(tl=>paused?tl.pause():tl.resume());
      glowTweens.forEach(tween=>paused?tween.pause():tween.resume());
      if(paused||!resolved||!finePointer.matches){if(driftX)stopDrift();}else startDrift();
      const entrancePaused=!onScreen||document.hidden||pageSuspended;
      if(master&&!resolved)entrancePaused?master.pause():master.resume();
      if(cueTimeline)paused?cueTimeline.pause():cueTimeline.resume();
      if(master&&!resolved&&!entrancePaused&&!playingReported){playingReported=true;trace('HERO_TIMELINE_PLAYING',{onScreen,pageSuspended});}
      if(entrancePaused)playingReported=false;
      root.dataset.worldMotion=paused?'paused':'playing';
    }
    function completeHero(){
      if(resolved||destroyed)return;resolved=true;notifyIntroComplete();
      hero.classList.remove('world-building');
      if(introScene)gsap.set(introScene,{autoAlpha:0});
      if(joinLink){joinLink.setAttribute('tabindex','0');joinLink.removeAttribute('aria-disabled');}
      updateJoinInteraction(true);
      if(mark)gsap.set(mark,{opacity:0});root.classList.remove('intro-pending');
      phase(reduceMotion()?'reduced':'alive');startAmbientMotion();
      trace(master?'HERO_TIMELINE_COMPLETE':'HERO_STATIC',{reason:reduceMotion()?'prefers-reduced-motion':'master-complete',element:debug?.elementState(tiles[0])});
      hero.dispatchEvent(new CustomEvent('poet:hero-ready',{bubbles:true}));
      startDestinationCue();
    }
    function finish(){
      if(destroyed||resolved)return;
      suppressTileNotes=true;
      if(master)master.totalProgress(1,false).pause();
      completeHero();
    }
    function respectReducedMotion(){
      if(reduceMotion())handoff?.finish();
      if(reduceMotion()){finish();stopAmbientMotion();resetDestination();showStaticCue();phase('reduced');updateJoinInteraction(true);}
      else if(resolved){phase('alive');startAmbientMotion();}
      syncMotion();
    }
    function stopHeroAnimation(){
      if(destroyed)return;destroyed=true;
      suppressTileNotes=true;tileEvent('assembly-cancel');
      handoff?.cancel();
      events.abort();observer?.disconnect();master?.kill();
      resetDestination();introScene?.setAttribute('aria-hidden','true');
      stopAmbientMotion();
      for(const[el,values]of snapshots){
        for(const[attr,value]of[['style',values.style],['transform',values.transform],['data-svg-origin',values.svgOrigin]])value===null?el.removeAttribute(attr):el.setAttribute(attr,value);
        if(el._gsap)el._gsap.uncache=1;
      }
      if(slot)slot.style.visibility=slotVisibility;
      root.classList.remove('intro-pending');hero.classList.remove('world-building');phase('stopped');
    }
    // Edge contact alone counts as isIntersecting at a deep-link scroll position.
    // Require visible area so the entrance cannot run just outside the viewport.
    const observer='IntersectionObserver'in window?new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting&&entry.intersectionRatio>=.01;syncMotion();},{threshold:.01}):null;
    async function initialize(){
      if(slot)slot.style.visibility='visible';
      phase('loading');
      trace('HERO_INITIALIZED',{tileCount:tiles.length,worldObjectCount:groups.filter(el=>!el.matches('.tile,.board')).length});
      // Let the real hero assets and initial SVG paint settle before timed choreography.
      // This keeps first-image decoding/layout outside the short assembly timeline.
      const urls=[...new Set([...select('image').map(el=>el.getAttribute('href')),...select('img').map(el=>el.currentSrc||el.src)])];
      await Promise.allSettled(urls.map(src=>{const image=new Image();image.src=src;return image.decode();}));
      await document.fonts.load('24px "Product Sans"').catch(()=>{});
      // Use the existing real italic face before revealing the two-line greeting.
      await document.fonts.load('italic 24px "Product Sans"').catch(()=>{});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      if(destroyed||resolved)return;
      // A deep link/restored scroll may skip the greeting, never construction.
      // Offscreen/hidden pages keep this one prepared timeline paused until visible.
      const skipIntro=!introScene||(!forceIntro&&(location.hash||scrollY>4));
      prepareHeroAnimation();phase('ready');
      master=gsap.timeline({paused:true,id:'poet-hero-master',onComplete:completeHero});
      if(reduceMotion()){
        hero.classList.remove('world-building');
        const intro=skipIntro?null:createIntro(true);INTRO=intro?.duration()||0;
        if(intro)master.call(()=>phase('intro'),null,0).add(intro,0);else return completeHero();
        trace('HERO_TIMELINE_CREATED',{duration:master.duration(),introDuration:INTRO,reducedVersion:true});
        syncMotion();return;
      }
      const intro=skipIntro?null:createIntro();INTRO=intro?.labels['world-open']??intro?.duration()??0;
      if(intro){
        master.addLabel('intro',0).call(()=>phase('intro'),null,0).add(intro,0);
      }else{
        if(mark)gsap.set(mark,{opacity:0});notifyIntroComplete();
      }
      master.addLabel('tiles',INTRO);
      animateTileAssembly();animateWorldReveal();animateMascotEntry();
      for(const[name,kind]of[['tiles','tile'],['board','board'],['playground','equipment'],['buildings','building'],['environment','environment'],['sign','sign'],['details','detail'],['mascots','character']]){
        const times=entries.filter(entry=>entry.kind===kind).map(entry=>entry.start);
        if(!times.length)continue;
        const time=Math.min(...times);
        master.addLabel(name,time).call(()=>phase(name),null,time);
      }
      master.addLabel('alive',master.duration());
      trace('HERO_TIMELINE_CREATED',{duration:master.duration(),introDuration:INTRO,element:debug?.elementState(tiles[0])});
      trace('TILE_TRANSFORM_BEFORE',{element:debug?.elementState(tiles[0])});
      syncMotion();
    }
    hero.addEventListener('poet:mascot-drag-start',resetFlowerHovers,{signal:events.signal});
    select('.flower-character').forEach(character=>{
      const node=character.querySelector('.flower-hover');
      character.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')reactFlower(node,true);},{signal:events.signal});
      character.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')reactFlower(node,false);},{signal:events.signal});
    });
    joinLink?.addEventListener('pointerenter',event=>{
      if(!resolved||!finePointer.matches||event.pointerType==='touch')return;
      joinHovered=true;updateJoinInteraction();
    },{signal:events.signal});
    joinLink?.addEventListener('pointerleave',()=>{joinHovered=false;updateJoinInteraction();},{signal:events.signal});
    joinLink?.addEventListener('focusin',()=>{joinFocused=true;updateJoinInteraction(true);},{signal:events.signal});
    joinLink?.addEventListener('focusout',()=>{joinFocused=false;updateJoinInteraction();},{signal:events.signal});
    function transitionToActivities({keyboard=false,source='click',href=''}={}){
      if(handoff)return;
      const target=document.getElementById('hoat-dong')||document.getElementById('noi-dung');if(!target&&!href)return;
      const navigate=()=>{
        // Another page: motion/page-wave.mjs there finishes the same wave.
        if(href){try{sessionStorage.setItem('poet-wave-in','1');}catch{/* Private mode: plain cut. */}location.assign(href);return;}
        history.replaceState(null,'','#hoat-dong');
        target.scrollIntoView({behavior:'instant',block:'start'});
        if(source!=='scroll'){
          const heading=target.querySelector('h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
        }
      };
      if(reduceMotion()||keyboard){navigate();return;}
      const stage=q('.stage'),stageStyle=stage?.getAttribute('style');
      const overlay=document.createElement('div');overlay.className='hero-join-wave';overlay.setAttribute('aria-hidden','true');
      // A single flat SVG with two curved edges: no blur, raster capture, or
      // distortion of the illustration. Equal path commands allow fluid morphs.
      const waveA='M0 170 C240 30 480 270 720 145 C960 20 1200 230 1440 110 L1440 1110 C1200 970 960 1190 720 1065 C480 940 240 1150 0 1010 Z';
      const waveB='M0 110 C240 250 480 10 720 135 C960 260 1200 50 1440 170 L1440 1010 C1200 1150 960 930 720 1055 C480 1180 240 970 0 1110 Z';
      overlay.innerHTML=`<svg viewBox="0 0 1440 1200" preserveAspectRatio="none" focusable="false"><path d="${waveA}"/></svg>`;
      document.body.append(overlay);const wave=overlay.querySelector('path');
      const block=event=>event.preventDefault();overlay.addEventListener('wheel',block,{passive:false});overlay.addEventListener('touchmove',block,{passive:false});
      let finished=false,navigated=false;
      const announce=phase=>document.dispatchEvent(new CustomEvent('poet:hero-handoff',{detail:{phase,source}}));
      const restore=()=>{
        if(finished)return;finished=true;
        handoff?.timeline?.kill();overlay.remove();
        if(stage){stageStyle===null?stage.removeAttribute('style'):stage.setAttribute('style',stageStyle);if(stage._gsap)stage._gsap.uncache=1;}
        document.removeEventListener('keydown',escape);handoff=null;delete root.dataset.heroTransition;announce('complete');syncMotion();
      };
      const land=()=>{if(navigated)return;navigated=true;navigate();if(href){handoff?.timeline?.pause();return;}root.dataset.heroTransition='reveal';};
      const finish=()=>{land();restore();};
      const escape=event=>{if(event.key==='Escape'){event.preventDefault();finish();}};
      handoff={timeline:null,finish,cancel:restore};root.dataset.heroTransition='anticipation';announce('start');syncMotion();
      document.addEventListener('keydown',escape);
      const tl=gsap.timeline({id:'poet-join-wave',onComplete:restore});handoff.timeline=tl;
      gsap.set(overlay,{y:innerHeight,force3D:true});
      if(stage){
        gsap.set(stage,{transformOrigin:'50% 72%',force3D:true});
        tl.to(stage,{y:22,scaleX:1.015,scaleY:.975,duration:.24,ease:'sine.inOut'},0)
          .to(stage,{y:-innerHeight*1.12,scaleX:.99,scaleY:1.025,duration:.72,ease:'power3.inOut'},.24);
      }
      tl.call(()=>{root.dataset.heroTransition='launch';},null,.24)
        .to(overlay,{y:-innerHeight*.3,duration:.68,ease:'power3.inOut'},.2)
        .to(wave,{attr:{d:waveB},duration:.68,ease:'sine.inOut'},.2)
        .call(land,null,.88)
        .to(overlay,{y:-innerHeight*1.9,duration:.65,ease:'power3.inOut'},.9)
        .to(wave,{attr:{d:waveA},duration:.65,ease:'sine.inOut'},.9);
      // fb-46: the whole hand-off (authored at ~1.55s) plays in 0.4s; timeScale keeps the beats in proportion.
      // Stall → message wall: 0.5s in total, ~0.3s here until the wave covers the screen, ~0.2s reveal on the next page.
      tl.timeScale(href?.88/.3:tl.duration()/.4);
    }
    const wallLink=q('.stall-link');
    wallLink?.addEventListener('click',event=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button)return;
      event.preventDefault();if(!resolved)return;
      transitionToActivities({keyboard:event.detail===0,href:wallLink.href.baseVal||wallLink.getAttribute('href')});
    },{signal:events.signal});
    joinLink?.addEventListener('click',event=>{
      if(!resolved){event.preventDefault();return;}
      if(root.classList.contains('hero-only')){event.preventDefault();return;}
      hero.dispatchEvent(new CustomEvent('poet:have-fun'));
      event.preventDefault();transitionToActivities({keyboard:event.detail===0});
    },{signal:events.signal});
    // Intercept only a downward wheel gesture while the completed Hero still
    // occupies most of the viewport. Other sections keep their native scrolling.
    addEventListener('wheel',event=>{
      if(event.defaultPrevented||event.ctrlKey||event.metaKey||!event.cancelable||Math.abs(event.deltaX)>=Math.abs(event.deltaY))return;
      // Also cover the anticipation beat, before the curtain enters the viewport.
      if(handoff){event.preventDefault();return;}
      if(event.deltaY<=0||!resolved||destroyed||reduceMotion()||root.classList.contains('hero-only')||!document.getElementById('hoat-dong'))return;
      if(document.querySelector('.site-dialog[open],.site-nav.is-open'))return;
      if(event.target instanceof Element&&event.target.closest('input,textarea,select,dialog,.hero-runtime-debug'))return;
      const bounds=hero.getBoundingClientRect();
      if(bounds.top>8||bounds.bottom<innerHeight*.65)return;
      event.preventDefault();transitionToActivities({source:'scroll'});
    },{passive:false,signal:events.signal});
    hero.addEventListener('pointermove',event=>{if(!driftX||event.pointerType==='touch'||hero.dataset.mascotDragging)return;driftX((event.clientX/innerWidth-.5)*10);driftY((event.clientY/innerHeight-.5)*7);pointerSettle?.restart(true);},{passive:true,signal:events.signal});
    hero.addEventListener('pointerleave',()=>{pointerSettle?.pause();driftX?.(0);driftY?.(0);},{signal:events.signal});
    finePointer.addEventListener('change',()=>{if(!finePointer.matches){joinHovered=false;resetFlowerHovers();}updateJoinInteraction(true);syncMotion();},{signal:events.signal});
    document.addEventListener('visibilitychange',syncMotion,{signal:events.signal});
    reduced.addEventListener('change',respectReducedMotion,{signal:events.signal});
    addEventListener('pagehide',event=>{if(event.persisted){pageSuspended=true;syncMotion();}else stopHeroAnimation();},{signal:events.signal});
    addEventListener('pageshow',event=>{if(event.persisted)handoff?.cancel();pageSuspended=false;syncMotion();},{signal:events.signal});
    document.addEventListener('freeze',()=>{pageSuspended=true;syncMotion();},{signal:events.signal});
    document.addEventListener('resume',()=>{pageSuspended=false;syncMotion();},{signal:events.signal});
    // Input never fast-forwards assembly. Only the completed Hero has a wheel handoff.
    if(!observer){const rect=hero.getBoundingClientRect();onScreen=rect.bottom>0&&rect.top<innerHeight;addEventListener('scroll',()=>{const rect=hero.getBoundingClientRect();onScreen=rect.bottom>0&&rect.top<innerHeight;syncMotion();},{passive:true,signal:events.signal});}
    initialize().catch(error=>{stopHeroAnimation();root.dataset.worldState='fallback';console.error('POET hero animation:',error);});observer?.observe(hero);
    return{
      engine:'gsap',version:gsap.version,entries,phaseEvents,introFinished,finish,routeStops,destroy:stopHeroAnimation,
      get masterTimeline(){return master;},get ambientTimelines(){return ambientTimelines;},get pathTimeline(){return pathLoop;},get state(){return root.dataset.worldState;},
      get cueTimeline(){return cueTimeline;},
      get activeTileOrder(){return activeTile?.order??null;},get tileGlowCount(){return glowTweens.size;},
      replay(){debug?.cancelTest();stopHeroAnimation();root.classList.add('intro-pending');return window.POETWorld=createHeroController(true);},
      seek(time){
        if(!master||destroyed)return;
        master.pause().totalTime(0,true);stopAmbientMotion();resolved=false;introNotified=false;
        prepareHeroAnimation();master.invalidate().totalTime(time,false);
        if(mark&&time>=INTRO)gsap.set(mark,{opacity:0});
        if(resolved)ambientTimelines.forEach(t=>t.pause());
      },
    };
  }
  window.POETWorld=createHeroController();

  // Explicit development mode only; normal localhost previews have no debug UI.
  if(localPreview&&query.get('heroDebug')==='1'){
    const replay=document.createElement('button');
    replay.type='button';replay.className='hero-replay-debug';replay.textContent='Replay Hero';
    replay.addEventListener('click',()=>{
      window.scrollTo({top:0,left:0,behavior:'instant'});
      debug?.enableMotionPreview();
      window.POETWorld.replay();
    });
    document.body.append(replay);
  }
})();
