const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const c={window:{},Number,Math};vm.createContext(c);vm.runInContext(fs.readFileSync('public/3d/dragon-riding.js','utf8'),c);const d=c.window.BFDragonRiding;let count=0;const ok=(v,m)=>{assert(v,m);count++;};
const meta={petOwned:['sunwing'],petActive:'sunwing'};
function setup(extra={}){const g={hub:true,zone:0,area:0,stageIndex:0,runSeed:1,walls:[],doors:[],obstacles:[],p:{x:0,y:0,z:0,yaw:0,r:12,hp:100,onGround:true},pet:{id:'sunwing',x:40,y:0,z:0,hp:100,t:0},...extra};const w={floor:()=>0,resolve(){},notice(){},land(){}};return {g,w};}
function tick(g,w,n,input={}){for(let i=0;i<n;i++)d.step(g,.02,input,0,0,w);}
let {g,w}=setup();ok(d.toggle(g,meta,w),'owned healthy active dragon mounts');ok(g.p.dragonRide&&g.pet.mounted,'rider and dragon linked');tick(g,w,50,{jump:true});ok(g.p.y>100&&!g.p.onGround&&g.pet.flying,'jump ascends with wing state');tick(g,w,100,{jump:true});ok(g.p.y<=d.height,'height bounded');ok(g.dragonFuel<6,'flight spends stamina');ok(d.toggle(g,meta,w)&&g.p.dragonRide.landing,'air dismount requests landing');tick(g,w,200);ok(!g.p.dragonRide&&g.p.y===0,'safe touchdown before dismount');ok(!g.pet.mounted&&!g.pet.flying,'companion visuals restore');
({g,w}=setup());g.dragonFuel=.2;d.toggle(g,meta,w);tick(g,w,100,{jump:true});ok(g.p.y<40,'exhaustion cannot sustain flight');
({g,w}=setup());d.toggle(g,meta,w);tick(g,w,30,{jump:true});g.p.x=500;w.floor=(x)=>x<100?0:-Infinity;tick(g,w,150);ok(g.p.x===0&&g.p.y===0,'void descent returns to last safe landing');
({g,w}=setup());d.toggle(g,meta,w);g.walls=[{x:60,z:0,w:10,d:200,h:15}];g.p.y=140;g.p.onGround=false;for(let i=0;i<40;i++)d.step(g,.02,{jump:true},1,0,w);ok(g.p.x<=31,'low wall cannot be flown over');
({g,w}=setup());d.toggle(g,meta,w);g.doors=[{x:60,z:0,w:10,d:200,h:15}];for(let i=0;i<40;i++)d.step(g,.02,{jump:true},1,0,w);ok(g.p.x<=31,'closed door blocks flight');g.doors[0].open=true;for(let i=0;i<40;i++)d.step(g,.02,{},1,0,w);ok(g.p.x>100,'open door permits travel');
({g,w}=setup());d.toggle(g,meta,w);g.obstacles=[{x:0,z:0,w:200,d:200,y0:160,h:180}];tick(g,w,50,{jump:true});ok(g.p.y<=55,'ceiling stops ascent');
for(const f of ['riftHall','sparringRoom','arena','trial','side','endless','escape','delve','bossRush','bonusActive','sprintFun','devKeep','devBriar','voyage']){({g,w}=setup({[f]:true}));ok(!d.toggle(g,meta,w),'mode blocks '+f);}
for(const [zone,area] of [[2,1],[3,1],[5,0],[5,1],[6,1],[7,1]]){({g,w}=setup({hub:false,zone,area}));ok(!d.toggle(g,meta,w),'interior restriction '+zone+':'+area);}
for(const [zone,area] of [[0,0],[0,1],[1,0],[1,1],[2,0],[3,0],[4,0],[4,1],[6,0],[7,0]])ok(d.allowed({hub:false,zone,area}),'outdoor region '+zone+':'+area);
({g,w}=setup());ok(!d.toggle(g,{petOwned:[],petActive:'sunwing'},w),'no free unlock');g.pet.hp=0;ok(!d.toggle(g,meta,w),'dead dragon blocked');
({g,w}=setup());g.p.onGround=false;ok(!d.toggle(g,meta,w),'airborne mount blocked');
for(const cause of ['scene','pet','downed','warp']){({g,w}=setup());d.toggle(g,meta,w);tick(g,w,20,{jump:true});if(cause==='scene')g.area++;if(cause==='pet')g.pet=null;if(cause==='downed')g.p.downed=true;if(cause==='warp')g.p.warpSerial=1;d.step(g,.02,{},0,0,w);ok(!g.p.dragonRide&&g.p.y===0,'safe cancel '+cause);}
console.log(count+' dragon eligibility, flight, collision, stamina and lifecycle checks passed.');
