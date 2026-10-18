const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),s=fs.readFileSync('public/3d/index.html','utf8');
const a=s.indexOf('  drawPeer(q,t){'),b=s.indexOf('\n  // ================= P1.2 SHARED ENEMIES',a);assert(a>=0&&b>a);let checks=0;
for(const flags of [{},{riding:true},{busy:'Paused'},{downed:true},{fallback:true},{teams:true},{pet:true},{chess:true}]){
 const boxes=[],heroes=[],pets=[],hpBars=[];const c={G:{area:0},window:{BFSocial:{camera:()=>!!flags.chess}},BFFaceOptions:{appearance:x=>x||{}},Math,performance:{now:()=>0},SKINS:{},PETS:{shepherd:{name:'Shepherd'}},pushM(){},popM(){},mv(){},rotY(){},bx:(...args)=>boxes.push(args),drawHero3:p=>{if(flags.fallback)throw Error('test fallback');heroes.push(p)},drawPet3:p=>pets.push(p),project:()=>[100,200],hpBars};vm.createContext(c);vm.runInContext('this.mp={'+s.slice(a,b).trim().replace(/,$/,'')+'};',c);Object.assign(c.mp,{zone:0,teams:!!flags.teams,teamOf:()=>0,pvp:false});const q={id:'friend',name:'Friend',zone:0,area:0,x:0,z:0,hp:80,hpm:100,...flags};if(flags.pet)q.pet={id:'shepherd',hp:10,maxHp:20};c.mp.drawPeer(q,1);
 assert(!boxes.some(x=>x[3]===5&&x[4]===5&&x[5]===5||x[3]===6&&x[4]===6&&x[5]===6),'no overhead marker '+JSON.stringify(flags));checks++;
 if(!flags.chess){assert(hpBars.some(x=>x.peer&&x.name.startsWith('Friend')&&x.f===.8));checks++;}
 if(flags.downed){assert.equal(boxes.length,2);assert(hpBars.some(x=>x.downed));checks++;}else if(!flags.fallback){assert.equal(heroes.length,1);checks++;}
 if(flags.busy){assert(heroes[0].pausedSafe);checks++;}if(flags.pet){assert.equal(pets.length,1);assert(hpBars.some(x=>x.pet));checks++;}
}
for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
console.log(checks+' teammate model, no-cube, name/health, downed, mount, pause, fallback and companion checks passed.');
