const fs=require('node:fs'),assert=require('node:assert/strict');
const E=require('../public/3d/story-state.js'),A=require('../public/3d/story-authority.js');
const books=fs.readdirSync('public/3d/story').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('public/3d/story/'+f,'utf8')));
const book={npcs:Object.assign({},...books.map(b=>b.npcs)),nodes:Object.assign({},...books.map(b=>b.nodes)),events:Object.assign({},...books.map(b=>b.events))};
let checks=0,id=0;const ok=(value,message)=>{assert(value,message);checks++};
function eligibleState(line,all=false){const s=E.create();if(all)for(const n of Object.values(book.nodes))for(const c of n.choices||[])for(const gate of c.when||[]){if(gate.flag)s.flags[gate.flag]=gate.is;if(gate.item)s.items[gate.item]=Math.max(s.items[gate.item]||0,gate.count||1);if(gate.quest)s.quests[gate.quest]=gate.is;}s.conversation={npc:'test',node:line,trail:[line],topics:[]};return s;}
for(const [line,n]of Object.entries(book.nodes)){
 for(const c of n.choices||[])ok(['main','side','lore'].includes(c.category),line+' categorized');
 for(const all of [false,true]){const s=eligibleState(line,all),v=E.view(s,book);ok(v.choices.filter(c=>!c.end&&c.category==='main').length<=1,line+' one main path');
  for(const c of n.choices||[])if(c.retired){ok(!v.choices.some(x=>x.id===c.id),line+' hides retired reaction');const r=E.transact(s,book,{id:'retired-'+ ++id,type:'choose',line,choice:c.id});ok(!r.changed&&r.state===s,line+' rejects hidden request atomically');}
 }
}
for(const [line,choice,category]of [
 ['briar.thomas.first','protect','main'],['lc.ruth.plan','others','side'],
 ['ih.flint.plan','work','side'],['sl.simon.hello','dragon','side'],
 ['sl.simon.hello','legion','lore'],['pc.grace.wait','garden','side'],
 ['cg.roland.menu','personal','side'],['hall.keeper.welcome','training','lore']]){
 const s=eligibleState(line);for(const g of book.nodes[line].choices.find(c=>c.id===choice).when||[]){if(g.flag)s.flags[g.flag]=g.is;if(g.item)s.items[g.item]=g.count||1;if(g.quest)s.quests[g.quest]=g.is;}const c=E.view(s,book).choices.find(c=>c.id===choice);ok(c?.category===category,line+' preserves '+category+' access');
}
// Repeated main-story reactions cannot re-enter through a forged guest request.
let s=eligibleState('briar.thomas.first');s.conversation.owner='host';
const req={epoch:'current',event:{id:'hidden-peer',type:'choose',line:s.conversation.node,choice:'joke'}};
ok(!A.apply(s,book,req,{epoch:'current',actor:'host',alive:true}).changed,'host cannot invoke retired branch');
req.event.choice='protect';ok(!A.apply(s,book,req,{epoch:'current',actor:'guest',alive:true}).changed,'listener cannot choose');ok(A.apply(s,book,req,{epoch:'current',actor:'host',alive:true}).changed,'speaker can continue');
// Multiple required deliveries remain possible, one primary action at a time.
s=eligibleState('sc.otto.work');Object.assign(s.items,{'sc.rudder':1,'sc.sail':1,'sc.rope':1});
for(const choice of ['deliver.rudder','deliver.sail','deliver.rope']){
 const v=E.view(s,book);ok(v.choices.some(c=>c.id===choice),'next boat part available');
 const r=E.transact(s,book,{id:'delivery-'+ ++id,type:'choose',line:s.conversation.node,choice});ok(r.changed,'boat part commits');s=r.state;
 if(s.conversation){const back=E.view(s,book).choices.find(c=>c.id==='more');if(back)s=E.transact(s,book,{id:'back-'+ ++id,type:'choose',line:s.conversation.node,choice:'more'}).state;}
 if(!s.conversation){s.conversation={npc:'otto',node:'sc.otto.work',trail:['sc.otto.work'],topics:[]};}
}
ok(s.flags['sc.boat.ready'],'all three parts complete boat');
const ui=fs.readFileSync('public/3d/hub-dialogue.js','utf8');ok(!ui.includes('More questions Â· optional'),'no hidden optional dropdown');ok(ui.includes("['main','side','lore']"),'renderer separates three groups');
console.log(checks+' category, single-path, retired-choice authority, side/lore access and sequential delivery checks passed.');
