const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
function load(source){const c={window:{}};vm.createContext(c);vm.runInContext(source,c);return c.window.BFCameraOcclusion;}
const before=load(fs.readFileSync('scripts/fixtures/camera-occlusion-before2239.js','utf8')),after=load(fs.readFileSync('public/3d/camera-occlusion.js','utf8'));
let seed=2239;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),n=()=>rand()*1000-500;
for(let i=0;i<6000;i++){
 const world={p:{x:n(),y:n(),z:n()},eye:{x:n(),y:n(),z:n()},walls:[],obstacles:[],doors:[],cameraSolids:[]},o={x:n(),z:n(),w:rand()*500,d:rand()*500,y0:n(),h:n(),open:rand()<.1,cameraSolid:rand()<.05?false:undefined};
 const bottom=o.y0,top=o.h,mode=i%5===0?'fps':'shoulder',pad=i%9;assert.equal(after.blocks(world,o,bottom,top,mode,pad),before.blocks(world,o,bottom,top,mode,pad),'cutaway parity '+i);
 world[['walls','obstacles','doors','cameraSolids'][i%4]]=[o];const a=before.constrain(world,world.p,world.eye),b=after.constrain(world,world.p,world.eye);for(const key of ['x','y','z','fraction'])assert(Math.abs(a[key]-b[key])<1e-9,'camera sweep parity '+i+' '+key);
}
const dense={p:{x:0,y:80,z:0},eye:{x:30,y:150,z:220},obstacles:Array.from({length:1800},(_,i)=>({x:2000+i*50,z:2000,w:100,d:100,h:200})),walls:[],doors:[],cameraSolids:[]};
const bench=api=>{const t=performance.now();for(let i=0;i<1000;i++)api.constrain(dense,dense.p,dense.eye);return performance.now()-t;};bench(before);bench(after);const timings={beforeMs:bench(before),afterMs:bench(after)};console.log(JSON.stringify({parityCases:6000,timings}));
// Direct enemy steps now filter nearby geometry once for all swept support probes.
const source=fs.readFileSync('public/3d/index.html','utf8');assert.match(source,/enemyRouteEdge\(e,e,ahead,directContext\)/);assert.match(source,/enemyRouteEdge\(e,e,next,directContext\)/);
const quest=source.slice(source.indexOf('  const active=discoveredOptionalTasks().filter(m=>!m.done);'),source.indexOf('/* ---------------- Enemies'));
assert(quest.includes('<section class="qoptional"'));assert(!quest.includes('<details'));assert(quest.includes('m.progress'));assert(quest.includes("sig+='|optional:'"));console.log('Active optional objectives are visible and progress-sensitive.');
// Walking away from a lamp must not change Three's NUM_POINT_LIGHTS.
const lightSource=fs.readFileSync('public/3d/scene-lights.js','utf8').replace('export function','function'),lc={};vm.createContext(lc);vm.runInContext(lightSource,lc);
for(const [radius,power,flat]of [[300,900,false],[300,800,false],[330,900,false],[360,700,true]]){
 const state={lights:Array.from({length:3},()=>({visible:false,intensity:power,position:{copy(v){Object.assign(this,v);}}}))},positions=[{x:0,y:60,z:0},{x:50,y:60,z:0}];
 for(const x of [0,2000,0]){lc.updateLocalLights(state,positions,{x,y:0,z:0},radius,power,false,flat);assert(state.lights.every(l=>l.visible));assert.equal(state.lights.filter(l=>l.intensity>0).length,x===0?2:0);}
 lc.updateLocalLights(state,positions,{x:0,y:0,z:0},radius,power,true,flat);assert(state.lights.every(l=>l.visible&&l.intensity===0));
}
for(const file of ['keep-art.js','frost-art.js','deep-art.js','hub-art.js'])assert.match(fs.readFileSync('public/3d/'+file,'utf8'),/updateLocalLights\(/);console.log('Keep, Frostfell, deep regions and hub retain stable light pools, including low quality.');
const cut=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a))),nav=require('../public/3d/enemy-navigation.js');
const world={segments:[{x:0,z:0,w:1800,d:1800}],walls:[],obstacles:[{kind:'col',x:180,z:0,w:35,d:400,h:140},{kind:'plat',x:20,z:250,w:400,d:200,h:25}],movers:[],crumbles:[],doors:[],torches:[],time:1};
for(let i=0;i<1000;i++)world.obstacles.push({kind:'col',x:4000+i*30,z:4000,w:40,d:40,h:160});
function context(old){const c={G:world,ECLIMB:44,BFEnemyNavigation:nav};vm.createContext(c);vm.runInContext(cut(source,'function resolveObstacles(','/* course floors:')+cut(source,'function enemySupport(','function moveGroundEnemy(')+(old?fs.readFileSync('scripts/fixtures/enemy-step-before2239.js','utf8'):cut(source,'function moveGroundEnemy(','function syncedMelee(')),c);return c;}
const oldStep=context(true),newStep=context(false);
for(let i=0;i<60;i++){const original={x:(i%10-5)*50,z:(Math.floor(i/10)-3)*70,y:0,r:16,h:44},a=JSON.parse(JSON.stringify(original)),b=JSON.parse(JSON.stringify(original));world._navTime=null;oldStep.moveGroundEnemy(a,1,.2,75,.016);world._navTime=null;newStep.moveGroundEnemy(b,1,.2,75,.016);assert.equal(a.x,b.x);assert.equal(a.z,b.z);}
assert(newStep.enemyRouteContext({x:0,z:0,r:16},112).obstacles.length<4);console.log('60 actual enemy movement parity cases pass with bounded direct-step candidates.');
