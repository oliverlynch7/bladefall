async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.continue());await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>__BF3&&HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();b.enterArena();const g=b.G,p=g.p;p.x=p.z=p.y=0;g.cam={x:0,y:0,z:0};g.camYaw=Math.PI;g.enemies=[];g.walls=[];g.obstacles=[];g.doors=[];g.cameraSolids=[];
 const rows=[],check=(name,ok,data)=>rows.push({name,ok:!!ok,data});
 b.meta.camMode='fps';b.render(1);check('First person queues real local hero',window.__hero3dPending?.some(x=>x[0]===p));b.flushHero3D();check('Modern renderer remains live',HERO3D.on&&!HERO3D.err,HERO3D.err);const head=HERO3D._wrap.getObjectByName('Head');check('Head restored after first-person render',Math.abs(head?.scale.x-1)<.00001,head?.scale.toArray());
 const c=BFCameraOcclusion,t={x:0,y:34,z:0},d={x:0,y:130,z:180};
 check('Open room does not change camera',c.constrain(g,t,d).fraction===1);
 g.walls=[{x:0,z:80,w:300,d:20,h:200}];let e=c.constrain(g,t,d);check('Wall stops camera on player side',e.z<63&&e.z>0,e);
 g.walls=[];g.cameraSolids=[{x:0,z:0,w:800,d:800,y0:90,h:110}];e=c.constrain(g,t,d);check('Ceiling keeps camera below roof',e.y<83,e);
 for(const mode of ['shoulder','far']){b.meta.camMode=mode;b.render(2);b.flushHero3D();check(mode+' enclosed render',g.eye.y<90&&HERO3D.on,g.eye);}
 g.cameraSolids=[];g.obstacles=[{x:0,z:0,w:200,d:200,y0:-20,h:0}];check('Supporting floor never pulls camera',c.constrain(g,t,d).fraction===1);
 g.obstacles=[];g.doors=[{x:0,z:80,w:200,d:20,h:200,open:true}];check('Open doorway does not block',c.constrain(g,t,d).fraction===1);
 b.meta.camMode='fps';b.render(3);b.flushHero3D();return rows;});
 await page.screenshot({path:'tmp-fps.png'});if(errors.length||result.some(r=>!r.ok))throw Error(JSON.stringify({result,errors}));return {result,errors};
}
