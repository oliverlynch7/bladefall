const fs=require('fs'),vm=require('vm'),assert=require('assert');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/3d/face-options.js','utf8'),c);const f=c.window.BFFaceOptions;
assert.equal(f.normalize({eyeX:Infinity,eyeY:200,mouthTilt:-500}).eyeX,0);assert.equal(f.normalize({eyeY:200}).eyeY,100);assert.equal(f.normalize({mouthTilt:-500}).mouthTilt,-100);
for(let i=0;i<100;i++){const r=f.random();assert(!('heroName' in r)&&!('classId' in r));assert(Object.values(r.faceAdjust).every(n=>n>=-50&&n<=50&&n%5===0));}
console.log('PASS face defaults, bounds and randomized offset limits');
