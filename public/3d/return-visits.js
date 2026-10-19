/* Save-local return requests; the host selects the shared field tasks. */
(function(root){'use strict';
const defs={...root.BFReturnAdventures.defs,
  pattern:{npc:'anvil',zone:4,region:'ember',area:0,title:'Tools for Tomorrow',where:'Emberdeep · Iron Halls',hint:'Search the western stores. Cool the pattern box before releasing its clamp.',gold:450,upgrade:'returnForge'},
  supplies:{npc:'quartermaster',zone:2,region:'keep',area:0,title:'Food for the Refuge',where:'Ruined Keep · Broken Walls',hint:'Search the western sealed chamber. Climb its service ledges and free the hoist brake.',gold:300,upgrade:'returnSupplies'}
};
const SUPPLY_CLUE='The food basket hangs over the far side of this room. Its brake is jammed above the west wall. Climb the service ledges, free the brake, then collect the load below.';
// A staggered maintenance route, separate from the chamber shield and the RK-02 shard.
const supplyLedges=[
  {x:-1815,z:-3480,h:112,w:150,d:115},
  {x:-1780,z:-3605,h:151,w:112,d:112},
  {x:-1870,z:-3690,h:196,w:110,d:114},
  {x:-1785,z:-3815,h:244,w:132,d:112}
];
function normalize(v){const out={};for(const id of Object.keys(defs))if(['accepted','ready','done'].includes(v?.[id]))out[id]=v[id];return out;}
function info(n,meta){const pair=Object.entries(defs).find(([id,q])=>q.npc===n.id&&(root.BFReturnAdventures.eligible(q,meta)||meta.returnVisits?.[id])&&meta.returnVisits?.[id]!=='done');if(!pair)return null;const [id,q]=pair,status=meta.returnVisits?.[id];return {id,...q,status,label:status==='ready'?(q.report?'Report: ':'Deliver: ')+q.title:status==='accepted'?'About: '+q.title:'New request: '+q.title,fresh:status!=='accepted'};}
function seedHub(s,meta){for(const [id,q]of Object.entries(defs)){s.flags['rv.eligible.'+id]=!!(root.BFReturnAdventures.eligible(q,meta)||meta.returnVisits?.[id]);for(const flag of ['accepted','ready','done'])s.flags['rv.'+flag+'.'+id]=meta.returnVisits?.[id]===flag;s.cursors[q.npc]=meta.returnVisits?.[id]?{npc:q.npc,node:'rv.'+id+'.'+(meta.returnVisits[id]==='accepted'?'wait':meta.returnVisits?.[id]==='ready'?'deliver':'thanks'),lastChoice:''}:{npc:q.npc,node:'rv.'+id+'.offer',lastChoice:''};}return s;}
function active(G,meta){return Object.keys(defs).filter(id=>{const q=defs[id];return G.zone===q.zone&&G.area===q.area&&meta.returnVisits?.[id]==='accepted';});}
function fieldObjects(ids){const o=(key,label,x,z,y,kind)=>({key,label,x,z,y,kind,returnObject:true});let out=[];
  if(ids.includes('pattern'))out.push(o('rv.pattern.note','Read the pattern box plate',-1740,-2440,160,'note'),o('rv.pattern.cool','Turn the cooling wheel',-1990,-2580,160,'wheel'),o('rv.pattern.clamp','Release the cooled clamp',-2050,-2790,160,'clamp'),o('rv.pattern.take','Take the forge pattern',-2050,-2890,160,'pattern'));
  if(ids.includes('supplies'))out.push(o('rv.supplies.note','Read the hoist repair plate',-1360,-3420,80,'note'),o('rv.supplies.release','Free the jammed hoist brake',-1735,-3815,244,'brake'),o('rv.supplies.take','Collect the lowered supplies',-1630,-3800,80,'supplies'));
  return out.concat(root.BFReturnAdventures.objects(ids));
}
function available(key,s){if(!root.BFReturnAdventures.available(key,s))return false;if(key==='rv.pattern.clamp')return !!s.flags['rv.pattern.cool'];if(key==='rv.pattern.take')return !!s.flags['rv.pattern.clamp'];if(key==='rv.supplies.release')return !s.flags['rv.supplies.balance.open'];if(key==='rv.supplies.take')return !!s.flags['rv.supplies.balance.open'];return true;}
function tasks(G,meta,s){return Object.entries(defs).filter(([id,q])=>(meta.returnVisits?.[id]||G.returnActive?.includes(id))&&meta.returnVisits?.[id]!=='done'&&(G.hub||G.zone===q.zone&&G.area===q.area)).map(([id,q])=>({title:q.title,progress:meta.returnVisits?.[id]==='ready'?'Return to '+(q.giver||(id==='pattern'?'the Smith':'the Quartermaster'))+' in the Waystation':s.flags['rv.collected.'+id]?'Return to the Waystation — recovery saved':id==='supplies'&&s.flags['rv.supplies.balance.open']?'Food basket lowered — collect it on the chamber floor':q.where+' — '+q.hint,done:false}));}
function sync({G,s,meta,plat}){
  if(!G.keep)return;
  const recovered=['ready','done'].includes(meta?.returnVisits?.supplies);
  const opened=!!s.flags['rv.supplies.balance.open']||recovered;
  if(!G.returnSupply){
    G.returnSupply={open:opened,collected:recovered,openedAt:opened?-Infinity:null,ledges:[]};
    for(const q of supplyLedges){const p=plat(q.x,q.z,q.h,q.w,q.d,{slab:16,checkpoint:true,returnSupplyLedge:true});G.returnSupply.ledges.push(p);}
  }else if(opened&&!G.returnSupply.open)G.returnSupply.openedAt=G.time;
  G.returnSupply.open=opened;
  G.returnSupply.collected=recovered||!!s.flags['event.rv.supplies.take'];
  // A clue collected in an earlier build must not keep teaching the retired weight sum.
  if(s.notes['rv.supplies.clue']&&s.notes['rv.supplies.clue'].text!==SUPPLY_CLUE)s.notes['rv.supplies.clue'].text=SUPPLY_CLUE;
}
function drawSupplyHoist({G,bx,ring}){
  const rig=G.returnSupply;if(!rig)return;
  const f=G.storyState?.flags||{},p=rig.open?Math.min(1,Math.max(0,(G.time-rig.openedAt)/1.4)):0;
  const beam=(x,y,z,w,h,d,c)=>bx(x,y,z,w,h,d,c,null,1);
  for(const q of rig.ledges){
    beam(q.x,q.h+1,q.z,q.w-12,3,q.d-12,'#a98b5f');
    for(const dx of [-q.w/2+5,q.w/2-5])beam(q.x+dx,q.h-8,q.z,9,14,q.d,'#5e4d3a');
    for(const dz of [-q.d/2+5,q.d/2-5])beam(q.x,q.h-8,q.z+dz,q.w,14,8,'#6e563b');
    for(const dx of [-q.w/2+16,q.w/2-16])beam(q.x+dx,(80+q.h-16)/2,q.z,8,q.h-80-16,8,'#765c42');
  }
  const cx=-1630,cz=-3800,ky=220-114*p,wy=140+112*p;
  for(const x of [cx-104,cx+104])beam(x,196,cz,12,232,15,'#625347');
  beam(cx,316,cz,238,14,23,'#b39a70');
  for(const x of [cx-72,cx+72]){beam(x,303,cz,20,22,25,'#cfb584');beam(x,(300+ky+27)/2,cz,4,300-ky-27,4,'#d7c797');}
  // Lowering the food raises the opposite weight. The floor mark shows the destination.
  ring(cx,82,cz,94,rig.open?'#c7db9d':'#a58b5f',.52);
  beam(-1820,314,cz,10,12,145,'#927750');
  beam(-1820,(300+wy)/2,cz-105,4,300-wy,4,'#c4b78a');
  beam(-1820,wy,cz-105,56,58,54,'#5a6062');
  beam(-1820,wy+34,cz-105,62,9,57,'#c1ab7b');
  if(!rig.collected&&!f['event.rv.supplies.take']){
    beam(cx,ky-25,cz,166,14,116,'#795c40');
    for(const dx of [-80,80])beam(cx+dx,ky,cz,10,56,118,'#805e3d');
    for(const dz of [-53,53])beam(cx,ky,cz+dz,164,55,10,'#7a5a3d');
    for(const dx of [-46,40]){beam(cx+dx,ky+4,cz,66,44,70,'#c9b387');beam(cx+dx,ky+29,cz,70,6,73,'#e0cf9c');}
  }
  // Brake handle stays visible before acceptance as environmental context.
  if(!root.BFCampaignObjects?.drawn(G.storyObjects.find(o=>o.key==='rv.supplies.release'))){
  beam(-1735,265,-3815,52,38,48,'#5d5549');
  beam(-1735,288,-3815,44,9,40,rig.open?'#b7c89e':'#b19b73');
  beam(-1715,298,-3815,8,41,9,'#dac290');
  }
}
function draw({G,bx,ring},t){if(!G?.storyObjects)return;drawSupplyHoist({G,bx,ring});const s=G.storyState;for(const o of G.storyObjects.filter(o=>o.returnObject)){if(root.BFCampaignObjects?.drawn(o))continue;
  if(o.returnAdventure){root.BFReturnAdventures.draw(o,{G,bx,ring},t);continue;}
  const taken=s?.flags['event.'+o.key],c=taken?'#615d55':'#dfb771',y=o.y+8;
  if(o.kind==='supplies'||o.kind==='brake')continue;
  if(o.kind==='note'){bx(o.x,y+25,o.z,58,8,40,'#d6c59e',null,1);continue;}
  if(o.kind==='pattern'){if(taken)continue;bx(o.x,y+24,o.z,92,45,64,'#34373b',null,1);bx(o.x,y+49,o.z,68,5,42,'#b09561',null,1);continue;}
  bx(o.x,y+28,o.z,22,56,22,'#66554a',null,1);ring(o.x,y+58,o.z,30,c,1);
}}
const api={defs,normalize,info,seedHub,active,fieldObjects,available,tasks,sync,draw,supplyLedges,SUPPLY_CLUE};root.BFReturnVisits=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
