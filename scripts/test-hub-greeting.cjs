const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const original=fs.readFileSync('public/3d/hub-dialogue.js','utf8');
const book=JSON.parse(fs.readFileSync('public/3d/story/hub-dialogue.json','utf8'));
const returns=JSON.parse(fs.readFileSync('public/3d/story/return-visits.json','utf8'));
const cast=JSON.parse(fs.readFileSync('public/3d/npc-voices/manifest.json','utf8')).lines;
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
async function fixture(id,extra={}){
 const nodes={},history=[],clips=[],timers=new Map();let serial=0,services=0,focused='';
 function element(id){return {id,dataset:{},disabled:false,textContent:'',focus(){focused=id;},remove(){this.removed=true;}};}
 const w={__BF3:{controlHint:()=> 'E'}},doc={getElementById:id=>nodes[id],addEventListener(){},body:{classList:{add(){},remove(){}}}};
 // Only replace the layout builder. Greeting, voice, timers, transition and service code remain actual.
 w.renderGreetingTest=html=>{history.push(html);for(const k of Object.keys(nodes))delete nodes[k];nodes.hubDialogue=element('hubDialogue');for(const match of html.matchAll(/id="([^"]+)"/g))nodes[match[1]]=element(match[1]);if(nodes.hubGreetingContinue)nodes.hubGreetingContinue.disabled=true;};
 class Audio{constructor(){clips.push(this);this.pauses=0;this.plays=0;}getAttribute(){return this.src;}play(){this.plays++;this.onplaying?.();return Promise.resolve();}pause(){this.pauses++;this.onpause?.();}removeAttribute(){this.src='';}load(){}}
 const c={window:w,document:doc,Audio,location:{hostname:'game.example',search:''},performance:{now:()=>0},fetch:async()=>({ok:true,json:async()=>JSON.parse(JSON.stringify(book))}),BFVoiceContent:{apply:async b=>{for(const [key,node]of Object.entries(b.nodes))if(cast[key]?.text===node.text)node.recordedAudio=cast[key].audio;return b;}},setTimeout:(fn,ms)=>{timers.set(++serial,{fn,ms});return serial;},clearTimeout:id=>timers.delete(id),cancelAnimationFrame(){},speechSynthesis:{cancel(){}}};
 const source=original.replace(' function shell(content){',' function shell(content){window.renderGreetingTest(content);}\n function realShell(content){');vm.createContext(c);vm.runInContext(source,c);await w.BFHubDialogue.ready;
 const meta={soundOn:true,dialogueVoice:true,dialogueTTS:false,hubDialogue:{[id]:{introduced:true}},...extra},n={id,name:id,role:'Requests',x:0,z:0,questOnly:id==='thomas',open(){services++;}};
 const a={meta,save(){},enter(){},leave(){},openService(){services++;},returnEntries:()=>[],returnInfo:()=>null,eye:()=>null};
 if(id==='thomas'){const key='rv.keepsake.home',node={...returns.nodes[key],recordedAudio:cast[key].audio};a.greeting={id:key,node};}
 return {api:w.BFHubDialogue,meta,n,a,nodes,history,clips,open:()=>w.BFHubDialogue.open(n,a),arm(){for(const [id,t]of [...timers])if(t.ms===250){timers.delete(id);t.fn();}},get services(){return services},get focused(){return focused}};
}
(async()=>{
 for(const id of [...Object.keys(book.npcs),'thomas']){
  const f=await fixture(id);await f.open();
  ok(f.api.active.greeting&&!!f.nodes.hubGreetingContinue,'fresh '+id+' starts at a greeting even on an introduced save');
  ok(!f.history.some(h=>h.includes('id="hubService"')||h.includes('id="hubReturnQuest"')),'no service/quest options flash before '+id+' greeting');
  ok(f.clips.length===1&&f.clips[0].plays===1&&f.api.speaking,'approved '+id+' voice starts before options');
  f.nodes.hubGreetingContinue.onclick();ok(f.api.active.greeting,'initial interaction cannot double-advance');
  f.arm();ok(f.focused==='hubGreetingContinue','continue gets keyboard focus');
  f.nodes.hubGreetingContinue.onclick();ok(!f.api.active.greeting&&!!f.nodes.hubLanding,'continue opens '+id+' options');
  ok(f.clips.length===1&&f.clips[0].plays===1&&f.clips[0].pauses===0,'continue does not cut or restart '+id+' greeting');
  if(id!=='thomas'){f.nodes.hubService.onclick();ok(f.services===1&&!f.api.active,'service opens only after '+id+' greeting');}
  else f.api.close();
  await f.open();ok(f.api.active.greeting,'fresh '+id+' reinteraction greets again');f.api.close();
 }
 const muted=await fixture('anvil',{soundOn:false});await muted.open();muted.arm();muted.nodes.hubGreetingContinue.onclick();ok(!!muted.nodes.hubService&&muted.clips.length===0,'muted greeting never blocks service access');muted.api.close();
 const back=await fixture('anvil');back.a.resumeMenu=true;await back.open();ok(!!back.nodes.hubService&&!back.nodes.hubGreetingContinue&&back.clips.length===0,'explicit shop Back restores options without repeating voice');back.api.close();
 const closed=await fixture('anvil');await closed.open();closed.api.close();closed.arm();ok(!closed.api.active&&closed.clips[0].pauses===1,'leaving during greeting stops voice and cancels delayed Continue');
 const index=fs.readFileSync('public/3d/index.html','utf8'),start=index.indexOf('function hubNpcGreeting(');let requested=0,presented=[],backFromService=null,resumed=0,questOpened=0;
 const g={p:{},storyState:{}},n={id:'anvil',open:back=>backFromService=back},c={G:g,meta:{},MP:{active:true},briarBook:null,inReturnHub:()=>true,briarRequest:()=>questOpened++,BFReturnVisits:{entries:()=>[]},returnHubInfo(){},openReturnRequest(){},persist(){},wsResume:()=>resumed++,BFHubDialogue:{open:(n,a)=>presented.push(a)},window:{BFSocial:{requestTalk:()=>requested++}}};c.BFSocial=c.window.BFSocial;vm.createContext(c);vm.runInContext(index.slice(start,index.indexOf('// Phase 12: the Mirror',start)),c);
 c.openNpcTalk(n,false,true);ok(requested===1&&!presented.length,'co-op shop Back must reacquire conversation ownership');c.openNpcTalk(n,true);ok(presented.at(-1).resumeMenu&&g._hubMenuReturn===null,'grant consumes the explicit Back marker once');
 c.openNpcTalk(n);c.openNpcTalk(n,true);ok(!presented.at(-1).resumeMenu,'fresh co-op interaction cannot inherit a prior Back bypass');
 g._hubMenuReturn='anvil';c.openNpcTalk({id:'keeper'});c.openNpcTalk({id:'keeper'},true);ok(!presented.at(-1).resumeMenu,'different NPC cannot inherit stale return marker');
 c.MP.active=false;c.openNpcTalk(n);presented.at(-1).openService();ok(typeof backFromService==='function','actual shop receives return callback');backFromService();ok(presented.at(-1).resumeMenu,'solo shop Back restores existing options');c.G={p:{},storyState:{}};backFromService();ok(resumed===1,'stale shop Back cannot reopen NPC in a changed world');
 c.G={p:{},storyState:{conversation:{npc:'anvil'}}};c.openNpcTalk(n);ok(questOpened===1,'ongoing shared quest dialogue keeps its authoritative cursor');
 console.log(checks+' hub greeting-first, approved voice, continue, return and cancellation checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
