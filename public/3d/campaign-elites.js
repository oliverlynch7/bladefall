/* Named campaign encounters: shared attack geometry, host-owned phase clock. */
(function(root){'use strict';
const kits={
 keep_lance:{shape:'thrust',wind:.82,strike:.26,recover:1.12,reach:145,width:23,stop:95,color:'#e1ba82',title:'Driving thrust',hint:'Step beside the narrow thrust, then close in.',damage:1.05},
 ember_ring:{shape:'ring',wind:1.05,strike:.65,recover:1.3,reach:190,stop:100,color:'#ffb172',title:'Cinder ring',hint:'Jump the spreading ring or leave its reach.',damage:1.05},
 frost_ring:{shape:'ring',wind:1.05,strike:.65,recover:1.3,reach:190,stop:100,color:'#96e5f6',title:'Ice ring',hint:'Jump the spreading ring or leave its reach.',damage:1.05},
 ember_fan:{shape:'fan',wind:.86,strike:.28,recover:1.15,reach:150,stop:95,color:'#ffac76',title:'Heated cleave',hint:'Circle behind the marked sweep.',damage:1.1},
 coast_volley:{shape:'volley',wind:1.05,strike:.26,recover:1.35,reach:380,stop:270,color:'#7fe0d5',title:'Tidal volley',hint:'Move into a gap between the three lanes.',damage:1},
 palace_cross:{shape:'cross',wind:1.1,strike:.28,recover:1.3,reach:220,stop:150,color:'#ead28f',title:'Astral cross',hint:'Step diagonally between the crossing lanes.',damage:1.05},
 dusk_curse:{shape:'circle',wind:1.15,strike:.3,recover:1.4,reach:440,radius:85,stop:300,color:'#c0a0f2',title:'Marked ground',hint:'Leave the marked circle. A strong hit interrupts the cast.',damage:1.05},
 cliff_lunge:{shape:'lunge',wind:.8,strike:.34,recover:1.1,reach:200,width:20,stop:135,color:'#d8b58b',title:'Running thrust',hint:'Sidestep the lane; attack after the rush.',damage:1},
 briar_runner:{wind:.72,strike:.34,recover:.95,reach:185,color:'#edb679',title:'Lunge',hint:'Sidestep the narrow lane. Strike during recovery for extra damage.',damage:.95},
 briar_guard:{wind:.95,strike:.25,recover:1.15,reach:135,color:'#a6c9df',title:'Heavy sweep',hint:'Get behind the marked sweep. Strike during recovery for extra damage.',damage:1.2},
 briar_hex:{wind:1.1,strike:.28,recover:1.4,reach:430,radius:78,color:'#bb8bea',title:'Ground hex',hint:'Leave the purple circle. A strong hit can interrupt the cast.',damage:1.05},
 cliff:{wind:1.05,strike:.32,recover:1.55,reach:180,color:'#8bded4',title:'Cliff cleave',hint:'Sidestep the marked fan, then strike while the warden recovers.',damage:1.05},
 raid:{wind:.95,strike:.24,recover:1.15,reach:150,color:'#efb663',title:'Wide sweep',hint:'Step behind the raid leader.',damage:1.15},
 forge:{wind:1.2,strike:.7,recover:1.4,reach:210,color:'#ff9856',title:'Ground pulse',hint:'Jump the ring, or move outside it.',damage:1.25},
 shore:{wind:1.15,strike:.26,recover:1.35,reach:360,color:'#83dce6',title:'Scatter shot',hint:'Move between the three aim lines.',damage:1.1},
 tower:{wind:1.25,strike:.28,recover:1.5,reach:200,color:'#c5a3f3',title:'Cross strike',hint:'Stand between the crossing lines.',damage:1.25}
};
function setup(e,zone){const kind={0:'raid',1:'cliff',2:'keep_lance',3:'frost_ring',4:'forge',5:'shore',6:'palace_cross',7:'tower'}[zone];if(!kind)return;if(e.role==='exploder')e.speed/=1.28;else if(e.role==='flanker')e.speed/=1.15;if(zone===5)Object.assign(e,{x:-180,z:-1100,y:30,sx:-180,sz:-1100,sy:30});Object.assign(e,{ceKind:kind,ceState:'hunt',ceClock:1.2,ceSerial:0,role:null,spec:null,kind:'walk',shot:null,meleeW:0,meleeActive:0});}
// Ordinary Briar troops share telegraph geometry and fixed role tuning, never elite rewards.
function briar(e){
 if(e.briarRole||e.ceKind||e.boss||e.elite||e.dummy||e.practice||e.bot||!['grunt','caster'].includes(e.type))return;
 const role=e.briarRoleHint||(e.type==='caster'?'hex':e.homeRaid==='runner'||e.patrolStyle==='flank'?'runner':e.patrolStyle==='guard'?'guard':(Math.abs(Math.round(((e.sx??e.x)+(e.sz??e.z))/80))%2===0?'runner':'guard'));
 if(e.role==='exploder')e.speed/=1.28;else if(e.role==='flanker')e.speed/=1.15;
 Object.assign(e,{briarRole:role,ceKind:'briar_'+role,ceState:'hunt',ceClock:1.2,ceSerial:0,role:null,roleCol:null,spec:null,kind:'walk',shot:null,meleeW:0,meleeActive:0});
 Object.assign(e,role==='runner'?{label:e.homeRaid?'Farm raider':'Legion raider',h:47,r:17,color:'#b98659'}:role==='guard'?{label:'Legion guard',h:65,r:23,color:'#647e91'}:{label:'Legion hex caster',h:56,r:15,color:'#9772ba'});
 e.speed=Math.max(role==='runner'?96:role==='guard'?66:62,e.speed*(role==='guard'?.82:role==='runner'?1.08:1));
 const health=role==='guard'?1.4:role==='runner'?1.22:1.18,fraction=e.hp/e.maxHp;
 e.maxHp=Math.round(e.maxHp*health);e.hp=e.maxHp*fraction;
}

// Upgrade only ordinary troops; specialist species and quest-owned fights keep their own AI.
function campaign(G,e){
 if(!active(G)||G.zone===0||e.ceKind||e.boss||e.elite||e.dummy||e.practice||e.bot||e.spec||!['grunt','caster'].includes(e.type))return;
 if(Object.keys(e).some(k=>/escort|officer|kingAdd|furnaceGate|furnaceOffice|libraryGuard|prisonFoe|canyonAlarm|hydraChain|immobile/i.test(k)&&e[k]))return;
 const ranged=e.type==='caster',guard=e.patrolStyle==='guard'||(!e.patrolStyle&&Math.abs(Math.round(((e.x||0)+(e.z||0))/80))%2===0);
 const pair={1:['cliff','coast_volley'],2:['keep_lance','dusk_curse'],3:['keep_lance','frost_ring'],4:['ember_fan','ember_ring'],5:['keep_lance','coast_volley'],6:['keep_lance','palace_cross'],7:['ember_fan','dusk_curse']}[G.zone];
 if(!pair)return;
 const kind=ranged?pair[1]:guard?pair[0]:'cliff_lunge';
 if(e.role==='exploder')e.speed/=1.28;else if(e.role==='flanker')e.speed/=1.15;
 Object.assign(e,{campaignRole:ranged?'caster':guard?'guard':'runner',ceKind:kind,ceState:'hunt',ceClock:.8+(Math.abs(e.mid||0)%4)*.17,ceSerial:0,role:null,roleCol:null,kind:'walk',shot:null,meleeW:0,meleeActive:0});
 if(!e.label)e.label=ranged?({1:'Cliff spellcaster',2:'Keep hex caster',3:'Frost caller',4:'Cinder caller',5:'Tide caster',6:'Palace arcanist',7:'Dusk hex caster'}[G.zone]):guard?'Legion guard':'Legion striker';
 // Preserve authored body/color and all fixed-world HP, damage and rewards.
}
function active(G){return !!G&&Number.isInteger(G.zone)&&G.zone>=0&&G.zone<8&&G.area>=0&&G.area<=1&&!['hub','trial','escape','bossRush','endless','delve','arena','bonusActive','sprintFun','sparringRoom','side','devBriar','devKeep'].some(k=>G[k]);}
function dangerous(q){return q.ceKind&&['wind','strike'].includes(q.ceState)||q.windT>0||q.chargeT>0||q.meleeW>0||q.meleeActive>0||q.shotW>0||q.eruptW>0||q.knightW>0||q.fuseT>0;}
function decision(G,e,target,clear,players=1){
 if(!target)return {target:null,attack:false};
 if(!active(G))return {target,attack:clear};
 if(e.ceHomeX==null){e.ceHomeX=e.x;e.ceHomeZ=e.z;e.ceHomeY=e.y;}
 if(e.ceState==='hunt'&&Math.hypot(target.x-e.ceHomeX,target.z-e.ceHomeZ)>1200)return {target:{x:e.ceHomeX,z:e.ceHomeZ,y:e.ceHomeY,hp:1},attack:false,returning:true};
 // Scan the nearby pressure budget only when a new attack can actually begin.
 if(e.ceState!=='hunt'||e.ceClock>0)return {target,attack:!!clear};
 let busy=0,recent=false;
 for(const q of G.enemies){if(q===e||q.dead||q.hp<=0||!q.active||Math.abs((q.ceY??q.y??0)-(target.y||0))>100||Math.hypot((q.ceX??q.x)-target.x,(q.ceZ??q.z)-target.z)>620)continue;
  if(dangerous(q))busy++;
  if(Number.isFinite(q.ceStartedAt)&&(G.time-q.ceStartedAt)<.28)recent=true;
 }
 return {target,attack:!!clear&&!recent&&busy<(players>1?3:2)};
}
function damage(e,n){return e.campaignRole&&e.ceState==='recover'?n*1.12:n;}
function hit(e,dealt){if(!e.campaignRole||e.dead||e.hp<=0||!(dealt>0))return null;
 if(e.campaignRole==='caster'&&e.ceState==='wind'&&dealt>=e.maxHp*.25){Object.assign(e,{ceState:'recover',ceClock:1.25,ceSerial:e.ceSerial+1,meleeW:0,meleeActive:0});return 'CAST INTERRUPTED';}
 if(e.ceState==='recover'&&e._ceOpening!==e.ceSerial){e._ceOpening=e.ceSerial;return 'OPENING';}return null;
}
function shape(e){return kits[e.ceKind]?.shape||(e.briarRole==='hex'?'circle':e.briarRole==='runner'?'lunge':e.ceKind==='forge'?'ring':e.ceKind==='tower'?'cross':e.ceKind==='shore'?'volley':'fan');}

function step(e,dt,target,speed,canAttack=true,move=null){const k=kits[e.ceKind];if(!k||e.dead||!target)return;dt=Math.min(.05,Math.max(0,dt));const form=shape(e),travel=(dx,dz,n,rush=false)=>{if(move)move(dx,dz,n,rush);else{e.x+=dx*n;e.z+=dz*n;}};e.ceClock=Math.max(0,e.ceClock-dt);
 if(e.ceState==='hunt'){
  let dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz);if(d<.001){dx=Math.sin(e.yaw||0);dz=Math.cos(e.yaw||0);d=1;}
  e.yaw=Math.atan2(dx,dz);const stop=k.stop??(!canAttack?20:e.ceKind==='shore'?210:e.briarRole==='hex'?305:e.briarRole==='runner'?125:e.briarRole==='guard'?85:85);
  if(d>stop){const length=Math.min(d-stop,speed*dt);travel(dx/d,dz/d,length);}
  if((e.briarRole==='hex'||e.campaignRole==='caster')&&d<150)travel(-dx/d,-dz/d,speed*dt*.6);
  if(canAttack&&e.ceClock===0&&d<k.reach+35&&Math.abs(target.y-e.y)<65){Object.assign(e,{ceState:'wind',ceClock:k.wind,ceSerial:e.ceSerial+1,ceX:e.x,ceZ:e.z,ceY:e.y,ceDX:dx/d,ceDZ:dz/d});if(form==='circle'){e.ceX=target.x;e.ceZ=target.z;e.ceY=e.y;}}
 }else{e.yaw=Math.atan2(e.ceDX,e.ceDZ);
  if((form==='lunge'||form==='thrust')&&e.ceState==='strike'){const distance=form==='thrust'?70:k.reach-30,travel=Math.min(distance,(1-e.ceClock/k.strike)*distance),last=e.ceTravel||0;const length=Math.max(0,travel-last);if(move)move(e.ceDX,e.ceDZ,length,true);else{e.x+=e.ceDX*length;e.z+=e.ceDZ*length;}e.ceTravel=travel;}
  if(e.ceClock===0){if(e.ceState==='wind'){e.ceState='strike';e.ceClock=k.strike;e.ceTravel=0;}else if(e.ceState==='strike'){e.ceState='recover';e.ceClock=k.recover*(e.combatRecovery||1);}else{e.ceState='hunt';e.ceClock=0;}}
 }
}
function local(e,p){const dx=p.x-e.ceX,dz=p.z-e.ceZ;return {forward:dx*e.ceDX+dz*e.ceDZ,side:dx*e.ceDZ-dz*e.ceDX,d:Math.hypot(dx,dz)};}
function contains(e,p){const k=kits[e.ceKind];if(!k||e.ceState!=='strike'||e.dead||p.hp<=0)return false;const form=shape(e),height=p.y-e.ceY;if(height> (form==='ring'?38:85)||height< -45)return false;
 const q=local(e,p),r=Math.min(20,p.r||12);
 if(form==='circle')return q.d<=k.radius+r;
 if(form==='lunge')return q.forward>=-r&&q.forward<=k.reach+r&&Math.abs(q.side)<=(k.width||19)+r&&Math.hypot(p.x-e.x,p.z-e.z)<=e.r+r+30;
 if(form==='thrust')return q.forward>=-r&&q.forward<=k.reach+r&&Math.abs(q.side)<=(k.width||23)+r&&Math.hypot(p.x-e.x,p.z-e.z)<=e.r+r+80;
 if(form==='fan')return q.d<=k.reach+r&&(q.d<r||q.forward/(q.d||1)>=Math.cos(1.05));
 if(form==='ring'){const wave=25+(k.reach-25)*(1-e.ceClock/k.strike);return Math.abs(q.d-wave)<r+24;}
 if(form==='cross')return (Math.abs(q.forward)<k.reach+r&&Math.abs(q.side)<22+r)||(Math.abs(q.side)<k.reach+r&&Math.abs(q.forward)<22+r);
 return [-.32,0,.32].some(a=>{const f=q.forward*Math.cos(a)+q.side*Math.sin(a),s=q.side*Math.cos(a)-q.forward*Math.sin(a);return f>=-r&&f<k.reach+r&&Math.abs(s)<13+r;});
}
// Solid props above the combat floor stop a strike; floor slabs do not.
function blocked(e,p,obstacles){return obstacles.some(o=>{
 if(o.h<=e.ceY+35||(o.y0||0)>e.ceY+85)return false;
 let lo=0,hi=1;for(const [start,delta,center,half]of [[e.ceX,p.x-e.ceX,o.x,o.w/2],[e.ceZ,p.z-e.ceZ,o.z,o.d/2]]){
  if(Math.abs(delta)<.0001){if(Math.abs(start-center)>=half)return false;continue;}
  let a=(center-half-start)/delta,b=(center+half-start)/delta;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>=hi)return false;
 }return hi>0&&lo<1;
});}
function snapshot(e){const out={role:null,spec:null,shot:null,kind:'walk'};for(const key of ['combatRecovery','campaignRole','briarRole','homeRaid','patrolGroup','patrolStyle','patrolReturn','color','speed','campaignElite','elite','label','y','h','r','dmg','ceKind','ceState','ceClock','ceSerial','ceX','ceY','ceZ','ceDX','ceDZ'])if(e[key]!=null)out[key]=e[key];return out;}
const api={kits,setup,briar,campaign,active,decision,damage,hit,shape,step,contains,blocked,snapshot};root.BFCampaignElites=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
