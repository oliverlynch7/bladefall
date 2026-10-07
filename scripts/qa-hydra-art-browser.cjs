async function run(page){
  await page.route('**/3d/__roster-qa.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));
  await page.goto('http://127.0.0.1:4338/3d/__roster-qa.html');
  const result=await page.evaluate(async()=>{
    const [{createHydra},T]=await Promise.all([
      import('./hydra-art.js?v=2128'),import('./three.module.js')
    ]);
    const scene=new T.Scene();
    window.BFHydra={heads:[
      {x:-510,z:230},{x:0,z:360},{x:510,z:230}
    ],blocked:()=>false};
    const model=createHydra(scene);
    let meshes=0,instances=0;
    model.root.traverse(o=>{if(o.isMesh)meshes++;if(o.isInstancedMesh)instances+=o.count;});
    for(const [state,kind,broken] of [
      ['idle',null,[]],['wind','bite',[]],['strike','bite',[]],
      ['strike','sweep',[]],['strike','blast',[]],['recover',null,[0]],
      ['idle',null,[0,1,2]]
    ]){
      model.update({hydraArena:{elapsed:3,state,kind,broken,head:0,
        freed:broken.length===3,retreat:0,x:120,y:80,z:550,clock:.2}});
      model.root.updateMatrixWorld(true);
      let finite=true;
      model.root.traverse(o=>{
        if(o.matrixWorld.elements.some(v=>!Number.isFinite(v)))finite=false;
        if(o.isInstancedMesh)for(let i=0;i<o.count;i++){
          const m=new T.Matrix4();o.getMatrixAt(i,m);
          if(m.elements.some(v=>!Number.isFinite(v)))finite=false;
        }
      });
      if(!finite)throw Error('Non-finite Hydra transform in '+state+'/'+kind);
    }
    model.dispose();
    if(meshes<150||instances<60)throw Error('Incomplete Hydra detail '+meshes+'/'+instances);
    return {meshes,instancedScales:instances,states:7};
  });
  return result;
}
