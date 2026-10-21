/* Authored campaign districts. Never moves a quest actor or rewrites saved flags. */
(function(root){'use strict';
const plans=root.BFCampaignDistrictPlans||(typeof require==='function'?require('./campaign-district-data.js'):{});
const excluded=['hub','trial','side','endless','delve','arena','voyage','bonusActive','sprintFun','devBriar','devKeep','bossRush'];
function plan(g){return g&&!excluded.some(k=>g[k])?plans[g.zone+'.'+g.area]:null;}
function footprint(b){const scale=b.model==='bank'?.52:['cliff','ice'].includes(b.model)?.85:1;return {x:b.x,z:b.z,w:b.w*scale,d:b.d*scale,y0:b.y,h:b.y+b.height*(b.model==='bank'?.35:1)};}
function install(g){
 const p=plan(g);if(!p||g.campaignDistrict?.id===p.id)return false;
 g.campaignDistrict={id:p.id,revision:2357,title:p.title};
 const craft=(id,model,x,z,y,w,h,d,extra={})=>{const {rot=0,...options}=extra;g.deco.push({kind:'craft',craftId:'district-'+p.id+'-'+id,model,x,z,y0:y,w,h,d,rot,options:{w,h,d,fullHeight:true,surfaceDetail:'painted',...options},campaignDistrict:true});};
 for(const boundary of p.boundaries||[]){
  const replaces=s=>(boundary.replace||[]).some(prefix=>s?.startsWith(prefix));
  g.walls=g.walls.filter(o=>!replaces(o.geography));
  g.obstacles=g.obstacles.filter(o=>!replaces(o.geography));
  g.deco=g.deco.filter(o=>!replaces(o.geographyFallback)&&!replaces(o.craftId?.replace(/^geo-/,'')));
  if(g.geography)g.geography.features=g.geography.features.filter(o=>!replaces(o.id));
  const trees=boundary.trees?g.deco.filter(o=>o.kind==='tree'&&o.c==='#47764b'&&o.w===155&&o.d===155&&o.h===125):[];
  if(boundary.trees)g.deco=g.deco.filter(o=>!trees.includes(o));
  const ps=boundary.points,last=boundary.closed===false?ps.length-1:ps.length;
  let ti=0;
  for(let j=0;j<last;j++){
   if(boundary.openEdges?.includes(j))continue;
   const a=ps[j],b=ps[(j+1)%ps.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),along=a[0]!==b[0],count=Math.ceil(length/400);
   if(a[0]!==b[0]&&a[1]!==b[1])throw Error('District edge must be cardinal '+boundary.id);
   for(let i=0;i<count;i++){
    const t=(i+.5)/count,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,w=along?length/count:boundary.thickness,d=along?boundary.thickness:length/count;
    g.obstacles.push({kind:'col',x,z,y0:boundary.y,w,d,h:boundary.y+boundary.height,invisible:true,campaignDistrict:true,districtBoundary:boundary.id});
    craft(boundary.id+'-'+j+'-'+i,boundary.model,x,z,boundary.y,w,boundary.height,d,{grass:!!boundary.grass});
   }
   if(boundary.trees){const n=Math.ceil(length/240);for(let i=0;i<n;i++){
    const t=(i+.5)/n,tree=trees[ti++%Math.max(1,trees.length)]||{kind:'tree',lead:true,w:155,d:155,h:125,c:'#47764b',theme:'forest',trunkH:230,y0:390};
    g.deco.push({...tree,x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,campaignDistrict:true});
   }}
  }
 }
 for(const [i,b]of p.blocks.entries()){
  g.obstacles.push({kind:'col',...footprint(b),invisible:true,campaignDistrict:true,districtName:b.name});
  if(b.model==='bookshelf'&&b.d>b.w)craft('body-'+i,b.model,b.x,b.z,b.y,b.d,b.height,b.w,{rot:-Math.PI/2});
  else craft('body-'+i,b.model,b.x,b.z,b.y,b.w,b.height,b.d,{grass:b.model==='bank'});
  if(p.gardenWalls&&b.model==='bank')for(const vertical of [false,true])for(const side of [-1,1]){
   const length=vertical?b.d:b.w,x=b.x+(vertical?side*b.w/2:0),z=b.z+(vertical?0:side*b.d/2),n=1;
   g.obstacles.push({kind:'col',x,z,y0:b.y,w:vertical?18:length,d:vertical?length:18,h:b.y+85,invisible:true,campaignDistrict:true,districtGarden:b.name});
   for(let k=0;k<n;k++){const t=(k+.5)/n-.5;craft('garden-'+i+'-'+vertical+'-'+side+'-'+k,'wall',x+(vertical?0:t*length),z+(vertical?t*length:0),b.y,length/n,85,22,{rot:vertical?Math.PI/2:0});}
  }
 }
 const c=p.climb;
 if(c)for(const [i,q]of c.steps.entries()){
  const [x,z,y,w,d]=q,natural=['shelf','ice'].includes(c.model)&&c.support!=='piers',timber=c.model==='trunk';
  g.obstacles.push({kind:'plat',x,z,w,d,h:y,y0:natural?c.base:y-20,slab:natural?y-c.base:20,checkpoint:i===c.steps.length-1,campaignDistrict:true,shardRoute:c.id,invisible:true});
  if(natural)craft('ledge-'+i,c.model,x,z,c.base,w,y-c.base,d);
  else if(timber){
   // Existing braced timber kit: the landing top and collision are identical.
   craft('ledge-'+i,'perch',x,z,y,w,Math.max(12,y-c.base-12),d,{rails:false});
   for(const sx of [-1,1])for(const sz of [-1,1])g.obstacles.push({kind:'col',x:x+sx*w*.39,z:z+sz*d*.38,y0:c.base,w:10,d:10,h:y-16,invisible:true,campaignDistrict:true,shardSupport:true});
  }else{
   // Masonry coping on a load-bearing pier, rather than hovering timber tiles.
   const [px,pz]=c.pierOffsets?.[i]||[0,0];
   craft('ledge-'+i,['ice','shelf'].includes(c.model)?c.model:'wall',x,z,y-20,w,20,d);
   craft('pier-'+i,'buttress',x+px,z+pz,c.base,w*.5,y-c.base-20,d*.55);
   g.obstacles.push({kind:'col',x:x+px,z:z+pz,y0:c.base,w:w*.22,d:d*.45,h:y-21,invisible:true,campaignDistrict:true,shardSupport:true});
  }
 }
 if(p.search){
  const s=p.search;
  // Three fitted, non-overlapping masonry strips. No coplanar tiled overlap.
  const [a,b,c,d]=s.path,tiles=[
   {x:a[0],z:(a[1]+b[1])/2,w:s.width,d:Math.abs(b[1]-a[1])+s.width},
   {x:(b[0]+c[0])/2,z:b[1],w:Math.abs(c[0]-b[0])-s.width,d:s.width},
   {x:c[0],z:(c[1]+d[1])/2,w:s.width,d:Math.abs(d[1]-c[1])+s.width}
  ];
  for(const [i,t]of tiles.entries()){
   const y=a[2];g.obstacles.push({kind:'plat',...t,h:y,y0:y-26,slab:26,checkpoint:true,campaignDistrict:true,shardSearch:s.id,invisible:true});
   // Small surface offset also clears the old corridor's threshold tiles.
   craft('inspection-floor-'+i,'wall',t.x,t.z,y-25.7,t.w,26,t.d);
  }
 }
 g._obsDirty=true;return true;
}
function shards(g,items){const p=plan(g),c=p?.climb||p?.search;if(!c||g.campaignDistrict?.id!==p.id)return items;const q=c.end||c.steps.at(-1);return items.map(o=>o.id===c.id?{...o,x:q[0],z:q[1],y:q[2]}:o);}
const api={plans,plan,footprint,install,shards};root.BFCampaignDistricts=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
