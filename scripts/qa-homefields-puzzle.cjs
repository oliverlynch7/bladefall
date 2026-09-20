async page=>{
const checks=[];await page.evaluate(()=>{window.__homeGold=__BF3.meta.gold});
for(const key of ['clue','water','sun','water','wheat','cache']){await page.evaluate(key=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='home.bell.'+key);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key})},key)}
checks.push(await page.evaluate(()=>({open:__BF3.G.storyState.flags['home.bells.open'],note:!!__BF3.G.storyState.notes['home.bells'],reward:__BF3.meta.gold-window.__homeGold,claimed:__BF3.G.storyClaims['home.bells.cache']})));
if(!checks[0].open||!checks[0].claimed||checks[0].reward<=0)throw Error(JSON.stringify(checks));
await page.evaluate(()=>{const b=__BF3,g=b.meta.gold;b.briarRequest('world',{key:'home.bell.cache'});if(b.meta.gold!==g)throw Error('duplicate reward')});
await page.screenshot({path:'output/playwright/homefields-tower-solved.png'});return checks;
}
