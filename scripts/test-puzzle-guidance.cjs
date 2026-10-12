const assert=require('node:assert/strict'),F=require('../public/3d/puzzle-feedback.js'),J=require('../public/3d/journal-clues.js'),Q=require('../public/3d/journal-notice.js'),M=require('../public/3d/iron-machinery.js');
const s=(items={},flags={})=>({items,flags});
let n=F.notice({effects:[{type:'sequence',id:'test',solution:[2,1,3]},{type:'item',id:'tries',amount:1}]},s(),s({test:0}),{},'a');assert.equal(n.title,'Pattern reset');assert(!n.text.includes('2,1,3'));
const q=Q.createQueue();q.reset('scene',{});for(let i=0;i<20;i++)q.push({...n,id:String(i),text:'Attempt '+i});assert.equal(q.pending,1);q.tick(0,true);q.push({...n,id:'new',text:'Latest'});assert.equal(q.pending,0);assert.equal(q.current.text,'Latest');q.push({id:'clue',text:'Keep this actual clue'});assert.equal(q.pending,1);q.reset('next',{});assert.equal(q.current,null);
const g={p:{x:0,z:0,y:100},storyObjects:[{key:'ih.plate',x:0,z:50,y:100}],storyState:{notes:{'ih.order':{title:'Machine plate',text:'Push the scrap sled.'}}}};assert.equal(J.related(g,null),'ih.order');delete g.storyState.notes['ih.order'];assert.equal(J.related(g,null),null,'undiscovered clues stay hidden');
assert.equal(J.search([{title:'Old lift',text:'Add the weights'},{title:'Mirror',text:'Turn toward the sun'}],'LIFT weights').length,1);assert.equal(J.search([],'x').length,0);
assert(!M.phase(2.59).warn);assert(M.phase(2.6).warn);assert(M.phase(4.1).hit);assert(!M.phase(4.35).hit);
const game={iron:{sledZ:M.startZ,sledCollider:{z:M.startZ}}};M.sync(game,s({'ih.line':2},{'ih.line.open':true}));assert.equal(game.iron.sledZ,M.targetZ);assert.equal(game.iron.sledCollider.z,M.targetZ);
console.log('Puzzle notice coalescing, discovered-clue search, hammer warning boundaries and old-complete sled placement passed.');
