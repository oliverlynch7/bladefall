import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import * as T from '../public/3d/three.module.js';
import {NPC_LOOKS,NPC_MODELS,npcLook} from '../public/3d/npc-looks.js';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return next(s==='three'?new URL('../public/3d/three.module.js',import.meta.url).href:s,c);}});
const {fitNpcCostume,tintNpcHair,tintNpcGarments}=await import('../public/3d/npc-costume3d.js');
import {npcEntries,npcSceneKey,waystationScene,thomasScene} from '../public/3d/npc-roster.js';
let checks=0;const ok=(b,m)=>{assert(b,m);checks++};
const thomas={id:'thomas',name:'Thomas',x:0,z:350},mara={id:'mara',x:-190,z:160},pose={x:334,y:-4,z:390};
for(let zone=0;zone<8;zone++)for(const area of [0,1,-1]){
 const rows=npcEntries({zone,area,storyNpcs:[thomas,mara]},{campaign:true,thomasPose:pose});ok(rows.some(n=>n.id==='thomas')===(zone===0&&area===0),'Thomas belongs only to Briar opening');
}
for(const flag of ['riftHall','sparringRoom','arena','trial','devKeep','delve','endless','side','bossRush'])ok(!waystationScene({hub:true,[flag]:true}),flag+' is not Waystation');
const actors=[mara],beta={devKeep:{actors},zone:2,area:0};npcEntries(beta,{thomasPose:pose});ok(actors.length===1,'beta source never receives chess actor');
ok(npcEntries({devKeep:{actors:[thomas]},devBriar:{part:0}}).length===1,'Briar beta opening keeps Thomas');ok(!npcEntries({devKeep:{actors:[thomas]},devBriar:{part:1}}).length,'Briar beta woods excludes Thomas');
const hub={hub:true,hubNpcs:[]};ok(npcEntries(hub,{thomasPose:pose})[0].x===334,'owned hub visitor uses actual pose');ok(!hub.hubNpcs.length,'hub source stays unchanged');
ok(npcEntries({zone:2,area:0,storyNpcs:[{...mara,id:'gone',hidden:true},{...mara,id:'dead',dead:true},mara,mara]}).length===1,'hidden, dead and duplicate actors excluded');
for(const flag of ['trial','side','arena','delve','endless','bossRush','bonusActive'])ok(!thomasScene({zone:0,area:0,[flag]:true},true),flag+' rejects stale campaign classification');
const nameContext={window:{BFNpcRoster:{thomasScene},__BF3:{isCampaignAdventure:()=>true}}};vm.createContext(nameContext);vm.runInContext(fs.readFileSync('public/3d/npc-names.js','utf8'),nameContext);ok(!nameContext.window.BFNpcNames.entries({zone:1,area:0,storyNpcs:[thomas]}).length,'no floating Thomas name in unrelated area');
const social=fs.readFileSync('public/3d/social-hub.js','utf8'),poseContext={visitor:{old:true},isHub:()=>false,owned:()=>false};vm.createContext(poseContext);vm.runInContext(social.slice(social.indexOf('function thomasPose('),social.indexOf('function walkPose(')),poseContext);ok(poseContext.thomasPose('thomas')===null&&poseContext.visitor===null,'leaving hub clears visitor state');poseContext.isHub=()=>true;poseContext.visitor={old:true};ok(poseContext.thomasPose('thomas')===null&&poseContext.visitor===null,'unowned table clears prior save visitor');
const state={zone:0,area:0};const before=npcSceneKey(state);state.area=1;ok(before!==npcSceneKey(state),'same-world area changes invalidate rigs');
// Run the actual renderer/lifecycle with real Three scene objects and a tiny cached model.
const src={scene:new T.Group(),animations:[],_nativeH:1,_baseY:0};src.scene.add(new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial()));
const window={__BF3:{G:{hub:true,hubNpcs:[thomas],p:{x:0,z:0}},isCampaignAdventure:()=>false},BFSocial:{npcPose:()=>null}};
const context={NPC_LOOKS,NPC_MODELS,npcLook,fitNpcCostume,tintNpcHair,tintNpcGarments,window,T,SkeletonUtils:{clone:o=>o.clone(true)},kitModel:()=>src,loadKitModel:()=>Promise.resolve(),npcEntries,npcSceneKey,waystationScene,performance};
vm.createContext(context);vm.runInContext(fs.readFileSync('public/3d/npc3d.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/export function /g,'function '),context);
const scene=new T.Scene();context.syncNpcs(scene,.016);const group=scene.getObjectByName('Waystation citizens'),old=group.children[0];ok(window.__npc3dDrawn('thomas'),'hub Thomas rendered');
window.__BF3.G={zone:1,area:0,storyNpcs:[{id:'caleb',x:40,z:50}],p:{x:0,z:0}};ok(!window.__npc3dDrawn('thomas'),'old rig immediately not authoritative');context.syncNpcs(scene,.016);ok(old.parent===null&&group.children.length===1,'old world rig physically removed');ok(!window.__npc3dDrawn('thomas'),'no ghost Thomas in Hollow');
window.__BF3.isCampaignAdventure=()=>true;window.__BF3.G={zone:0,area:0,storyNpcs:[thomas],p:{x:0,z:0}};context.syncNpcs(scene,.016);ok(window.__npc3dDrawn('thomas')&&group.children[0]!==old,'legitimate Briar Thomas rebuilt');
window.__BF3.G.area=1;context.syncNpcs(scene,.016);ok(!group.children.length&&!window.__npc3dDrawn('thomas'),'same-world stale Thomas excluded');
window.__BF3.G=null;context.syncNpcs(scene,.016);ok(group.visible===false&&window.__npcArtStats.actors===0,'missing-world cleanup leaves no actors');
const html=fs.readFileSync('public/3d/index.html','utf8'),start=html.indexOf('function loadStageRaw(i){'),end=html.indexOf('const s=G.trial?',start);const G={storyNpcs:[thomas],storyObjects:[{id:'old'}],riftSpirit:{id:'riftkeeper'},storyState:{flags:{done:true}}};const c={G};vm.createContext(c);vm.runInContext(fs.readFileSync('public/3d/trial-themes.js','utf8'),c);vm.runInContext(html.slice(start,end)+'}',c);c.loadStageRaw(0);ok(!G.storyNpcs.length&&!G.storyObjects.length&&G.riftSpirit===null,'actual stage reset removes transient NPCs/props/spirit');ok(G.storyState.flags.done,'quest state retained');
console.log(checks+' NPC scene ownership, legitimate Thomas, mode exclusion, lifecycle, immutable roster and stage cleanup checks passed.');
