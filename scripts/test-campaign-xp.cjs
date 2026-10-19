const fs=require('fs'),vm=require('vm'),assert=require('assert');const src=fs.readFileSync('public/3d/index.html','utf8');
const award=src.slice(src.indexOf('function characterXpAward('),src.indexOf('function checkStageClear()'));
const campaign=src.match(/function isCampaignAdventure\(\)[^\n]+/)[0];
let classXp=0;const ctx={G:{p:{level:1,xp:0,xpNext:100000},zone:0},IN_ARENA:false,ZONES:[{}],Math,gainClassXp:n=>classXp+=n,checkAchievements(){},hudUpdate(){},autosaveRun(){}};vm.createContext(ctx);vm.runInContext(campaign+'\n'+award,ctx);
ctx.gainXp(800);assert.equal(ctx.G.p.xp,1350);assert.equal(classXp,2560);assert.equal(ctx.characterXpAward(800),1200*1.125);
for(const flag of ['hub','side','trial','arena','endless','delve','bossRush','bonusActive']){ctx.G[flag]=true;ctx.G.p.xp=0;classXp=0;ctx.gainXp(800);assert.equal(ctx.G.p.xp,800,flag);assert.equal(classXp,640,flag);delete ctx.G[flag];}
ctx.G.devKeep=true;ctx.G.p.xp=0;ctx.gainXp(800);assert.equal(ctx.G.p.xp,0);delete ctx.G.devKeep;
ctx.IN_ARENA=true;assert.equal(ctx.characterXpAward(800),800);ctx.IN_ARENA=false;
assert(src.includes("'+'+characterXpAward(_xp)+' XP'")||src.includes("+characterXpAward(_xp)+' XP'"));assert(src.includes("characterXpAward(reward.amount)+' XP'"));
assert(src.includes('if(xp>0) gainXp(xp)'));console.log('Campaign character XP +12.5%, class XP unchanged, excluded modes unchanged, award text and shared kill credit pass.');
