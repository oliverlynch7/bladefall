/* Campaign formations and territory. No new enemies, rewards, quest flags or save fields. */
(function(root){'use strict';
// [type, original x, original z, job, optional new x, optional new z].
// Each formation belongs to an existing route/objective; quest-owned actors stay in place.
const plans={
 '0.0':[
  ['village-lane','Read the first raider before reaching the mill.',760,[['grunt',120,-550,'runner',100,-680],['grunt',300,-1120,'guard',210,-1190]]],
  ['millrace','Cross the repaired mill bridge into a guard and rear caster.',720,[['grunt',20,-2570,'guard',70,-2470],['caster',-110,-2810,'caster',-170,-2800]]],
  ['granary-road','Finite guards defend the departure road, not the village.',650,[['grunt',360,-3490,'guard'],['grunt',165,-3395,'runner'],['grunt',165,-3585,'guard']]]
 ],
 '0.1':[
  ['forest-search','A front searcher, flanker and rear hex caster hold the signal approach.',720,[['grunt',-570,-1360,'runner',-440,-1300],['grunt',-820,-1800,'guard',-720,-1770],['caster',-400,-1870,'caster',-490,-1990],['grunt',-650,-2220,'runner']]],
  ['signal-ground','Ground guards remain below the climb; upper-route players are not detected through floors.',650,[['grunt',-200,-2860,'guard'],['caster',240,-3250,'caster'],['grunt',-170,-3600,'guard']]],
  ['rescue-clearing','Rescue predators remain at Beth’s brother, away from the safe path.',500,[['thornboar',2370,-1550,'predator'],['thornboar',2740,-1600,'predator']]]
 ],
 '1.0':[
  ['cliff-hunt','Predators defend the lower path; the spitter stays behind the first pair.',650,[['dustjackal',-630,-920,'predator',-660,-1060],['dustjackal',-800,-1030,'predator',-870,-1210],['cragspitter',-900,-1780,'caster']]],
  ['freight-landing','Finite freight guards hold the crossing exit with a rear caster.',650,[['grunt',-660,-3850,'guard'],['caster',-380,-4100,'caster'],['siegeknight',-280,-3740,'guard']]]
 ],
 '1.1':[
  ['south-cage','A guard screens the caster at the first cage.',600,[['grunt',-720,-1920,'guard'],['caster',-1080,-2140,'caster']]],
  ['north-cage','Two defenders cover the north cage without chasing back to the entrance.',620,[['grunt',710,-3320,'guard'],['grunt',900,-3610,'runner']]],
  ['hidden-cage','The optional prisoner has an independent guard pair.',570,[['grunt',-2020,-2240,'guard'],['caster',-2380,-2390,'caster']]]
 ],
 '2.0':[
  ['arrow-gallery','The gallery caster remains above the breached gate, supported by a guard.',550,[['caster',660,-980,'caster'],['grunt',850,-950,'guard']]],
  ['workshop','A workshop sentry guards the approach to the tool route.',650,[['grunt',1250,-2190,'guard']]],
  ['key-post','A front guard and rear hex caster defend the key.',590,[['grunt',-340,-3580,'guard'],['caster',-496,-3770,'caster']]],
  ['bell-yard','Keep the repeatable siege camp together, separate from the rescue waves.',620,[['grunt',-1630,-1800,'guard'],['caster',-1930,-1660,'caster'],['grunt',-1650,-2010,'runner']]]
 ],
 '2.1':[
  ['cell-block','Finite cell guards defend the prisoner, not the lower floor.',520,[['grunt',-970,-1980,'guard'],['caster',-1229,-2088,'caster'],['grunt',-900,-2150,'runner']]],
  ['upper-landing','The caster supports the knight only on the upper landing.',560,[['caster',-80,-3520,'caster'],['siegeknight',70,-3710,'guard']]],
  ['drain-branch','Separate drain fights leave the main evacuation route readable.',560,[['bones',2330,-3450,'guard'],['caster',2190,-4090,'caster']]],
  ['lower-works','Hunting troops stay on their own lower floor.',620,[['grunt',-180,-2940,'guard'],['caster',180,-3060,'caster'],['grunt',-120,-3200,'runner']]]
 ],
 '3.0':[
  ['lower-snow','Space the opening creatures along the first climb instead of one pile.',650,[['frostling',-290,-340,'predator',-310,-480],['frostling',-350,-450,'predator',-430,-650]]],
  ['lift-house','The mountain patrol defends the lift house and its supplies.',650,[['grunt',-2200,-1210,'guard'],['grunt',-1960,-1160,'runner'],['caster',-2150,-1470,'caster']]],
  ['summit-approach','The summit has a screening pair and a rear frost caller.',680,[['grunt',-200,-4550,'guard'],['grunt',250,-4450,'runner'],['caster',-150,-4750,'caster']]]
 ],
 '3.1':[
  ['cave-entry','Two creatures pressure consecutive turns before the first pages.',630,[['frostling',-100,-630,'predator',-150,-740],['frostling',200,-1380,'predator',120,-1430]]],
  ['scholar-cage','Finite rescue guards remain around Ellis’s cell.',560,[['grunt',-1250,-2310,'guard'],['caster',-1570,-2300,'caster'],['grunt',-1100,-2100,'runner']]],
  ['waterworks','A guard screens the crossing caster; no detection from the channel above.',600,[['grunt',-100,-3500,'guard'],['caster',140,-3680,'caster'],['grunt',0,-3600,'runner']]]
 ],
 '4.0':[
  ['worker-gate','Finite guards hold the workers’ approach, with the caster behind.',600,[['grunt',-90,-1420,'guard'],['caster',200,-1550,'caster'],['grunt',-290,-1710,'runner']]],
  ['west-handles','The west guard covers the route into the handle workshop.',630,[['grunt',-1900,-2650,'guard',-1830,-2630],['grunt',-650,-2730,'runner',-720,-2540]]],
  ['weapon-line','A screening pair and cinder caller defend the mold drive.',620,[['grunt',-160,-3780,'guard'],['caster',170,-4050,'caster'],['grunt',0,-3950,'runner']]],
  ['furnace-door','The last guard challenges the exit approach after the machinery.',580,[['grunt',130,-5620,'guard',100,-5490]]]
 ],
 '4.1':[
  ['worker-floor','Repeatable guards defend the worker district independently of the escort.',620,[['grunt',-1000,-3370,'guard'],['caster',-980,-3910,'caster'],['grunt',-1000,-3650,'runner']]],
  ['east-gallery','The gallery pair remains on its walkway, away from the animal rescue.',580,[['grunt',1180,-2910,'guard',1130,-3060],['caster',1250,-3810,'caster',1250,-3670]]],
  ['office','Finite office guards remain at the writings, on the upper floor.',520,[['grunt',2170,-4730,'guard'],['caster',2340,-4880,'caster']]]
 ],
 '5.0':[
  ['rudder-wreck','The western wreck caster covers the approach to the rudder.',600,[['caster',-1670,-1800,'caster',-1600,-1880],['grunt',-696,-2200,'runner',-760,-2275]]],
  ['sail-wreck','A guard, flanker and tide caster defend the upper sail wreck.',620,[['grunt',1390,-1700,'guard'],['caster',1210,-1840,'caster'],['grunt',1550,-2040,'runner']]],
  ['memorial-shore','The shore guard screens the branch to the memorial.',620,[['grunt',-1060,-3190,'guard',-1140,-3240],['caster',-2050,-3480,'caster'],['grunt',0,-3830,'guard']]]
 ],
 '5.1':[
  ['first-climb','A guard occupies the first landing, a caster the next turn.',560,[['grunt',894,-1080,'guard',830,-1150],['caster',602,-1661,'caster']]],
  ['storm-climb','Separate successive landings instead of dragging the whole climb behind the player.',600,[['grunt',-980,-2290,'guard'],['grunt',-450,-2950,'runner'],['caster',460,-3360,'caster']]],
  ['upper-approach','A guard screens the final tide caster before the hydra approach.',620,[['grunt',870,-4000,'guard',790,-4055],['caster',410,-4590,'caster']]]
 ],
 '6.0':[
  ['west-court','Finite west guards protect the upper route, not the garden below.',540,[['grunt',-920,-2380,'guard'],['caster',-1160,-2520,'caster']]],
  ['east-court','Finite east guards protect the opposing upper route.',540,[['grunt',960,-1930,'guard'],['caster',1200,-2170,'caster']]],
  ['garden-patrol','The garden patrol is its own fight, with a clear screening guard.',600,[['grunt',-1330,-2100,'guard'],['caster',-1490,-1930,'caster'],['grunt',-1400,-1900,'runner']]],
  ['palace-entry','The last arcanist holds the climb before the mirror court.',620,[['caster',-200,-3410,'caster',-120,-3470]]]
 ],
 '6.1':[
  ['records-wing','Separate maintenance and records sentries preserve a choice of approach.',580,[['grunt',-1110,-1230,'guard',-1110,-1370],['caster',1150,-1950,'caster']]],
  ['orders-hall','Finite main-hall guards hold the release route.',650,[['grunt',-260,-2640,'guard'],['grunt',100,-3150,'runner'],['caster',290,-2940,'caster']]],
  ['display-hall','The optional display patrol stays in the display wing.',560,[['grunt',-925,-3690,'guard'],['caster',-1100,-3800,'caster'],['grunt',-990,-3740,'runner']]],
  ['scholar-exit','A final sentry covers the release-room approach.',540,[['grunt',500,-4500,'guard',440,-4560]]]
 ],
 '7.0':[
  ['supply-post','Finite supply guards defend the disguise supplies; preserve alternate access.',600,[['grunt',630,-1960,'guard'],['caster',1088,-2011,'caster'],['grunt',940,-1510,'runner']]],
  ['western-approach','A front guard screens the royal arcanist at the helmet route.',620,[['grunt',-1360,-1700,'guard',-1360,-1800],['royalarcanist',-1060,-2260,'caster'],['grunt',-1230,-1970,'runner']]],
  ['storehouse','The optional store has an independent guard/caster pair.',580,[['grunt',1870,-2570,'guard'],['caster',1710,-2720,'caster']]],
  ['inner-approach','The arcanist holds the final approach without pursuing into the supply ward.',650,[['royalarcanist',-330,-4070,'caster']]]
 ],
 '7.1':[
  ['first-landing','The first pair only sees the player once they reach its landing.',500,[['grunt',819,290,'guard'],['caster',894,290,'caster']]],
  ['lower-bars','The knight and caster own the lower-bars landing, not the floor below.',500,[['siegeknight',215,-894,'guard'],['royalarcanist',290,-894,'caster'],['grunt',160,-854,'runner']]],
  ['cells','Cell guards remain on the prisoner landing.',500,[['grunt',-1015,0,'guard'],['caster',-940,0,'caster'],['grunt',-865,0,'runner']]],
  ['middle-landing','The midpoint guard screens its arcanist.',500,[['royalarcanist',-528,824,'caster'],['grunt',-453,824,'guard']]],
  ['upper-east','The upper east pair stays on its own storey.',500,[['grunt',865,0,'guard'],['caster',940,0,'caster']]],
  ['upper-bars','The second knight and caster defend the upper bars.',500,[['siegeknight',215,-894,'guard'],['caster',290,-894,'caster']]],
  ['summit','The final formation defends the summit, independently of lower-storey fights.',540,[['siegeknight',-475,851,'guard'],['royalarcanist',-400,851,'caster'],['grunt',-325,851,'runner']]]
 ]
};
function active(G){return root.BFCampaignElites?.active(G)??(!!G&&G.zone>=0&&G.zone<8&&G.area>=0&&G.area<=1&&!['hub','trial','escape','bossRush','endless','delve','arena','bonusActive','sprintFun','sparringRoom','side','devBriar','devKeep'].some(k=>G[k]));}
function managed(e){return !!e&&!e.dead&&!e.boss&&!e.dummy&&!e.practice&&!e.bot&&e.kind!=='fly'&&e.kind!=='goblin'&&!Object.keys(e).some(k=>/escort|officer|kingAdd|wave|canyonAlarm|furnaceGate|furnaceCooling|hydraChain|immobile|prisonFoe/i.test(k)&&e[k]);}
function home(e,range=800){e.encHome={x:e.x,y:e.y||0,z:e.z};e.encLeash=range;e.encReturning=false;}
function install(G,api={}){
 if(!active(G))return null;
 const report={id:G.zone+'.'+G.area,groups:[],moved:[],rejected:[],unmatched:[]},used=new Set();
 for(const [id,intent,leash,rows]of plans[report.id]||[]){
  const group={id,intent,members:[]};report.groups.push(group);
  for(const [type,x,z,job,nx,nz]of rows){
   const e=G.enemies.filter(q=>!used.has(q)&&q.type===type&&Math.hypot((q.sx??q.x)-x,(q.sz??q.z)-z)<145).sort((a,b)=>Math.hypot((a.sx??a.x)-x,(a.sz??a.z)-z)-Math.hypot((b.sx??b.x)-x,(b.sz??b.z)-z))[0];
   if(!e){report.unmatched.push({group:id,type,x,z});continue;}used.add(e);
   e.encounter=id;e.encJob=job;group.members.push(e.mid);
   // Ordinary soldiers get authored jobs before the telegraph system replaces random roles.
   if(!e.ceKind){if(type==='grunt'){e.briarRoleHint=job==='runner'?'runner':'guard';e.campaignRoleHint=e.briarRoleHint;}else if(type==='caster')e.campaignRoleHint='caster';}
   if(nx!=null&&managed(e)){
    const q={...e,x:nx,z:nz},y=api.floor?.(nx,nz,e.r||15,(e.y||0)+12);
    if(Number.isFinite(y)&&Math.abs(y-(e.y||0))<=55&&(G.storyNpcs||[]).every(n=>Math.hypot(n.x-nx,n.z-nz)>200)){
     q.y=y;api.resolve?.(q,q.r,null,0);
     if(Math.hypot(q.x-nx,q.z-nz)<3){report.moved.push({mid:e.mid,from:[e.x,e.z,e.y],to:[nx,nz,y]});Object.assign(e,{x:nx,z:nz,y,sx:nx,sz:nz,sy:y});}
     else report.rejected.push({group:id,type,x:nx,z:nz,reason:'solid collision'});
    }else report.rejected.push({group:id,type,x:nx,z:nz,reason:'floor or safe NPC space'});
   }
   if(managed(e))home(e,leash);
  }
 }
 // Unmoved species keep their original jobs/AI, but cannot pursue across whole districts.
 for(const e of G.enemies)if(managed(e)&&!e.encHome)home(e);
 for(const slot of G.patrolWork?.slots||[]){const e=G.enemies.find(q=>q.mid===slot.mid);if(e){Object.assign(slot,{x:e.x,y:e.y,z:e.z,encounter:e.encounter,encJob:e.encJob,encLeash:e.encLeash,campaignRoleHint:e.campaignRoleHint,briarRoleHint:e.briarRoleHint});}}
 G.encounterPlan=report;return report;
}
function reinstate(e,slot){if(slot.encounter)e.encounter=slot.encounter;for(const k of ['encJob','campaignRoleHint','briarRoleHint'])if(slot[k])e[k]=slot[k];home(e,slot.encLeash||800);}
// Query sight only while a dormant body is within range. No hidden cross-floor wake-ups.
function canWake(G,e,players,clear){
 if(!active(G)||!managed(e))return true;
 if(e.hp<e.maxHp)return true; // Valid ranged/skill hits must always provoke a response.
 return players.some(p=>p&&p.hp>0&&!p.dead&&!p.downed&&Math.abs((p.y||0)-(e.y||0))<110&&Math.hypot(p.x-e.x,p.z-e.z)<640&&clear(e,p));
}
function retreat(G,e,players,dt,move){
 if(!active(G)||!managed(e))return false;
 if(!e.encHome)home(e);
 const h=e.encHome,homeDistance=Math.hypot(e.x-h.x,e.z-h.z),near=players.some(p=>p&&p.hp>0&&!p.dead&&!p.downed&&Math.abs((p.y||0)-h.y)<140&&Math.hypot(p.x-h.x,p.z-h.z)<e.encLeash);
 if(!e.encReturning&&!near&&homeDistance>e.encLeash*.65){
  // Finish a visible strike before disengaging; never erase an attack already being shown.
  if(root.BFCampaignElites?.dangerous?.(e)||e.windT>0||e.chargeT>0||e.meleeW>0||e.meleeActive>0||e.shotW>0||e.eruptW>0||e.knightW>0||e.fuseT>0)return false;
  e.encReturning=true;e.encLost=0;
 }
 if(!e.encReturning)return false;
 if(near){e.encReturning=false;return false;}
 if(homeDistance<30&&Math.abs(e.y-h.y)<45){e.encReturning=false;e.active=false;e.dropT=.65;return true;}
 const dx=(h.x-e.x)/(homeDistance||1),dz=(h.z-e.z)/(homeDistance||1);e.yaw=Math.atan2(dx,dz);move(dx,dz);
 return true;
}
const api={plans,active,managed,install,reinstate,canWake,retreat};root.BFCampaignEncounters=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
