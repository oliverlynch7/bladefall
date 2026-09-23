/* Host-owned Storm Coast voyage. Coordinates are metres, independent of game units.
   This module never writes saves, awards loot, advances areas or accepts client kills. */
(function(root){
 'use strict';
 const VERSION=1, STEP=1/60, HALF_WIDTH=26, HULL_RADIUS=2.4;
 const stages=[
  {id:'wrecks',kind:'steer',length:680,speed:16,title:'Follow the open water'},
  {id:'boarders-one',kind:'fight',length:180,speed:7,title:'Drive the boarders off the deck',wave:1},
  {id:'shelter',kind:'rest',length:0,speed:0,title:'Repair the boat and trade places'},
  {id:'reefs',kind:'steer',length:640,speed:17,title:'Keep clear of the reefs'},
  {id:'boarders-two',kind:'fight',length:180,speed:7,title:'Clear the deck before the storm',wave:2},
  {id:'storm',kind:'steer',length:720,speed:18,title:'Reach the shelter of Thunder Cliffs'},
  {id:'landed',kind:'done',length:0,speed:0,title:'Thunder Cliffs ahead'}
 ];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
 const clone=v=>JSON.parse(JSON.stringify(v));
 function crewList(crew){return [...new Set((crew||[]).filter(p=>p&&typeof p.id==='string'&&p.id.length<100&&p.connected!==false&&p.alive!==false).map(p=>p.id))].sort();}
 function obstacles(seed,index){
  // A fixed safe passage survives every seed. Small offsets vary wreck placement,
  // never its timing or the number of hazards. No obstacle is placed in combat lanes.
  if(stages[index]?.kind!=='steer')return [];
  let n=(seed>>>0)^((index+1)*0x9e3779b9);
  const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
  const out=[],count=index===5?8:7;
  for(let i=0;i<count;i++){
   const side=i%2===0?-1:1;
   out.push({id:index+':'+i,z:100+i*76,x:side*(3+random()*3),radius:6+random(),
    kind:index===5?'rock':i%3===0?'wreck':'reef'});
  }
  return out;
 }
 function create({epoch,seed=1,crew=[],initiator}={}){
  if(typeof epoch!=='string'||!epoch||epoch.length>160)throw Error('Voyage needs a scene epoch');
  const ids=crewList(crew);
  if(!ids.length)throw Error('Voyage needs a living crew');
  return {version:VERSION,epoch,seed:seed>>>0,seq:0,tick:0,stage:0,distance:0,x:0,vx:0,hull:100,
   elapsed:0,crew:ids,helm:ids.includes(initiator)?initiator:ids[0],previousHelm:null,
   ready:[],input:0,inputAt:-1,inputSeq:-1,hit:[],waveCleared:false,repaired:false,
   started:false,failed:false,paused:false,accumulator:0,events:[],eventSeq:0};
 }
 function emit(s,type,extra={}){s.events.push({id:s.epoch+':'+(++s.eventSeq),type,...extra});}
 function current(s){return stages[s.stage];}
 function transition(s){
  s.stage++;s.distance=0;s.hit=[];s.waveCleared=false;s.input=0;s.inputSeq=-1;s.inputAt=-1;
  s.vx=0;s.ready=[];
  const p=current(s);
  if(p.kind==='rest'){
   s.previousHelm=s.helm;
   const at=s.crew.indexOf(s.helm);s.helm=s.crew[(at+1)%s.crew.length];
   emit(s,'shelter',{helm:s.helm,swapped:s.helm!==s.previousHelm});
  }else if(p.kind==='fight')emit(s,'boarding',{wave:p.wave});
  else if(p.kind==='done')emit(s,'landed');
  else emit(s,'sailing',{stage:p.id,helm:s.helm});
 }
 function reconcileCrew(s,crew){
  const ids=crewList(crew),before=s.crew.join('|');s.crew=ids;s.ready=s.ready.filter(id=>ids.includes(id));
  if(!ids.includes(s.helm)){
   s.helm=ids[0]||null;s.input=0;s.inputAt=-1;s.inputSeq=-1;
   if(s.helm)emit(s,'helm-changed',{helm:s.helm});
  }
  if(before!==ids.join('|'))s.seq++;
 }
 function command(s,actor,request){
  if(!request||request.epoch!==s.epoch||!s.crew.includes(actor)||s.failed||current(s).kind==='done'||s.paused)return false;
  const p=current(s);
  if(request.type==='start'){
   if(s.started||actor!==s.helm)return false;
   s.started=true;emit(s,'sailing',{stage:p.id,helm:s.helm});
  }else if(request.type==='steer'){
   if(!s.started||p.kind!=='steer'||actor!==s.helm||!finite(request.value)||
      !Number.isSafeInteger(request.seq)||request.seq<=s.inputSeq)return false;
   s.input=clamp(request.value,-1,1);s.inputAt=s.elapsed;s.inputSeq=request.seq;
  }else if(request.type==='repair'){
   if(p.kind!=='rest'||s.repaired)return false;
   s.repaired=true;s.hull=Math.min(100,s.hull+45);emit(s,'repaired',{hull:s.hull});
  }else if(request.type==='ready'){
   if(p.kind!=='rest'||s.ready.includes(actor))return false;
   s.ready.push(actor);
  }else return false; // No client command can land, clear enemies or change hull.
  s.seq++;return true;
 }
 function clearWave(s,wave,remaining){
  // Call only from the host adapter after checking the actual tagged deck enemies.
  if(current(s).kind!=='fight'||current(s).wave!==wave||remaining!==0||s.waveCleared||s.failed)return false;
  s.waveCleared=true;s.seq++;emit(s,'deck-clear',{wave});return true;
 }
 function damage(s,amount,source){
  if(s.failed||!s.started||current(s).kind==='done'||s.paused||!finite(amount)||amount<=0)return false;
  s.hull=Math.max(0,s.hull-Math.min(amount,100));s.seq++;emit(s,'hull-hit',{amount,source});
  if(s.hull===0){s.failed=true;s.vx=0;emit(s,'failed');}return true;
 }
 function collides(x,z,obstacle){
  // A fore/aft capsule covers the longboat, including its bow and stern.
  return Math.hypot(x-obstacle.x,Math.max(0,Math.abs(z-obstacle.z)-3.6))<=HULL_RADIUS+obstacle.radius;
 }
 function advance(s,dt){
  if(!finite(dt)||dt<=0||s.paused||!s.started||s.failed||!s.crew.length||current(s).kind==='done')return;
  // Tab suspension cannot fast-forward into unseen obstacles; normal frame budgets
  // are fixed-step and deterministic. At most 250ms simulation per host update.
  s.accumulator+=Math.min(dt,.25);
  while(s.accumulator+1e-9>=STEP){
   s.accumulator=Math.max(0,s.accumulator-STEP);s.elapsed+=STEP;s.tick++;s.seq++;
   const p=current(s);
   if(p.kind==='rest'){
    if(s.crew.every(id=>s.ready.includes(id)))transition(s);
   }else if(p.kind==='steer'){
    const axis=s.elapsed-s.inputAt<.35?s.input:0;
    s.vx+=(axis*11-s.vx)*Math.min(1,STEP*5);
    s.x=clamp(s.x+s.vx*STEP,-HALF_WIDTH+HULL_RADIUS,HALF_WIDTH-HULL_RADIUS);
    s.distance+=p.speed*STEP;
    for(const o of obstacles(s.seed,s.stage))if(!s.hit.includes(o.id)&&collides(s.x,s.distance,o)){
     s.hit.push(o.id);damage(s,18,o.id);
    }
    if(!s.failed&&s.distance>=p.length)transition(s);
   }else if(p.kind==='fight'){
    // Broad safe water: the boat keeps travelling but never outruns the fight.
    s.distance=Math.min(p.length,s.distance+p.speed*STEP);
    if(s.distance>=p.length&&s.waveCleared)transition(s);
   }
   if(s.failed||current(s).kind==='done'){s.accumulator=0;break;}
  }
 }
 function pause(s,value){s.paused=!!value;s.input=0;s.inputAt=-1;s.seq++;}
 function drain(s){const events=s.events;s.events=[];return events;}
 function snapshot(s){const {events,accumulator,input,inputAt,inputSeq,...data}=s;return clone(data);}
 function acceptSnapshot(previous,data,epoch){
  // Snapshots are visual state only. No callbacks/rewards or host commands execute.
  if(!data||data.version!==VERSION||data.epoch!==epoch||!Number.isSafeInteger(data.seq)||data.seq<0||
    !Number.isInteger(data.stage)||data.stage<0||data.stage>=stages.length||
    !['distance','x','vx','hull','elapsed','tick','seed','eventSeq'].every(k=>finite(data[k]))||
    data.hull<0||data.hull>100||Math.abs(data.x)>HALF_WIDTH||data.distance<0||data.distance>stages[data.stage].length+.5||
    data.elapsed<0||!Number.isSafeInteger(data.tick)||data.tick<0||!Number.isSafeInteger(data.eventSeq)||data.eventSeq<0||Math.abs(data.vx)>11.01||
    !['started','failed','paused','repaired','waveCleared'].every(k=>typeof data[k]==='boolean')||
    !Array.isArray(data.crew)||!data.crew.every(id=>typeof id==='string')||
    !Array.isArray(data.ready)||!data.ready.every(id=>data.crew.includes(id))||!Array.isArray(data.hit)||!data.hit.every(id=>typeof id==='string')||
    (data.helm!==null&&!data.crew.includes(data.helm))||
    (previous&&previous.epoch===epoch&&data.seq<=previous.seq))return previous;
  return clone(data);
 }
 function view(s){const p=current(s);return {title:s.failed?'The boat cannot make it':p.title,
  phase:p.id,kind:p.kind,progress:p.length?Math.min(1,s.distance/p.length):0,
  helm:s.helm,hull:s.hull,obstacles:obstacles(s.seed,s.stage).filter(o=>o.z>s.distance-15&&o.z<s.distance+210),
  canSteer:s.started&&!s.paused&&!s.failed&&p.kind==='steer',
  canRepair:p.kind==='rest'&&!s.repaired,ready:s.ready.length,crew:s.crew.length};}
 const api={create,current,command,reconcileCrew,clearWave,damage,advance,pause,drain,snapshot,acceptSnapshot,view,obstacles,collides,
  constants:{VERSION,STEP,HALF_WIDTH,HULL_RADIUS},stages};
 root.BFShipCrossing=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
