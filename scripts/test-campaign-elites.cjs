const assert=require('node:assert/strict'),E=require('../public/3d/campaign-elites.js');
const checks=[];function ok(name,fn){fn();checks.push(name);}
for(const [zone,kind]of [[0,'raid'],[4,'forge'],[5,'shore'],[7,'tower']]){
 const e={x:0,z:0,y:0,hp:100,maxHp:100,role:'exploder',r:18};E.setup(e,zone);Object.assign(e,{x:0,z:0,y:0});const p={x:0,z:100,y:0,hp:100,r:12};
 ok(kind+' replaces random role and preserves original body stats',()=>{assert.equal(e.ceKind,kind);assert.equal(e.role,null);assert.equal(e.hp,100)});
 while(e.ceState==='hunt')E.step(e,.05,p,0);const aim=[e.ceDX,e.ceDZ,e.ceX,e.ceZ];let elapsed=0;
 while(e.ceState==='wind'){assert.equal(E.contains(e,p),false);E.step(e,.01,{...p,x:300},0);elapsed+=.01;}
 ok(kind+' full harmless warning and locked aim',()=>{assert.ok(elapsed>=E.kits[kind].wind-.02);assert.deepEqual([e.ceDX,e.ceDZ,e.ceX,e.ceZ],aim)});
 ok(kind+' snapshot carries complete phase geometry',()=>{const snap=E.snapshot(e);assert.equal(snap.ceKind,kind);assert.equal(snap.role,null);assert.equal(snap.ceSerial,1);assert.equal(snap.ceState,'strike');assert.equal(snap.ceX,0)});
 while(e.ceState==='strike')E.step(e,.01,p,0);ok(kind+' recovery leaves an attack opening',()=>{assert.equal(e.ceState,'recover');assert.ok(e.ceClock>=1.1);assert.equal(E.contains(e,p),false)});
}
function entity(kind,clock){return {ceKind:kind,ceState:'strike',ceClock:clock??E.kits[kind].strike,ceX:0,ceY:0,ceZ:0,ceDX:0,ceDZ:1};}
const p=(x,z,y=0)=>({x,z,y,hp:100,r:12});
ok('raid hits front, misses rear/outside/above',()=>{const e=entity('raid');assert.ok(E.contains(e,p(0,100)));for(const q of [p(0,-100),p(250,0),p(0,100,100)])assert.ok(!E.contains(e,q));});
ok('forge expands outward and jumping clears it',()=>{const e=entity('forge',.35);assert.ok(E.contains(e,p(0,118)));for(const q of [p(0,118,50),p(0,0),p(0,270)])assert.ok(!E.contains(e,q));});
ok('shore hits three lanes, gaps and cover range stay safe',()=>{const e=entity('shore');for(const a of [-.32,0,.32])assert.ok(E.contains(e,p(Math.sin(a)*300,Math.cos(a)*300)));assert.ok(!E.contains(e,p(48,300)));assert.ok(!E.contains(e,p(0,420)));});
ok('tower cardinal lanes hit, diagonal gaps stay safe',()=>{const e=entity('tower');for(const q of [p(150,0),p(-150,0),p(0,150),p(0,-150)])assert.ok(E.contains(e,q));assert.ok(!E.contains(e,p(100,100)));});
ok('dead enemy or target cannot damage',()=>{assert.ok(!E.contains({...entity('raid'),dead:true},p(0,100)));assert.ok(!E.contains(entity('raid'),{...p(0,100),hp:0}));});
ok('tall solid cover blocks, ground and overhead props do not',()=>{const e=entity('shore'),wall={x:0,z:50,w:40,d:20,h:100};assert.ok(E.blocked(e,p(0,150),[wall]));assert.ok(!E.blocked(e,p(0,150),[{...wall,h:0}]));assert.ok(!E.blocked(e,p(0,150),[{...wall,y0:120,h:160}]));assert.ok(!E.blocked(e,p(150,0),[wall]));});
console.log(JSON.stringify({checks}));
