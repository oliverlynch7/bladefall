const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s=fs.readFileSync('public/3d/index.html','utf8');
assert(!s.includes('function dodgeEchoTick('));assert(!s.includes('function dodgeEchoDraw('));assert(!s.includes('dodgeEchoDraw(_poseKeep)'));assert(!s.includes('motionTrailsBtn'));
assert(s.includes("![canvas,document.getElementById('lookzone'),document.getElementById('joyzone')].includes(e.target)"));
const key=s.match(/function keyAction\(code\)\{[^\n]+/)[0];const kc={meta:{keybinds:{dodge:['ShiftLeft','Mouse2']}},_codeToAction:{Mouse0:'attack',Mouse2:'dodge',KeyJ:'attack'}};vm.createContext(kc);vm.runInContext(key,kc);assert.equal(kc.keyAction('KeyK'),'dodge');kc._codeToAction.KeyK='jump';assert.equal(kc.keyAction('KeyK'),'jump');delete kc._codeToAction.KeyK;kc.meta.keybinds.dodge=['KeyL'];assert.equal(kc.keyAction('KeyK'),null);
const map=s.match(/window.__BF_MAP_PARTY=\(\)=>\((.+)\);/)[1];const mc={meta:{camMode:'far'},VIEW:[0,0,0,0,0,0,0,0,0,0,.7],G:{p:{yaw:2},camYaw:1},MP:{active:false},Math};vm.createContext(mc);vm.runInContext('this.read=()=>('+map+')',mc);assert.equal(mc.read().heading,Math.PI);mc.G.p.yaw=-1;assert.equal(mc.read().heading,Math.PI);mc.meta.camMode='shoulder';assert.equal(mc.read().heading,1);
console.log('Overhead input, key aliases, map and removed character afterimages pass');
