const assert=require('node:assert/strict'),fs=require('node:fs');
require('../public/3d/return-adventures.js');
const R=require('../public/3d/return-visits.js'),S=require('../public/3d/story-state.js'),A=require('../public/3d/story-authority.js');
const parts=['briar-foundation','return-visits'].map(n=>JSON.parse(fs.readFileSync('public/3d/story/'+n+'.json','utf8')));
const book={npcs:Object.assign({},...parts.map(b=>b.npcs)),nodes:Object.assign({},...parts.map(b=>b.nodes)),events:Object.assign({},...parts.map(b=>b.events))};
let checks=0,serial=0;const ok=(v,m)=>{assert(v,m);checks++;};
for(const [id,q]of Object.entries(R.defs)){
 for(const status of [undefined,'accepted','ready','done']){
  const meta={zoneDone:{},returnVisits:status?{[id]:status}:{}},before=JSON.stringify(meta),rows=R.entries({id:q.npc},meta);
  const row=rows.find(r=>r.id===id);
  ok(row.status===(status||(id==='tracks'?'available':'locked')),id+' status '+status);
  ok(!!R.info({id:q.npc},meta)===(status!=='done'&&(!!status||id==='tracks')),id+' action availability '+status);
  ok(JSON.stringify(meta)===before,id+' inspection cannot mutate saves');
 }
 const meta={zoneDone:{[q.unlockRegion||q.region]:true},returnVisits:{}};
 ok(R.info({id:q.npc},meta)?.status==='available',id+' unlock preserves campaign gate');
 // Resume from a stale accepted/lore cursor using the saved request status.
 for(const [status,node]of [['accepted','wait'],['ready','deliver'],['done','thanks']]){
  meta.returnVisits[id]=status;const s=S.create();s.cursors[q.npc]={npc:q.npc,node:'rv.'+id+'.accepted'};
  R.seedHub(s,meta);ok(s.cursors[q.npc].node==='rv.'+id+'.'+node,id+' refresh '+status);
  let context={epoch:'hub',actor:'host',alive:true,canInteract:true,position:{x:0,z:0,y:0},npcs:[{id:q.npc,x:0,z:0}],objects:[],party:['host','guest']};
  let r=A.apply(s,book,{epoch:'hub',event:{id:'open-'+ ++serial,type:'open',npc:q.npc}},context);
  ok(r.changed&&r.state.conversation.node==='rv.'+id+'.'+node,id+' opens current status');
  const request={epoch:'hub',event:{id:'close-'+ ++serial,type:'close'}};
  ok(!A.apply(r.state,book,request,{...context,actor:'guest'}).changed,id+' observer cannot close speaker quest');
  const closed=A.apply(r.state,book,request,context);ok(closed.changed&&!closed.state.conversation,id+' owner closes before returning to services');
  if(status==='ready'){
   const turnIn=book.nodes[r.state.conversation.node].choices.find(c=>c.turnIn);
   const paid=A.apply(r.state,book,{epoch:'hub',event:{id:'give-'+ ++serial,type:'choose',line:r.state.conversation.node,choice:turnIn.id}},context);
   ok(paid.changed&&paid.state.flags['rv.done.'+id],id+' deliver after stale cursor');
   ok(paid.state.rewards['rv.finish.'+id].recipients.join(',')==='host,guest',id+' shared reward recipients retained');
  }
 }
}
for(const id of ['keeper','drillmaster']){
 ok(R.entries({id},{zoneDone:{},returnVisits:{}}).length===0,id+' has no invented quest');
 ok(!R.info({id},{zoneDone:{},returnVisits:{}}),id+' no false quest marker');
}
for(const [id,q]of Object.entries(R.defs)){
 const guest={zoneDone:{},returnVisits:{[id]:'done'}},host={zoneDone:{[q.unlockRegion||q.region]:true},returnVisits:{[id]:'ready'}},state=R.seedHub(S.create(),host);
 ok(R.info({id:q.npc},guest,state)?.status==='ready',id+' guest sees current host turn-in despite own completed save');
 state.flags['rv.ready.'+id]=false;state.flags['rv.eligible.'+id]=false;
 ok(R.entries({id:q.npc},guest,state)[0].status==='locked',id+' guest cannot advertise own quest in locked host world');
}
console.log(checks+' hub quest status, unlock, stale-cursor, delivery and co-op ownership checks passed.');
