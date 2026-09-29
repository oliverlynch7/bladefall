/* Short, input-gated onboarding and a local, heading-up exploration map. */

(function(){

'use strict';

let guide=null, panel=null, mapCanvas=null, lastMap=0,mapOwner=null,mapHeading=0;

const lessons=[

 ['Safe practice','Learn four controls first. Enemies wait until you finish these steps.'],

 ['Move around','Use W, A, S and D to move forward, left, backward and right. Try moving now.','move'],

 ['Hold to jump higher','Tap for a hop. Hold jump for a higher leap; practice holding it briefly.','jump'],

 ['Basic attack','Left-click or press J to attack. Hold to keep attacking.','attack'],

 ['Dodge / dash','Right-click or press K to dodge. You can also dash in the air.','dodge'],

 ['Your health and mana','Red is health. Blue is mana for skills. Keep an eye on both.','#hud'],

 ['Your objective','Defeat 6 enemies. After the first 3, choose a skill and try it on the rest. Then find the exit portal.','#questbox'],

 ['Level and class rank','Player level earns stat points and unlocks gear. Class rank unlocks skills and passives.','#hudprogress'],

 ['Your skills','Press 1 for your first skill once it unlocks. Skills use mana and need time to recharge.','#skillframe'],

 ['Your bag and journal','B opens your bag. N opens your journal for saved clues. E talks or interacts; Esc pauses.'],

 ['Find your way','The map turns with you. Red dots are enemies; the gold diamond is the nearby exit.','#localMap']

];

const css=document.createElement('style');css.textContent=`#guidedLesson{position:fixed;z-index:18;left:50%;top:70px;transform:translateX(-50%);width:min(360px,calc(100vw - 24px));padding:12px 16px;background:#101621f2;border:1px solid #edbe60;border-radius:12px;color:#f4eedf;box-shadow:0 8px 30px #0007;font:14px/1.4 system-ui;box-sizing:border-box}#guidedLesson h2{margin:4px 0;font-size:19px}#guidedLesson p{margin:7px 0}#guidedLesson button{padding:7px 12px;border-radius:7px;border:1px solid #d7ae61;background:#e5b456;color:#15120c;font-weight:bold;cursor:pointer;margin:4px 6px 0 0}#guidedLesson .skip{background:transparent;color:#d5dbe5}#guidedLesson small{color:#edbe60}.lessonFocus{outline:3px solid #ffe047!important;outline-offset:3px}#lessonArrow{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:17}#localMap{position:fixed;left:20px;bottom:115px;width:126px;height:126px;z-index:5;border:2px solid #c5a365;border-radius:50%;background:#101923dd;pointer-events:none}#localMap[hidden],#guidedLesson[hidden]{display:none}@media(max-width:700px){#localMap{width:85px;height:85px;left:12px;bottom:220px}#guidedLesson{font-size:12px;padding:10px;top:65px;width:280px}}`;

document.head.append(css);

function clearFocus(){document.querySelectorAll('.lessonFocus').forEach(e=>e.classList.remove('lessonFocus'));document.getElementById('lessonArrow')?.remove();}

function stop(){if(guide)guide.g._tutorialSafe=false;guide=null;panel?.remove();panel=null;clearFocus();}

function start(g){stop();g._guidedUsed=true;g._tutorialSafe=true;document.exitPointerLock?.();guide={g,i:0,steps:lessons,hold:0,run:0};}

function skill(g){stop();guide={g,i:0,steps:[['Try Skill 1','Press 1 or tap Skill 1. Move within range first. Skills use mana and recharge after use.','skill1']],hold:0,run:0};}

function next(){if(!guide)return;clearFocus();guide.i++;guide.hold=0;guide.run=0;guide.tapped=false;guide.rendered=-1;if(guide.i>=guide.steps.length)stop();}

let placedAt=0;function position(){if(performance.now()-placedAt<150)return;placedAt=performance.now();if(!guide||!panel||panel.hidden)return;const a=guide.steps[guide.i]?.[2],target=a?.startsWith('#')?document.querySelector(a):null;panel.style.transform='none';const w=panel.offsetWidth,h=panel.offsetHeight;let x=(innerWidth-w)/2,y=70;document.getElementById('lessonArrow')?.remove();if(target&&!target.hidden){const r=target.getBoundingClientRect();if(r.width&&r.height){target.classList.add('lessonFocus');x=r.left<innerWidth/2?r.right+18:r.left-w-18;y=Math.max(64,r.top);x=Math.max(12,Math.min(innerWidth-w-12,x));y=Math.max(12,Math.min(innerHeight-h-12,y));if(x<r.right&&x+w>r.left&&y<r.bottom&&y+h>r.top)y=r.top>h+24?r.top-h-14:r.bottom+14;const tx=r.left+r.width/2,ty=r.top+r.height/2,sx=Math.max(x,Math.min(x+w,tx)),sy=Math.max(y,Math.min(y+h,ty));const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='lessonArrow';svg.innerHTML=`<defs><marker id="lessonHead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#ffe047"/></marker></defs><line x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}" stroke="#ffe047" stroke-width="3" marker-end="url(#lessonHead)"/>`;document.body.append(svg);}}panel.style.left=x+'px';panel.style.top=Math.max(12,Math.min(innerHeight-h-12,y))+'px';}

function draw(hint){if(guide.rendered===guide.i)return;guide.rendered=guide.i;const [title,text,a]=guide.steps[guide.i];if(!panel){panel=document.createElement('section');panel.id='guidedLesson';panel.setAttribute('aria-live','polite');document.body.append(panel);}const core=['move','jump','attack','dodge'].includes(a);panel.innerHTML='';const small=document.createElement('small');small.textContent=core?'SAFE PRACTICE':'QUICK TIP';const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=text;panel.append(small,h,p);if(core){const k=document.createElement('p');k.textContent=a==='move'?['up','left','down','right'].map(hint).join(' · '):hint(a);panel.append(k);}else{const b=document.createElement('button');b.textContent='Continue · E';b.onclick=next;panel.append(b);}const skip=document.createElement('button');skip.className='skip';skip.textContent='Skip lessons · Q';skip.onclick=stop;panel.append(skip);position();}

window.addEventListener('keydown',e=>{if(!guide||!panel||panel.hidden||e.repeat)return;if(e.code==='KeyQ'||e.code==='KeyE'&&!['move','jump','attack','dodge'].includes(guide.steps[guide.i]?.[2])){e.preventDefault();e.stopImmediatePropagation();e.code==='KeyQ'?stop():next();}},true);

// Capture mouse controls on the game surface as well as the canvas: HUD layers can cover it.

window.addEventListener('pointerdown',e=>{if(!guide||panel?.hidden||e.pointerType!=='mouse'||e.target.closest?.('button,input,select,#guidedLesson'))return;const b=window.__BF3,a=b?.keyAction('Mouse'+e.button);if(!['attack','dodge'].includes(a))return;guide.tapped=a;b.input[a]=true;if(a==='dodge')b.input.dodgeEdge=true;e.preventDefault();},true);

window.addEventListener('resize',position);

function tick(g,mode,dt,input,api){if(!guide&&mode==='play'&&g?._guidedUsed&&g.portal&&!g._guideExitSeen){g._guideExitSeen=true;guide={g,i:0,steps:[['The exit is open','Find the gold exit diamond on your map and walk into the portal.','#localMap']],hold:0,run:0};}if(!guide)return false;if(g!==guide.g||!g.trial){stop();return false;}if(mode!=='play'){if(panel)panel.hidden=true;clearFocus();return false;}draw(api.hint);panel.hidden=false;position();const a=guide.steps[guide.i][2],core=['move','jump','attack','dodge'].includes(a);g._tutorialSafe=guide.steps===lessons&&guide.i<=4;if(g._tutorialSafe)g.p.invuln=Math.max(g.p.invuln||0,1);

 if(a==='skill1'){if(g.p.skillCd?.[0]>0)next();return false;}

 if(!core)return guide.steps===lessons&&guide.i===0;

 const pressed=a==='move'?input.up||input.left||input.down||input.right||Math.hypot(input.jx||0,input.jz||0)>.2:input[a]||guide.tapped===a;

 if(!guide.run&&!pressed)return true;if(pressed)guide.run=1;guide.hold+=dt;

 if(a==='jump'&&!input.jump&&guide.hold<.33){guide.run=0;guide.hold=0;return true;}

 if(guide.hold>=(a==='jump'?.36:.3)){next();}return false;

}

function map(g,mode){if(!mapCanvas){mapCanvas=document.createElement('canvas');mapCanvas.id='localMap';mapCanvas.width=252;mapCanvas.height=252;mapCanvas.setAttribute('aria-label','Nearby map: white player, red enemies, gold exit. Player facing is up. N marks north on the rim.');document.body.append(mapCanvas);}mapCanvas.hidden=!g||mode!=='play'||g.hub||g.bonusActive;const now=performance.now();if(mapCanvas.hidden||now-lastMap<30)return;const elapsed=Math.min(.1,(now-lastMap)/1000);lastMap=now;const target=g.p.yaw||0;if(mapOwner!==g){mapOwner=g;mapHeading=target;}else{const delta=Math.atan2(Math.sin(target-mapHeading),Math.cos(target-mapHeading));mapHeading+=delta*(1-Math.exp(-elapsed*14));}const turn=mapHeading+Math.PI;const c=mapCanvas.getContext('2d'),p=g.p,scale=116/650;c.clearRect(0,0,252,252);c.save();c.beginPath();c.arc(126,126,123,0,Math.PI*2);c.clip();c.fillStyle='#101923';c.fillRect(0,0,252,252);c.save();c.translate(126,126);c.rotate(turn);c.translate(-126,-126);const xy=o=>[126+(o.x-p.x)*scale,126+(o.z-p.z)*scale];c.fillStyle='#465746';for(const s of g.segments||[]){const [x,y]=xy(s);c.fillRect(x-(s.w||80)*scale/2,y-(s.d||80)*scale/2,(s.w||80)*scale,(s.d||80)*scale);}c.fillStyle='#ff7470';for(const e of g.enemies||[]){if(e.dead||e.hp<=0||e.dummy)continue;const [x,y]=xy(e);if(Math.hypot(x-126,y-126)>115)continue;c.beginPath();c.arc(x,y,e.boss?6:3,0,7);c.fill();}if(g.portal){const [x,y]=xy(g.portal);if(Math.hypot(x-126,y-126)<115){c.fillStyle='#ffe047';c.beginPath();c.moveTo(x,y-7);c.lineTo(x+7,y);c.lineTo(x,y+7);c.lineTo(x-7,y);c.fill();}}c.restore();c.translate(126,126);c.fillStyle='white';c.beginPath();c.moveTo(0,-9);c.lineTo(-6,6);c.lineTo(0,3);c.lineTo(6,6);c.fill();c.restore();c.fillStyle='#fff0c7';c.font='bold 19px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('N',126+Math.sin(turn)*105,126-Math.cos(turn)*105);}

window.BFGuidedTutorial={start,skill,tick,map,stop,get blocksPointerLock(){return !!guide?.g?._tutorialSafe;},get state(){return guide?{step:guide.i,title:guide.steps[guide.i]?.[0]}:null}};

})();
