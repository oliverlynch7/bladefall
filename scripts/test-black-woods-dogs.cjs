const fs=require('node:fs'),assert=require('node:assert/strict');
const D=require('../public/3d/return-adventures.js'),R=require('../public/3d/return-visits.js'),S=require('../public/3d/story-state.js'),A=require('../public/3d/story-authority.js');
const book=JSON.parse(fs.readFileSync('public/3d/story/return-visits.json','utf8'));
let checks=0,serial=0;const ok=(v,m)=>{assert(v,m);checks++;};
const world=()=>({zone:0,area:1,returnActive:[],bounds:{minX:-2600},deco:[]});
let geometry;
for(const status of [undefined,'accepted','ready','done']){
 const G=world(),meta={returnVisits:status?{tracks:status}:{}},s=S.create();G.returnActive=R.refreshActive(G,meta);
 ok(G.returnActive.includes('tracks')===![ 'ready','done'].includes(status),'field discovery '+status);
 const segs=[],plats=[],api={G,s,seg:(...v)=>segs.push(v),plat:(...v)=>plats.push(v)};
 D.sync(api);const signature=JSON.stringify([segs,plats,G.bounds.minX]);
 if(!geometry)geometry=signature;ok(geometry===signature,'identical physical route '+status);
 ok((G.returnAnimals||[]).length===(['ready','done'].includes(status)?0:2),'correct dog availability '+status);
 const before=signature;D.sync(api);ok(JSON.stringify([segs,plats,G.bounds.minX])===before,'no duplicate route '+status);
}
let G=world();G.returnActive=['tracks'];ok(R.refreshActive(G,{returnVisits:{tracks:'ready'}}).includes('tracks'),'second rescue does not remove platforms');
G.area=0;ok(!R.refreshActive(G,{returnVisits:{}}).includes('tracks'),'route selection does not leak into Homefields');
for(const id of ['pattern','supplies','keepsake']){
 const q=R.defs[id];ok(!R.active({zone:q.zone,area:q.area},{returnVisits:{}}).includes(id),'other quests retain acceptance gate '+id);
}
for(const order of [['snare','cage'],['cage','snare']]){
 let s=S.create();s.flags['rv.active.tracks']=true;
 const objects=R.fieldObjects(['tracks']);
 function use(key,actor='host',far=false){
  const o=objects.find(o=>o.key==='rv.tracks.'+key),event={id:'dogs-'+ ++serial,type:'world',key:o.key};
  const context={epoch:'woods',actor,alive:true,canInteract:true,position:{x:o.x+(far?1000:25),z:o.z,y:o.y},objects,npcs:[],party:['host','guest']};
  const r=A.apply(s,book,{epoch:'woods',event},context);if(r.changed)s=r.state;return {r,event,context};
 }
 const denied=use(order[0],'guest',true);ok(!denied.r.changed&&!s.flags['rv.accepted.tracks'],'out-of-range discovery rejected');
 const first=use(order[0]);ok(first.r.changed&&s.flags['rv.accepted.tracks'],'rescue starts quest without reading clue');
 ok(s.items['rv.tracks.freed']===1&&s.rewards['rv.accept.tracks'],'first dog counts and accepts');
 ok(s.rewards['rv.accept.tracks'].recipients.join(',')==='host,guest','shared acceptance reward');
 ok(!A.apply(s,book,{epoch:'woods',event:first.event},first.context).changed,'same packet cannot count a dog twice');
 ok(!use(order[0],'guest').r.changed&&s.items['rv.tracks.freed']===1,'new packet cannot repeat opened trap');
 // Preserve a partial save, then let the other player rescue the remaining dog.
 s=S.restore(JSON.parse(JSON.stringify(s)));ok(s.flags['rv.tracks.'+order[0]]&&s.items['rv.tracks.freed']===1,'partial save retained');
 ok(R.tasks({...world(),returnActive:['tracks']},{returnVisits:{}},s)[0].progress.includes('1/2'),'readable partial objective');
 const second=use(order[1],'guest');ok(second.r.changed&&s.items['rv.tracks.freed']===2,'either order completes');
 ok(s.flags['rv.collected.tracks']&&s.rewards['rv.item.tracks'],'both rescues secure existing turn-in');
 ok(s.rewards['rv.item.tracks'].recipients.join(',')==='host,guest','both players receive saved rescue');
 ok(s.notes['rv.tracks.saved'].text.includes('rescue is saved'),'completion explains saved progress');
 ok(!use(order[1]).r.changed&&s.items['rv.tracks.freed']===2,'completed rescue is idempotent');
}
for(const key of ['start','hoof','paw']){
 let s=S.create();s.flags['rv.active.tracks']=true;
 s=S.transact(s,book,{id:'discover-'+key,type:'world',key:'rv.tracks.'+key}).state;
 ok(s.flags['rv.accepted.tracks']&&s.rewards['rv.accept.tracks'],'tracks can also start the quest '+key);
}
const guestState=S.create();guestState.flags['rv.accepted.tracks']=false;
ok(R.tasks({...world(),returnActive:['tracks']},{returnVisits:{tracks:'done'}},guestState)[0].progress.includes('0/2'),'guest personal completion cannot hide host rescue');
guestState.flags['rv.ready.tracks']=true;
ok(R.tasks({...world(),returnActive:['tracks']},{returnVisits:{tracks:'done'}},guestState)[0].progress.includes('Beastkeeper'),'guest sees shared turn-in');
// Every point along both existing paths must fit inside the revised physical bank.
const Geo=require('../public/3d/campaign-geography.js');
const field=Object.assign(world(),{segments:[],obstacles:[],walls:[],rooms:[],returnActive:['tracks']});
D.sync({G:field,s:S.create(),seg:(x,z,w,d)=>field.segments.push({x,z,w,d}),plat:(x,z,h,w,d)=>field.obstacles.push({x,z,h,w,d,kind:'plat'})});
Geo.apply(field,'outskirts');
for(const [name,path]of Object.entries(D.paths))for(let j=1;j<path.length;j++){
 const a=path[j-1],b=path[j];for(let i=0;i<=20;i++){
  const x=a[0]+(b[0]-a[0])*i/20,z=a[1]+(b[1]-a[1])*i/20;
  ok(!field.walls.some(w=>Math.abs(w.x-x)<w.w/2+18&&Math.abs(w.z-z)<w.d/2+18),'forest bank clears '+name+' '+j+'/'+i);
 }
}
console.log(checks+' Black Woods discovery, permanent route, save, either-order rescue and co-op authority checks passed.');

