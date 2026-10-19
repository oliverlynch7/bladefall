/* Additional action phases. Transient audio state only; no actor/save mutations. */
(function(root){'use strict';
const data=root.BFRichSfxData||(typeof require==='function'?require('./rich-sfx-data.js'):null);
const levels={lifecycle:.17,charge:.24,movement:.12,world:.29,state:.25,companion:.18};
const definitions=Object.fromEntries(data.ids.map(row=>[row.id,{f:'custom/rich-actions-20261019/'+row.id+'_v01',v:levels[row.group],lazy:true}]));
const groups=Object.fromEntries(data.ids.map(row=>[row.id,row.group]));
const timers=new Map(data.timed.map(row=>[row.skill,row]));
const moveTypes=new Map(data.movement.flatMap(row=>row.types.map(type=>[type,row.family])));
const petTypes=new Map(data.pets.flatMap(row=>row.types.map(type=>[type,row.family])));
let api=null,world=null,scene=null,last=null,watches=new Map(),moves=new WeakMap(),pets=new WeakMap(),peerPets=new Map(),budget=[],steps=[],variants=new Map(),sent=new Map(),warmAt=-Infinity;
const distance=(a,b)=>Math.hypot(a.x-b.x,((a.y||0)-(b.y||0))*.65,a.z-b.z);
function apply(registry){for(const [id,def]of Object.entries(definitions))if(!Object.hasOwn(registry,id))registry[id]={...def};}
function reset(){world=null;scene=null;last=null;watches.clear();moves=new WeakMap();pets=new WeakMap();peerPets.clear();budget=[];steps=[];variants.clear();sent.clear();warmAt=-Infinity;}
function configure(value){api=value;reset();}
function sceneKey(g){return [g._storyEpoch||'',g.stageIndex??'',g.area??'',g.floor??'',!!g.hub,!!g.trial,g.escape?.id||''].join(':');}
function bind(g){const key=g&&sceneKey(g);if(world!==g||scene!==key){reset();world=g;scene=key;}}
function audible(c){return !!c?.g?.p&&c.mode==='play'&&c.enabled!==false&&!c.hidden&&!c.paused&&!c.g._tutorialSafe;}
function queue(id){if(!definitions[id])return;try{api?.queue(id);}catch{}}
function emit(id,origin,c,at,key=id,cooldown=.4,relay=false){
 if(!definitions[id]||!audible(c)||!origin||!Number.isFinite(at))return false;
 const d=distance(c.g.p,origin),range=groups[id]==='movement'?650:1800;
 if(!Number.isFinite(d)||d>=range)return false;
 const previous=sent.get(key);if(previous!=null&&at-previous<cooldown)return false;
 budget=budget.filter(t=>at-t<.35);steps=steps.filter(t=>at-t<.25);
 if(budget.length>=4||(groups[id]==='movement'&&steps.length>=2))return false;
 sent.set(key,at);budget.push(at);if(groups[id]==='movement')steps.push(at);
 const gain=Math.min(1,Math.max(0,(range-d)/(range*.8)));queue(id);try{api.play(id,gain);if(relay)api.relay?.(id,gain);}catch{return false;}return true;
}
function owner(row,g){return row.actor==='pet'?g.pet:row.actor==='world'?g:g.p;}
function value(row,actor){return actor&&!(row.field==='shieldT'&&!(actor.shieldHp>0))?Math.max(0,Number(actor[row.field])||0):0;}
function track(g,id){
 const row=timers.get(id);if(!row||!api)return;bind(g);const c=api.context();if(c.g!==g||!audible(c))return;
 const actor=owner(row,g);if(!value(row,actor))return;
 const at=api.now?.()??performance.now()/1000;
 watches.set(id,{row,actor,cid:c.cid,next:at+.7});queue('life_'+id+'_active');queue('life_'+id+'_end');
}
function snapshot(c){
 const g=c.g,p=g.p,v=g.voyage;
 return {audible:audible(c),party:!!c.party,down:!!p.downed,spectate:!!p.spectating,warp:p.warpSerial||0,channel:c.channel||null,reviving:c.reviving||null,
  charge:!!p.charging,chargeType:p.weapon?.chg,chargeAmount:p.chargeAmt||0,weapon:p.weapon,
  peers:new Map((c.peers||[]).map(q=>[q.id,{down:!!q.downed,spectate:!!q.spectating,warp:q.tw||0,origin:{x:q.x,y:q.y||0,z:q.z}}])),
  flags:Object.fromEntries(data.world.flatMap(row=>[row.key,...row.aliases].map(key=>['event.'+key,!!g.storyState?.flags?.['event.'+key]]))),props:new Map((g.storyObjects||[]).map(o=>[o.key,{x:o.x,y:o.y||0,z:o.z}])),
  rooms:new Map((g.escape?.plan?.rooms||[]).filter(r=>['fight','waves','boss'].includes(r.kind)).map(r=>[r.id,!!g.escape.states?.[r.id]?.cleared])),
  floorClear:!!g.floorCleared,voyage:v?{ref:v.epoch||v,repaired:!!v.repaired,stage:v.stage}:null};
}
function warm(c){
 const g=c.g,p=g.p;if(!p)return;
 const charge=p.weapon?.chg;if(data.charges.includes(charge)){queue('charge_'+charge+'_start');queue('charge_'+charge+'_ready');}
 // Only nearby relevant sources enter the existing three-decoder lazy queue.
 for(const e of g.enemies||[]){const family=moveTypes.get(e.type);if(!family||e.dead||e.hp<=0||distance(p,e)>=800)continue;for(let i=1;i<=5;i++)queue('move_'+family+'_'+String(family==='human'&&i===1?6:i).padStart(2,'0'));}
 for(const actor of [g.pet,...(c.peers||[]).map(q=>q.pet)]){const family=petTypes.get(actor?.id);if(!family||actor.dead||actor.hp<=0||distance(p,actor)>=1800)continue;queue('care_'+family+'_hurt');queue('care_'+family+'_care');}
 for(const row of data.world){const o=(g.storyObjects||[]).find(o=>o.key===row.key||row.aliases.includes(o.key));if(o&&distance(p,o)<2000)queue(row.id);}
 if(c.party)for(const row of data.ids)if(row.group==='state'&&!/dungeon|ship/.test(row.id))queue(row.id);
 if(g.escape){queue('state_dungeon_room');queue('state_dungeon_floor');}
 if(g.voyage){queue('state_ship_repaired');queue('state_ship_shelter');}
}
function lifecycle(c,at){
 for(const [id,w]of watches){
  if(w.cid!==c.cid||w.actor!==owner(w.row,c.g)||c.g.p.dead||c.g.p.downed){watches.delete(id);continue;}
  if(!value(w.row,w.actor)){emit('life_'+id+'_end',w.row.actor==='pet'?w.actor:c.g.p,c,at,'end:'+id,.5,true);watches.delete(id);continue;}
  if(at>=w.next){emit('life_'+id+'_active',w.row.actor==='pet'?w.actor:c.g.p,c,at,'pulse:'+id,2,true);w.next=at+2.5;}
 }
}
function locomotion(c,at,continuing){
 const p=c.g.p;
 // Nearest six moving bodies only. Budget never delays a contact into a later frame.
 const actors=(c.g.enemies||[]).filter(e=>!e.dead&&e.hp>0&&e.active&&!e.dummy&&moveTypes.has(e.type)&&distance(p,e)<800).sort((a,b)=>distance(p,a)-distance(p,b)).slice(0,6);
 for(const e of actors){const prev=moves.get(e),family=moveTypes.get(e.type),record={x:e.x,y:e.y||0,z:e.z,travel:prev?.travel||0,at:prev?.at??-Infinity};moves.set(e,record);
  if(!prev||!continuing||!e.active)continue;
  const d=Math.hypot(e.x-prev.x,e.z-prev.z),dy=Math.abs((e.y||0)-prev.y);if(!Number.isFinite(d)||d>80||dy>24){record.travel=0;continue;}
  if(!['wing','spectral'].includes(family)&&e.onGround===false){record.travel=0;continue;}
  record.travel+=d;const stride=['stone','hoof','spore'].includes(family)?62:family==='wing'?80:42;
  if(record.travel<stride||at-record.at<.34)continue;record.travel=0;record.at=at;
  const variation=(variants.get(family)||0)%5+1;variants.set(family,variation);
  emit('move_'+family+'_'+String(family==='human'&&variation===1?6:variation).padStart(2,'0'),e,c,at,'move:'+family,.18);
 }
}
function companions(c,at,continuing){
 const peerIds=new Set((c.peers||[]).map(q=>q.id));for(const id of peerPets.keys())if(!peerIds.has(id))peerPets.delete(id);
 for(const {actor,id} of [{actor:c.g.pet},...(c.peers||[]).map(q=>({actor:q.pet,id:q.id}))]){if(!actor)continue;const family=petTypes.get(actor.id);if(!family)continue;
  const saved=id!=null?peerPets.get(id):pets.get(actor),prev=saved?.petId===actor.id?saved:null,hp=Number(actor.hp),max=Number(actor.maxHp),record={petId:actor.id,hp,heal:prev?.heal||0,hurtAt:prev?.hurtAt??-Infinity,careAt:prev?.careAt??-Infinity};if(id!=null)peerPets.set(id,record);else pets.set(actor,record);
  if(!prev||!continuing||actor.dead||hp<=0||!Number.isFinite(hp)||!(max>0)){record.heal=0;continue;}
  if(hp<prev.hp){record.heal=0;if(at-record.hurtAt>=2){if(emit('care_'+family+'_hurt',actor,c,at,'hurt:'+family,1.5))record.hurtAt=at;}}
  else if(hp>prev.hp){record.heal+=hp-prev.hp;if(record.heal>=max*.10&&at-record.careAt>=5){if(emit('care_'+family+'_care',actor,c,at,'care:'+family,3)){record.careAt=at;record.heal=0;}}}
 }
}
function transitions(c,s,prev,at){
 const p=c.g.p;
 if(s.party&&prev.party){
  if(s.down&&!prev.down)emit('state_down',p,c,at);
  if(!s.down&&prev.down&&!s.spectate&&p.hp>0)emit('state_revived',p,c,at);
  if(s.reviving&&!prev.reviving)emit('state_revive_start',p,c,at);
  if(!s.reviving&&prev.reviving&&s.peers.get(prev.reviving)?.down)emit('state_revive_cancel',p,c,at);
  if(s.channel&&!prev.channel)emit('state_travel_start',p,c,at);
  if(!s.channel&&prev.channel)emit(s.warp!==prev.warp?'state_travel_arrive':'state_travel_cancel',p,c,at);
  for(const [id,q]of s.peers){const before=prev.peers.get(id);if(!before){emit('state_peer_join',p,c,at);continue;}
   if(q.down&&!before.down)emit('state_peer_down',q.origin,c,at);
   if(!q.down&&before.down&&!q.spectate)emit('state_peer_revived',q.origin,c,at);
   if(q.spectate&&!before.spectate)emit('state_peer_spectate',q.origin,c,at);
  }
  for(const id of prev.peers.keys())if(!s.peers.has(id))emit('state_peer_leave',p,c,at);
 }
 if(s.floorClear&&!prev.floorClear&&c.g.escape)emit('state_dungeon_floor',p,c,at);
 else for(const [id,cleared]of s.rooms)if(cleared&&prev.rooms.get(id)===false){emit('state_dungeon_room',p,c,at);break;}
 if(s.voyage&&prev.voyage?.ref===s.voyage.ref){if(s.voyage.repaired&&!prev.voyage.repaired)emit('state_ship_repaired',p,c,at);if(s.voyage.stage===2&&prev.voyage.stage!==2)emit('state_ship_shelter',p,c,at);}
}
function tick(at=api?.now?.()??performance.now()/1000){
 if(!api)return;const c=api.context();if(!c?.g?.p){reset();return;}bind(c.g);if(c.enabled!==false&&at-warmAt>=.5){warm(c);warmAt=at;}
 const current=snapshot(c),prev=last;last=current;const continuing=!!prev&&prev.audible&&current.audible;
 locomotion(c,at,continuing);companions(c,at,continuing);
 if(!current.audible){watches.clear();return;}
 if(!continuing)return;
 lifecycle(c,at);
 const charge=current.chargeType;
 if(!c.g.p.dead&&!c.g.p.downed&&data.charges.includes(charge)){
  if(current.charge&&(!prev.charge||prev.chargeType!==charge||prev.weapon!==current.weapon))emit('charge_'+charge+'_start',c.g.p,c,at,'charge-start',.2,true);
  else if(current.charge&&prev.charge&&current.chargeAmount>=1&&prev.chargeAmount<1&&prev.chargeType===charge)emit('charge_'+charge+'_ready',c.g.p,c,at,'charge-ready',.2,true);
 }
 for(const row of data.world){const keys=[row.key,...row.aliases];for(const key of keys)if(current.flags['event.'+key]&&!prev.flags['event.'+key]){emit(row.id,current.props.get(key)||prev.props.get(key),c,at,row.id,1);break;}}
 transitions(c,current,prev,at);
}
const valueApi={data,definitions,ids:Object.keys(definitions),apply,configure,reset,track,tick,emit,audible,snapshot};root.BFRichSfx=valueApi;if(typeof module!=='undefined')module.exports=valueApi;
})(typeof window!=='undefined'?window:globalThis);
