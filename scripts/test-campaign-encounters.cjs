const assert=require('node:assert/strict');
global.BFCampaignElites=require('../public/3d/campaign-elites.js');
const C=require('../public/3d/campaign-encounters.js'),E=global.BFCampaignElites;
let checks=0;const test=(name,fn)=>{try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}};
const world=()=>({zone:0,area:0,time:1,enemies:[],storyNpcs:[]});
const foe=(p={})=>({type:'grunt',x:0,y:0,z:0,sx:0,sz:0,sy:0,hp:60,maxHp:100,r:18,h:54,kind:'walk',active:true,mid:1,...p});
const player=(p={})=>({x:100,y:0,z:0,hp:100,...p});
test('all sixteen sections have authored formations, finite purposes and bounded pursuit',()=>{
 assert.equal(Object.keys(C.plans).length,16);
 for(let z=0;z<8;z++)for(let a=0;a<2;a++){
  const rows=C.plans[z+'.'+a];assert.ok(rows.length>=2);
  const names=new Set();for(const [id,intent,range,members]of rows){assert.ok(!names.has(id));names.add(id);assert.ok(intent.length>30);assert.ok(range>=500&&range<=800);assert.ok(members.length);}
 }
});
for(const mode of ['hub','trial','escape','bossRush','endless','delve','arena','bonusActive','sprintFun','sparringRoom','side','devBriar','devKeep'])test(mode+' is unchanged',()=>{
 const g={...world(),[mode]:true},e=foe();g.enemies=[e];assert.equal(C.install(g),null);assert.equal(C.canWake(g,e,[],()=>false),true);assert.equal(C.retreat(g,e,[],1,()=>assert.fail()),false);assert.equal(e.encHome,undefined);
});
for(const special of ['boss','dummy','practice','bot','keepEscort','furnaceEscort','canyonEscort','canyonAlarm','furnaceGate','furnaceCooling','hydraChain','prisonFoe'])test('protect '+special,()=>{
 const e=foe({[special]:true});assert.equal(C.managed(e),false);assert.equal(C.retreat(world(),e,[],1,()=>assert.fail()),false);
});
test('intact distant or occluded troops do not wake; visible same-floor troops do',()=>{
 const g=world(),e=foe({hp:100});assert.equal(C.canWake(g,e,[player()],()=>true),true);
 assert.equal(C.canWake(g,e,[player()],()=>false),false);
 assert.equal(C.canWake(g,e,[player({y:240})],()=>true),false);
 assert.equal(C.canWake(g,e,[player({x:700})],()=>true),false);
 assert.equal(C.canWake(g,e,[player({hp:0}),player({dead:true}),player({downed:true})],()=>true),false);
});
test('a guest in the correct room can wake a host-owned foe even if host is elsewhere',()=>{
 const e=foe({hp:100});assert.equal(C.canWake(world(),e,[player({x:3000}),player()],()=>true),true);
});
test('a valid ranged hit provokes an intact dormant enemy without requiring proximity',()=>{
 assert.equal(C.canWake(world(),foe({hp:99}),[player({x:1500})],()=>false),true);
});
test('return retains damage, takes actual movement steps and sleeps only at home',()=>{
 const g=world(),e=foe();g.enemies=[e];C.install(g);e.x=650;
 const hp=e.hp;let moves=0;for(let i=0;i<100;i++){C.retreat(g,e,[player({x:2500})],.05,(dx,dz)=>{e.x+=dx*10;e.z+=dz*10;moves++;});if(!e.active)break;}
 assert.ok(moves>40);assert.equal(e.hp,hp);assert.equal(e.active,false);assert.equal(e.dropT,.65);assert.ok(Math.abs(e.x)<30);
});
test('a living nearby ally keeps the fight active; a dead, downed or other-storey ally does not',()=>{
 for(const p of [player(),player({hp:0}),player({dead:true}),player({downed:true}),player({y:300})]){
  const g=world(),e=foe();g.enemies=[e];C.install(g);e.x=650;
  const result=C.retreat(g,e,[player({x:2400}),p],.05,()=>{});
  assert.equal(result,p.hp<=0||p.dead===true||p.downed===true||p.y===300);
 }
});
test('do not erase a displayed windup or strike to return home',()=>{
 for(const state of ['wind','strike']){const g=world(),e=foe();g.enemies=[e];C.install(g);Object.assign(e,{x:700,ceKind:'briar_guard',ceState:state});assert.equal(C.retreat(g,e,[],.05,()=>assert.fail()),false);}
});
test('return is immediately cancelled when an ally re-enters the territory',()=>{
 const g=world(),e=foe();g.enemies=[e];C.install(g);e.x=650;C.retreat(g,e,[],.05,()=>{});assert.equal(e.encReturning,true);assert.equal(C.retreat(g,e,[player()],.05,()=>assert.fail()),false);assert.equal(e.encReturning,false);
});
test('collision or void rejects an authored move without corrupting the actor or quest tags',()=>{
 for(const floor of [()=>-Infinity,()=>0]){const g=world(),e=foe({x:120,sx:120,z:-550,sz:-550,keepGuard:'quest',hp:100});g.enemies=[e];const r=C.install(g,{floor,resolve:q=>q.x+=40});assert.equal(e.x,120);assert.equal(e.keepGuard,'quest');assert.equal(e.hp,100);assert.equal(r.rejected.length,1);}
});
test('formation jobs override parity randomness without altering stats or species',()=>{
 const e=foe({x:100,z:-1000,campaignRoleHint:'guard',speed:100});E.campaign({...world(),zone:2},e);assert.equal(e.campaignRole,'guard');assert.equal(e.ceKind,'keep_lance');assert.equal(e.hp,60);assert.equal(e.maxHp,100);
 const r=foe({x:100,z:-1000,campaignRoleHint:'runner',speed:100});E.campaign({...world(),zone:2},r);assert.equal(r.campaignRole,'runner');assert.equal(r.ceKind,'cliff_lunge');
});
test('refill inherits the home, role and territory but never the previous corpse HP',()=>{
 const slot={x:100,z:-1500,y:300,encounter:'cell-block',encJob:'guard',encLeash:520,campaignRoleHint:'guard'},e=foe({x:100,z:-1500,y:300,hp:100});C.reinstate(e,slot);assert.deepEqual(e.encHome,{x:100,z:-1500,y:300});assert.equal(e.campaignRoleHint,'guard');assert.equal(e.encLeash,520);assert.equal(e.hp,100);
});
test('real host snapshots include specialist melee timing and clear obsolete timing on upgraded troops',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),source=fs.readFileSync('public/3d/index.html','utf8');
 const start=source.indexOf('  enemySnap(){'),end=source.indexOf('  noteKill(',start);
 const g=world();g.enemies=[foe({type:'sporeback',spec:'spores',meleeW:.4,meleeSerial:7,encReturning:true}),foe({mid:2,ceKind:'briar_guard',ceState:'hunt',ceSerial:2})];
 const c={G:g,BFCampaignEncounters:C,BFCampaignElites:E,STATUS_ORDER:[],syncedMelee:e=>e.kind==='walk'&&!e.ceKind&&!e.spec};vm.createContext(c);
 const host=vm.runInContext('({typeIdx:()=>0,'+source.slice(start,end)+'})',c),rows=host.enemySnap();
 assert.equal(rows[0][7].encounterOwned,true);assert.equal(rows[0][7].normalMelee,true);assert.equal(rows[0][7].meleeSerial,7);assert.equal(rows[0][7].meleeW,.4);assert.equal(rows[0][7].encReturning,true);
 assert.equal(rows[1][7].normalMelee,false);assert.equal(rows[1][7].ceState,'hunt');
});
console.log(checks+' formation, physical placement, visibility, floor separation, pursuit, co-op and scope checks passed.');
