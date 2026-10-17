/* Beginner practice and current Adventure HUD guidance. The map is shared by all modes. */
(function(){'use strict';
let guide=null,panel=null,mapCanvas=null,placedAt=0;
const coreActions=['move','jump','attack','dodge'];
const lessons=[
 {id:'welcome',title:'A safe place to learn',body:'Practice moving, jumping, attacking and dodging. Enemies wait until you finish these four controls.',safe:true},
 {id:'move',title:'Move around',body:'Try moving in different directions. You can change your camera view later in Settings.',action:'move',safe:true},
 {id:'jump',title:'Hold to jump higher',body:'Tap for a short hop. Hold the jump control briefly for more height.',action:'jump',safe:true},
 {id:'attack',title:'Try a basic attack',body:'Red health bars mark enemies. Face one and tap to attack. Hold and release chargeable weapons for a stronger attack.',action:'attack',safe:true},
 {id:'dodge',title:'Dodge or dash',body:'Dodge through an attack to avoid the hit. The same control lets you dash in mid-air.',action:'dodge',safe:true},
 {id:'vitals',title:'Watch health and mana',body:'HP is your health. Mana fuels skills. Enemies are active now: keep moving while you read these optional tips.',target:['#hud .hudvitals']},
 {id:'objective',title:'Your next task',body:'Defeat 6 enemies. After the first 3, your class ranks up. A purple banner announces your first skill choice; combat waits while you choose. Try it on the rest, then find the exit portal.',target:['#questbox']},
 {id:'progress',title:'Two kinds of progress',body:'Gold: your player leveled up. Keep fighting; spend stat points in Bag later. Purple: your class ranked up. A short celebration leads into a skill or passive choice.',target:['#hudprogress']},
 {id:'skills',title:'Skills, costs and cooldowns',body:'Unlocked skills show their mana cost at the top left and a countdown while recharging. Padlocks show the rank you need.',target:['#bSk0']},
 {id:'bag',title:'Pickups and your bag',body:'Gear goes straight into free bag slots. The pickup card compares it with equipped gear. Bag full + Auto-sell OFF leaves gear behind.',target:['#inventoryDock']},
 {id:'autosell',title:'Choose what happens to loot',body:'Auto-sell OFF keeps new gear. Turn it ON to sell new equipment pickups for gold—even with free slots. Check this label before collecting.',target:['#hudAutoSell'],anchor:'#inventoryDock'},
 {id:'journal',title:'Keep your clues close',body:'New clues appear on paper notices until dismissed. Open Journal to read them again, search clues or check side quests.',target:['#hudJournal'],anchor:'#inventoryDock'},
 {id:'navigation',title:'Follow your map',body:'Gold marks the next objective or exit. Blue marks friends; cyan marks pings; red marks enemies. The map rotates as you turn.',target:['#localMap']},
 {id:'menu',title:'Ready to explore',body:'Close these tips, then open the menu for Settings or Help. Esc pauses time in solo play. In co-op, you stay visible and protected while your friends keep playing.',target:['#pausebtn','#eschint']}
];
const skillLesson={id:'skill-use',title:'Try your new skill',body:'Face an enemy within range, then use Skill 1. It spends mana and needs time to recharge.',action:'skill1',target:['#bSk0']};
const pauseHint=()=>guide?.hint?.('pause')||'Esc';
function suspend(){if(panel)panel.hidden=true;BFTutorialCallout.hide();}
function stop(){if(guide)guide.g._tutorialSafe=false;guide=null;panel?.remove();panel=null;BFTutorialCallout.clear();}
function start(g){if(!g)return;stop();g._guidedUsed=true;g._tutorialSafe=true;document.exitPointerLock?.();guide={g,i:0,steps:lessons,hold:0,run:0};}
function skill(g){
 if(!g)return;const resume=guide?.g===g?guide:null;
 if(resume?.steps[resume.i]?.id==='skill-use')return;
 if(!resume)stop();
 guide={g,i:0,steps:[skillLesson],hold:0,run:0,resume};
 g._tutorialSafe=false;
}
function next(){
 if(!guide)return;guide.i++;guide.hold=0;guide.run=0;guide.airborne=false;guide.qualified=false;guide.tapped=null;guide.rendered=null;
 if(guide.i>=guide.steps.length){
  if(guide.resume){guide=guide.resume;guide.rendered=null;}
  else{stop();return;}
 }
 guide.g._tutorialSafe=!!guide.steps[guide.i].safe;
 placedAt=0;
}
function position(force=false){
 if(!guide||!panel||panel.hidden)return;
 if(!force&&performance.now()-placedAt<120)return;placedAt=performance.now();
 BFTutorialCallout.place(panel,guide.steps[guide.i].target,guide.steps[guide.i].anchor);
}
function movementHints(hint){return [...new Set(['up','left','down','right'].map(hint))];}
function draw(hint){
 guide.hint=hint;
 const step=guide.steps[guide.i],core=coreActions.includes(step.action);
 const actions=['up','left','down','right','jump','attack','dodge','skill1','bag','journal','interact','pause'];
 const sig=step.id+actions.map(hint).join('|');
 if(guide.rendered===sig)return;guide.rendered=sig;
 if(!panel){
  panel=document.createElement('section');panel.id='guidedLesson';panel.setAttribute('aria-label','Adventure tutorial');
  document.body.append(panel);
 }
 panel.dataset.lesson=step.id;panel.innerHTML='';
 const copy=document.createElement('div');copy.setAttribute('aria-live','polite');copy.setAttribute('aria-atomic','true');
 const meta=document.createElement('div');meta.className='lesson-meta';
 const stage=document.createElement('span');stage.textContent=step.safe?'Safe practice':step.id==='skill-use'?'New skill':'HUD guide';
 const count=document.createElement('span');count.className='lesson-count';
 count.textContent=guide.steps===lessons?(step.safe?guide.i+1+' / 5':guide.i-4+' / '+(lessons.length-5)):'Try it';
 meta.append(stage,count);
 const h=document.createElement('h2');h.textContent=step.title;
 const p=document.createElement('p');p.textContent=step.body;copy.append(meta,h,p);
 let keys=[],label='';
 if(core){keys=step.action==='move'?movementHints(hint):[hint(step.action)];label=step.action==='jump'?'Hold to continue':'Try it to continue';}
 else if(['skills','skill-use'].includes(step.id)){keys=[hint('skill1')];label=step.id==='skills'?'Skill 1 · unlocks at class rank 2':'Skill 1';}
 else if(step.id==='bag'){keys=[hint('bag')];label='Open bag · Loot reopens the latest pickup';}
 else if(step.id==='journal'){keys=[hint('journal')];label='Open journal';}
 else if(step.id==='menu'){keys=[pauseHint()];label='Open menu after closing tips';}
 if(keys.length){const k=document.createElement('div');k.className='lesson-control';for(const key of keys){const el=document.createElement('kbd');el.textContent=key; k.append(el);}const l=document.createElement('span');l.className='lesson-controls-label';l.textContent=label;k.append(l);copy.append(k);}
 panel.append(copy);
 const buttons=document.createElement('div');buttons.className='lesson-actions';
 if(!core){const b=document.createElement('button');b.type='button';b.textContent=(guide.i===guide.steps.length-1&&!guide.resume?'Finish':'Continue')+' · '+hint('interact');b.onclick=next;buttons.append(b);}
 const skip=document.createElement('button');skip.type='button';skip.className='skip';skip.textContent=(step.safe?'Skip lessons':'Close tips')+' · '+pauseHint();skip.onclick=stop;buttons.append(skip);panel.append(buttons);
 const status=document.createElement('p');status.className='lesson-status';status.textContent=step.safe?'Enemies wait during control practice.':'Optional tip · movement and combat stay active.';panel.append(status);
 position(true);
}
function canReceive(){return guide&&panel&&!panel.hidden&&window.__BF3?.mode==='play';}
window.addEventListener('keydown',e=>{
 if(!canReceive()||e.repeat||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;
 const action=window.__BF3?.keyAction(window.BFPartyNavigation?.keyCode(e)||e.code);
 if(e.code==='Escape'||action==='interact'&&!coreActions.includes(guide.steps[guide.i].action)){
  e.preventDefault();e.stopImmediatePropagation();e.code==='Escape'?stop():next();
 }
},true);
// Short mouse clicks can fall between simulation frames; remember the performed input.
window.addEventListener('pointerdown',e=>{
 if(!canReceive()||e.pointerType!=='mouse'||e.target.closest?.('button,input,select,#guidedLesson,#inventoryDock,#equipmentFeed,#journalNotice,#hud,#questbox'))return;
 const b=window.__BF3,a=b?.keyAction('Mouse'+e.button);
 if(a==='interact'&&!coreActions.includes(guide.steps[guide.i].action)){e.preventDefault();e.stopImmediatePropagation();next();return;}
 if(!['attack','dodge','jump'].includes(a))return;
 guide.tapped=a;b.input[a]=true;if(a!=='attack')b.input[a+'Edge']=true;e.preventDefault();
},true);
window.addEventListener('resize',()=>position(true));
function tick(g,mode,dt,input,api){
 if(!guide&&mode==='play'&&g?._guidedUsed&&g.portal&&!g._guideExitSeen){
  g._guideExitSeen=true;guide={g,i:0,steps:[{id:'exit',title:'The exit is open',body:'Walk into the exit portal to reach the Waystation. Its gold marker appears at the edge of your map when it is far away.',target:['#localMap']}],hold:0,run:0};
 }
 if(!guide)return false;
 if(g!==guide.g||!g.trial){stop();return false;}
 if(mode!=='play'){suspend();return false;}
 if(panel)panel.hidden=false;draw(api.hint);position();
 const step=guide.steps[guide.i],a=step.action,core=coreActions.includes(a);g._tutorialSafe=!!step.safe;
 if(step.safe)g.p.invuln=Math.max(g.p.invuln||0,1);
 if(a==='skill1'){if(g.p.skillCd?.[0]>0)next();return false;}
 if(!core)return step.id==='welcome';
 const pressed=a==='move'?input.up||input.left||input.down||input.right||Math.hypot(input.jx||0,input.jz||0)>.2:input[a]||guide.tapped===a;
 // Finish a jump/fall before waiting for the next input. Never freeze a learner mid-air.
 if(!guide.run&&!pressed)return g.p.onGround!==false;
 if(pressed)guide.run=1;
 if(a==='jump'){
  if(input.jump)guide.hold+=dt;else if(!guide.qualified)guide.hold=0;
  guide.qualified=guide.qualified||guide.hold>=.33;
  guide.airborne=guide.airborne||g.p.onGround===false;
  if(guide.airborne&&g.p.onGround){
   if(guide.qualified)next();
   else{guide.hold=0;guide.run=0;guide.airborne=false;guide.tapped=null;}
  }
 }else{guide.hold+=dt;if(guide.hold>=.3)next();}
 return false;
}
function map(g,mode){
 if(!mapCanvas){mapCanvas=document.createElement('canvas');mapCanvas.id='localMap';mapCanvas.width=320;mapCanvas.height=320;mapCanvas.setAttribute('aria-label','Map: gold objective, blue teammates, cyan pings, red enemies. In the Waystation, 1 marks the first campaign gate, $ the shops, star training, C challenges, R the Rift Hall. The map rotates as you turn.');document.body.append(mapCanvas);}
 mapCanvas.hidden=!g||mode!=='play'||g.bonusActive;if(mapCanvas.hidden)return;
 // Draw the same heading as this frame's world; smoothing here makes navigation lag.
 const nav=window.__BF_MAP_PARTY?.()||{},heading=nav.heading;
 const mapHeading=Number.isFinite(heading)?heading:(g.p.yaw||0);
 const turn=mapHeading+Math.PI,c=mapCanvas.getContext('2d'),p=g.p,scale=145/800,mid=160;
 c.clearRect(0,0,320,320);c.save();c.beginPath();c.arc(mid,mid,156,0,Math.PI*2);c.clip();c.fillStyle='#101923';c.fillRect(0,0,320,320);c.translate(mid,mid);c.rotate(turn);
 const xy=o=>[(o.x-p.x)*scale,(o.z-p.z)*scale];c.fillStyle='#435747';for(const o of g.segments||[]){const [x,y]=xy(o);c.fillRect(x-o.w*scale/2,y-o.d*scale/2,o.w*scale,o.d*scale);}
 for(const o of g.obstacles||[]){c.fillStyle=o.kind==='plat'?'#819488':'#56636a';const [x,y]=xy(o);c.fillRect(x-o.w*scale/2,y-o.d*scale/2,o.w*scale,o.d*scale);}
 c.fillStyle='#26302d';for(const o of g.walls||[]){const [x,y]=xy(o);c.fillRect(x-o.w*scale/2,y-o.d*scale/2,o.w*scale,o.d*scale);}
 const marker=(o,color,r,edge=false)=>{if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.z))return;let [x,y]=xy(o);const d=Math.hypot(x,y);if(d>138){if(!edge)return;x*=138/d;y*=138/d;}c.fillStyle=color;c.strokeStyle='#101923';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.stroke();};
 if(g.hub&&!g.hubArt?.riftHall){
   const landmark=(o,color,glyph)=>{if(!o)return;let [x,y]=xy(o);const d=Math.hypot(x,y);if(d>136){x*=136/d;y*=136/d;}c.fillStyle='#111c24';c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();c.fillStyle=color;c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();c.fillStyle='#182126';c.font='bold 12px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(glyph,x,y+.5);};
   landmark(g.gates?.find(q=>q.zi===0&&!q.side),'#e9c77c','1');
   landmark({x:-610,z:145},'#e7af76','$');
   landmark({x:610,z:145},'#91c5da','★');
   landmark({x:0,z:710},'#ba9bcf','C');
   landmark({x:-610,z:710},'#d3a8f2','R');
   landmark({x:0,z:30},'#a4e8e8','◆');
 }
 for(const e of g.enemies||[])if(!e.dead&&e.hp>0&&!e.dummy)marker(e,'#ff7470',e.boss?7:3);
 for(const q of nav.peers||[])marker(q,'#67baff',6,true);for(const m of g.marks||[])marker(m,'#72fff0',6,true);
 marker(window.BFPartyNavigation?.target?.(g)||g.portal,'#ffe047',7,true);
 c.restore();c.save();c.translate(mid,mid);c.rotate(mapHeading-(p.yaw||0));c.fillStyle='white';c.beginPath();c.moveTo(0,-11);c.lineTo(-7,7);c.lineTo(0,3);c.lineTo(7,7);c.fill();c.restore();
 c.fillStyle='#fff0c7';c.font='bold 18px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('N',mid+Math.sin(turn)*148,mid-Math.cos(turn)*148);
}

const mapStyle=document.createElement('style');mapStyle.textContent='#localMap{width:176px!important;height:176px!important}@media(max-width:650px){#localMap{width:128px!important;height:128px!important}}';document.head.append(mapStyle);
function control(p){if(!canReceive())return false;if(p.edge('pause')){stop();return true;}if(p.edge('interact')&&!coreActions.includes(guide.steps[guide.i].action)){next();return true;}return false;}
window.BFGuidedTutorial={start,skill,tick,map,stop,suspend,control,get blocksPointerLock(){return !!guide?.g?._tutorialSafe;},get state(){return guide?{step:guide.i,id:guide.steps[guide.i]?.id,title:guide.steps[guide.i]?.title}:null}};
})();
