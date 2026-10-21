// Local developer fixture only; not imported by public game/gallery.
window.runNpcCostumeChecks=async()=>{
 const [{NPC_LOOKS},{buildNpcActor},{loadKitModel},T]=await Promise.all([import('/3d/npc-looks.js?v=2344'),import('/3d/npc3d.js?v=2344'),import('/3d/mob3d.js?v=2339'),import('/3d/three.module.js')]);
 const result={checks:0,actors:[],failures:[]},ok=(v,label)=>{result.checks++;if(!v)result.failures.push(label);};
 for(const [id,p]of Object.entries(NPC_LOOKS)){
  const src=await loadKitModel('chars/'+p.model),source=[],shared=new Set();src.scene.traverse(o=>{if(o.isMesh){source.push([o,o.visible,o.material,o.geometry]);shared.add(o.geometry);for(const m of(Array.isArray(o.material)?o.material:[o.material])){shared.add(m);if(m.map)shared.add(m.map);}}});
  let sourceDisposals=0;const onDispose=()=>sourceDisposals++;shared.forEach(o=>o.addEventListener('dispose',onDispose));
  const r=buildNpcActor(id,src),out={id,model:p.model,...r.detail.stats,poseSamples:0,textures:[]};
  ok(r.face?.state.eyes&&r.face?.state.mouth,id+' fitted face');ok(r.root!==src.scene,id+' isolated body');
  r.root.traverse(o=>{if(!o.isMesh)return;if(/Sword|Bow|Staff|Dagger|Axe/i.test(o.name))ok(!o.visible,id+' no loose source weapon');for(const m of (Array.isArray(o.material)?o.material:[o.material])){ok(!source.some(a=>a[2]===m),id+' private material');if(m.map&&m.map!==m.userData?._srcMap)out.textures.push([m.map.image?.width,m.map.image?.height]);}});
  for(const kind of ['idle','walk','seated']){window.__restoreChessNpc(r.anim||={});r.mixer.stopAllAction();const clip=kind==='walk'?r.walk:src.animations.find(a=>a.name==='Idle');if(clip)r.mixer.clipAction(clip).play();for(const t of [.01,.23,.64,1.0]){window.__restoreChessNpc(r.anim);r.root.position.set(0,0,0);r.mixer.setTime(t);if(kind==='seated')window.__poseChessNpc({sitting:true,seatBlend:1},r.root,r.anim);r.root.updateMatrixWorld(true);r.root.traverse(o=>{if(o.isMesh)ok(o.matrixWorld.elements.every(Number.isFinite),id+' finite '+kind);});out.poseSamples++;}}
  if(['ian','shade','riftkeeper'].includes(id))r.root.traverse(o=>{if(o.isMesh&&o.visible)for(const m of(Array.isArray(o.material)?o.material:[o.material]))ok(m.transparent&&m.opacity===.66&&!m.depthWrite,id+' consistent spirit opacity');});
  r.dispose();for(const [o,visible,mat,geo]of source)ok(o.visible===visible&&o.material===mat&&o.geometry===geo,id+' source survives clone/disposal');ok(sourceDisposals===0,id+' no shared kit resource disposed');shared.forEach(o=>o.removeEventListener('dispose',onDispose));result.actors.push(out);
 }
 result.passed=!result.failures.length;window.npcCostumeChecks=result;return result;
};
