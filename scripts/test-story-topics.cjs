const fs=require('fs'),assert=require('assert'),E=require('../public/3d/story-state.js');let serial=0;
const books=fs.readdirSync('public/3d/story').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('public/3d/story/'+f,'utf8')));
const book={npcs:Object.assign({},...books.map(b=>b.npcs)),nodes:Object.assign({},...books.map(b=>b.nodes)),events:Object.assign({},...books.map(b=>b.events))};
function act(s,type,fields){return E.transact(s,book,{id:'topics-'+(++serial),type,...fields}).state;}
// Every marked menu can be recovered from a completed branch, including old saves without history.
let count=0;
for(const [id,n]of Object.entries(book.nodes).filter(([,n])=>n.topicMenu)){
 const owner=Object.keys(book.npcs).find(npc=>{let todo=[book.npcs[npc].start],seen=new Set();while(todo.length){const k=todo.shift();if(k===id)return true;if(seen.has(k))continue;seen.add(k);todo.push(...(book.nodes[k]?.choices||[]).map(c=>c.next));}return false;});
 assert(owner,id+' owner');const child=n.choices.find(c=>c.next!==id);if(!child)continue;
 let s=E.create();for(const c of child.when||[]){if(c.flag)s.flags[c.flag]=c.is;if(c.item)s.items[c.item]=c.count||1;if(c.quest)s.quests[c.quest]=c.is;}s.conversation={npc:owner,node:child.next,trail:[id,child.next],topics:[id]};
 const snapshot=JSON.stringify([s.flags,s.quests,s.items,s.rewards]);s=act(s,'choose',{line:child.next,choice:'__topics'});assert.equal(s.conversation.node,id);assert.equal(snapshot,JSON.stringify([s.flags,s.quests,s.items,s.rewards]),'navigation executes no effects');
 s=E.create();s.cursors[owner]={node:child.next,trail:[id,child.next]};for(const c of book.npcs[owner].when||[])if(c.flag)s.flags[c.flag]=c.is;
 s=act(s,'open',{npc:owner});assert(s.conversation,owner+' open');assert(s.conversation.topics.length,id+' legacy cursor topic access');count++;
}
let s=E.create();s.cursors.simon={node:'sl.simon.hint'};s=act(s,'open',{npc:'simon'});s=act(s,'choose',{line:s.conversation.node,choice:'__topics'});assert(E.view(s,book).choices.some(c=>c.id==='dragon'));s=act(s,'choose',{line:s.conversation.node,choice:'dragon'});assert(s.flags['dr.known']);
s=E.create();s.flags['cg.refused']=true;s.cursors.roland={node:'cg.roland.refused'};s=act(s,'open',{npc:'roland'});s=act(s,'choose',{line:s.conversation.node,choice:'__topics'});assert(!E.view(s,book).choices.some(c=>c.id==='personal'),'refusal remains respected');
s=E.create();s=act(s,'open',{npc:'thomas'});const before=JSON.stringify(s);s=act(s,'choose',{line:s.conversation.node,choice:'__topics'});assert.equal(JSON.stringify(s),before,'cannot invent a topic target');
console.log(count+' topic menus: legacy cursor recovery, effect-free navigation, Simon side quest after core dialogue, refusal guard and forged navigation passed.');
