async page => {
  async function load(zone, area = 0, position) {
    await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2151');
    await page.waitForFunction(() => window.__BF3 && HERO3D?.ready);
    await page.evaluate(async ({zone,area,position}) => {
      const b = __BF3; await b.briarReady; b.loadMode('rl');
      b.meta.run = null; b.meta.bank = null; b.meta.introSeen = true;
      b.meta.classId = 'warrior'; b.meta.riftShards = [];
      b.openHub(); b.enterZone(zone); if (area) b.nextArea();
      b.meta.tutOff = true; b.meta.camMode = 'far'; b.G.p.invuln = 999;
      for (const e of b.G.enemies) e.stunT = 999;
      Object.assign(b.G.p,position);
    }, {zone,area,position});
    await page.waitForFunction(() => !BF_LOADING.active);
    await page.waitForTimeout(900);
  }
  await load(3,0,{x:0,z:-1960,y:380,vy:0});
  await page.screenshot({path:'output/playwright/campaign-peaks-winch-before.png'});
  await page.evaluate(() => {const b=__BF3,p=b.G.p;for(const key of ['ff.trail','ff.part','ff.heater']){const o=b.G.storyObjects.find(x=>x.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key});}Object.assign(p,{x:0,z:-1960,y:380});});
  await page.waitForTimeout(400);
  await page.screenshot({path:'output/playwright/campaign-peaks-winch-after.png'});
  await page.evaluate(() => {
    const b=__BF3, p=b.G.p;
    const roof=b.G.obstacles.find(o=>o.roofShard);
    if (!roof || b.highestSurfaceAt(roof.x,roof.z,roof.h+5)<roof.h) throw Error('Roof shard platform has no solid top');
    Object.assign(p,{x:roof.x,z:roof.z,y:roof.h,vy:0,onGround:true});
    b.G.camYaw=Math.PI;
  });
  await page.waitForTimeout(600);
  await page.screenshot({path:'output/playwright/campaign-peaks-roof-standing.png'});
  await load(4,0,{x:0,z:-3280,y:100,vy:0});
  await page.evaluate(()=>{__BF3.G.camYaw=Math.PI;__BF3.G.p.yaw=Math.PI;});
  await page.waitForTimeout(300);
  await page.screenshot({path:'output/playwright/campaign-iron-cart-before.png'});
  await page.evaluate(() => {const b=__BF3,G=b.G,p=G.p;G.storyState.flags['ih.handles']=true;b.briarSync();const o=G.storyObjects.find(o=>o.key==='ih.cart');Object.assign(p,{x:o.x,y:o.y,z:o.z});b.briarRequest('world',{key:'ih.cart'});Object.assign(p,{x:0,z:-3280,y:100});});
  await page.waitForTimeout(400);
  await page.screenshot({path:'output/playwright/campaign-iron-cart-moving.png'});
  await page.waitForTimeout(1500);
  await page.screenshot({path:'output/playwright/campaign-iron-cart-after.png'});
  await load(5,0,{x:-180,z:120,y:30,vy:0});
  await page.screenshot({path:'output/playwright/campaign-boat-before.png'});
  await page.evaluate(() => {const b=__BF3,G=b.G,p=G.p;G.storyState.flags['sc.met']=true;for(const k of ['rudder','sail','rope'])G.storyState.items['sc.'+k]=1;b.briarSync();const o=G.storyObjects.find(o=>o.key==='sc.fit');Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:'sc.fit'});Object.assign(p,{x:-180,z:120,y:30});});
  await page.waitForTimeout(400);
  await page.screenshot({path:'output/playwright/campaign-boat-after.png'});
  return {peaks:'output/playwright/campaign-peaks-winch-before.png / after.png / roof-standing.png',iron:'output/playwright/campaign-iron-cart-before.png / moving.png / after.png',boat:'output/playwright/campaign-boat-before.png / after.png'};
}
