/* Beginner practice and current Adventure HUD guidance. The map is shared by all modes. */
(function(){'use strict';
let guide=null,panel=null,mapCanvas=null,placedAt=0;
const SUCCESS_SECONDS=2;
function complete(){if(!guide||guide.success!=null)return;guide.success=0;paintSuccess();}
function paintSuccess(){const status=panel?.querySelector('.lesson-status');if(status){status.textContent='Well done! Next lesson in a moment…';status.setAttribute('role','status');}panel?.classList?.add('lesson-success');}

const coreActions=['move','jump','attack','dodge'];
const lessons=[
 {id:'welcome',title:'A safe place to learn',body:'Practice moving, jumping, attacking and dodging. Enemies wait until you finish these four controls.',safe:true},
 {id:'menu-keys',title:'Choose, go back, open the menu',body:(g,hint)=>hint('interact')+' selects or continues. Q goes back or closes a menu. '+hint('pause')+' opens the main menu. In conversations, W/S or ↑/↓ moves the yellow selection. Choose Continue now.',safe:true},
 {id:'bag-practice',title:'Your bag is one key away',body:(g,hint)=>'Press '+hint('bag')+' to open your bag. Press it again, or Q, to close it. Try it now, or continue.',practice:'bag',safe:true},
 {id:'pause-practice',title:'Pause when you need a break',body:(g,hint)=>'Press '+hint('pause')+' to open the main menu. Settings → Controls & camera lets you rebind keys or set up an Xbox or PlayStation controller. Choose Resume or press Q to return. Solo time stops; in co-op you stay protected.',practice:'pause',safe:true},
 {id:'move',title:'Move around',body:'Try moving in different directions. You can change your camera view later in Settings.',action:'move',safe:true},
 {id:'jump',title:'Hold to jump higher',body:'Tap for a short hop. Hold the jump control briefly for more height.',action:'jump',safe:true},
 {id:'attack',title:'Try a basic attack',body:'Red health bars mark enemies. Face one and tap to attack. Hold and release chargeable weapons for a stronger attack.',action:'attack',safe:true},
 {id:'dodge',title:'Dodge or dash',body:'Dodge through an attack to avoid the hit. The same control lets you dash in mid-air.',action:'dodge',safe:true},
 {id:'charge',title:'Some weapons can charge',body:(g,hint)=>window.__BF3?.isChargeWeapon(g.p.weapon)?'Your weapon can charge. Hold '+hint('attack')+' until the charge is ready, then release for a stronger attack. Practice if you like, or continue.':'Your current weapon has no charged attack. Other weapons let you hold '+hint('attack')+' and release for a stronger hit. You do not need one to continue.',safe:true},
 {id:'vitals',title:'Watch health and mana',body:'HP is your health. Mana fuels skills. Basic hits restore a little mana. Wait 4 seconds between skills for faster recovery. Keep moving: enemies are active.',target:['#hud .hudvitals']},
 {id:'objective',title:'Your next task',body:'Defeat 6 enemies. After the first 3, your class ranks up. A purple banner announces your first skill choice; combat waits while you choose. Try it on the rest, then find the exit portal.',target:['#questbox']},
 {id:'progress',title:'Two kinds of progress',body:'Gold: your player leveled up. Spend points with the gold + points button beside your character bar, now or later. Purple: your class ranked up. Combat pauses, then you must choose a skill or passive. Each bar has ten progress marks.',target:['#hudprogress']},
 {id:'skills',title:'Skills are your stronger attacks',body:(g,hint)=>'Use '+hint('skill1')+' for Skill 1 after class rank 2. It hits harder or helps you fight in a way basic attacks cannot. Skills spend mana; the countdown shows when you can use one again.',target:['#bSk0']},
 {id:'bag',title:'Chests and your bag',body:'Chests reveal one piece of gear and put it in your bag. Enemies rarely drop chests. Bag full + Auto-sell OFF leaves a chest unopened.',target:['#inventoryDock']},
 {id:'autosell',title:'Choose what happens to loot',body:'Auto-sell OFF keeps new gear. Turn it ON to sell new equipment pickups for gold—even with free slots. Check this label before collecting.',target:['#hudAutoSell'],anchor:'#inventoryDock'},
 {id:'journal',title:'Keep your clues close',body:(g,hint)=>'New clues appear on paper notices. Open Journal ('+hint('journal')+') to reread clues or check quests at any time.',target:['#hudJournal'],anchor:'#inventoryDock'},
 {id:'navigation',title:'Follow your map',body:()=> 'Gold marks your objective or exit. Blue marks friends; cyan marks pings; red marks enemies. '+(window.__BF3?.meta?.camMode==='far'?'Overhead view keeps the map aligned with the camera.':'The map turns with your camera.'),target:['#localMap']},
 {id:'menu',title:'Ready to explore',body:(g,hint)=>'Open the main menu with '+hint('pause')+' for Settings or Help. You can rebind keys and set up a controller in Settings → Controls & camera. Q closes menus; '+hint('interact')+' selects or continues.',target:['#pausebtn']}
];
const skillLesson={id:'skill-use',title:'Try your new skill',body:(g,hint)=>'Skill 1 is a powerful part of combat, not just an extra button. Face an enemy in range and press '+hint('skill1')+' to try it. Watch your mana and its recharge countdown.',action:'skill1',target:['#bSk0']};
const pauseHint=()=>guide?.hint?.('pause')||'Tab';
function practice(action){if(guide?.steps[guide.i]?.practice===action){guide.practiceOpened=true;suspend();}}
function suspend(){if(guide)window.BFNarration?.hide(guide);if(guide){const practice=guide.steps[guide.i].practice;if(practice==='bag'&&document.getElementById('bagItems')||practice==='pause'&&document.getElementById('resBtn'))guide.practiceOpened=true;}if(panel)panel.hidden=true;BFTutorialCallout.hide();}
function stop(){if(guide)window.BFNarration?.hide(guide);if(guide)guide.g._tutorialSafe=false;guide=null;panel?.remove();panel=null;BFTutorialCallout.clear();}
function start(g){if(!g)return;stop();g._guidedUsed=true;g._tutorialSafe=true;document.exitPointerLock?.();guide={g,i:0,steps:lessons,hold:0,run:0};}
function skill(g){
 if(!g)return;if(guide)window.BFNarration?.hide(guide);const resume=guide?.g===g?guide:null;
 if(resume?.steps[resume.i]?.id==='skill-use')return;
 if(!resume)stop();
 guide={g,i:0,steps:[skillLesson],hold:0,run:0,resume};
 g._tutorialSafe=false;
}
function next(){
 if(!guide)return;window.BFNarration?.hide(guide);guide.i++;guide.success=null;panel?.classList?.remove('lesson-success');guide.hold=0;guide.run=0;guide.airborne=false;guide.qualified=false;guide.tapped=null;guide.rendered=null;guide.practiceOpened=false;
 if(guide.i>=guide.steps.length){
  if(guide.resume){guide=guide.resume;guide.rendered=null;}
  else{stop();return;}
 }
 guide.g._tutorialSafe=!!guide.steps[guide.i].safe;
 placedAt=0;
}
function back(){
 if(!canReceive())return false;
 if(guide.i===0)return true;
 window.BFNarration?.hide(guide);guide.i--;guide.success=null;guide.hold=0;guide.run=0;guide.airborne=false;guide.qualified=false;guide.tapped=null;guide.rendered=null;guide.practiceOpened=false;
 panel?.classList?.remove('lesson-success');guide.g._tutorialSafe=!!guide.steps[guide.i].safe;placedAt=0;return true;
}
function position(force=false){
 if(!guide||!panel||panel.hidden)return;
 if(!force&&performance.now()-placedAt<120)return;placedAt=performance.now();
 BFTutorialCallout.place(panel,guide.steps[guide.i].target,guide.steps[guide.i].anchor);
}
function movementHints(hint){return [...new Set(['up','left','down','right'].map(hint))];}
function narrationLine(){const step=guide?.steps[guide.i];if(!step)return null;const id=step.id==='charge'?'charge.'+(window.__BF3?.isChargeWeapon(guide.g.p.weapon)?'available':'unavailable'):step.id;return window.BFNarration?.resolve('tutorial.'+id);}
function narrate(){if(!guide||!panel||panel.hidden)return;const owner=guide,step=guide.steps[guide.i],line=narrationLine();if(line)window.BFNarration?.show(panel,line,owner,()=>guide===owner&&owner.steps[owner.i]===step&&window.__BF3?.G===owner.g&&!owner.g.p.dead&&!owner.g.p.downed&&window.__BF3?.mode==='play');}
function draw(hint){
 guide.hint=hint;
 const step=guide.steps[guide.i],core=coreActions.includes(step.action);
 const actions=['up','left','down','right','jump','attack','dodge','skill1','bag','journal','interact','pause','stats','loot'];
 const sig=step.id+actions.map(hint).join('|');
 if(guide.rendered===sig){narrate();return;}guide.rendered=sig;
 if(!panel){
  panel=document.createElement('section');panel.id='guidedLesson';panel.setAttribute('aria-label','Adventure tutorial');
  document.body.append(panel);
 }
 panel.dataset.lesson=step.id;panel.innerHTML='';
 const copy=document.createElement('div');copy.setAttribute('aria-live','polite');copy.setAttribute('aria-atomic','true');
 const meta=document.createElement('div');meta.className='lesson-meta';
 const stage=document.createElement('span');stage.textContent='Tutorial · '+(step.safe?'Safe practice':step.id==='skill-use'?'New skill':'HUD guide');
 const count=document.createElement('span');count.className='lesson-count';
 const group=lessons.filter(s=>!!s.safe===!!step.safe),within=group.indexOf(step)+1;
 count.textContent=guide.steps===lessons?within+' / '+group.length:'Try it';
 meta.append(stage,count);
 const h=document.createElement('h2');h.textContent=step.title;
 const p=document.createElement('p');p.textContent=narrationLine()?.text||(typeof step.body==='function'?step.body(guide.g,hint):step.body);copy.append(meta,h,p);
 let keys=[],label='';
 if(core){keys=step.action==='move'?movementHints(hint):[hint(step.action)];label=step.action==='jump'?'Hold to continue':'Try it to continue';}
 else if(step.id==='charge'){keys=[hint('attack')];label='Optional · hold, then release';}
 else if(['skills','skill-use'].includes(step.id)){keys=[hint('skill1')];label=step.id==='skills'?'Skill 1 · unlocks at class rank 2':'Skill 1';}
 else if(step.practice){keys=[hint(step.practice),window.BFNarration?.backHint()||'Q'];label='Open · then close to finish practice';}
 else if(step.id==='bag'){keys=[hint('bag')];label='Open bag · Loot reopens the latest pickup';}
 else if(step.id==='journal'){keys=[hint('journal')];label='Open journal';}
 else if(step.id==='menu-keys'){keys=[hint('interact'),'Q'];label='Choose / continue · Back / close';}
 else if(step.id==='menu'){keys=[pauseHint()];label='Open menu after closing tips';}
 if(step.id==='menu-keys'){
  const cards=document.createElement('div');cards.className='lesson-menu-keys';
  for(const [key,title,description] of [[hint('interact'),'Choose / continue','Talk, interact and select'],[window.BFNarration?.backHint()||'Q','Back / close','Leave menus and conversations'],[hint('pause'),'Main menu','Settings, controller setup and more']]){
   const card=document.createElement('div'),keycap=document.createElement('kbd'),titleEl=document.createElement('strong'),text=document.createElement('small');
   keycap.textContent=key;titleEl.textContent=title;text.textContent=description;card.append(keycap,titleEl,text);cards.append(card);
  }copy.append(cards);keys=[];
 }
 if(keys.length){const k=document.createElement('div');k.className='lesson-control';for(const key of keys){const el=document.createElement('kbd');el.textContent=key; k.append(el);}const l=document.createElement('span');l.className='lesson-controls-label';l.textContent=label;k.append(l);copy.append(k);}
 panel.append(copy);
 const buttons=document.createElement('div');buttons.className='lesson-actions';
 const previous=document.createElement('button');previous.type='button';previous.textContent='Back · Q';previous.disabled=guide.i===0;previous.onclick=back;buttons.append(previous);
 if(!core){const b=document.createElement('button');b.type='button';b.textContent=(guide.i===guide.steps.length-1&&!guide.resume?'Finish':'Continue')+' · '+hint('interact');b.onclick=next;buttons.append(b);}
 const skip=document.createElement('button');skip.type='button';skip.className='skip';skip.textContent=step.safe?'Skip lessons':'Close tips';skip.onclick=stop;buttons.append(skip);panel.append(buttons);
 const status=document.createElement('p');status.className='lesson-status';status.textContent=step.safe?'Enemies wait during control practice.':'Optional tip · movement and combat stay active.';panel.append(status);
 if(guide.success!=null)paintSuccess();
 narrate();position(true);
}
function canReceive(){return guide&&panel&&!panel.hidden&&window.__BF3?.mode==='play';}
window.addEventListener('keydown',e=>{
 if(!canReceive()||e.repeat||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;
 if(e.code==='KeyQ'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();e.stopImmediatePropagation();back();return;}
 const action=window.__BF3?.keyAction(window.BFPartyNavigation?.keyCode(e)||e.code);
 if(guide.steps[guide.i].practice&&(action===guide.steps[guide.i].practice||guide.steps[guide.i].practice==='pause'&&e.code==='Escape'))return;
 if(action==='interact'&&!coreActions.includes(guide.steps[guide.i].action)){
  e.preventDefault();e.stopImmediatePropagation();if(guide.success==null)next();
 }
},true);
// Short mouse clicks can fall between simulation frames; remember the performed input.
window.addEventListener('pointerdown',e=>{
 if(!canReceive()||e.pointerType!=='mouse'||e.target.closest?.('button,input,select,#guidedLesson,#inventoryDock,#equipmentFeed,#journalNotice,#hud,#questbox'))return;
 const b=window.__BF3,a=b?.keyAction('Mouse'+e.button);
 if(a==='interact'&&!coreActions.includes(guide.steps[guide.i].action)){e.preventDefault();e.stopImmediatePropagation();if(guide.success==null)next();return;}
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
 const practice=guide.steps[guide.i].practice;
 if(mode!=='play'){if(practice==='bag'&&document.getElementById('bagItems')||practice==='pause'&&document.getElementById('resBtn'))guide.practiceOpened=true;suspend();return false;}
 if(practice&&guide.practiceOpened){guide.practiceOpened=false;complete();}
 if(panel)panel.hidden=false;draw(api.hint);position();
 const step=guide.steps[guide.i],a=step.action,core=coreActions.includes(a);g._tutorialSafe=!!step.safe;
 if(step.safe)g.p.invuln=Math.max(g.p.invuln||0,1);
 if(guide.success!=null){if(!document.hidden)guide.success+=Math.min(dt,.1);if(guide.success>=SUCCESS_SECONDS)next();return false;}
 if(a==='skill1'){if(g.p.skillCd?.[0]>0)complete();return false;}
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
   if(guide.qualified)complete();
   else{guide.hold=0;guide.run=0;guide.airborne=false;guide.tapped=null;}
  }
 }else{guide.hold+=dt;if(guide.hold>=.3)complete();}
 return false;
}
function map(g,mode){
 if(!mapCanvas){mapCanvas=document.createElement('canvas');mapCanvas.id='localMap';mapCanvas.width=320;mapCanvas.height=320;mapCanvas.setAttribute('aria-label','Map: gold objective, blue teammates, cyan pings, red enemies. In the Waystation, 1 marks the first campaign gate, $ the shops, star training, C challenges, R the Rift Hall. The map follows your camera orientation.');document.body.append(mapCanvas);}
 mapCanvas.hidden=!g||mode!=='play'||g.bonusActive;if(mapCanvas.hidden)return;
 // Draw the same heading as this frame's world; smoothing here makes navigation lag.
 const nav=window.__BF_MAP_PARTY?.()||{},heading=nav.heading;
 const mapHeading=Number.isFinite(heading)?heading:(g.p.yaw||0);
 const turn=mapHeading+Math.PI,c=mapCanvas.getContext('2d'),p=g.p,scale=145/800,mid=160;
 c.clearRect(0,0,320,320);c.save();c.beginPath();c.roundRect(4,4,312,312,24);c.clip();c.fillStyle='#101923';c.fillRect(0,0,320,320);c.translate(mid,mid);c.rotate(turn);
 const xy=o=>[(o.x-p.x)*scale,(o.z-p.z)*scale];c.fillStyle='#435747';for(const o of g.segments||[]){const [x,y]=xy(o);c.fillRect(x-o.w*scale/2,y-o.d*scale/2,o.w*scale,o.d*scale);}
 for(const o of g.obstacles||[]){c.fillStyle=o.kind==='plat'?'#819488':'#56636a';const [x,y]=xy(o);c.fillRect(x-o.w*scale/2,y-o.d*scale/2,o.w*scale,o.d*scale);}
 c.fillStyle='#26302d';for(const o of g.walls||[]){const [x,y]=xy(o);c.fillRect(x-o.w*scale/2,y-o.d*scale/2,o.w*scale,o.d*scale);}
 const marker=(o,color,r,edge=false)=>{if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.z))return;let [x,y]=xy(o);const rx=x*Math.cos(turn)-y*Math.sin(turn),ry=x*Math.sin(turn)+y*Math.cos(turn),d=Math.max(Math.abs(rx),Math.abs(ry));if(d>138){if(!edge)return;x*=138/d;y*=138/d;}c.fillStyle=color;c.strokeStyle='#101923';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.stroke();};
 if(g.hub&&!g.hubArt?.riftHall){
   const landmark=(o,color,glyph)=>{if(!o)return;let [x,y]=xy(o);const rx=x*Math.cos(turn)-y*Math.sin(turn),ry=x*Math.sin(turn)+y*Math.cos(turn),d=Math.max(Math.abs(rx),Math.abs(ry));if(d>136){x*=136/d;y*=136/d;}c.fillStyle='#111c24';c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.fill();c.fillStyle=color;c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();c.fillStyle='#182126';c.font='bold 12px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(glyph,x,y+.5);};
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

const mapStyle=document.createElement('style');mapStyle.textContent='#localMap{width:216px!important;height:216px!important}@media(max-width:650px){#localMap{width:140px!important;height:140px!important}}';document.head.append(mapStyle);
function control(p){if(!canReceive())return false;if(guide.steps[guide.i].practice&&p.edge(guide.steps[guide.i].practice))return false;if(p.edge('pause'))return false;if(p.edge('interact')&&!coreActions.includes(guide.steps[guide.i].action)){if(guide.success==null)next();return true;}return false;}
window.BFGuidedTutorial={start,skill,tick,map,stop,suspend,practice,control,back,get blocksPointerLock(){return !!guide?.g?._tutorialSafe;},get state(){return guide?{step:guide.i,id:guide.steps[guide.i]?.id,title:guide.steps[guide.i]?.title,success:guide.success!=null}:null}};
})();
