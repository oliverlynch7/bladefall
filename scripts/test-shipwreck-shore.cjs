const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('../public/3d/story-state.js'),S=require('../public/3d/shipwreck-shore.js'),book=JSON.parse(fs.readFileSync('public/3d/story/shipwreck-shore.json','utf8'));
const A=require('../public/3d/story-authority.js');
let s,n=0;const reset=()=>s=E.create(),act=(type,x={})=>{const r=E.transact(s,book,{id:'shore-'+ ++n,type,...x});s=r.state;return r.changed},world=key=>act('world',{key:'sc.'+key}),pick=choice=>act('choose',{line:s.conversation.node,choice}),talk=(id,choices)=>{assert(act('open',{npc:id}));for(const c of choices){if(!s.conversation){act('open',{npc:id});if(c.startsWith('deliver.')||c==='ready')pick('more');}assert(pick(c),c);}act('close');};
for(const branch of ['truth','ready-only','repair','hostile']){reset();assert(!world('board'));assert(!world('rope'));world('drain');assert(!world('rope'));world('latch');world('rope');world('rudder');world('sail');talk('otto',['palace','work','deliver.rudder','more','deliver.sail','more','deliver.rope','more','ready','depart']);assert(s.flags['sc.boat.ready']);assert(world('board'));assert(!s.flags['sc.rose.met']);talk('rose',['help']);world('bell');assert(!act('world',{key:'sc.bell'}));if(['truth','ready-only'].includes(branch))world('record');
 if(branch==='truth')talk('rose',['truth']);else if(branch==='ready-only'){assert(act('open',{npc:'rose'}));assert.deepEqual(E.view(s,book).choices.map(c=>c.id),['truth']);assert(!pick('looking'));assert(!pick('kind'));assert(pick('truth'));act('close');}else{talk('rose',['mock',branch==='repair'?'sorry':'again']);world('record');world('memorial');if(branch==='repair')talk('rose',['restore']);}
 assert.equal(!!s.rewards['sc.rose.SC-02'],branch!=='hostile');world('hull.note');assert(!world('weight.2'));assert(!s.flags['sc.hull.open']);assert(world('hull.release'));assert.equal(S.shards(s)[0].id,'SC-01');
 world('code.note');assert(!s.rewards['sc.stormshot']);assert(world('code.fire'));assert(s.flags['sc.code.open']);assert(!s.rewards['sc.stormshot']);assert(world('code.claim'));assert(s.rewards['sc.stormshot']);const before=JSON.stringify(s.rewards);assert(!world('code.fire'));assert(!world('code.claim'));assert.equal(JSON.stringify(s.rewards),before);
}
for(const [id,line]of Object.entries(book.nodes)){assert(book.npcs[line.voice.speaker]);assert(line.voice.context&&line.voice.direction);for(const c of line.choices)assert(book.nodes[c.next],id);}
assert(!S.aimHit(S.targetYaw+.14,S.targetPitch-.075));assert(S.aimHit(S.targetYaw,S.targetPitch));assert(!S.aimHit(S.targetYaw+.1,S.targetPitch));
assert(!S.available('sc.sail',{shore:{},enemies:[{shoreLookout:true,hp:10}]}));
assert(S.hullReady({shore:{clock:0}}));assert(!S.hullReady({shore:{clock:1}}));
assert(!S.available('sc.hull.release',{shore:{clock:1},storyState:{flags:{}},enemies:[]}));
assert(S.available('sc.hull.release',{shore:{clock:0},storyState:{flags:{}},enemies:[]}));
{
 let shared=E.create();const objects=[{key:'sc.code.fire',x:S.ballista.x,z:S.ballista.z,y:S.ballista.y,range:165},{key:'sc.code.claim',x:-2140,z:-3400,y:200,range:115}];
 const apply=(key,id,position)=>A.apply(shared,book,{epoch:'shore',event:{id,type:'world',key}},{epoch:'shore',actor:'guest',position,alive:true,canInteract:true,objects,npcs:[],party:['host','guest']});
 assert(!apply('sc.code.fire','far',{x:0,z:0,y:130}).changed);
 let r=apply('sc.code.fire','near',{x:S.ballista.x+130,z:S.ballista.z,y:130});assert(r.changed);shared=r.state;assert(shared.flags['sc.code.open']);assert(!shared.rewards['sc.stormshot']);
 assert(!apply('sc.code.claim','wrong-side',{x:S.ballista.x,z:S.ballista.z,y:130}).changed);
 r=apply('sc.code.claim','chest',{x:-2140,z:-3400,y:200});assert(r.changed);shared=r.state;assert.deepEqual(shared.rewards['sc.stormshot'].recipients,['host','guest']);assert(!apply('sc.code.claim','duplicate',{x:-2140,z:-3400,y:200}).changed);
 const old=E.restore({version:1,flags:{'sc.code.open':true},items:{'sc.code':2},rewards:{'sc.stormshot':{kind:'stormshot',amount:1,claimed:true}},revision:4});assert(old.flags['sc.code.open']);assert.equal(old.items['sc.code'],2);assert(!S.available('sc.ballista',{storyState:old,enemies:[]}));
}
console.log('Shipwreck Shore passed: ready Rose hand-in and incomplete refusal/apology routes, main independence, deliveries, cave order, cargo release, ballista aim/reward dedupe and voice graph.');
