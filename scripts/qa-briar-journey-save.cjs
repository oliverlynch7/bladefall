// Prepare public/3d/.qa-briar-pre2188.html from
// git show 253fa6bd:public/3d/index.html, then remove the fixture after running.
// These saves are created by that older build in disposable browser storage.
async root=>{
 const ctx=await root.context().browser().newContext(),page=await ctx.newPage(),rows=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 for(const stage of ['mara','water','jam','bridge']){
 await page.goto('http://127.0.0.1:4345/3d/.qa-briar-pre2188.html?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(()=>__BF3.briarReady);
 const before=await page.evaluate(stage=>{const b=__BF3;b.loadMode('rl');Object.assign(b.meta,{run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,autoAttack:false,dialogueTTS:false,petActive:null,classId:'warrior',heroName:'Legacy Miller'});b.openHub();b.enterZone(0);b.meta.gold=317;b.G.p.xp=99;b.classState('warrior').xp=41;const s=b.G.storyState;Object.assign(s.flags,{'thomas.ready':true,'mara.healing':true});if(stage!=='mara'){s.quests['briar.escape']='active';s.flags['briar.water']=true;}if(['jam','bridge'].includes(stage))s.flags['briar.jam']=true;if(stage==='bridge')s.flags['briar.bridge']=true;b.briarSync();b.meta.run.campaign.storyState=JSON.parse(JSON.stringify(s));b.autosaveRun();return{gold:b.meta.gold,xp:b.G.p.xp,classXp:b.classState('warrior').xp,weapon:b.G.p.weapon.name,oldBuild:!b.G.briarMill};},stage);
 await page.goto('http://127.0.0.1:4345/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await page.evaluate(async()=>{await __BF3.briarReady;__BF3.loadMode('rl');__BF3.continueRun();});
 const after=await page.evaluate(()=>{const b=__BF3;return{gold:b.meta.gold,xp:b.G.p.xp,classXp:b.classState('warrior').xp,weapon:b.G.p.weapon.name,latched:b.G.briarMill.latched,bridge:b.G.briarMill.bridge,barrier:b.G.walls.some(w=>w.storyBridge),quest:b.G.storyState.quests['briar.escape'],name:b.meta.heroName,area:b.G.area};});
 if(!before.oldBuild||before.gold!==after.gold||before.xp!==after.xp||before.classXp!==after.classXp||before.weapon!==after.weapon||after.name!=='Legacy Miller'||after.area!==0||after.quest!=='active'||after.latched!==(stage!=='mara')||(stage==='bridge'?(after.bridge!==1||after.barrier):!after.barrier))throw Error(JSON.stringify({stage,before,after}));rows.push({stage,before,after});
 }
 if(errors.length)throw Error(JSON.stringify(errors));return{rows,errors,source:'253fa6bd v2.187 HTML creates each save; current HTML loads it'};
 }finally{await ctx.close();}
}
