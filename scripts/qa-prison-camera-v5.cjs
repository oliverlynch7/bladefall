async page=>{
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 return page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();b.startDelve('warrior');const g=b.G,p=g.p;const rows=[];
 for(const mode of ['far','shoulder','fps']){b.meta.camMode=mode;let prev=null,maxStep=0,samples=0;delete g._cameraBoom;for(let i=0;i<420;i++){
 const z=200-i*3;Object.assign(p,{x:0,z,y:0});g.cam={x:0,z,y:0};g.camYaw=Math.PI;g.camPitch=.22;if(g._cameraBoom)g._cameraBoom.time-=1000/60;b.renderFrame();const e=g.eye;
 if(![e.x,e.y,e.z].every(Number.isFinite))throw Error('Invalid camera');if(prev)maxStep=Math.max(maxStep,Math.hypot(e.x-prev.x,e.y-prev.y,e.z-prev.z));prev={...e};samples++;
 }if(maxStep>4)throw Error('Camera jump '+mode+' '+maxStep);rows.push({mode,samples,maxStep});}
 // A released obstruction extends rather than popping straight to the full boom.
 b.meta.camMode='shoulder';Object.assign(p,{x:0,z:0,y:0});g.cam={x:0,y:0,z:0};g.camYaw=Math.PI;g.walls.push({x:0,z:80,w:300,d:20,y0:0,h:300});delete g._cameraBoom;b.renderFrame();const blocked=g._cameraBoom.fraction;g.walls.pop();g._cameraBoom.time-=16;b.renderFrame();const released=g._cameraBoom.fraction;if(!(released>blocked&&released<.99))throw Error('Camera release snapped');
 return {rows,blocked,released};
 });
}
