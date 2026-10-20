const assert=require('node:assert/strict'),T=require('../public/3d/boss-tactics.js');
const src={x:0,y:0,z:-100},enemy=o=>({hp:1000,maxHp:1000,x:0,y:0,z:0,...o});let count=0;
const ok=(v,m)=>{assert(v,m);count++;};
// Reproduce thresholds where the old UI advertised damage the combat guard refused.
for(const e of [enemy({marksmanCrossing:true,markState:'recover',markExposed:2,markClock:4,markWindowSeq:1,hp:550}),enemy({finalKing:true,akStage:'fight2',phase:2,akState:'recover',akClock:3,akSeq:1,akEnvSeq:1,akEnvPhase:2,hp:550})]){
 const g={p:src};ok(T.damage(g,e,src,100)===0,'Phase threshold blocks damage');ok(T.rule(g,e,src).factor===0,'Readability agrees with the real phase floor');ok(T.view(g,e,src).state==='transition','Phase transition is named');ok(!T.cue(g,e).safe&&!/attack now/i.test(T.cue(g,e).text),'No false green attack cue');
 if(e.marksmanCrossing)e.markMoved=true;else e.akSummoned=true;
 ok(T.view(g,e,src).state==='open'&&T.damage(g,e,src,100)>0,'Actual relocation/guard completion restores damage');
}
// Exhaust every type of real window, replicate its existing packet and open the next one.
const cases=[
 [enemy({bruteOrchard:true,bruteState:'stagger',bruteClock:3,bruteStaggers:1}),{},e=>Object.assign(e,{bruteState:'stagger',bruteStaggers:2})],
 [enemy({marksmanCrossing:true,markMoved:true,markState:'recover',markExposed:3,markWindowSeq:1}),{},e=>Object.assign(e,{markExposed:3,markWindowSeq:2})],
 [enemy({fallenDuel:true,fallState:'stagger',fallClock:3,fallSeq:1}),{},e=>Object.assign(e,{fallState:'stagger',fallSeq:2})],
 ...['shield','spear','caster'].map(role=>[enemy({frostOfficer:role,offState:'recover',offClock:2,offSeq:1}),{enemies:[]},e=>Object.assign(e,{offState:'recover',offSeq:2})]),
 [enemy({furnaceColossus:true,fcExposed:7,_fcCool:1}),{},e=>Object.assign(e,{fcExposed:7,_fcCool:2})],
 [enemy({marbleGuardian:true,mcExposed:7,mcSeq:1}),{},e=>Object.assign(e,{mcExposed:7,mcSeq:2})],
 [enemy({hydraChain:true,hydraIndex:0}),{hydraArena:{state:'recover',head:0,seq:1,clock:3}},(e,g)=>g.hydraArena.seq++],
 [enemy({finalKing:true,akStage:'fight1',phase:1,akState:'recover',akClock:4.2,akSeq:1,akEnvSeq:1,akEnvPhase:1}),{},e=>{e.akSeq++;e.akEnvSeq++;e.akState='recover';}]
];
for(const [e,g,next]of cases){g.p=src;const before=JSON.stringify({e,g});ok(T.view(g,e,src).state==='open','Counter has readable open state');T.view(g,e,src);ok(before===JSON.stringify({e,g}),'Reading UI never mutates a fight');const dealt=T.damage(g,e,src,1e8);e.hp-=dealt;ok(dealt>0&&e.hp>0,'One counter has its existing finite budget');ok(T.damage(g,e,src,100)===0,'Spent window remains closed');ok(T.view(g,e,src).state!=='open','No false open badge after the budget is used');ok(!T.cue(g,e)?.safe,'No false green cue after exhaustion');
 const guest={...e,...T.snapshot(e)};ok(T.view(g,guest,src).state===T.view(g,e,src).state,'Existing host snapshot gives the same local guest status');next(e,g);ok(T.view(g,e,src).state==='open'&&T.damage(g,e,src,10)>0,'Next actual counter remains usable');
}
const marksman=enemy({marksmanCrossing:true,markExposed:1.2,markClock:4,markState:'recover',markMoved:true});ok(T.view({},marksman,{x:1000,y:0,z:0}).seconds===1.2,'Distant cover opening timer never borrows the longer nest recovery');ok(T.view({},marksman,src).seconds===4,'Close nest timer uses the actual longer recovery');marksman.untargetable=true;ok(T.view({},marksman,src).state==='transition','Moving untargetable boss never advertises damage');
for(const e of [enemy({}),enemy({dummy:true}),enemy({practice:true,bruteOrchard:true}),enemy({_peer:true}),enemy({bot:true})])ok(T.view({},e,src)===null&&T.damage({},e,src,30)===30,'Ordinary enemies/tutorial/PvP unchanged');
const officers={p:{x:0,y:0,z:0,yaw:0},enemies:[enemy({frostOfficer:'shield',x:500,z:0}),enemy({frostOfficer:'spear',x:0,z:200})]};
ok(T.focus(officers,officers.enemies[0],0)===officers.enemies[1],'Team status follows the officer in front of the player');ok(T.focus(officers,officers.enemies[1],Math.PI/2)===officers.enemies[0],'Turning toward another officer changes the subject');officers.enemies[0].dead=true;ok(T.focus(officers,officers.enemies[0],Math.PI/2)===officers.enemies[1],'A defeated officer cannot keep the team HUD focus');
const exposedSpear=enemy({frostOfficer:'spear',offSeq:1,offState:'recover',offClock:2}),casting=enemy({frostOfficer:'caster',offState:'wind'}),overlap={p:src,enemies:[exposedSpear,casting]};
ok(T.view(overlap,exposedSpear,src).state==='open'&&!T.cue(overlap,exposedSpear).safe&&/Ice marks/.test(T.cue(overlap,exposedSpear).text),'Another officer danger remains distinct from an open target');
console.log(count+' boss damage/cue/phase/timer/guest/read-only checks passed.');
