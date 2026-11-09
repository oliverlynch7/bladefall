const assert=require('node:assert/strict'),K=require('../public/3d/final-king.js'),E=require('../public/3d/story-state.js'),book=require('../public/3d/story/final-king.json');
let e={finalKing:true,akBaseHP:1000};K.startFight(e,1);const p={x:0,z:100,y:0,hp:100,r:16};for(let i=0;i<61;i++)K.step(e,.05,p);assert.equal(e.akState,'wind');assert(!K.inAttack(e,p));const target=[e.akX,e.akZ];K.step(e,.05,{...p,x:1000});assert.deepEqual([e.akX,e.akZ],target);while(e.akState==='wind')K.step(e,.05,p);assert(K.inAttack(e,p));assert(!K.inAttack(e,{...p,x:900,z:900}));
e.akKind='burst';e.akX=0;e.akZ=100;e.akY=0;assert(K.inAttack(e,p));assert(!K.inAttack(e,{...p,x:250}));e.akKind='wave';assert(K.inAttack(e,p));assert(!K.inAttack(e,{...p,y:100}));e.x=-430;e.z=-700;e.akKind='line';e.akDX=0;e.akDZ=1;assert(!K.inAttack(e,{...p,x:-430,z:100}));assert(K.inAttack(e,{...p,x:-430,z:-400}));
K.lethal(e);assert.equal(e.akStage,'recognition');assert.equal(e.hp,1);K.startFight(e,2);assert.equal(e.maxHp,1150);let summoned=0;for(let i=0;i<4000;i++)K.step(e,.05,p,{adds:0,summon:()=>summoned++});assert.equal(summoned,1);K.lethal(e);assert.equal(e.akStage,'collapse');assert(e.untargetable);
let c=K.newCharge(),seq=0;assert(!K.command(c,'guest',{type:'start',seq:1},['host','guest']));assert(K.command(c,'host',{type:'start',seq:++seq},['host']));for(let i=0;i<60;i++){K.chargeStep(c,.07);assert(K.command(c,'host',{type:'press',seq:++seq},['host']));assert(!K.command(c,'host',{type:'press',seq:seq},['host']));}assert.equal(c.state,'won');c=K.newCharge();seq=0;for(let i=0;i<5;i++){K.command(c,'host',{type:'start',seq:++seq},['host']);K.chargeStep(c,10);if(i<4)assert(!K.command(c,'host',{type:'skip',seq:++seq},['host']));}assert.equal(c.failures,5);assert(K.command(c,'host',{type:'skip',seq:++seq},['host']));assert.equal(c.state,'won');
let s=E.create(),n=0;for(const [npc,start,count,flag]of [['abyss_king','ak.king.offer',2,'start'],['abyss_king','ak.king.recognize',2,'plunge'],['ian','ak.ian.welcome',6,'charge'],['ian','ak.ian.restored',2,'home']]){s.cursors[npc]={node:start};s=E.transact(s,book,{id:''+ ++n,type:'open',npc}).state;for(let i=0;i<count;i++){const r=E.transact(s,book,{id:''+ ++n,type:'choose',line:s.conversation.node,choice:'next'});assert(r.changed);s=r.state;}assert(s.flags['ak.'+flag]);s=E.transact(s,book,{id:''+ ++n,type:'close'}).state;}
for(const line of Object.values(book.nodes)){assert(book.npcs[line.voice.speaker]);for(const choice of line.choices)assert(book.nodes[choice.next]);}
// A sweep should close the gap first, then stay committed if its target circles away.
const distantKing={finalKing:true,akBaseHP:1000,yaw:0};
K.startFight(distantKing,1);
distantKing.akClock=0;
const distantPlayer={...p,z:400};
K.step(distantKing,.05,distantPlayer);
assert.equal(distantKing.akState,'approach','the King cannot start a sweep outside its reach');
assert(distantKing.z>-450,'the King walks toward a distant player before sweeping');
for(let i=0;i<120&&distantKing.akState==='approach';i++)K.step(distantKing,.05,distantPlayer);
assert.equal(distantKing.akState,'wind');
assert.equal(distantKing.akKind,'sweep');
assert(Math.hypot(distantPlayer.x-distantKing.x,distantPlayer.z-distantKing.z)<365+distantPlayer.r);
const committed={x:distantKing.x,z:distantKing.z,dx:distantKing.akDX,dz:distantKing.akDZ};
const behind={...p,x:distantKing.x,z:distantKing.z-150};
for(let i=0;i<35&&distantKing.akState==='wind';i++)K.step(distantKing,.05,behind);
assert.equal(distantKing.akState,'strike');
assert.deepEqual({x:distantKing.x,z:distantKing.z,dx:distantKing.akDX,dz:distantKing.akDZ},committed);
assert(!K.inAttack(distantKing,behind));
const coveredKing={...distantKing,x:430,z:-330,akBeat:0,akState:'approach',akClock:0};
const coveredPlayer={...p,x:430,z:200};
for(let i=0;i<50&&coveredKing.akState==='approach';i++)K.step(coveredKing,.05,coveredPlayer);
assert.equal(coveredKing.akState,'wind','the King attacks if a pillar stops his approach');
assert.equal(coveredKing.akKind,'line');
for(let i=0;i<40&&coveredKing.akState==='wind';i++)K.step(coveredKing,.05,coveredPlayer);
assert.equal(coveredKing.akState,'strike');
assert(!K.inAttack(coveredKing,coveredPlayer));
assert(K.environmentalCounter(coveredKing,[coveredPlayer]),'the pillar counter also works on the alternate beam');
console.log('Final King: sweep reach, locked telegraphs, safe regions/height/cover, two lethal gates, finite summons, validated charge/retry/fifth-failure skip and complete voice/story graph passed.');
