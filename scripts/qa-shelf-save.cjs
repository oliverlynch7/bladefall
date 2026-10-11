async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.introSeen=true;b.openHub();b.enterZone(6);b.G.area=1;b.loadArea();});
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.library);
  const result=await page.evaluate(()=>{
    const b=__BF3,G=b.G,rows=[];
    G.storyState=BFStoryState.restore({...G.storyState,version:1,flags:{...G.storyState.flags,'sl.shelf.open':true},items:{...G.storyState.items,'sl.shelf.turns':7}});
    b.loadArea();rows.push({case:'old complete',shelves:G.obstacles.filter(o=>o.shelfJump).length,shard:b.worldRiftShards().some(q=>q.id==='SP-03'),near:BFSkyLibrary.available('sl.shelf.0',G),far:BFSkyLibrary.available('sl.shelf.1',G)});
    G.storyState=BFStoryState.restore({...G.storyState,version:1,flags:{},items:{'sl.shelf.0':2,'sl.shelf.1':1,'sl.shelf.turns':5}});
    b.loadArea();rows.push({case:'old partial',shelves:G.obstacles.filter(o=>o.shelfJump).length,shard:b.worldRiftShards().some(q=>q.id==='SP-03'),near:BFSkyLibrary.available('sl.shelf.0',G),far:BFSkyLibrary.available('sl.shelf.1',G)});
    G.storyState.flags['sl.shelf.stage1']=true;b.loadArea();rows.push({case:'new partial',shelves:G.obstacles.filter(o=>o.shelfJump).length,shard:b.worldRiftShards().some(q=>q.id==='SP-03'),near:BFSkyLibrary.available('sl.shelf.0',G),far:BFSkyLibrary.available('sl.shelf.1',G)});
    return rows;
  });
  if(errors.length||result[0].shelves!==6||!result[0].shard||result[0].near||result[0].far||result[1].shelves||result[1].shard||!result[1].near||result[1].far||result[2].shelves!==2||result[2].shard||result[2].near||!result[2].far)throw Error(JSON.stringify({result,errors}));
  return {result,errors};
}
