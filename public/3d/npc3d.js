import {npcEntries,npcSceneKey,waystationScene} from './npc-roster.js?v=2309';
import * as T from './three.module.js';
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';
import {loadKitModel,kitModel} from './mob3d.js?v=2233a';
import {NPC_LOOKS,NPC_MODELS,npcLook} from './npc-looks.js?v=2344';
import {fitNpcCostume,tintNpcHair,tintNpcGarments} from './npc-costume3d.js?v=2344';
const records=new Map(),pending=new Set();let group,currentWorld=null,currentScene='';const visible=new Set();

// Shared factory: the gallery, chess visitor and campaign all wear the same outfit.
export function buildNpcActor(id,src){
 const profile=npcLook(id)||{...NPC_LOOKS.grant,name:id,detail:'guard'},root=SkeletonUtils.clone(src.scene);
 // The kit cache is immutable. Clones own every changed material and skeleton.
 const sourceWeapons=[];
 root.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;o.castShadow=false;
  if(/Sword|Staff|Bow|Dagger|Axe/i.test(o.name)){sourceWeapons.push(o);return;}
  o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();
 });
 // Detach shared source weapons before repaint/disposal. They are not NPC
 // equipment, and recoloring them would waste textures and risk the kit cache.
 sourceWeapons.forEach(o=>o.removeFromParent());
 const before=new Set();root.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))before.add(m);});
 window.__npcPaintClassBody?.(root,NPC_MODELS[profile.model],false,{...profile,id:'npc_'+id,lift:1.14});
 const materials=new Set();root.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});
 for(const m of before)if(!materials.has(m))m.dispose();
 tintNpcGarments(root,profile);tintNpcHair(root,profile);
 const detail=fitNpcCostume(root,profile),mixer=new T.AnimationMixer(root),idle=src.animations.find(a=>a.name==='Idle');
 if(idle)mixer.clipAction(idle).play();
 const face=window.__npcBuildFace?.(root,profile.model,profile.eye,{mouthStyle:profile.mouth||'line',browStyle:profile.brow});
 // Ghosts retain their established translucent treatment, including their clothes.
 const ghost=['ian','shade','warden_shade','riftkeeper'].includes(id);
 if(ghost)root.traverse(o=>{if(o.isMesh&&o.visible)for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.transparent=true;m.opacity=.66;m.depthWrite=false;}});
 const r={root,mixer,materials,detail,profile,face,idle:idle&&mixer.clipAction(idle),walk:src.animations.find(a=>/walk/i.test(a.name))};
 r.dispose=()=>dispose(r);return r;
}
function dispose(r){r.face?.dispose();r.detail.dispose();r.mixer.stopAllAction();r.mixer.uncacheRoot(r.root);r.root.removeFromParent();r.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});for(const m of r.materials)m.dispose();}
export function syncNpcs(scene,dt){const g=window.__BF3?.G,key=npcSceneKey(g);visible.clear();
if(g!==currentWorld||key!==currentScene){for(const r of records.values())dispose(r);records.clear();currentWorld=g;currentScene=key;}
if(!g){if(group)group.visible=false;window.__npcArtStats={actors:0,pending:pending.size,ids:[]};return;}
if(!group){group=new T.Group();group.name='Waystation citizens';}group.visible=true;if(group.parent!==scene)scene.add(group);
const entries=npcEntries(g,{campaign:!!window.__BF3?.isCampaignAdventure?.(),thomasPose:waystationScene(g)?window.BFSocial?.npcPose('thomas'):null}).filter(n=>!g.hub||npcLook(n.id));
const keys=new Set(entries.map(n=>n.id));for(const [key,r]of records)if(!keys.has(key)){dispose(r);records.delete(key);}
for(const n of entries){const profile=npcLook(n.id)||NPC_LOOKS.grant,file='chars/'+profile.model,src=kitModel(file);if(!src){if(src===undefined&&!pending.has(file)){pending.add(file);loadKitModel(file).finally(()=>pending.delete(file));}continue;}let r=records.get(n.id);if(!r){r=buildNpcActor(n.id,src);group.add(r.root);records.set(n.id,r);}
const chess=waystationScene(g)?window.BFSocial?.npcPose(n.id):null;r.chessAnim=r.chessAnim||{};window.__restoreChessNpc?.(r.chessAnim);for(const [bone,pos]of r.chessLengths||[])bone.position.copy(pos);r.chessLengths=[];const shade=n.id==='shade',x=n.x+(shade?0:n.x<0?-13:13),z=n.z+(n.id==='anvil'?22:0),h=g.hub&&['quartermaster','drillmaster','keeper','beastkeeper','anvil'].includes(n.id)?(n.id==='quartermaster'?80:74):shade?55:58,sc=h/src._nativeH;r.root.scale.setScalar(sc);r.root.position.set(x,(n.y||0)-src._baseY*sc,z);const tourViewer=window.BFHubTour?.focusId===n.id?window.BFHubTour.camera():null;const viewer=tourViewer||(window.BFHubDialogue?.active?.n.id===n.id?window.BFHubDialogue.active.a.player():g.p);r.root.rotation.y=(tourViewer?Math.atan2(viewer.x-x,viewer.z-z):(n._yaw??Math.atan2(viewer.x-x,viewer.z-z)))+(r.face?.yawOffset||0);if(r.walk){const moving=chess?!!chess.walking:!!n.walking&&window.__BF3?.mode==='play';if(moving!==r.moving){r.moving=moving;r.idle?.stop();r.mixer.clipAction(r.walk).stop();(moving?r.mixer.clipAction(r.walk):r.idle)?.reset().play();}}const visualNow=performance.now(),visualDt=chess?.walking&&r.visualAt!=null?(visualNow-r.visualAt)/1000:dt;r.visualAt=visualNow;r.mixer.update(Math.min(visualDt,.05));if(chess){r.root.position.set(chess.x,chess.y-src._baseY*sc,chess.z);r.root.rotation.y=chess.yaw;r.root.updateMatrixWorld(true);window.__poseChessNpc?.(chess,r.root,r.chessAnim);}r.labelWorld=g;r.labelAnchor={x:r.root.position.x,y:(chess?.y??n.y??0)+h,z:r.root.position.z};r.face?.tick(performance.now()/1000,window.BFHubDialogue?.active?.n.id===n.id&&window.BFHubDialogue.speaking);visible.add(n.id);}
window.__npcArtStats={actors:records.size,pending:pending.size,ids:[...visible],walkClips:Object.fromEntries([...records].map(([id,r])=>[id,r.walk?.name||null])),costumes:Object.fromEntries([...records].map(([id,r])=>[id,{name:r.profile.name,detail:r.profile.detail,...r.detail.stats}])),faces:Object.fromEntries([...records].map(([id,r])=>[id,r.face?.state]))};}
window.__npc3dDrawn=id=>currentWorld===window.__BF3?.G&&currentScene===npcSceneKey(currentWorld)&&visible.has(id==='smith'?'anvil':id);

// Top of this client's rendered NPC, never a host camera or a previous world's actor.
window.__npc3dAnchor=id=>{const r=records.get(id==='smith'?'anvil':id);return r&&r.labelWorld===window.__BF3?.G&&visible.has(id==='smith'?'anvil':id)?r.labelAnchor:null;};
