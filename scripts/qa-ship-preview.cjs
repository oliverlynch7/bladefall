async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/ship-preview/');
 await page.waitForFunction(()=>window.__SHIP_PREVIEW?.renderer.info.render.triangles>0);
 const storageBefore=await page.evaluate(()=>JSON.stringify({...localStorage}));
 await page.setViewportSize({width:1440,height:900});
 await page.getByRole('button',{name:'Inspect boat',exact:true}).click();
 await page.screenshot({path:'public/3d/ship-preview/boat-detail.png'});
 await page.getByRole('button',{name:'Sailing view',exact:true}).click();
 await page.getByRole('button',{name:'Set sail',exact:true}).click();
 await page.locator('h1').click();await page.keyboard.down('ArrowRight');await page.waitForTimeout(650);await page.keyboard.up('ArrowRight');
 const moved=await page.evaluate(()=>__SHIP_PREVIEW.state.x);if(moved<1)throw Error('Keyboard did not steer');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const time=await page.evaluate(()=>__SHIP_PREVIEW.state.elapsed);await page.waitForTimeout(200);
 if(await page.evaluate(()=>__SHIP_PREVIEW.state.elapsed)!==time)throw Error('Pause did not freeze');
 await page.getByRole('button',{name:'Restart',exact:true}).click();
 await page.getByLabel('Two-role preview').check();
 // Host adapter simulation, not a network or real-combat claim. Steer actual course.
 const result=await page.evaluate(()=>{
  const {C,state:s}=__SHIP_PREVIEW;C.command(s,s.helm,{epoch:s.epoch,type:'start'});
  let checks=0;while(s.stage<2&&!s.failed&&checks++<15000){
   if(C.current(s).kind==='steer'){
    const o=C.obstacles(s.seed,s.stage).find(o=>o.z>s.distance-8),target=o?-Math.sign(o.x)*17:0;
    C.command(s,s.helm,{epoch:s.epoch,type:'steer',seq:s.tick+100,value:Math.max(-1,Math.min(1,(target-s.x)*.5))});
   }else C.clearWave(s,C.current(s).wave,0);
   C.advance(s,1/60);
  }
  C.pause(s,true);return {stage:s.stage,helm:s.helm,hull:s.hull};
 });
 if(result.stage!==2||result.helm!=='player-two'||result.hull!==100)throw Error(JSON.stringify(result));
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.getByRole('button',{name:'Repair +45',exact:true}).click();
 await page.waitForFunction(()=>document.getElementById('repair').disabled);
 await page.getByRole('button',{name:'Ready: player two',exact:true}).click();
 await page.getByRole('button',{name:'Ready: player one',exact:true}).click();
 await page.waitForFunction(()=>__SHIP_PREVIEW.state.stage===3);
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await page.screenshot({path:'public/3d/ship-preview/sailing-course.png'});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Inspect boat',exact:true}).click();
 await page.screenshot({path:'public/3d/ship-preview/boat-phone.png'});
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,triangles:__SHIP_PREVIEW.renderer.info.render.triangles,calls:__SHIP_PREVIEW.renderer.info.render.calls,saveKeys:Object.keys(localStorage).length}));
 if(layout.overflow)throw Error('Phone overflow');if(errors.length)throw Error(errors.join(';'));
 if(await page.evaluate(()=>JSON.stringify({...localStorage}))!==storageBefore)throw Error('Preview changed a save');
 // Pointer controls are usable on the phone view too, with release stopping input.
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 const left=await page.getByRole('button',{name:'Steer left',exact:true}).boundingBox();
 const xBefore=await page.evaluate(()=>__SHIP_PREVIEW.state.x);
 await page.mouse.move(left.x+left.width/2,left.y+left.height/2);await page.mouse.down();await page.waitForTimeout(500);await page.mouse.up();
 const xAfter=await page.evaluate(()=>__SHIP_PREVIEW.state.x);if(xAfter>=xBefore-1)throw Error('Pointer did not steer');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 return {keyboardSteering:moved,pause:true,roleSwap:result,repairOnce:true,twoReady:true,layout,errors};
}
