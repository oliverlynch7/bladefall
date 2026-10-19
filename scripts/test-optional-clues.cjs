const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('../public/3d/story-state.js'),A=require('../public/3d/story-authority.js');
const load=id=>JSON.parse(fs.readFileSync('public/3d/story/'+id+'.json','utf8'));
let checks=0,seq=0;const ok=(name,value)=>{assert(value,name);checks++;};
const rows=[
 ['deep-ice-caves','ic.free',{},'ic.free','ic.pages'],
 ...['1','2','3','reset'].map(k=>['deep-ice-caves','ic.lock.'+k,{},null,'ic.lock.clue']),
 ['deep-ice-caves','ic.channel.plug',{},'ic.channel.open','ic.channel.clue'],
 ['hollow-cliffs','hp.cart.push',{},'hp.weight.open','hp.orders'],
 ['hollow-cliffs','hp.brake.right',{'hp.weight.open':true},'hp.bridge','hp.orders'],
 ['prison-dungeons','kd.hidden',{},'kd.hidden','kd.roster'],
 ['prison-dungeons','kd.lift.winch',{'kd.free':true},null,'kd.papers'],
 ['prison-dungeons','kd.lift.wound',{'kd.free':true},'kd.lift.open','kd.papers'],
 ['iron-halls','ih.line.complete',{'ih.workers.safe':true,'ih.cart':true},'ih.line.open','ih.plate'],
 ['great-furnace','gf.pet.feed',{},'gf.pet.feed.closed','gf.cage'],
 ['great-furnace','gf.pet.release',{'gf.pet.feed.closed':true},'gf.pet.open','gf.cage'],
 ['snowbound-peaks','ff.reflect.3',{},'ff.reflect.open','ff.reflect.clue'],
 ['snowbound-peaks','ff.camp.release',{},'ff.camp.open','ff.camp.found'],
 ['sky-library','sl.release',{'sl.access':true},'sl.ready','sl.orders'],
 ['thunder-cliffs','tc.approach',{},'tc.approach','tc.shackle']
];
for(const [book,key,flags,result,unread]of rows)for(const actor of ['host','guest']){
 const b=load(book),s=S.create();Object.assign(s.flags,flags);const p={x:0,z:0,y:0},o={key,...p};
 const ctx={epoch:'test',actor,alive:true,canInteract:true,position:p,objects:[o],npcs:[],party:['host','guest']};
 const request={epoch:'test',event:{id:'optional-'+ ++seq,type:'world',key}};
 const r=A.apply(s,b,request,ctx);ok(actor+' unread '+key,r.changed);if(result)ok(key+' consequence',r.state.flags[result]);
 ok(key+' never fakes reading',!r.state.flags[unread]&&!r.state.flags['event.'+unread]);
 ok(key+' old state not mutated',s.revision===0&&!s.events[request.event.id]);
 ok(key+' duplicate receipt ignored',!A.apply(r.state,b,request,ctx).changed);
 ok(key+' distance still enforced',!A.apply(s,b,request,{...ctx,position:{x:999,z:0,y:0}}).changed);
 ok(key+' unavailable still enforced',!A.apply(s,b,request,{...ctx,objects:[{...o,available:false}]}).changed);
 ok(key+' stale scene rejected',!A.apply(s,b,{...request,epoch:'old'},ctx).changed);
 const saved=S.restore(r.state);ok(key+' survives reload',JSON.stringify(saved.flags)===JSON.stringify(r.state.flags));
}
const transact=(s,b,key)=>S.transact(s,b,{id:'optional-'+ ++seq,type:'world',key});
// The float still has to be raised correctly; both a wrong attempt and reset remain possible with no read receipts.
{
 let s=S.create(),b=load('deep-ice-caves');
 for(const key of ['ic.lock.1','ic.lock.2','ic.lock.3'])s=transact(s,b,key).state;
 ok('wrong water height does not solve',!s.flags['ic.lock.open']);
 for(const key of ['ic.lock.1','ic.lock.1','ic.lock.2','ic.lock.3'])s=transact(s,b,key).state;
 ok('correct physical crossing solves unread',s.flags['ic.lock.open']);
 s.flags['ic.ellis.lead']=true;s=transact(s,b,'ic.lock.clue').state;ok('clue remains readable after solve',s.notes['ic.lock']);
}
{
 const b=load('hollow-cliffs');ok('bridge still needs loaded plate',!transact(S.create(),b,'hp.brake.right').changed);
 const p=load('prison-dungeons');ok('lift still needs freed prisoners',!transact(S.create(),p,'kd.lift.winch').changed);
 const f=load('great-furnace');ok('cage still needs heat feed off',!transact(S.create(),f,'gf.pet.release').changed);
 const l=load('sky-library');ok('library still needs physical hall access',!transact(S.create(),l,'sl.release').changed);
}
const P=require('../public/3d/prison-dungeons.js'),I=require('../public/3d/iron-machinery.js'),D=require('../public/3d/deep-ice-caves.js');
{
 const s=S.create();Object.assign(s.flags,{'kd.free':true,'kd.transfer':true});ok('rescue finish never needs confiscated papers',P.ready(s));
 const G={storyState:s,enemies:[],prison:{rescueT:8,winch:{} }};ok('lift runtime accepts unread state',P.available('kd.lift.winch',G));G.prison.rescueT=3;ok('lift still waits for prisoners',!P.available('kd.lift.winch',G));
 ok('prison tracker does not require reading',!/^Read/.test(P.quest(S.create(),{})));
 const fresh=S.create();fresh.flags['kd.free']=true;fresh.notes['kd.rescue']={};fresh.notes['kd.lift']={};
 const g={storyState:fresh,enemies:[],storyObjects:[{key:'kd.lift.winch'},{key:'kd.hidden'}],obstacles:[],prison:{rescueT:8,winch:{}}};
 P.sync({G:g,state:fresh,openWay:()=>{}});
 ok('lift feedback never requires papers',!/(Read|papers)/.test(g.storyObjects[0].blockedText));
 ok('rescue note never requires reading',!/^Read/.test(fresh.notes['kd.rescue'].text));
 ok('lift note never requires reading',!/^Read/.test(fresh.notes['kd.lift'].text));

}
{
 const s=S.create();Object.assign(s.flags,{'ih.workers.safe':true,'ih.cart':true});
 const G={p:{x:200,y:100,z:-3700},iron:{clock:0,sledZ:I.startZ},enemies:[]};
 const tick=()=>I.tick({G,state:s,host:true,players:[{x:0,y:100,z:G.iron.sledZ+75,vz:-80,hp:100}],complete:key=>{const r=transact(s,load('iron-halls'),key);Object.assign(s,r.state);}},.1);
 tick();ok('unread sled physically moves',G.iron.sledZ<I.startZ);
 for(let n=0;n<100;n++)tick();ok('unread sled completes weapon-line shutdown',s.flags['ih.line.open']);
 ok('machine never requires read hint',!/^Read/.test(I.task(G,S.create())));
}
// Actual route guidance, including unread clues, never targets a reading prop.
const ctx={window:{},console};ctx.window=ctx;vm.createContext(ctx);for(const f of ['party-navigation','campaign-journey'])vm.runInContext(fs.readFileSync('public/3d/'+f+'.js','utf8'),ctx);
const inv=JSON.parse(fs.readFileSync('docs/art-validation/quest-mechanisms-20261019/campaign-inventory.json','utf8'));
for(const [zone,area,flags]of [[1,0,{'hp.trail':true}],[3,0,{'ff.heater':true,'ff.part':true}],[3,1,{'ic.free':true,'ic.ellis.met':true,'ic.notes':true,'ic.ellis.lead':true}],[4,0,{'ih.flint.met':true,'ih.workers.safe':true,'ih.handles':true,'ih.cart':true}],[5,1,{}],[6,0,{'pc.met':true,'pc.clamp':true,'pc.court':true,'pc.west':true}],[6,1,{'sl.access':true}],[7,0,{'cg.met':true,'cg.bridge.open':true,'cg.disguise':true}]]){
 const objects=inv.find(r=>r.zone===zone&&r.area===area).objects;
 const g={zone,area,p:{x:0,z:0,y:1000},storyState:{...S.create(),flags},storyObjects:objects,storyNpcs:[{id:'cross',x:0,z:0,y:280}],enemies:[],iron:{sledZ:-3780}};
 const t=ctx.BFPartyNavigation.target(g);ok(zone+':'+area+' direct unread target',t&&!/^Read|^Inspect/.test(t.label||'')&&!/clue|\.plate$|\.orders$|\.bells$/.test(t.key||''));
}
{
 const objects=inv.find(r=>r.zone===7&&r.area===0).objects;
 const g={zone:7,area:0,p:{x:0,z:0,y:200},storyState:{...S.create(),flags:{'cg.met':true,'cg.disguise':true}},storyObjects:objects,storyNpcs:[{id:'cross',x:0,z:0,y:280}],enemies:[]};
 ok('disguise cannot divert guidance past unopened bridge',ctx.BFPartyNavigation.target(g)?.key==='cg.catch.west');
}
for(const [key,a]of Object.entries(ctx.BFCampaignJourney.areas)){
 ok(key+' no artificial destination boards',a.signs.length===0);
 const [zone,area]=key.split(':').map(Number),g={zone,area,obstacles:[{journeySign:9},{kind:'plat',h:20}],storyState:S.create()};ctx.BFCampaignJourney.install(g);
 ok(key+' obsolete board collider removed',g.obstacles.length===1&&g.journeySigns.length===0);
}
// All19 authored books: reading receipts may gate context/lore or a physically collected document, never these controls.
const forbidden=new Set(['hp.orders','ic.pages','ic.lock.clue','ic.channel.clue','kd.roster','kd.papers','ih.plate','gf.cage','ff.reflect.clue','ff.camp.found','sl.orders','tc.shackle']);
let books=0;for(const file of fs.readdirSync('public/3d/story').filter(f=>f.endsWith('.json'))){books++;const b=load(file.slice(0,-5));for(const [key,e]of Object.entries(b.events||{}))for(const c of e.when||[])ok(key+' no removed reading gate',!forbidden.has(c.flag));}
const result={checks,books,controls:rows.length,actors:['host','guest'],passed:true};console.log(JSON.stringify(result));
