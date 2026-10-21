const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
const source=fs.readFileSync('public/3d/hub-dialogue.js','utf8').replace('window.BFHubDialogue={','window.BFHubDialogue={_set:n=>active=n,_play:playVoice,_prime:primeVoice,_arm:n=>timer=n,');
async function fixture(captureLine=false){
 const nodes={hubVoiceStatus:{textContent:''},hubVoiceReplay:{textContent:''}},clips=[],spoken=[],cancelled=[],timers=new Map(),cleared=[];let serial=0,mediaMode='ok',attachment=async b=>b,prepared=async()=>({});
 class Audio{constructor(src){this.src=src;this.pauses=0;this.plays=0;clips.push(this);}play(){this.plays++;if(mediaMode==='blocked')return Promise.reject(Object.assign(Error('gesture required'),{name:'NotAllowedError'}));this.onplaying?.();return Promise.resolve();}pause(){this.pauses++;this.onpause?.();}removeAttribute(){this.src='';}load(){}}
 const w={},c={window:w,document:{getElementById:id=>nodes[id],addEventListener(){}},location:{hostname:'game.example',search:''},Audio,fetch:async()=>({ok:true,json:async()=>({npcs:{},nodes:{}})}),BFVoiceContent:{apply:b=>attachment(b)},BFDialogueSpeech:{prepare:()=>prepared()},speechSynthesis:{speak:u=>{spoken.push(u);u.onstart?.();},cancel:()=>cancelled.push(true)},setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>{cleared.push(id);timers.delete(id);},cancelAnimationFrame(){},performance:{now:()=>0}};
 vm.createContext(c);vm.runInContext(captureLine?source.replace(" function showLine("," function showLine(...args){window.capturedLine=args[1];}\n function originalShowLine("):source,c);const api=w.BFHubDialogue;await api.ready;
 const meta={soundOn:true,sfxVol:.1,dialogueVoice:true,dialogueTTS:true},owner={n:{id:'thomas'},a:{meta}};api._set(owner);
 return {api,c,meta,nodes,clips,spoken,cancelled,cleared,owner,set mode(v){mediaMode=v},set attachment(fn){attachment=fn},set prepared(fn){prepared=fn}};
}
const flush=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
const line=()=>({text:'The road is open.',recordedAudio:'./npc-voices/test.mp3',voice:{speaker:'thomas'}});
(async()=>{
 let f=await fixture();ok(f.api.voiceVolume(f.meta)===.85,'NPC default does not inherit quiet effects');
 for(const [v,want]of [[0,0],[.4,.4],[2,1],[-1,0],['bad',.85]])ok(f.api.voiceVolume({dialogueVol:v})===want,'bounded independent volume '+v);
 f.api._play('test',line());await flush();ok(f.clips.length===1&&f.clips[0].volume===.85&&f.api.speaking,'one recorded take at voice volume');
 ok(f.spoken.length===0&&f.nodes.hubVoiceStatus.textContent==='Recorded voice','recording preferred with visible status');
 const first=f.clips[0];first.onwaiting();ok(!f.api.speaking,'buffering stops mouth');first.onplaying();first.onended();ok(!f.api.speaking&&f.nodes.hubVoiceStatus.textContent.includes('finished'),'end stops mouth and enables replay');
 f.api._arm(9000);f.api._play('test',line());await flush();ok(first.pauses===1&&f.clips.length===1&&first.plays===2,'replay stops old take and reuses unlocked element');ok(!f.cleared.includes(9000),'replay cannot cancel response-button arming timer');
 for(const mode of ['master','localhost','query','volume']){
  f=await fixture();if(mode==='master')f.meta.soundOn=false;if(mode==='localhost')f.c.location.hostname='127.0.0.1';if(mode==='query')f.c.location.search='?mute=1';if(mode==='volume')f.meta.dialogueVol=0;
  f.api._play('test',line());await flush();ok(f.clips.length===0&&f.spoken.length===0,'mute respected '+mode);ok(f.nodes.hubVoiceStatus.textContent.length>0,'mute is explained '+mode);
 }
 f=await fixture();f.mode='blocked';f.api._play('test',line());await flush();ok(f.nodes.hubVoiceStatus.textContent.includes('Press Play voice')&&f.spoken.length===0&&!f.api.speaking,'blocked autoplay invites a gesture without switching actors');
 f.mode='ok';f.api._play('test',line());await flush();ok(f.clips.length===1&&f.clips[0].plays===2&&f.api.speaking,'manual replay recovers blocked audio');
 f=await fixture();f.api._play('test',line());await flush();const failed=f.clips[0].onerror;failed();failed();await flush();ok(f.spoken.length===1,'media failure falls back once');f.spoken[0].onend();ok(!f.api.speaking,'fallback ends mouth animation');
 f=await fixture();f.meta.dialogueTTS=false;f.api._play('test',line());await flush();f.clips[0].onerror();await flush();ok(f.spoken.length===0&&f.nodes.hubVoiceStatus.textContent.includes('unavailable'),'disabled fallback stays silent and explains failure');
 f=await fixture();f.attachment=async b=>{b.nodes.test.recordedAudio='./npc-voices/recovered.mp3';return b};f.api._play('test',{text:'The road is open.',voice:{speaker:'thomas'}});await flush();ok(f.clips[0]?.src.includes('recovered'),'late manifest recovery attaches a cached-book line');
 f=await fixture();let finish;f.attachment=b=>new Promise(r=>finish=()=>{b.nodes.test.recordedAudio='./npc-voices/late.mp3';r(b)});f.api._play('test',{text:'Wait.',voice:{speaker:'thomas'}});f.api._set(null);finish();await flush();ok(f.clips.length===0&&f.spoken.length===0,'leaving cancels a pending attachment');
 f=await fixture();let resolveSpeech;f.meta.dialogueVoice=false;f.prepared=()=>new Promise(r=>resolveSpeech=r);f.api._play('old',line());f.meta.dialogueVoice=true;f.api._play('new',line());resolveSpeech({});await flush();ok(f.spoken.length===0&&f.clips.length===1,'rapid next cancels stale device speech');
 f=await fixture();f.api._set(null);f.api._prime({isTrusted:false});await flush();ok(f.clips.length===0,'synthetic input cannot claim an audio gesture');f.api._prime({isTrusted:true});await flush();ok(f.clips.length===1&&f.clips[0].volume===0,'first trusted input primes silence only');f.api._set(f.owner);f.api._play('test',line());await flush();ok(f.clips.length===1&&f.clips[0].plays===2&&f.clips[0].volume===.85,'dialogue reuses gesture-primed player at voice volume');
 f=await fixture(true);f.owner.external=true;const sourceNode={...line(),choices:[]},view={lineId:'test',text:'A changed quest description.',choices:[]};f.api.present(f.owner.n,f.owner.a,{nodes:{test:sourceNode}},view,true);ok(f.c.window.capturedLine.recordedAudio===undefined,'changed dynamic text cannot play a mismatched recording');f.api.present(f.owner.n,f.owner.a,{nodes:{test:sourceNode}},{...view,text:sourceNode.text},true);ok(f.c.window.capturedLine.recordedAudio===sourceNode.recordedAudio,'matching source text retains approved recording');
 console.log(checks+' NPC volume, recorded playback, replay, mute, blocked/error recovery and stale-async checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
