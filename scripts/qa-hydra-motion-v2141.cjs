async page=>{
 await page.route('**/3d/__enemy-art-qa.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));
 await page.goto('http://127.0.0.1:4338/3d/__enemy-art-qa.html');
 return page.evaluate(async()=>{
  const [{createHydra},T]=await Promise.all([import('./hydra-art.js?v=2141'),import('./three.module.js')]);
  const parent=new T.Group();window.BFHydra={heads:[{x:-510,z:230},{x:0,z:360},{x:510,z:230}],blocked:()=>false};
  const art=createHydra(parent),headGroup=art.root.children.find(o=>o.isGroup&&o.children.some(c=>c.isGroup));
  if(!headGroup)throw Error('Hydra head rig missing');
  const head=headGroup.children.find(c=>c.isGroup),state=(elapsed,move,kind)=>({hydraArena:{elapsed,state:move,kind,broken:[],head:0,freed:false,retreat:0,x:120,y:80,z:550,clock:.2}});
  art.update(state(1,'idle',null));const before=head.position.clone();
  art.update(state(1.016,'strike','bite'));const after=head.position.clone();
  const travel=before.distanceTo(after),target=before.distanceTo(new T.Vector3(120,138,550));
  for(let i=2;i<24;i++)art.update(state(1+i*.016,'strike','bite'));
  art.root.updateMatrixWorld(true);
  let finite=true,meshes=0;art.root.traverse(o=>{finite&&=o.matrixWorld.elements.every(Number.isFinite);if(o.isMesh)meshes++;});
  art.dispose();if(!finite||travel<10||travel>target*.5||meshes<150)throw Error(JSON.stringify({finite,travel,target,meshes}));
  return {finite,travelFirstFrame:travel,fullTargetDistance:target,meshes};
 });
}
