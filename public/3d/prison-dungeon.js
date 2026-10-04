/* Pure dungeon content and progression. No campaign state and no network side effects. */
(()=>{'use strict';
const VERSION=1,BASE=['warrior','ranger','mage'];
const offers=[{id:'berserker',tier:1,cost:300,goal:8,key:'elites',name:'Break the guards',desc:'Defeat 8 optional prison elites across runs.'},{id:'ninja',tier:2,cost:600,goal:3,key:'seals',name:'Hidden routes',desc:'Recover 3 hidden seals in Tier 2 or higher.'},{id:'reaper',tier:3,cost:1000,goal:1,key:'warden',name:'Last gate',desc:'Defeat the final Tier 3 boss.'}];
const upgrades=[{id:'health',name:'Endurance',desc:'+6 starting health',base:60,cap:10},{id:'armor',name:'Reinforced armor',desc:'+1% damage reduction',base:80,cap:10},{id:'weapon',name:'Weapon training',desc:'+4% starting weapon damage',base:90,cap:10}];
const copy=x=>JSON.parse(JSON.stringify(x));
function validCheckpoint(c){return !!(c&&c.version===VERSION&&typeof c.id==='string'&&Number.isFinite(c.seed)&&[1,2,3].includes(c.section)&&[1,2,3].includes(c.tier)&&[...BASE,...offers.map(o=>o.id)].includes(c.cid)&&c.p&&Number.isFinite(c.p.hp)&&c.p.hp>0&&c.p.gear&&c.p.stats&&c.p.weapon&&c.classes&&c.states&&c.safe&&Number.isFinite(c.safe.x)&&Number.isFinite(c.safe.z));}
function profile(v={}){v=v&&typeof v==='object'?v:{};const n=(x,max)=>Math.max(0,Math.min(max,Math.floor(Number(x)||0)));return {version:VERSION,gold:n(v.gold,1e9),tier:Math.max(1,n(v.tier,3)),classes:[...new Set([...BASE,...(Array.isArray(v.classes)?v.classes:[]).filter(x=>offers.some(o=>o.id===x))])],upgrades:Object.fromEntries(upgrades.map(u=>[u.id,n(v.upgrades?.[u.id],u.cap)])),progress:{elites:n(v.progress?.elites,1e6),seals:n(v.progress?.seals,1e6),warden:n(v.progress?.warden,1e6)},receipts:Array.isArray(v.receipts)?v.receipts.filter(x=>typeof x==='string').slice(-1500):[],checkpoint:validCheckpoint(v.checkpoint)?copy(v.checkpoint):null};}
function saves(v,legacy){
 if(v&&v.version===1&&Array.isArray(v.slots))return {version:1,active:[0,1,2].includes(v.active)?v.active:0,slots:Array.from({length:3},(_,i)=>v.slots[i]&&typeof v.slots[i]==='object'?profile(v.slots[i]):null)};
 return {version:1,active:0,slots:[legacy&&typeof legacy==='object'?profile(legacy):null,null,null]};
}
function credit(p,id,gold,kind){if(p.receipts.includes(id))return false;p.receipts.push(id);if(p.receipts.length>1500)p.receipts.shift();p.gold+=Math.max(0,Math.floor(gold));if(kind&&kind in p.progress)p.progress[kind]++;return true;}
function price(p,id){const u=upgrades.find(u=>u.id===id);return u?u.base*(1+p.upgrades[id]):offers.find(o=>o.id===id)?.cost||0;}
function buy(p,id){const u=upgrades.find(u=>u.id===id),o=offers.find(o=>o.id===id),cost=price(p,id);if(!cost||p.gold<cost)return false;if(u){if(p.upgrades[id]>=u.cap)return false;p.upgrades[id]++;}else{if(!o||p.classes.includes(id)||p.tier<o.tier||p.progress[o.key]<o.goal)return false;p.classes.push(id);}p.gold-=cost;return true;}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function layout(seed,section,tier,revision=2){
 const random=rng(seed+section*997+tier*71),side=random()<.5?-1:1;
 const names=[['Cell block','Guard hall','Broken crossing','Watch post','Cell keeper','Hidden store'],['Lower cells','Supply hall','Drain crossing','Barracks','Iron checkpoint','Sealed store'],['Gate cells','Patrol hall','Broken stairwell','Last watch','Outer gate','Warden’s store']][section-1]||['Cell block','Guard hall','Broken crossing','Watch post','Outer gate','Hidden store'];
 const rooms=names.map((name,i)=>({id:i,name,x:i===5?side*720:0,z:i===5?-720:-i*720,w:600,d:600,h:i===2?300:240,kind:['start','fight','bridge','waves','boss','vault'][i],optional:i===5}));
 if(revision>=2){
  rooms[4].x=side*720;rooms[4].z=-2160;rooms[4].name=['Bell chamber','Iron den','Last seal'][section-1];
  rooms.push({id:6,name:['Guard armory','Forgotten workshop','Sealed treasury'][section-1],x:-side*720,z:-2160,w:600,d:600,h:300,kind:'vault',optional:true});
  rooms[1].formation=['patrol','crossfire','charge'][(seed+section)%3];
  rooms[3].formation=['crossfire','charge','patrol'][(seed+section+1)%3];
 }
 const links=[[0,1],[1,2],[2,3],[3,4],[1,5],...(revision>=2?[[3,6]]:[])],walls=[],floors=[],plats=[],roofs=[],decor=[];
 const box=(x,z,w,d,y0,h,extra={})=>({x,z,w,d,y0,h,...extra});
 for(const r of rooms){
  const dirs=new Set(links.filter(l=>l.includes(r.id)).map(l=>{const q=rooms[l.find(i=>i!==r.id)];return Math.abs(q.x-r.x)>10?(q.x>r.x?'E':'W'):(q.z>r.z?'S':'N');}));
  for(const dir of ['N','S','E','W']){const ns=dir==='N'||dir==='S',sign=dir==='N'||dir==='W'?-1:1;
   for(const [offset,length] of dirs.has(dir)?[[-195,210],[195,210]]:[[0,600]])walls.push(box(r.x+(ns?offset:sign*300),r.z+(ns?sign*300:offset),ns?length:24,ns?24:length,0,r.h,{room:r.id}));
  }
  roofs.push(box(r.x,r.z,624,624,r.h,r.h+18,{room:r.id}));
  if(r.kind==='bridge'){
   floors.push(box(r.x,r.z+235,576,130,-20,0),box(r.x,r.z-235,576,130,-20,0));
   const variant=revision>=2?(seed+section)%3:0;
   for(let k=0;k<3;k++)plats.push(box(r.x+(variant===2?(k===1?-side*45:side*30):(k===1?side*55:0)),r.z+125-k*125,variant===1?140:110,variant===1?95:85,0,k===1?(variant===1?62:44):18,{room:r.id}));
   r.crossing=variant;r.waypoints=[{x:r.x,z:r.z+225,y:0},...plats.filter(p=>p.room===r.id).map(p=>({x:p.x,z:p.z,y:p.h})),{x:r.x,z:r.z-225,y:0}];
  }else floors.push(box(r.x,r.z,576,576,-20,0));
  if(r.kind==='vault'&&r.id===5)for(let k=0;k<3;k++)plats.push(box(r.x-120+k*70,r.z-80,70,95,0,28+k*28,{room:r.id}));
  if(r.kind==='fight'||r.kind==='waves')for(const s of [-1,1])plats.push(box(r.x+s*(170+Math.floor(random()*35)),r.z+(random()<.5?-60:60),44,74,0,100,{room:r.id}));
  if(revision>=2&&r.id===6){
   for(let k=0;k<4;k++)plats.push(box(r.x-175+k*100,r.z-170,65,85,0,24+k*24,{room:r.id,cacheStep:true}));
  }
  if(revision>=2&&r.kind==='boss')for(const s of [-1,1])plats.push(box(r.x+s*185,r.z-150,65,65,0,110,{room:r.id}));
  for(const s of [-1,1])decor.push(box(r.x+s*260,r.z-260,24,24,0,r.h,{room:r.id,pillar:true}));
  if(r.kind==='start')for(const s of [-1,1]){
   for(let k=0;k<8;k++)decor.push(box(r.x+s*210,r.z-130+k*28,8,8,0,160,{room:r.id,bar:true}));
   plats.push(box(r.x+s*250,r.z+115,65,80,0,24,{room:r.id}));
   walls.push(box(r.x+s*210,r.z-32,8,204,0,160,{room:r.id,collisionOnly:true}));
  }
 }
 for(const [a,b] of links){const r=rooms[a],q=rooms[b],horizontal=r.x!==q.x,x=(r.x+q.x)/2,z=(r.z+q.z)/2;
  floors.push(box(x,z,horizontal?144:180,horizontal?180:144,-20,0));roofs.push(box(x,z,horizontal?144:204,horizontal?204:144,200,218));
  for(const s of [-1,1])walls.push(box(x+(horizontal?0:s*90),z+(horizontal?s*90:0),horizontal?144:24,horizontal?24:144,0,200));
 }
 const exit={x:rooms[4].x,z:rooms[4].z-170,y:0};
 const bounds={minX:Math.min(...rooms.map(r=>r.x-320)),maxX:Math.max(...rooms.map(r=>r.x+320)),minZ:Math.min(...rooms.map(r=>r.z-320)),maxZ:320};
 return {version:VERSION,revision,exit,bounds,seed,section,tier,rooms,links,walls,floors,plats,roofs,decor,side,title:['Prison cells','The underworks','Escape gate'][section-1]||'Prison'};
}
function roomAt(plan,p){return plan.rooms.find(r=>Math.abs(p.x-r.x)<r.w/2&&Math.abs(p.z-r.z)<r.d/2);}
window.BFPrisonDungeon={VERSION,BASE,offers,upgrades,profile,saves,validCheckpoint,credit,price,buy,layout,roomAt,copy};
})();
