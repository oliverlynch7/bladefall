/* Source-matched, local onboarding narration. No timers advance gameplay or tutorials. */
(function(root){'use strict';
 function createPlayer(env){
  let current=null,generation=0,loading=null;
  const settings=()=>env.options(),allowed=()=>{const o=settings();return o.enabled!==false&&!o.muted&&Number(o.volume)>0;};
  const volume=()=>Math.max(0,Math.min(1,Number(settings().volume)||0));
  function report(status,c=current){if(c){c.status=status;env.onState?.({status,owner:c.owner,key:c.line.key});}}
  function stop(){generation++;if(!current)return;const c=current;current=null;if(c.audio){const a=c.audio;a.onplaying=a.onended=a.onerror=a.onpause=null;try{a.pause();a.removeAttribute('src');a.load();}catch{}}report('stopped',c);}
  function valid(c){return current===c&&c.generation===generation&&c.valid()&&allowed();}
  async function play(line,owner,isValid){stop();const c=current={line,owner,valid:isValid,generation, audio:null,status:'loading'};
   if(!isValid()||!allowed()){report('off',c);return false;}if(settings().suspended){c.waiting=true;report('waiting',c);return false;}report('loading');
   try{
    if(!loading)loading=env.manifest().catch(e=>{loading=null;throw e;});const book=await loading;
    if(!valid(c))return false;if(settings().suspended){c.waiting=true;report('waiting');return false;}const take=book?.lines?.[line.key];
    if(!take||take.text_sha256!==line.text_sha256||take.text!==line.text||!/^[-a-z0-9.]+\.mp3$/i.test(take.file)){report('missing');return false;}
    const a=c.audio=env.audio(take.file);a.volume=volume();
    a.onplaying=()=>{if(settings().suspended){tick();return;}if(valid(c))report('playing');else{a.pause();}};
    a.onended=()=>{if(current===c)report('ended');};a.onerror=()=>{if(current===c)report('error');};
    await a.play();if(!valid(c)){a.pause();return false;}return true;
   }catch(_){if(current===c)report('error');return false;}
  }
  function tick(){if(!current)return;if(!current.valid()||!allowed()){stop();return;}const c=current;if(settings().suspended){if(!c.waiting)play(c.line,c.owner,c.valid);return;}if(c.waiting){play(c.line,c.owner,c.valid);return;}if(c.audio&&c.audio.volume!==volume())c.audio.volume=volume();}
  return {play,stop,tick,get speaking(){return current?.status==='playing';},get state(){return current?{key:current.line.key,status:current.status}:null;}};
 }
 if(typeof module!=='undefined')module.exports={createPlayer};
 if(!root.document)return;
 let options=()=>({enabled:false,volume:0}),view=null;const seen=new WeakMap();
 const player=createPlayer({options:()=>({...options(),muted:!!options().muted||document.hidden}),
  manifest:()=>fetch('/3d/narration/manifest.json?v=2287',{signal:root.AbortSignal?.timeout?.(8000)}).then(r=>{if(!r.ok)throw Error('manifest');return r.json();}),
  audio:file=>new Audio('/3d/narration/'+file),
  onState:event=>{if(!view||view.owner!==event.owner||view.line.key!==event.key)return;view.status.textContent={waiting:'Preparing narration…',loading:'Loading voice…',playing:'Narrator speaking',ended:'',stopped:'',off:'Narration off',missing:'Text only · recording needs an update',error:'Text only · Replay to try again'}[event.status]||'';}
 });
 function resolve(id){return root.BFOnboardingScript?.resolve(id,root.__BF3?.narrationContext?.()||{});}
 function hide(owner){if(!owner||view?.owner===owner){player.stop();view=null;}}
 function show(container,line,owner,isValid,restart=false){
  if(!container||!line||!owner)return;
  if(view?.owner===owner&&view.container===container&&view.line.key===line.key&&view.line.text_sha256===line.text_sha256)return;
  const originalValid=isValid;isValid=()=>originalValid()&&resolve(line.key.replace(/\.(base|keyboard|adapted)$/,''))?.text_sha256===line.text_sha256;
  player.stop();
  const reuse=view?.owner===owner&&view.container===container&&container.querySelector('.narration-controls');
  if(reuse){view.line=line;view.valid=isValid;view.status.textContent='';}
  else{
   container.querySelector('.narration-controls')?.remove();
   const controls=document.createElement('div');controls.className='narration-controls';
   const replay=document.createElement('button');replay.type='button';replay.className='narration-replay';replay.textContent='Replay voice';replay.setAttribute('aria-label','Replay this narration');
   const mute=document.createElement('button');mute.type='button';mute.className='narration-toggle';
   const status=document.createElement('small');status.className='narration-status';status.setAttribute('aria-live','polite');
   const state=view={container,line,owner,valid:isValid,status,mute};
   const update=()=>{mute.textContent=options().enabled===false?'Narrator off':'Mute narrator';mute.setAttribute('aria-pressed',String(options().enabled===false));};update();
   replay.onclick=()=>{root.__BF3?.initAudio?.();if(view===state&&state.valid())player.play(state.line,state.owner,state.valid);};
   mute.onclick=()=>{const enabled=options().enabled===false;root.__BF3?.setNarrationEnabled?.(enabled);update();player.tick();if(enabled&&view===state&&state.valid())player.play(state.line,state.owner,state.valid);};
   controls.append(replay,mute,status);container.append(controls);
  }
  let heard=seen.get(owner);if(!heard){heard=new Set();seen.set(owner,heard);}const key=line.key+line.text_sha256;
  if(restart||!heard.has(key)){heard.add(key);player.play(line,owner,isValid);}
 }

 root.BFNarration={backHint:()=>root.__BF3?.narrationContext?.().controller?(root.BFController?.label(1)||'Back'):'Q',configure(get){options=get;},resolve,show,hide,stop:()=>hide(),tick(){player.tick();if(view){const off=options().enabled===false;const label=off?'Narrator off':'Mute narrator';if(view.mute.textContent!==label)view.mute.textContent=label;if(view.mute.getAttribute('aria-pressed')!==String(off))view.mute.setAttribute('aria-pressed',String(off));}},get speaking(){return player.speaking;},get state(){return player.state;},createPlayer};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)player.stop();});root.addEventListener('pagehide',()=>hide());
})(typeof window!=='undefined'?window:globalThis);
