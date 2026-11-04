const fs=require('node:fs'),assert=require('node:assert/strict');
const H=require('../public/3d/campaign-hunts.js'),Q=require('../public/3d/quest-panels.js');
const books=fs.readdirSync('public/3d/story').filter(n=>n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync('public/3d/story/'+n,'utf8')));
const book={nodes:Object.assign({},...books.map(b=>b.nodes)),npcs:Object.assign({},...books.map(b=>b.npcs))};
const cast=JSON.parse(fs.readFileSync('public/3d/npc-voices/manifest.json','utf8'));
let checks=0;function ok(v,m){assert(v,m);checks++;}
for(const d of H.definitions){
 const lineId=book.npcs[d.npc].start,node=book.nodes[lineId],input={npc:d.npc,lineId,text:node.text,choices:[]};
 const g={zone:d.zone,area:d.area,patrolWork:{contract:{...d,target:'Test enemy',place:'Test camp'}},storyNpcs:[]};
 for(const phase of ['offer','active','ready']){
  const state={quests:phase==='offer'?{}:{[d.id]:'active'},items:{[d.id]:phase==='ready'?d.total:2}};
  const view=H.decorate(g,state,input,book),panel=view.questPanels[0];
  ok(view.text===node.text,'quest facts never alter spoken wording '+d.npc+' '+phase);
  ok(panel.gold===d.gold&&panel.xp===d.xp,'rewards match contract '+d.npc);
  ok(panel.status===phase&&!!panel.objective&&!!panel.where,'clear phase and task '+d.npc);
 }
}
const gus='briar.gus.first',node=book.nodes[gus];
ok(cast.lines[gus].option==='C'&&cast.lines[gus].text===node.text,'Gus still uses approved C take with exact live wording');
ok(fs.existsSync('public/3d/'+cast.lines[gus].audio.slice(2)),'Gus recording exists');
for(const q of Q.requests)for(const id of q.lines)ok(!!book.nodes[id],'panel is attached to a real authored line '+id);
let state={quests:{'briar.gus.tools':'active'},items:{gus_tools:1}};
const original={lineId:'briar.gus.waiting',text:book.nodes['briar.gus.waiting'].text,choices:[{id:'deliver'}]};
const v=Q.decorate({},state,original);
ok(v.text===original.text&&v.choices===original.choices,'presentation preserves voice and actual turn-in choices');
ok(v.questPanels[0].status==='ready'&&v.questPanels[0].rewards.includes('1 Rift Shard'),'Gus hand-in shows actual reward and readiness');
state.quests['briar.gus.tools']='closed';ok(!Q.decorate({},state,original).questPanels,'closed request cannot look available');
global.BFReturnVisits={defs:{pattern:{title:'Tools for Tomorrow',hint:'Recover the pattern.',where:'Iron Halls',gold:450,npc:'anvil'}}};
const r=Q.decorate({storyNpcs:[{id:'anvil',name:'The Smith'}]},{flags:{'rv.ready.pattern':true}},{lineId:'rv.pattern.deliver',text:'That is the pattern.'});
ok(r.questPanels[0].status==='ready'&&r.questPanels[0].gold===450,'return quest uses authoritative definition and shared readiness');
const html=Q.render([{title:'<img onerror=bad>',status:'offer',objective:'Kill <script>bad</script>',gold:120,xp:160,rewards:['1 Rift Shard']}]);
ok(!html.includes('<script>')&&!html.includes('<img onerror'),'untrusted labels escaped');
ok(html.includes('quest-reward-gold')&&html.includes('120 gold')&&html.includes('quest-reward-xp')&&html.includes('160 XP'),'gold and XP have independent labeled styling');
ok(!Q.render([{title:'No payout',gold:0,xp:0}]).includes('quest-facts-rewards'),'zero rewards not invented');
ok(Q.render(null)==='','ordinary lore has no quest card');
console.log(checks+' quest speech separation, current cast, objective/reward and shared state checks passed.');
