import assert from 'node:assert/strict';import {createRequire,registerHooks} from 'node:module';import fs from 'node:fs';import vm from 'node:vm';
registerHooks({resolve(s,c,n){return s==='three'?{url:new URL('../public/3d/three.module.js',import.meta.url).href,shortCircuit:true}:n(s,c)}});
const require=createRequire(import.meta.url);globalThis.window={HERO3D:{on:true},__BF3:{G:null}};const D=require('../public/3d/campaign-objects.js');window.BFCampaignObjects=D;
const T=await import('../public/3d/three.module.js'),{syncCampaignObjects}=await import('../public/3d/campaign-object3d.js');let checks=0;const ok=(n,v)=>{assert(v,n);checks++;};
const expected={'home.bell.cache':'coin','home.grain.cache':'coin','home.orchard.cache':'coin','lc.cache':'coin','hp.code.claim':'uncommon','kd.cache':'rare','ff.cache':'common','gf.cache.release':'common','sc.code.note':'rare','sc.code.claim':'rare','rv.pattern.take':'common'};
for(const [key,type]of Object.entries(expected)){
 const spec=D.spec({key});ok(key+' explicit reward model',type==='coin'?spec.currencyOnly:spec.chest&&spec.rarity===type);
 const scene=new T.Scene(),o={key,x:150,y:180,z:-500},g={zone:1,area:0,p:{x:150,y:180,z:-500},storyState:{flags:{}},storyObjects:[o]};window.__BF3.G=g;syncCampaignObjects(scene);
 scene.updateMatrixWorld(true);const node=scene.getObjectByName(key),item=node.children[0],bounds=new T.Box3().setFromObject(item);ok(key+' visible',node.visible&&D.drawn(o));ok(key+' grounded',Math.abs(bounds.min.y-180)<.001);ok(key+' finite bounded detail',item.userData.triangles>100&&item.userData.triangles<100000);
 g.storyState.flags['event.'+(spec.openKey||key)]=true;for(let i=0;i<50;i++)syncCampaignObjects(scene,.016);
 const stats=window.__CAMPAIGN_OBJECT_STATS.items.find(q=>q.key===key);ok(key+' lid opens',stats.opening>.99);ok(key+' briefly holds open before disappearing',item.visible);
 for(let i=0;i<60;i++)syncCampaignObjects(scene,.016);ok(key+' claimed model disappears',!item.visible);ok(key+' hidden model still suppresses placeholder',D.drawn(o));
 Object.assign(g.p,{x:99999,z:99999});syncCampaignObjects(scene);ok(key+' culled body not replaced by old fallback',!node.visible&&D.drawn(o));
}
{
 const scene=new T.Scene(),objects=['sc.code.note','sc.code.claim'].map(key=>({key,x:0,y:200,z:0}));const g={zone:5,area:0,p:{x:0,y:200,z:0},storyState:{flags:{}},storyObjects:objects};window.__BF3.G=g;syncCampaignObjects(scene);
 ok('two Stormshot actions share one chest',window.__CAMPAIGN_OBJECT_STATS.total===1&&objects.every(D.drawn));
 g.storyState.flags['event.sc.code.note']=true;syncCampaignObjects(scene,.1);ok('inspecting never opens chest',window.__CAMPAIGN_OBJECT_STATS.items[0].opening===0);
 g.storyState.flags['event.sc.code.claim']=true;syncCampaignObjects(scene,.1);ok('claiming opens shared chest',window.__CAMPAIGN_OBJECT_STATS.items[0].opening>0);
 Object.assign(g.p,{x:99999,z:99999});syncCampaignObjects(scene);ok('both aliases suppress fallback at distance',objects.every(D.drawn));
}
{
 const scene=new T.Scene(),o={key:'gf.cache.release',x:850,boxX:690,y:305,z:-5580};window.__BF3.G={zone:4,area:1,p:{...o},storyState:{flags:{}},storyObjects:[o]};syncCampaignObjects(scene);ok('cooling box stays at actual box instead of remote handle',scene.getObjectByName(o.key).position.x===690);ok('authored handle offset not mutated',o.x===850&&o.boxX===690);
}
{
 const scene=new T.Scene(),o={key:'kd.cache',x:0,y:80,z:0},external=new T.Group();scene.add(external);const g={zone:2,area:1,prison:{},p:{...o},storyState:{flags:{}},storyObjects:[o]};window.__BF3.G=g;window.__PRISON_JOURNEY_ART={root:external,objects:new Set(['kd.cache'])};syncCampaignObjects(scene);ok('existing detailed prison chest owns render',!scene.getObjectByName(o.key).visible&&D.drawn(o));delete window.__PRISON_JOURNEY_ART;syncCampaignObjects(scene);ok('shared chest available if bespoke renderer absent',scene.getObjectByName(o.key).visible);
}
// The cliff model fits under the existing cargo bottom; the snow cover stays separate and above its chest.
{
 const scene=new T.Scene(),o={key:'hp.code.claim',x:0,y:0,z:0};window.__BF3.G={zone:1,area:0,p:{...o},storyState:{flags:{}},storyObjects:[o]};syncCampaignObjects(scene);const b=new T.Box3().setFromObject(scene.getObjectByName(o.key));ok('cliff chest below lowered cargo plate',b.max.y<66.5);ok('cliff chest inside cargo frame',b.max.x<51&&b.min.x>-51);
 const Snow=require('../public/3d/snowbound-peaks.js'),calls=[];const obj={key:'ff.cache',kind:'chest',x:0,z:0,y:810};window.__campaignObjectDrawn=new WeakSet([obj]);
 const g={peaks:{trailMarks:[],corniceRidge:[],surveyLedges:[]},storyObjects:[obj],storyNpcs:[],time:0};const s={flags:{}};Snow.draw({G:g,state:s,bx:(...a)=>calls.push(a),ring:()=>{},pushM:()=>{},popM:()=>{},mv:()=>{},rotY:()=>{},rotX:()=>{}},0);ok('shared chest still has snowy puzzle cover',calls.some(a=>a[1]===902&&a[6]==='#d4e3e4'));ok('old box body suppressed',!calls.some(a=>a[6]==='#655b50'));ok('safety rope has an outside corner post',calls.some(a=>a[0]===-560&&a[1]===853&&a[2]===-3460));
}
// Actual fixed-reward delivery helper: no reroll, no second item, explicit full-bag outcome.
const source=fs.readFileSync('public/3d/index.html','utf8'),helper=source.slice(source.indexOf('function claimAuthoredChestItem('),source.indexOf('function revealChestReward('));
for(const bagged of [true,false]){
 const item={armor:{slot:'legs',rarity:'uncommon',name:'Test leggings'}},calls=[];const c={G:{p:{x:2,y:3,z:4}},stashItem:v=>{calls.push(['stash',v]);return bagged},pushLoot:(x,z,y,v)=>calls.push(['drop',v]),playFx:v=>calls.push(['sfx',v]),revealChestReward:(ch,v,result)=>calls.push(['reveal',v,result,ch.rarity])};vm.createContext(c);vm.runInContext(helper,c);c.claimAuthoredChestItem(item);ok('one delivery '+bagged,calls.filter(c=>c[0]==='stash').length===1);ok('one unchanged reward reveal '+bagged,calls.filter(c=>c[0]==='reveal').length===1&&calls.find(c=>c[0]==='reveal')[1]===item);ok('full bag retains drop '+bagged,calls.filter(c=>c[0]==='drop').length===(bagged?0:1));ok('clear outcome '+bagged,calls.find(c=>c[0]==='reveal')[2]===(bagged?'Added to bag':'Bag full · reward placed beside you'));
}
for(const key of ['ih.mold','rv.supplies.take'])ok('non-chest remains distinct '+key,!D.spec({key})?.chest&&!D.spec({key})?.currencyOnly);
ok('cooling diagram remains a diagram',D.spec({key:'gf.cache'}).model==='diagram');
const inventory=JSON.parse(fs.readFileSync('docs/art-validation/quest-mechanisms-20261019/campaign-inventory.json','utf8'));for(const row of inventory)for(const o of row.objects)if(['chest','chestclaim','cachebox','bellcache','graincache','orchardcache'].includes(o.kind))ok('all authored chest actions mapped '+o.key,!!D.spec(o));
console.log(JSON.stringify({checks,assignments:Object.keys(expected).length,passed:true}));
