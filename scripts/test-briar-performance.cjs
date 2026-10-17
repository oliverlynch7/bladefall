const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n'),before=fs.readFileSync('scripts/fixtures/briar-collision-before2234.js','utf8');
function cut(s,a,b){const start=s.indexOf(a);assert(start>=0,a);const end=s.indexOf(b,start);assert(end>start,b);return s.slice(start,end);}
function context(s,G){const c={G,ECLIMB:44};vm.createContext(c);vm.runInContext(cut(s,'function resolveObstacles(','/* course floors:')+cut(s,'function enemySupport(','function moveGroundEnemy('),c);return c;}
let reads=0;const far=Array.from({length:250},(_,i)=>new Proxy({x:2000+i*15,z:2000,w:40,d:40,h:140,structure:true},{get(t,k){if(k==='kind')reads++;return t[k];}}));
const G={segments:[{x:0,z:0,w:2000,d:2000}],walls:[],movers:[],crumbles:[],obstacles:far,doors:[],torches:[]},old=context(before,G),now=context(source,G);
const a={x:0,y:0,z:0,hh:56},b={...a};old.resolveObstacles(a,14,null,44);const legacy=reads;reads=0;now.resolveObstacles(b,14,null,44);assert.deepEqual(a,b);assert(legacy>50000);assert(reads<10,'distant structures cannot rescan every walkway');
const wall={x:0,z:0,w:50,d:50,h:140,structure:true};G.obstacles=[wall];const p={x:20,z:0,y:0,hh:56};now.resolveObstacles(p,14,null,44);assert(p.x>=39,'near walls still collide');
G.obstacles=[wall,{kind:'plat',x:0,z:0,w:80,d:80,h:30}];const walker={x:20,z:0,y:30,hh:56};now.resolveObstacles(walker,14,null,44);assert.equal(walker.x,20,'supported building walkways retain their exception');
G.obstacles=[{x:0,z:0,w:100,d:18,y0:108,h:164,structure:true}];const door={x:0,z:0,y:0,hh:56};now.resolveObstacles(door,14,null,12);assert.equal(door.z,0,'walk beneath a doorway lintel');
G.obstacles=[...far,{x:100,z:0,w:90,d:90,h:22},{x:-200,z:80,w:110,d:100,h:100}];G.walls=[{x:320,z:10,w:30,d:180,h:80,stand:true}];G.movers=[{x:70,z:150,w:80,d:80,h:25}];G.crumbles=[{x:-100,z:120,w:70,d:70,h:16,state:0}];
const scope=now.enemyRouteContext({x:0,z:0,r:16});assert(scope.obstacles.length<5);
for(let x=-384;x<=384;x+=48)for(let z=-384;z<=384;z+=48){const e={x,z,y:30,r:16};assert.equal(now.enemySupport(e,scope),old.enemySupport(e));}
let queries=0;const d={window:{devicePixelRatio:2,innerWidth:3840,innerHeight:2160},meta:{quality:'high'},gl:{MAX_TEXTURE_SIZE:1,getParameter(){queries++;return 16384;}}};vm.createContext(d);vm.runInContext(cut(source,'function targetRenderDpr(){','function resize(){'),d);const auto=d.targetRenderDpr();assert(Math.abs(3840*2160*auto*auto-2560*1440)<1);for(let i=0;i<200;i++)d.targetRenderDpr();assert.equal(queries,1,'GPU limit queried once, not every rendered frame');d.meta.nativeResolution=true;assert.equal(d.targetRenderDpr(),2);
console.log(`Collision behavior and bounded navigation pass; far-walkway reads ${legacy} -> ${reads}. Auto pixel budget/native override/GPU-query cache pass.`);

// Actual updater must not change shader light-count variants as the player leaves a lamp.
const art=fs.readFileSync('public/3d/outskirts-art.js','utf8'),points=Array.from({length:3},()=>({visible:false,intensity:900,position:{copy(v){this.x=v.x;this.y=v.y;this.z=v.z;}}})),st={groups:[],lamps:[{x:0,y:60,z:0}],points,stats:{},key:{position:{set(){}},target:{position:{set(){}},updateMatrixWorld(){}}}},lightContext={active:{userData:{art:st}},window:{__BF_META:()=>({quality:'high'})}};
vm.createContext(lightContext);vm.runInContext(cut(art,'export function updateOutskirts(','export function outskirtsObstacleDrawn').replace('export function','function'),lightContext);
for(const x of [0,2000,0]){lightContext.updateOutskirts({p:{x,y:0,z:0}});assert.equal(points.filter(l=>l.visible).length,3,'constant three shader lights, even away from lamps');assert.equal(points.filter(l=>l.intensity>0).length,x===0?1:0,'only nearby lamps illuminate the scene');}
console.log('Lamp proximity changes intensity, never shader light count.');
