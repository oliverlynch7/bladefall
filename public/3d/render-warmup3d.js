import {Vector4} from './three.module.js';
// Upload even off-camera chunks while the loading curtain protects the player.
// compile() alone does not upload geometry or exercise shadow/transparent passes.
export function warmSceneGeometry(renderer,scene,camera){
 const visibility=[],culling=[],materials=new Map(),viewport=renderer.getViewport(new Vector4()),shadow=renderer.shadowMap.needsUpdate;
 try{
  scene.traverse(node=>{if(!node.isLight&&!node.visible){visibility.push(node);node.visible=true;}if(node.isMesh||node.isPoints||node.isLine){culling.push([node,node.frustumCulled]);node.frustumCulled=false;}});
  renderer.setViewport(0,0,2,2);renderer.shadowMap.needsUpdate=true;
  renderer.compile(scene,camera);renderer.render(scene,camera);
  // Dash afterimages and camera cutaways use the same geometry with transparent
  // programs. Prepare that variant too instead of compiling it on the first dash.
  scene.traverse(node=>{for(const material of Array.isArray(node.material)?node.material:[node.material])if(material&&!materials.has(material)){materials.set(material,material.transparent);if(!material.transparent){material.transparent=true;material.needsUpdate=true;}}});
  renderer.compile(scene,camera);renderer.render(scene,camera);
 }finally{
  for(const [material,transparent]of materials){if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}}
  for(const node of visibility)node.visible=false;
  for(const [node,value]of culling)node.frustumCulled=value;
  renderer.shadowMap.needsUpdate=shadow;renderer.setViewport(viewport);
 }
}
