async page=>{
 let hits=0;
 await page.route('**/voice-api/game',route=>{hits++;return route.fulfill({status:404,body:''});});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;await Promise.all(Array.from({length:15},()=>BFVoiceContent.apply({nodes:{}})));});
 if(hits!==1)throw Error('Expected one shared manifest request, got '+hits);
 return {requests:hits,version:await page.evaluate(()=>__BF3.snap().version)};
}
