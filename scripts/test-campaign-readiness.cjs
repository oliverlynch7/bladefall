const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
const source=fs.readFileSync('public/3d/index.html','utf8'),previous=fs.readFileSync('scripts/fixtures/enemy-route-before2280.js','utf8'),nav=require('../public/3d/enemy-navigation.js');
const cut=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function load(G,old){const c={G,ECLIMB:44,BFEnemyNavigation:nav};vm.createContext(c);vm.runInContext(cut(source,'function resolveObstacles(','/* course floors:')+(old?previous:cut(source,'function enemySupport(','function syncedMelee(')),c);return c;}
let seed=2280;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),coord=()=>random()*1100-550;
const G={segments:[{x:0,z:0,w:2000,d:2000}],obstacles:[],walls:[],movers:[],crumbles:[],doors:[],torches:[],time:1};
for(let i=0;i<160;i++)G.obstacles.push({x:coord(),z:coord(),w:10+random()*160,d:10+random()*160,h:random()*180,y0:i%4?undefined:60,kind:i%5?'col':'plat',structure:i%7===0});
for(let i=0;i<18;i++){G.walls.push({x:coord(),z:coord(),w:20,d:150,h:100,stand:i%2===0});G.movers.push({x:coord(),z:coord(),w:80,d:80,h:20});G.crumbles.push({x:coord(),z:coord(),w:70,d:70,h:25,state:i%3});}
G.doors=[{x:50,z:20,w:100,d:20,h:160,open:false}];G.torches=[{x:-30,z:-20}];
const old=load(G,true),now=load(G,false);let cases=0;
for(let i=0;i<6000;i++){const e={x:coord(),z:coord(),y:Math.floor(random()*5)*25,r:10+random()*20,h:56},b={x:e.x+random()*100-50,z:e.z+random()*100-50,y:e.y},scope=old.enemyRouteContext(e);const a=old.enemyRouteEdge(e,e,b,scope),c=now.enemyRouteEdge(e,e,b,scope);assert.equal(JSON.stringify(c),JSON.stringify(a),'sweep parity '+i);cases++;}
// A raised platform through a support building, ceiling, narrow door and floor-edge remain live.
for(const open of [false,true]){G.doors[0].open=open;for(const y of [0,25,60,100])for(let x=-120;x<120;x+=10){const e={x,y,z:20,r:16,h:56},b={x:x+20,z:20,y},scope=old.enemyRouteContext(e);assert.equal(JSON.stringify(now.enemyRouteEdge(e,e,b,scope)),JSON.stringify(old.enemyRouteEdge(e,e,b,scope)));cases++;}}
// Every query must see moving geometry and changed crumble state; no cross-frame cache.
G.movers[0].x=0;G.movers[0].z=0;G.movers[0].h=35;G.crumbles[0].state=2;
for(let i=0;i<25;i++){const e={x:i-12,z:0,y:35,r:16,h:56},scope=old.enemyRouteContext(e);assert.equal(JSON.stringify(now.enemyRouteEdge(e,e,{x:e.x+12,z:0},scope)),JSON.stringify(old.enemyRouteEdge(e,e,{x:e.x+12,z:0},scope)));cases++;}
let reads=0;const dense={segments:[{x:0,z:0,w:2000,d:2000}],walls:[],movers:[],crumbles:[],doors:[],torches:[],obstacles:Array.from({length:180},(_,i)=>new Proxy({x:100+i*2,z:300,w:20,d:20,h:100},{get(o,k){if(k==='x')reads++;return o[k];}}))};
const a=load(dense,true),b=load(dense,false),e={x:0,z:0,y:0,r:16,h:56},goal={x:48,z:48,y:0};reads=0;a.enemyRouteEdge(e,e,goal,dense);const oldReads=reads;reads=0;b.enemyRouteEdge(e,e,goal,dense);const newReads=reads;assert(newReads<oldReads*.5,`bounded support work ${oldReads} -> ${newReads}`);
const bench=api=>{const t=performance.now();for(let i=0;i<500;i++)api.enemyRouteEdge(e,e,goal,dense);return performance.now()-t;};
console.log(JSON.stringify({parityCases:cases,geometryXReads:{before:oldReads,after:newReads},syntheticMs:{before:bench(a),after:bench(b)}}));

// Dispose scene-owned DOM text even when a story/tour freezes simulation time.
const nodes=new Set(),textContext={meta:{dmgNumbers:true},project:()=>[100,200],document:{body:{appendChild:el=>nodes.add(el)},createElement:()=>({style:{},remove(){nodes.delete(this);}})}};
vm.createContext(textContext);vm.runInContext(cut(source,'const worldTexts=[];','let PROJ='),textContext);
textContext.addText(0,0,0,'IT RISES','#fff',true);textContext.addText(0,0,0,'+20 XP','#fff',false);assert.equal(nodes.size,2);textContext.clearWorldTexts();assert.equal(nodes.size,0);textContext.clearWorldTexts();assert.equal(nodes.size,0,'empty cleanup is safe');
textContext.addText(0,0,0,'12','#fff',false,'dmg');textContext.updateTexts(.2);assert.equal(nodes.size,1,'same-scene damage text retains its normal life');textContext.updateTexts(.8);assert.equal(nodes.size,0,'normal text expires');textContext.meta.dmgNumbers=false;textContext.addText(0,0,0,'12','#fff',false,'dmg');assert.equal(nodes.size,0);textContext.addText(0,0,0,'Quest complete','#fff',true);assert.equal(nodes.size,1,'noncombat messages survive the numbers setting');textContext.clearWorldTexts();assert.equal(nodes.size,0);
console.log('Floating text disposal, normal lifetimes and damage-number preferences pass.');
