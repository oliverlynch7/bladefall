const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=process.argv[2]||require('node:path').resolve(__dirname,'../../public/3d/hostile-art.js');const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(file,'utf8'),context);const api=context.window.BF_HOSTILE_ART;
let count=0,depth=0;const draw={quality:'high',theme:'void',pushM(){depth++;},popM(){depth--;assert.ok(depth>=0);},mv(){},rotX(){},rotY(){},ribbon(a,b,w,c,alpha){assert.ok([...a,...b,w,alpha].every(Number.isFinite));count++;}};
for(const type of Object.keys(api.types)){const g={time:.2,enemies:[],projectiles:[{owner:'enemy',src:{type},x:10,y:20,z:30,vx:20,vy:0,vz:50,size:7}]};const before=JSON.stringify(g);count=0;api.render(g,draw);assert.ok(count>0&&count<=300,type);assert.equal(depth,0);assert.equal(JSON.stringify(g),before);}
console.log(Object.keys(api.types).length+' projectile profiles render without changing game state');

const waves=Array.from({length:4},()=>({fxType:'sorcerer',dmg:5,r:60}));const g={shockwaves:waves};
assert.deepEqual(waves.map(w=>api.replacesWave(g,w,'low')),[true,false,false,false]);
assert.deepEqual(waves.map(w=>api.replacesWave(g,w,'high')),[true,true,true,false]);
for(const w of [{dmg:5},{fxType:'brute',dmg:0},{fxType:'brute',dmg:5,delay:1},{fxType:'brute',dmg:5,hitPlayer:true}])assert.equal(api.replacesWave({shockwaves:[w]},w,'high'),false);
assert.equal(api.replacesWave(g,{fxType:'brute',dmg:5},'high'),false);
console.log('Wave replacement preserves delayed, player and overflow warnings');
