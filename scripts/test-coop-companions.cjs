const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');let checks=0;
const ok=(v,n)=>{assert(v,n);checks++;};
const html=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n'),source=fs.readFileSync('public/3d/companion3d.js','utf8');
const c={window:{},Math,Number,Object,Array,Set};vm.createContext(c);
const pets=html.slice(html.indexOf('const PETS={'),html.indexOf('const PETIDS='));vm.runInContext(pets+';this.pets=PETS;',c);
const a=html.indexOf('  _petRender(raw,old){'),b=html.indexOf('  // Render-only motion',a);vm.runInContext('this.mp={'+html.slice(a,b)+'};',c);
vm.runInContext(source.slice(source.indexOf('export function companionActors'),source.indexOf('export function syncCompanions')).replace('export ',''),c);
const ids=Object.keys(c.pets),g={pet:null,zone:0,area:0},mp={active:true,zone:0,peers:{}};
for(const [i,id]of ids.entries()){
 const raw=[id,10+i,20+i,0,.5,40,100,0,.3,.8,1,1,1,1.55],p=c.mp._petRender(raw,null);
 ok(p?.id===id&&p.x===10+i,'known pet '+id+' decoded');ok(p.atkT===1.55&&p.sitting,'attack/rest animation state '+id);
 ok(p.mounted===(id==='sunwing')&&p.flying===(id==='sunwing'),'mount restricted to dragon '+id);
 p.t=5;raw[1]+=5;ok(c.mp._petRender(raw,p)===p&&p.t===5,'snapshot preserves actor identity/animation '+id);
 ok(p.tx===raw[1]&&p.x===10+i,'new network target retains interpolation '+id);
 mp.peers[id]={zone:0,area:0,pet:p};
}
let list=c.companionActors(g,mp);ok(list.length===10&&ids.every(id=>list.includes(mp.peers[id].pet)),'every owned/hidden pet selected remotely, not just dragon');
mp.peers.shepherd.area=1;ok(!c.companionActors(g,mp).includes(mp.peers.shepherd.pet),'other campaign half excluded');mp.peers.shepherd.area=0;
mp.peers.shepherd.zone=1;ok(!c.companionActors(g,mp).includes(mp.peers.shepherd.pet),'other region excluded');mp.peers.shepherd.zone=0;
mp.peers.shepherd.hall=true;ok(!c.companionActors(g,mp).includes(mp.peers.shepherd.pet),'Rift Hall isolated');mp.peers.shepherd.hall=false;
mp.peers.shepherd.pet.dead=true;ok(!c.companionActors(g,mp).includes(mp.peers.shepherd.pet),'dead peer pet removed');mp.peers.shepherd.pet.dead=false;
mp.peers.shepherd.pet.hp=0;ok(!c.companionActors(g,mp).includes(mp.peers.shepherd.pet),'zero health peer pet removed');mp.peers.shepherd.pet.hp=40;
const old=mp.peers.shepherd.pet;mp.peers.shepherd.pet=c.mp._petRender(['cinder',0,0,0,0,20,20],old);list=c.companionActors(g,mp);ok(!list.includes(old)&&list.includes(mp.peers.shepherd.pet),'pet change drops old source and includes new one');
mp.active=false;ok(c.companionActors(g,mp).length===0,'disconnection removes remote companions');mp.active=true;
g.pet=mp.peers.sunwing.pet;ok(c.companionActors(g,mp).length===10,'same source cannot be rendered twice');
const preview={id:'shepherd'};ok(c.companionActors(g,mp,[preview]).length===1&&c.companionActors(g,mp,[preview])[0]===preview,'preview stays independent of live peers');
for(const raw of [null,{},['missing',0,0],['__proto__',0,0],['shepherd',NaN,0],['shepherd',0,Infinity]])ok(c.mp._petRender(raw,null)===null,'malformed/unknown pet rejected');
ok(c.mp._petRender(['shepherd',0,0],null).hp===1,'legacy missing health remains renderable');
ok(c.mp._petRender(['shepherd',0,0,Infinity,NaN],null).y===0,'bad optional height uses safe default');
ok(c.mp._petRender(['shepherd',0,0,0,0,0,100],null).dead,'health-zero snapshot is dead');
const imports=JSON.parse(html.match(/<script type="importmap">([^<]+)/)[1]).imports;
for(const alias of ['2073','2226e'])ok(imports['./companion3d.js?v='+alias]==='./companion3d.js?v=2259','legacy module alias has one live registry');
ok(html.includes('G.pet.sitting?1:0,+(G.pet.atkT||0).toFixed(3)'),'owner packet appends attack timing after existing fields');
// All defined pets have recognizable compatibility graphics if detailed art is disabled/loading.
let boxes=0;Object.assign(c,{PETS:c.pets,three3DLive:()=>false,voxLod:()=>0,drawShadow(){},petRarityCol:()=> '#fff',pushM(){},popM(){},mv(){},rotY(){},rotX(){},rotZ(){},mMul:()=>[],mS:()=>[],CURM:[],tint:c=>c,bx:()=>boxes++,BFDragonCombat:{draw(){}}});
const f=html.indexOf('function drawPet3('),end=html.indexOf('\nfunction updatePetLabel()',f);vm.runInContext(html.slice(f,end),c);
for(const id of ids){boxes=0;c.drawPet3({id,x:0,y:0,z:0,yaw:0,bob:0,t:0},0);ok(boxes>3,id+' compatibility shape is not a generic cube');}
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
console.log(JSON.stringify({checks,passed:true,pets:ids}));
