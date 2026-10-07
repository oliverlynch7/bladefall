async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/3d/__roster-qa.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><head><script type="importmap">{"imports":{"three":"./three.module.js"}}</script></head><body></body></html>'}));
 await page.goto('http://127.0.0.1:4338/3d/__roster-qa.html');
 const out=await page.evaluate(async()=>{
  const {loadKitModel}=await import('./mob3d.js?v=2128');
  const {AnimationMixer}=await import('./three.module.js');
  const names=['grunt','flyer','emberling','frostling','toxling','shadeling','sparkling','goblin','bones','slime','slimelet','caster','charger','mimic','dustjackal','cragspitter','galewisp','thornboar','sporeback','sentinel','revenant','dummy','bosscrystal','frostshell','frostlobber','magmaskit','embertotem','blinkstalker','voidtether','sunpriest','marblestatue','siegeknight','royalarcanist','brute','warden','archer','sorcerer','king','tyrant','officer-shield','officer-spear'];
  const cases=[];
  for(const name of names){
   const model=await loadKitModel('enemy-assets/upgraded/'+name+'-v2128');
   if(!model){cases.push({name,error:'missing'});continue;}
   const bones=[];model.scene.traverse(o=>{if(o.isBone)bones.push(o);});
   const clips=model.animations.map(a=>a.name),mixer=new AnimationMixer(model.scene);
   for(const clip of model.animations){const action=mixer.clipAction(clip);action.play();mixer.update(.15);action.stop();}
   model.scene.updateMatrixWorld(true);
   const finite=bones.every(b=>b.matrixWorld.elements.every(Number.isFinite));
   cases.push({name,bones:bones.length,clips,finite,height:model._nativeH,meshes:model.scene.children.length});
  }
  return {cases,mobError:window.MOB3D?.err||null};
 });
 const broken=out.cases.filter(c=>c.error||c.bones<10||!c.finite||!Number.isFinite(c.height)||c.height<=0||!['Idle','Move','Windup','Attack','Hit','Death'].every(x=>c.clips.includes(x)));
 if(broken.length||errors.length)throw Error(JSON.stringify({broken,errors}));
 return {loaded:out.cases.length,boneRange:[Math.min(...out.cases.map(x=>x.bones)),Math.max(...out.cases.map(x=>x.bones))],heightRange:[Math.min(...out.cases.map(x=>x.height)),Math.max(...out.cases.map(x=>x.height))],errors};
}
