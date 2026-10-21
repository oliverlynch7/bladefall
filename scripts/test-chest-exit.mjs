import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {registerHooks} from 'node:module';
import * as T from '../public/3d/three.module.js';
registerHooks({resolve(s,c,n){return s==='three'?{url:new URL('../public/3d/three.module.js',import.meta.url).href,shortCircuit:true}:n(s,c)}});
const {createChestActor,animateChest}=await import('../public/3d/chest-art.js');
const {createCoinCoffer,animateCoinCoffer}=await import('../public/3d/coin-coffer3d.js');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
for(const rarity of ['common','uncommon','rare','epic','legendary','coin']){
 const make=()=>rarity==='coin'?createCoinCoffer():createChestActor(rarity),a=make(),other=make();
 a.root.scale.multiplyScalar(2);const base=a.root.scale.clone(),b={x:11,y:7,z:20,opened:false};
 const animate=(rec,opened,dt)=>rarity==='coin'?animateCoinCoffer(rec,opened,dt):animateChest(rec,{...b,opened},dt);
 animate(a,false,.016);animate(other,false,.016);const materials=[];a.root.traverse(o=>{if(o.isMesh)materials.push([o.material,o.material.opacity,o.material.transparent]);});
 for(let i=0;i<8;i++)animate(a,true,.1);
 ok(a.root.visible&&a.opening===1,'lid completes before exit '+rarity);ok(a.root.scale.equals(base),'holds authored scale '+rarity);
 for(let i=0;i<7;i++)animate(a,true,.1);
 ok(!a.root.visible&&a.root.scale.length()===0,'collected shell disappears '+rarity);
 for(let i=0;i<200;i++)animate(a,true,.016);
 ok(!a.root.visible,'does not resurrect '+rarity);ok(other.root.visible,'unclaimed co-op copy remains '+rarity);
 ok(materials.every(([m,opacity,transparent])=>m.opacity===opacity&&m.transparent===transparent),'shared materials untouched '+rarity);
 const imported=make();animate(imported,true,.016);ok(!imported.root.visible,'preclaimed save spawns hidden '+rarity);
 animate(a,false,.016);ok(a.root.visible&&a.root.scale.equals(base),'reset restores original scale '+rarity);
 for(const dt of [-1,NaN,undefined,Infinity])animate(a,true,dt);
 ok(a.root.scale.toArray().every(Number.isFinite),'bad delta cannot corrupt transform '+rarity);
}
// Actual prop synchronizer: hidden actors remain hidden, stale models are detached.
const src=readFileSync('public/3d/prop3d.js','utf8'),start=src.indexOf('function syncChests('),end=src.indexOf('\nfunction syncKeys(',start);
const context={PROP3D:{},Set,createChestActor,animateChest,_actors:new Map(),_group:new T.Group(),_box:null,window:{__BF3:{prepareChest(){}}}};
vm.createContext(context);vm.runInContext(src.slice(start,end),context);
const ch={x:0,y:0,z:0,rarity:'common',opened:false};context.syncChests([ch],.016);ok(context.PROP3D.chests===1,'unopened model counted');ch.opened=true;
for(let i=0;i<20;i++)context.syncChests([ch],.1);
ok(context.PROP3D.chests===0&&context._actors.size===1,'claimed actor not rebuilt each frame');ok(!context._actors.get(ch).root.visible,'prop actor remains hidden');
context.syncChests([],.016);ok(context._actors.size===0&&context._group.children.length===0,'scene removal detaches consumed actor');
context.syncChests([ch],.016);ok(context.PROP3D.chests===0&&!context._actors.get(ch).root.visible,'restored claimed object does not flash');
const game=readFileSync('public/3d/index.html','utf8'),a=game.indexOf('function drawChest('),b=game.indexOf('\nfunction drawPortal3(',a);let draws=0;
const fallback={prepareChest(){},deferArmed(){throw Error('claimed fallback should return before drawing');}};vm.createContext(fallback);vm.runInContext(game.slice(a,b),fallback);fallback.drawChest({opened:true},0);ok(true,'claimed fallback shell omitted');
console.log(`${checks} chest exit, shared-material, reload and render cleanup checks passed.`);
