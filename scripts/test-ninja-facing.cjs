const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync('public/3d/index.html','utf8');
const hook=s.slice(s.indexOf('  ninja(p, e, dmg){'),s.indexOf('  /* FLOW. Every connecting attack'));
const tick=s.slice(s.indexOf('  if(p._unseenFacing){'),s.indexOf('  hazUpdate(dt); questMarkTick'));
let checks=0;for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){
 const p={x:Math.sin(a)*-50,z:Math.cos(a)*-50,y:0,_stillT:2,swingId:1};const e={x:0,z:0,y:0,h:40,hp:100,maxHp:100};
 const G={camYaw:1.17,camPitch:.23};const c={p,e,G,Math,c2Passive:()=>false,unseenLanding:()=>({x:Math.sin(a)*50,y:0,z:Math.cos(a)*50}),addText(){},burst(){}};vm.createContext(c);
 vm.runInContext('const basic={'+hook+'};basic.ninja(p,e,10)',c);const expected=Math.atan2(e.x-p.x,e.z-p.z);
 assert.equal(p.yaw,expected);checks++;for(let n=0;n<18;n++){p.yaw=2.1;vm.runInContext('{let dt=1/60;'+tick+'}',c);assert.equal(p.yaw,expected);checks++;}
 assert.equal(G.camYaw,1.17);assert.equal(G.camPitch,.23);checks+=2;
 vm.runInContext('{let dt=.1;'+tick+'}',c);assert.equal(p._unseenFacing,undefined);checks++;
 p.yaw=.7;vm.runInContext('{let dt=.016;'+tick+'}',c);assert.equal(p.yaw,.7);checks++;
}
console.log(JSON.stringify({passed:true,checks}));
