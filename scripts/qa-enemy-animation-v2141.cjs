async page=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4338/3d/animation-preview.html');
 await page.waitForFunction(()=>window.__animationQA?.().bones>0);
 const result=await page.evaluate(async()=>{
  const [{GLTFLoader},{revisedClips,upgradedTypes,enemyAsset},{choreographyProfile},T]=await Promise.all([
   import('./jsm/loaders/GLTFLoader.js'),import('./enemy-motion.js?v=2141'),
   import('./enemy-choreography.js?v=2141'),import('./three.module.js')]);
  const loader=new GLTFLoader(),cases=[];
  for(const name of [...upgradedTypes,'colossus','marblecolossus']){
   try{
    const gltf=await loader.loadAsync(enemyAsset(name));
    const bones=[];gltf.scene.traverse(o=>{if(o.isBone)bones.push(o);});
    const clips=revisedClips(gltf.scene,name,gltf.animations.map(a=>{a.name=a.name.split('|').pop();return a;}));
    const mixer=new T.AnimationMixer(gltf.scene);let finite=true,maxAngle=0;const motion={};
    for(const clipName of ['Idle','Move','Windup','Attack','Recover','Hit','Death']){
     const clip=clips.find(c=>c.name===clipName);if(!clip){finite=false;continue;}
     const pivot=clip.tracks.find(t=>t.name==='body.quaternion')||clip.tracks[0];
     const first=clipName==='Idle'||clipName==='Move'?6:0,last=clipName==='Idle'||clipName==='Move'?18:20;
     motion[clipName]=Array.from({length:4},(_,i)=>Math.abs(pivot.values[first*4+i]-pivot.values[last*4+i])).reduce((a,b)=>a+b,0);
     const action=mixer.clipAction(clip);action.reset().play();
     for(const ratio of [.02,.24,.5,.78,.98]){action.time=clip.duration*ratio;mixer.update(0);gltf.scene.updateMatrixWorld(true);
      finite&&=bones.every(b=>b.matrixWorld.elements.every(Number.isFinite)&&b.quaternion.toArray().every(Number.isFinite));
      for(const b of bones)maxAngle=Math.max(maxAngle,2*Math.acos(Math.min(1,Math.abs(b.quaternion.w))));
     }action.stop();
    }
    const variants=clips.filter(c=>c.name.startsWith('Attack_')).map(c=>c.name);
    cases.push({name,bones:bones.length,finite,maxAngle,motion,profile:!!choreographyProfile(name),variants});
    gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();if(o.isSkinnedMesh)o.skeleton.dispose();}});
   }catch(error){cases.push({name,error:String(error)});}
  }
  return cases;
 });
 const broken=result.filter(c=>c.error||!c.finite||!c.profile||c.bones<10||c.maxAngle>Math.PI+.1||Object.values(c.motion||{}).some(delta=>delta<.002));
 if(broken.length||errors.length)throw Error(JSON.stringify({broken,errors}));
 const bossVariants=Object.fromEntries(result.filter(c=>c.name.startsWith('prison_')).map(c=>[c.name,c.variants]));
 return {tested:result.length,finite:result.filter(c=>c.finite).length,bones:[Math.min(...result.map(c=>c.bones)),Math.max(...result.map(c=>c.bones))],maxAngle:Math.max(...result.map(c=>c.maxAngle)),bossVariants,errors};
}
