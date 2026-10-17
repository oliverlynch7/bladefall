const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('public/3d/guided-tutorial.js','utf8');
let rotations=[],arcs=[],reads=0,nav={heading:0,peers:[{x:40,z:30}]},checks=0;
const ctx=new Proxy({rotate:a=>rotations.push(a),arc:(...a)=>arcs.push(a)},{get:(o,k)=>o[k]||(()=>{})});
const canvas={setAttribute(){},getContext:()=>ctx};
const document={createElement:()=>canvas,head:{append(){}},body:{append(){}}};
const window={addEventListener(){},__BF_MAP_PARTY:()=>{reads++;return nav;},BFPartyNavigation:{target:()=>({x:200,z:100})}};
vm.runInNewContext(code,{window,document});
const g={p:{x:10,z:20,yaw:0},zone:0,enemies:[],marks:[]};
function check(v,msg){assert(v,msg);checks++;}
for(const h of [0,Math.PI/2,Math.PI,-Math.PI+.001,Math.PI-.001,-2,0]){
 nav.heading=h;g.p.yaw=h/2;rotations=[];arcs=[];const before=reads;window.BFGuidedTutorial.map(g,'play');
 check(rotations[0]===h+Math.PI,'world heading follows immediately, including wrap');
 check(rotations[1]===h-g.p.yaw,'player arrow stays accurate relative to camera');
 check(reads===before+1,'one consistent navigation sample per frame');
 check(arcs.some(a=>Math.abs(a[0]-30*145/800)<1e-9&&Math.abs(a[1]-10*145/800)<1e-9),'teammate current position retained');
 check(arcs.some(a=>Math.abs(a[0]-190*145/800)<1e-9&&Math.abs(a[1]-80*145/800)<1e-9),'objective current position retained');
}
nav.heading=NaN;g.p.yaw=1.1;rotations=[];window.BFGuidedTutorial.map(g,'play');check(rotations[0]===1.1+Math.PI,'missing camera heading falls back to player');
window.BFGuidedTutorial.map(g,'pause');check(canvas.hidden,'paused map hidden');nav.heading=-1;rotations=[];window.BFGuidedTutorial.map(g,'play');check(!canvas.hidden&&rotations[0]===-1+Math.PI,'resume has no stale heading');
console.log(`${checks} actual minimap canvas behavior checks passed.`);
