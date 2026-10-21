const fs=require('node:fs'),assert=require('node:assert/strict');
const D=require('../public/3d/campaign-districts.js');
const before=JSON.parse(fs.readFileSync('docs/art-validation/campaign-districts-20261021/before.json','utf8'));
let checks=0;const failures=[];
const ok=(v,m)=>{checks++;if(!v)failures.push(m);};
const clone=v=>JSON.parse(JSON.stringify(v));
const blocked=(o,x,z,y,r=18)=>y<o.h-16&&y+56>(o.y0??-Infinity)&&Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r;
for(const row of before){
 const g=clone(row);g.deco=[];const anchor=JSON.stringify([g.objects,g.npcs,g.chests,g.healpads]),bounds=JSON.stringify(g.bounds);
 ok(D.install(g),'installed '+row.zone+'.'+row.area);
 const p=D.plan(g),added=g.obstacles.filter(o=>o.campaignDistrict);
 ok(JSON.stringify([g.objects,g.npcs,g.chests,g.healpads])===anchor,'quest anchors untouched '+p.id);
 ok(JSON.stringify(g.bounds)===bounds,'map scale retained '+p.id);
 const signature=JSON.stringify([g.deco,added]);ok(!D.install(g)&&signature===JSON.stringify([g.deco,g.obstacles.filter(o=>o.campaignDistrict)]),'idempotent '+p.id);
 const shared=clone(row);shared.returnActive=[];shared.deco=[];shared.personalQuestDone=true;D.install(shared);
 ok(signature===JSON.stringify([shared.deco,shared.obstacles.filter(o=>o.campaignDistrict)]),'personal history cannot change shared layout '+p.id);
 for(const a of [...row.objects,...row.npcs,...row.chests,...row.healpads])ok(!added.some(o=>blocked(o,a.x,a.z,a.y||0,60)),'protected actor '+p.id+' '+(a.key||a.id||a.x+','+a.z));
 for(const e of row.enemies)ok(!added.some(o=>blocked(o,e.x,e.z,e.y||0,28)),'existing enemy spawn clear '+p.id+' '+e.type+' '+e.mid);
 const hits=new Set();
 for(const [name,path]of Object.entries(row.paths)){
  if(!path||p.id==='2.1'&&name==='deadDrain2')continue; // reviewed empty, collapsed branch
  for(let j=1;j<path.length;j++){
   const a=path[j-1],b=path[j];if(!a||!b)continue;
   const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/25));
   for(let i=0;i<=n;i++){
    const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n,y=(a[2]||0)+((b[2]||0)-(a[2]||0))*i/n;
    for(const o of added)if(blocked(o,x,z,y))hits.add(name+' '+(o.districtName||o.shardRoute||'support')+' @'+[Math.round(x),Math.round(z),Math.round(y)]);
   }
  }
 }
 ok(!hits.size,'existing route obstruction '+p.id+': '+[...hits].join('; '));
 const items=D.shards(g,row.shards);
 ok(items.map(o=>o.id).join()===row.shards.map(o=>o.id).join(),'stable shard set/unlocks '+p.id);
 ok(!D.shards(g,[]).length,'locked shards remain absent '+p.id);
 if(p.climb){
  const c=p.climb,end=c.steps.at(-1),item=items.find(o=>o.id===c.id);
  ok(!!item&&item.x===end[0]&&item.z===end[1]&&item.y===end[2],'final shard matches real landing '+p.id);
  let last=c.start;
  for(const q of c.steps){
   ok(q[2]-last[2]>=-40&&q[2]-last[2]<=40,'reasonable upward jump '+p.id);
   ok(Math.hypot(q[0]-last[0],q[1]-last[1])<=205,'reachable jump spacing '+p.id);
   ok(q[0]-q[3]/2>g.bounds.minX&&q[0]+q[3]/2<g.bounds.maxX&&q[1]-q[4]/2>g.bounds.minZ&&q[1]+q[4]/2<g.bounds.maxZ,'landing within world '+p.id);
   ok(added.some(o=>o.kind==='plat'&&o.x===q[0]&&o.z===q[1]&&o.h===q[2]),'landing collision exists '+p.id);
   last=q;
  }
 }
 if(p.search){
  const s=p.search,item=items.find(o=>o.id===s.id);
  ok(item.x===s.end[0]&&item.z===s.end[1]&&item.y===s.end[2],'concealed shard shares actual recess '+p.id);
  for(let j=1;j<s.path.length;j++)for(let i=0;i<=20;i++){
   const a=s.path[j-1],b=s.path[j],x=a[0]+(b[0]-a[0])*i/20,z=a[1]+(b[1]-a[1])*i/20;
   ok(added.some(o=>o.shardSearch&&Math.abs(x-o.x)<=o.w/2&&Math.abs(z-o.z)<=o.d/2),'continuous inspection floor '+p.id);
   ok(!added.some(o=>blocked(o,x,z,a[2])),'clear inspection corridor '+p.id);
  }
 }
 for(const mode of ['hub','side','trial','arena','delve','endless','voyage','bossRush','devBriar','devKeep','bonusActive','sprintFun'])ok(D.plan({...row,[mode]:true})===null,'special mode excluded '+p.id+' '+mode);
}
for(let zone=0;zone<8;zone++)ok(D.plan({zone,area:-1})==null,'boss unchanged '+zone);
if(failures.length)throw Error(failures.join('\n'));
assert.equal(Object.keys(D.plans).length,16);
console.log(checks+' district scale, protected actors, route clearance, shard gates, geometry determinism and scope checks passed.');
