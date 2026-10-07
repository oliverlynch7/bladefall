async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4339/3d/?devbriar=1&mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&document.getElementById('bstart'));
 await page.locator('#bi').check();await page.locator('#bstart').click();
 const inspect=()=>page.evaluate(()=>{
  const g=__BF3.G,s=g.devBriar,inside=(x,z)=>g.segments.some(f=>Math.abs(x-f.x)<f.w/2&&Math.abs(z-f.z)<f.d/2);
  const points=[...s.actors.map(p=>['actor:'+p.id,p]),...s.props.map(p=>['prop:'+p.kind,p]),...s.groups.map(p=>['group:'+p.id,p]),['exit',s.exit],...(s.holdAt?[['wagon',s.holdAt]]:[]),...(s.duelAt?[['ranger',s.duelAt]]:[])];
  return {part:s.part,segments:g.segments.length,outside:points.filter(([_,p])=>!inside(p.x,p.z)).map(([name,p])=>({name,x:p.x,z:p.z})),points:points.length};
 });
 const home=await inspect();
 await page.evaluate(()=>{Object.assign(BFBriarBeta.progress,{medicine:true,healing:true,bridge:true,evacuated:true});const p=__BF3.G.p;Object.assign(p,{x:0,z:-4250,y:0,onGround:true});__BF3.updateInteract();__BF3.doInteract();});
 const woods=await inspect();
 if(home.outside.length||woods.outside.length||woods.part!==1||errors.length)throw Error(JSON.stringify({home,woods,errors}));
 return {home,woods,errors};
}
