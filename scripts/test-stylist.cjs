const fs=require('fs'),vm=require('vm'),assert=require('assert');const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/3d/face-options.js','utf8'),c);c.BFFaceOptions=c.window.BFFaceOptions;vm.runInContext(fs.readFileSync('public/3d/stylist.js','utf8'),c);const s=c.window.BFStylist;
const m={gold:25,heroName:'Hero',eyeColor:'#8fd0ff',mouthStyle:'line',browStyle:'natural'};
assert.equal(s.purchase(m,{...s.read(m),mouthStyle:'unknown'}).ok,false);assert.equal(m.gold,25);
assert.equal(s.purchase(m,{...s.read(m),heroName:'x'.repeat(21)}).ok,false);assert.equal(m.gold,25);
assert.equal(s.purchase(m,{...s.read(m),mouthStyle:'smile'}).ok,true);assert.equal(m.gold,0);
assert.equal(s.purchase(m,s.read(m)).ok,false);assert.equal(m.gold,0);
console.log('PASS invalid choices, long names, exact funds, unchanged purchase');
