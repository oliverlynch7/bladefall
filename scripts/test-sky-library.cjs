require('../public/3d/dragon-rescue.js');
const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../public/3d/story-state.js'),L=require('../public/3d/sky-library.js');
const book=JSON.parse(fs.readFileSync('public/3d/story/sky-library.json','utf8'));
let s,n=0;
const reset=()=>s=E.create();
const act=(type,x={})=>{const r=E.transact(s,book,{id:'sl-test-'+ ++n,type,...x});s=r.state;return r.changed;};
const world=k=>act('world',{key:'sl.'+k});
const talk=(npc,cs)=>{assert(act('open',{npc}));for(const choice of cs)assert(act('choose',{line:s.conversation.node,choice}),choice);act('close');};

for(const route of ['persuade','care','service','repair']){
 reset();assert(!world('release'));
 if(route==='service')world('maintenance');
 else if(route==='care'){talk('hugh',['work','go']);world('records');talk('hugh',['work','done']);}
 else if(route==='repair')talk('hugh',['rules','sorry','open']);
 else talk('hugh',['help','open']);
 assert(s.flags['sl.access'],route);world('orders');world('release');assert(L.ready(s));assert.equal(L.shards(s).length,0);
}

reset();assert(!world('display.2'),'retired mark cannot open the display');
s.items['sl.display']=2; // Old partial sun-wing-sword progress is safe to ignore.
world('display.clue');assert.match(s.notes['sl.display'].text,/Grip the wing-shaped reflector/);
world('display.grip');assert.equal(s.items['sl.display.grips'],1);
const G={storyState:s,library:{active:-1,left:0,lensX:L.display.start,gripOwner:null,lightCharge:0},enemies:[],storyObjects:[{key:'sl.display.grip',x:L.display.start}]};
assert(L.grip(G,'solo'));assert(!L.grip(G,'ally'),'a second actor cannot steal the handle');
const p={x:L.display.start,z:L.display.handleZ,y:440,hp:100};
for(let i=0;i<70;i++){p.x=L.display.start-140*(i+1)/70;assert(!L.tick(G,.016,true,p));}
assert(!s.flags['sl.display.open']);assert(G.library.lensX< -1200);
for(let i=0;i<70;i++){p.x=-1250+(-1550+1250)*(i+1)/70;L.tick(G,.016,true,p);}
assert(!s.flags['sl.display.open'],'overshooting does not solve it');
let aligned=false;for(let i=0;i<35;i++){p.x=-1550+(L.display.target+1550)*(i+1)/35;aligned=L.tick(G,.016,true,p)||aligned;}
for(let i=0;i<70&&!aligned;i++)aligned=L.tick(G,.016,true,p);
assert(aligned,'holding the real beam on the target triggers the host');
world('display.align');assert(s.flags['sl.display.open']);G.storyState=s;
assert(!L.available('sl.display.grip',G));assert(!L.tick(G,.016,true,p));
for(const i of [1,1,2])world('shelf.'+i);
assert(s.flags['sl.shelf.open']);assert.deepEqual(L.shards(s).map(q=>q.id),['SP-03','SP-04']);
const turns=s.items['sl.shelf.turns'];world('shelf.0');assert.equal(s.items['sl.shelf.turns'],turns);
for(let i=0;i<3;i++){world('vow.'+i);world('seal.'+i);assert(!world('vow.'+i));}assert.equal(L.shards(s).length,3);
const V={storyState:s,library:{active:1,left:20},enemies:[{libraryGuard:'vow',hp:4},{libraryGuard:'main',hp:4}]};
assert(!L.available('sl.release',V));assert(!L.available('sl.seal.1',V));assert(!L.available('sl.vow.2',V));
V.enemies[0].dead=true;assert(L.available('sl.seal.1',V));assert(!L.available('sl.seal.0',V));
L.tick(V,21,true);assert(!L.available('sl.seal.1',V));assert(L.available('sl.vow.2',V));
reset();const bad={nodes:{},npcs:{},events:{bad:{effects:[{type:'rotatePuzzle',id:'bad',index:4,target:[1,2,3]}]}}};
assert(!E.transact(s,bad,{id:'invalid',type:'world',key:'bad'}).changed);
for(const [id,line]of Object.entries(book.nodes)){assert(book.npcs[line.voice.speaker]);for(const c of line.choices)assert(book.nodes[c.next],id);assert(!/Ian.s Blade|cut the (?:void|binding)|you are (?:the |a )?Bladeborn/i.test(line.text));}
console.log('Sky Library passed: main access, spatial display reflector, shelf branch, shards, guard/timer/retry checks, malformed rotation rejection and voice graph.');
