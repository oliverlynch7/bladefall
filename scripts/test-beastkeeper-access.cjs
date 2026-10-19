const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
require('../public/3d/return-adventures.js');const R=require('../public/3d/return-visits.js'),S=require('../public/3d/story-state.js');
const book=JSON.parse(fs.readFileSync('public/3d/story/return-visits.json','utf8'));
for(const status of [undefined,'accepted','ready','done']){
 const meta={zoneDone:{},returnVisits:status?{tracks:status}:{}};
 const info=R.info({id:'beastkeeper'},meta);assert.equal(!!info,status!=='done');
 if(status==='done')continue;
 let state=R.seedHub(S.create(),meta);state=S.transact(state,book,{id:'open',type:'open',npc:'beastkeeper'}).state;
 assert.equal(state.conversation.node,'rv.tracks.'+(status==='ready'?'deliver':status==='accepted'?'wait':'offer'));
 if(status!=='accepted'){
  const choice=status==='ready'?'give':'help';state=S.transact(state,book,{id:'choose',type:'choose',line:state.conversation.node,choice}).state;
  assert(state.rewards[status==='ready'?'rv.finish.tracks':'rv.accept.tracks']);
 }
}
(async()=>{
 const code=fs.readFileSync('public/3d/hub-dialogue.js','utf8');let calls=0,fail=true;
 const ctx={book:null,fetch:async()=>{calls++;if(fail)throw Error('offline');return {ok:true,json:async()=>({npcs:{beastkeeper:{}},nodes:{}})};},BFVoiceContent:{apply:async b=>b},setTimeout:f=>{f();}};
 vm.createContext(ctx);vm.runInContext(code.slice(code.indexOf(' let loading=null;'),code.indexOf(' const ready=loadBook();'))+';this.loadBook=loadBook;',ctx);
 assert.equal(await ctx.loadBook(),null);assert.equal(calls,3);
 fail=false;assert((await ctx.loadBook()).npcs.beastkeeper);assert.equal(calls,4);
 await ctx.loadBook();assert.equal(calls,4);
 assert(code.includes("known:id=>!!book?.npcs[id]||['quartermaster','anvil','keeper','drillmaster','beastkeeper'].includes(id)"));
 const game=fs.readFileSync('public/3d/index.html','utf8');assert(game.includes('id="beastQuest"'));assert(game.includes("if(G!==beastWorld||!inReturnHub())return;showOverlay(false);openReturnRequest(beastNpc)"));
 console.log('Beastkeeper offer/accepted/ready/done, reward routing, failed-load recovery/cache and shop action checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
