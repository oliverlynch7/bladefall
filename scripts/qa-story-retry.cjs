async page => {
  const context=await page.context().browser().newContext(),p=await context.newPage(),errors=[];
  let requests=0;
  p.on('pageerror',e=>errors.push(e.message));
  try {
    await p.route('**/story/prison-dungeons.json*',route=>{requests++;if(requests===1)route.abort('failed');else route.continue();});
    await p.goto('http://127.0.0.1:4332/3d/?mute=1&qa=story-retry');
    await p.waitForFunction(()=>window.__BF3&&window.BFPrison);
    const loaded=await p.evaluate(async()=>{const book=await __BF3.briarReady;return !!book?.events?.['kd.lift.winch']&&!!book?.nodes?.['kd.walter.first'];});
    if(!loaded||requests<2||errors.length)throw Error(JSON.stringify({loaded,requests,errors}));
    return {checks:['story book recovers from one failed file request'],requests,errors};
  } finally {await context.close();}
}
