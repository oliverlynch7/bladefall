async page=>{
// Run after qa-shipwreck-shore: that route test leaves real completed quests and two carried shards.
const before=await page.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='sc.board');if(!b.G.pendingRiftShards.found.includes('SC-01'))throw Error('Run shore QA first');Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});BFShipCrossing.damage(b.G.voyage,100,'qa-rock');b.update(.016);return {area:b.G.area,failed:b.G.voyage.failed,bank:b.meta.riftShards.length};});
await page.getByRole('button',{name:'Retry this part',exact:true}).click();await page.waitForFunction(()=>!BF_LOADING.active&&!!__BF3.G.shore);
const after=await page.evaluate(()=>({area:__BF3.G.area,depart:!!__BF3.G.storyState.flags['sc.depart'],met:!!__BF3.G.storyState.flags['sc.met'],voyage:!!__BF3.G.voyage,carried:__BF3.G.pendingRiftShards?.found?.length||0,bank:__BF3.meta.riftShards.length,boat:__BF3.G.shore.parts}));
if(!before.failed||after.area!==0||after.depart||after.met||after.voyage||after.carried||after.bank!==before.bank||after.boat.some(Boolean))throw Error(JSON.stringify({before,after}));
return {hullFailureRestartsFirstHalf:true,unbankedShardsAndQuestChoicesReset:true,noVoyageCheckpoint:true,before,after};
}
