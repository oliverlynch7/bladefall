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
 const box={window:{},meta:{},module:{exports:{}},console,actx,fxBus:bus,master:bus,Math,sOn:()=>!mute,noise:()=>{if(!mute)fallback.push('noise');},tone:()=>{if(!mute)fallback.push('tone');},fetch:async url=>{requests.push(url);return {ok:!missing||!url.includes('custom/'),arrayBuffer:async()=>new ArrayBuffer(4)};}};
 vm.createContext(box);vm.runInContext(config,box);vm.runInContext(source+';this.test={FXDEF,FXBUF,SFX,loadFxFiles,playFx,loopFx,stopAllLoops};',box);
 return {box,t:box.test,requests,starts,fallback,gains};
}
(async()=>{
 const crypto=require('crypto');
 check(manifest.cues.length===64,'64 candidate takes preserved');
 for(const c of manifest.cues){
  check(fs.existsSync('public/sfx/'+c.file+'.mp3'),'candidate exists '+c.id);
  if(c.legacy_file){const current=fs.readFileSync('public/sfx/'+c.legacy_file+'.mp3'),backup=fs.readFileSync('audio-source/sfx/legacy-before-starter-20261016/'+c.legacy_file+'.mp3');check(crypto.createHash('sha256').update(current).digest('hex')===crypto.createHash('sha256').update(backup).digest('hex'),'original byte-for-byte preserved '+c.id);}
 }
 const a=await fixture(),api=a.box.window.BFPrioritySfx;
 check(api.policy==='additive-only'&&api.activeAdditions.length===0,'unreviewed batch inactive');
 const keep={f:'my-favorite-original',v:.37},registry={swordswing:keep};api.apply(registry);check(registry.swordswing===keep,'existing definition identity untouched');check(Object.keys(registry).length===1,'no unapproved additions');
 const fn=()=>42,methods={hit:fn,hurt:fn,jump:fn,land:fn,dodge:fn,classup:fn,pickup:fn,wand:fn};api.bind(methods,()=>true);check(Object.values(methods).every(x=>x===fn),'all original procedural methods retained');
 for(const c of manifest.cues){if(c.legacy_file)check(a.t.FXDEF[c.id].f===c.legacy_file,'original slot restored '+c.id);else check(!a.t.FXDEF[c.id],'candidate-only slot inactive '+c.id);}
 a.t.loadFxFiles();await new Promise(r=>setImmediate(r));
 check(!a.requests.some(x=>x.includes('/custom/')),'inactive replacements are not loaded');
 check(a.requests.length===Object.values(a.t.FXDEF).filter(d=>!d.lazy).length,'one request per eager original slot');
 for(const c of manifest.cues.filter(x=>x.legacy_file))check(!!a.t.FXBUF[c.id],'original decodes '+c.id);
 const n=a.starts.length;a.t.SFX.hit();check(a.fallback.length>0&&a.starts.length===n,'original procedural hit used');
 check(!a.t.playFx('custom_shoot'),'bow naturally falls back to original shoot');
 a.t.playFx('swordswing');check(a.starts.length===n+1,'original file plays once');
 check(a.t.FXDEF.levelcheer.f==='fanfare-celebration'&&a.t.FXDEF.levelcheer.v===.6,'original level-up fanfare and volume');
 a.t.loadFxFiles();check(a.requests.length===Object.values(a.t.FXDEF).filter(d=>!d.lazy).length,'no duplicate loads');
 const m=await fixture({mute:true});m.t.loadFxFiles();await new Promise(r=>setImmediate(r));m.t.SFX.hurt();m.t.SFX.classup();m.t.playFx('swordswing');check(m.starts.length===0&&m.fallback.length===0,'mute retained');
 check(html.includes("if(w.arche!=='bow'||!playFx('custom_shoot'))SFX.shoot()"),'original bow fallback remains available');
 console.log(JSON.stringify({checks,candidateFilesPreserved:64,originalFilesRestored:manifest.cues.filter(x=>x.legacy_file).length,proceduralOverrides:0,unreviewedActiveReplacements:0,subjectiveQuality:'Not inferred from technical tests'}));
})().catch(err=>{console.error(err);process.exit(1);});
