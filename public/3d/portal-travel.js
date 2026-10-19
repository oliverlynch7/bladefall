/* Presentation only. Scene builders keep their synchronous save/network transactions. */
(function(root){'use strict';
let cfg={},state=null,node=null,timer=null,committing=false,serial=0,cancelUntil=0;
const now=()=>performance.now(),clamp=n=>Math.max(0,Math.min(1,n));
function reduced(){return !!cfg.reduced?.()||!!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
function stamp(g){return g?[g.stageIndex,g.zone,g.area,!!g.hub,!!g.riftHall,!!g.sparringRoom,g.floor,g.runSeed,!!g.bonusActive,g.bonusCourse?.seed,g.sprintAttempt,g.brIdx,g.arenaMap,g.trial,g.trialSession].join('|'):'';}
function profile(g){
 const zones=[['Briar Town','#8ee0a1'],['Hollow Pass','#efbe74'],['Ruined Keep','#91baff'],['Frostfell','#9ae5ff'],['Emberdeep','#ffac72'],['Storm Coast','#88def1'],['Sunspire','#ffe7a2'],['Castle Duskmore','#c6a3ff']];
 if(g?.hub)return g.riftHall?{name:'Rift Hall',color:'#bc9aff'}:g.sparringRoom?{name:'Sparring Room',color:'#edbe76'}:{name:'The Waystation',color:'#8ee3e0'};
 if(typeof g?.trial==='string'&&g.trial)return {name:(g.trial[0].toUpperCase()+g.trial.slice(1))+' Trial',color:({pyromancer:'#ffad70',paladin:'#ffe6a0',reaper:'#c39aff',necromancer:'#9be6b2',ninja:'#f3949e',berserker:'#efac77',pirate:'#88dfd4',chronomancer:'#9aefe2'})[g.trial]||'#a6d8ff'};
 if(g?.sprintFun||g?.bonusActive)return {name:'Treasure Sprint',color:'#ffdf80'};
 if(g?.escape||g?.delve)return {name:'Endless Dungeon'+(g.floor?' · Floor '+g.floor:''),color:'#a8d5e8'};
 if(g?.endless)return {name:'Abyssal Descent'+(g.floor?' · Floor '+g.floor:''),color:'#c6a2ff'};
 if(g?.bossRush)return {name:'The Gauntlet',color:'#f4b184'};
 if(g?.arena)return {name:'The Arena',color:'#efa099'};
 const z=zones[g?.zone]||['Beyond the Rift','#a7dfff'];return {name:g?.areaName||z[0],color:z[1]};
}
function destination(g){
 if(g?.escape||g?.delve||g?.endless)return profile({...g,floor:(g.floor||1)+1});
 if(g?.trial||g?.side||g?.area<0)return profile({hub:true});
 const z=cfg.zones?.()?.[g?.zone];return {...profile(g),name:z?.areas?.[(g?.area||0)+1]?.name||z?.boss?.name||profile(g).name};
}
function element(){
 if(node)return node;node=document.createElement('div');node.id='portal-transit';node.hidden=true;node.setAttribute('aria-hidden','true');
 node.innerHTML='<div class="portal-transit-vortex"><i></i><i></i><i></i><b></b><em></em></div><div class="portal-transit-label"><small>PASSING THROUGH THE RIFT</small><strong></strong></div>';document.body.append(node);return node;
}
function paint(){
 const el=element();el.hidden=!state;document.body.classList.toggle('portal-travelling',!!state);document.body.classList.toggle('portal-leaving',state?.phase==='out');document.body.classList.toggle('portal-loading',state?.phase==='hold');
 if(!state)return;el.dataset.phase=state.phase;el.dataset.reduced=String(reduced());el.style.setProperty('--portal-accent',state.profile.color);el.querySelector('strong').textContent=state.profile.name;
}
function clear(){if(timer!=null)clearTimeout(timer);timer=null;state=null;paint();}
function cue(s){if(s.sounded)return;s.sounded=true;try{cfg.cue?.();}catch(_){}}
function depart(g,options={}){
 if(!g?.p||g.p.dead||g.p.downed||state)return null;
 const s={id:++serial,world:g,stamp:stamp(g),phase:'out',at:now(),profile:{...profile(g),...(options.name?{name:options.name}:{}),...(options.color?{color:options.color}:{})},sounded:!!options.cued};state=s;paint();if(!options.cued)cue(s);return s;
}
function run(g,fn,options={}){
 if(committing)return fn();if(state||now()<cancelUntil)return false;
 if(!g?.p||g.p.dead||g.p.downed)return fn();
 const originMode=cfg.mode?.(),s=depart(g,options);if(!s)return false;
 timer=setTimeout(()=>{timer=null;if(state!==s)return;
  if(cfg.world?.()!==g||stamp(g)!==s.stamp||g.p.dead||g.p.downed||cfg.mode?.()!==originMode||options.valid&& !options.valid()){clear();return;}
  committing=true;try{fn();}finally{committing=false;if(state===s)clear();}
 },reduced()?70:220);return true;
}
function cover(g){
 const sounded=state?.sounded||false;if(timer!=null)clearTimeout(timer);timer=null;
 state={id:++serial,world:g,stamp:stamp(g),phase:'hold',at:now(),profile:profile(g),sounded};paint();
 // Automatic network/load arrivals stay silent; the local interaction owns its one cue.
}
function reveal(g){
 if(!state||state.world!==g||state.stamp!==stamp(g))return true;
 if(state.phase==='hold'){state.phase='in';state.at=now();paint();return false;}
 if(state.phase!=='in')return false;
 if(now()-state.at<(reduced()?100:280))return false;clear();return true;
}
function pose(p){
 if(!state||state.world?.p!==p||reduced())return null;
 const t=clamp((now()-state.at)/(state.phase==='out'?190:280));
 if(state.phase==='out'){const k=t*t;return {scale:1-k*.9,lift:18*k,turn:k*.45};}
 if(state.phase==='in'){const k=1-Math.pow(1-t,3);return {scale:.12+.88*k,lift:14*(1-k),turn:-.3*(1-k)};}
 return null;
}
function cancel(){const out=state?.phase==='out';clear();if(out){cancelUntil=now()+400;cfg.cancelOut?.();}}
function installButtons(){for(const type of ['pointerdown','mousedown'])window.addEventListener(type,e=>{if(state&&!e.target.closest?.('#loadRetry')){e.preventDefault();e.stopImmediatePropagation();}},true);document.addEventListener('click',e=>{
 if(state&&!committing&&!e.target.closest?.('#loadRetry')){e.preventDefault();e.stopImmediatePropagation();return;}
 const b=e.target.closest?.('#leGo,#descBtn,#brNormal,#brBrutal,#prresume,#hallTrial,#riftHallTravel,#hubBtn,#qmenu,#brHub,#sprintHub,#prisonHome,[data-replay-area],[data-tr]');if(!b||b.disabled||b.dataset.portalCommit==='1'||!cfg.world?.()?.p)return;
 e.preventDefault();e.stopImmediatePropagation();if(state)return;
 cfg.release?.();run(cfg.world(),()=>{b.dataset.portalCommit='1';try{b.click();}finally{delete b.dataset.portalCommit;}},{valid:()=>b.isConnected,name:b.closest('.card')?.querySelector('.ovh')?.textContent?.trim()});
 },true);
 window.addEventListener('keydown',e=>{if(!state||['F11','F5'].includes(e.code)||e.ctrlKey||e.metaKey)return;if(state.phase==='out'&&['Escape','KeyQ'].includes(e.code))cancel();e.preventDefault();e.stopImmediatePropagation();},true);
 window.addEventListener('blur',()=>{if(state?.phase==='out')cancel();});
}
const api={configure:c=>{cfg=c||{};},profile,destination,stamp,depart,run,cover,reveal,pose,cancel,reset:clear,get cooling(){return now()<cancelUntil;},get blocking(){return !!state;},get phase(){return state?.phase||null;},get state(){return state;}};
root.BFPortalTravel=api;if(typeof module!=='undefined')module.exports=api;
if(typeof document!=='undefined')installButtons();
})(typeof window!=='undefined'?window:globalThis);
