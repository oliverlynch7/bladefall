const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('public/3d/index.html','utf8');
const config=fs.readFileSync('public/3d/priority-sfx.js','utf8');
const source=html.slice(html.indexOf("const SFXDIR='/sfx/';"),html.indexOf('/* ---------------- Rarity / elements'));
const manifest=JSON.parse(fs.readFileSync('public/sfx/custom/starter-20261016/manifest.json','utf8'));
let checks=0;function check(v,label){assert(v,label);checks++;}
async function fixture({missing=false,mute=false}={}){
 const requests=[],starts=[],fallback=[],gains=[];const bus={};
 const buffer={numberOfChannels:2,getChannelData:()=>new Float32Array([.1,-.2,.85,-.05])};
 const actx={currentTime:2,decodeAudioData:async()=>buffer,createBufferSource(){return {connect(){},start(){starts.push(this.buffer);},stop(){}};},createGain(){const g={gain:{value:0},connect(b){check(b===bus,'same effects bus');}};gains.push(g);return g;}};
 const box={window:{},module:{exports:{}},console,actx,fxBus:bus,master:bus,Math,sOn:()=>!mute,noise:()=>{if(!mute)fallback.push('noise');},tone:()=>{if(!mute)fallback.push('tone');},fetch:async url=>{requests.push(url);return {ok:!missing||!url.includes('custom/'),arrayBuffer:async()=>new ArrayBuffer(4)};}};
 vm.createContext(box);vm.runInContext(config,box);vm.runInContext(source+';this.test={FXDEF,FXBUF,SFX,loadFxFiles,playFx,loopFx,stopAllLoops};',box);
 return {box,t:box.test,requests,starts,fallback,gains};
}
(async()=>{
 check(manifest.cues.length===64,'64 authored sounds');
 for(const c of manifest.cues){const path='public/sfx/'+c.file+'.mp3';check(fs.existsSync(path),'runtime exists '+c.id);check(c.channels===2&&c.peak<.95&&c.rms>.002,'signal '+c.id);check(c.duration>0&&c.duration<=c.source_seconds+.03,'bounded duration');if(c.legacy_file)check(fs.existsSync('audio-source/sfx/legacy-before-starter-20261016/'+c.legacy_file+'.mp3'),'old source backup');}
 const a=await fixture();a.t.SFX.hit();check(a.fallback.length>0,'procedural fallback before decoding');
 a.fallback.length=0;a.t.loadFxFiles();await new Promise(r=>setImmediate(r));
 check(a.requests.length===Object.keys(a.t.FXDEF).length,'one load per slot');
 for(const c of manifest.cues){check(a.t.FXDEF[c.id].f===c.file,'replacement '+c.id);check(!!a.t.FXBUF[c.id],'decoded '+c.id);check(a.t.FXDEF[c.id]._norm*.85<=.85001,'normalization peak ceiling');}
 for(const name of Object.keys(a.box.window.BFPrioritySfx.methods)){const n=a.starts.length;a.t.SFX[name]();check(a.starts.length===n+1,'one replacement per procedural cue '+name);}
 check(a.fallback.length===0,'no procedural layering after successful custom playback');
 check(a.t.FXDEF.swordswing.v===.42&&a.t.FXDEF.levelcheer.v===.6,'legacy prominence retained');
 a.t.loadFxFiles();check(a.requests.length===Object.keys(a.t.FXDEF).length,'no duplicate loads');
 const b=await fixture({missing:true});b.t.loadFxFiles();await new Promise(r=>setImmediate(r));
 for(const c of manifest.cues.filter(c=>c.legacy_file)){check(b.requests.includes('/sfx/'+c.legacy_file+'.mp3'),'network fallback '+c.id);check(!!b.t.FXBUF[c.id],'legacy decoded '+c.id);}
 const n=b.fallback.length;b.t.SFX.hurt();check(b.fallback.length>n,'new-only missing file uses procedural fallback');
 const m=await fixture({mute:true});m.t.loadFxFiles();await new Promise(r=>setImmediate(r));m.t.SFX.hurt();m.t.SFX.classup();m.t.playFx('swordswing');check(m.starts.length===0&&m.fallback.length===0,'mute preserved');
 check(html.includes("if(w.arche!=='bow'||!playFx('custom_shoot'))SFX.shoot()"),'only bows use natural string release');
 const ledger=JSON.parse(fs.readFileSync('audio-source/sfx/starter-20261016/manifest.json','utf8'));
 check(ledger.license_plan_at_generation==='starter','paid provenance');check(ledger.cues.every(c=>c.status==='saved'),'no uncertain requests');check(ledger.cues.reduce((s,c)=>s+c.duration_seconds*40,0)<=10000,'batch budget');
 console.log(JSON.stringify({checks,runtimeFiles:64,existingSlotsReplaced:manifest.cues.filter(c=>c.legacy_file).length,proceduralMethodsReplaced:8,networkFallback:true,mute:true,subjectiveListening:'pending',browserVerified:false}));
})().catch(err=>{console.error(err);process.exit(1);});
