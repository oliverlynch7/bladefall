// Local browser fixture; not loaded by the shipped game or wardrobe.
import * as T from './three.module.js';
import {createClassDisplay} from './hero3d.js?v=2191';
import {syncClassLook,clearClassLook} from './class-look3d.js?v=2191';
const output=document.getElementById('result'),canvas=document.querySelector('canvas'),renderer=new T.WebGLRenderer({canvas,antialias:true}),scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.01,100);
renderer.setSize(500,500);scene.background=new T.Color('#354a55');scene.add(new T.HemisphereLight(0xffffff,0x8490a1,2));const sun=new T.DirectionalLight(0xffffff,2);sun.position.set(3,4,4);scene.add(sun);camera.position.set(0,1.8,6);camera.lookAt(0,1.6,0);
const show=v=>{output.textContent=JSON.stringify(v,null,2)},assert=(c,s)=>{if(!c)throw Error(s)},frame=()=>new Promise(r=>requestAnimationFrame(r));
const anchorSnapshot=node=>{const a=[];node.traverse(o=>{if(o.userData.classLookRoot)a.push([o.userData.classLookBone,...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]);});return JSON.stringify(a);};
const motionSnapshot=node=>{const a=[];node.traverse(o=>{if(o.userData.lookAnimated)a.push([...o.position.toArray(),...o.rotation.toArray(),...o.scale.toArray()]);});return JSON.stringify(a);};
document.getElementById('run').onclick=async()=>{
 const results=[],checks=[];let current;
 try{
  for(const cls of Object.keys(BFClassLooks.catalog))for(const tier of [0,1,2]){
   current=await createClassDisplay(cls,tier);scene.add(current.wrap);current.update(.016);const fit=anchorSnapshot(current.node),stat=current.stats;
   assert(tier?stat.meshes>0:stat.meshes===0,cls+' tier geometry');assert(stat.meshes<50&&stat.triangles<10000,cls+' geometry budget '+JSON.stringify(stat));
   current.node.traverse(o=>{if(o.userData.classLookRoot)assert(o.parent.isBone,'Fitting is not parented to a bone');});
   const motions=['Idle','Run','RunAttack','Attack','Charge','Skill','Jump','Dodge','wave','point','cheer','bow','dance'];let frames=0;
   for(const animation of motions){for(let i=0;i<6;i++){
    current.update(.1,{animation,cape:tier===2?'tyrant':'',motion:true});
    current.node.traverse(o=>{if(o.isBone||o.userData.classLookRoot||o.userData.lookAnimated)assert([...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()].every(Number.isFinite),cls+' invalid transform '+animation);});
    renderer.render(scene,camera);frames++;
   }assert(anchorSnapshot(current.node)===fit,cls+' attachment moved relative to its bone');await frame();}
   if(tier){
    // Crucial regression: rebuild in the current non-neutral pose; the authored fit must not change.
    clearClassLook(current.node);syncClassLook(current.node,cls,tier,null,23,true);assert(anchorSnapshot(current.node)===fit,cls+' skin depends on creation pose');
    syncClassLook(current.node,cls,tier,null,10,false);const frozen=motionSnapshot(current.node);syncClassLook(current.node,cls,tier,null,20,false);assert(motionSnapshot(current.node)===frozen,cls+' reduced-motion ornament drift');
    const hidden=[];current.node.traverse(o=>{if(o.userData.classLookBaseVisibility!==undefined)hidden.push(o);});
    syncClassLook(current.node,cls,0,null);assert(hidden.every(o=>o.visible&&o.userData.classLookBaseVisibility===undefined),cls+' original pads did not return');
    syncClassLook(current.node,cls,tier,null);assert(anchorSnapshot(current.node)===fit,cls+' default/earned refit changed');
   }
   results.push({cls,tier,...stat,frames});show({running:cls,tier,completed:results.length});current.dispose();current=null;renderer.render(scene,camera);
  }
  checks.push('All 51 class/tier combinations render','34 earned fits stable after rebuilding during a non-neutral pose','13 animations sampled for every outfit','Original pads restored on default switch','Reduced-motion ornaments stable','No nonfinite bone/ornament transforms','Every attachment parented to the intended skeleton','Each appearance stays under 50 extra meshes / 10k triangles');
  show({passed:true,checks,results,totalFrames:results.reduce((n,r)=>n+r.frames,0),rendererMemory:renderer.info.memory});
 }catch(e){current?.dispose();show({passed:false,error:e.stack,results});}
};
