/* Optional campaign combat work. Only designated patrol slots replenish. */
(function(root){'use strict';
const themes=[
 ['Keep Briar safe','Push the raiders away from the farms so the neighbors can gather supplies.','Guard the forest route','Cut down the patrols searching for the fleeing villagers.','Raid leader'],
 ['Clear the cliff paths','Thin the patrols blocking the climb through Hollow Pass.','Cover the rescued travelers','Keep the canyon paths clear while the prisoners escape.','Cliff captain'],
 ['Break the siege patrol','Drive the Legion away from the Keep workshops.','Protect the prison exit','Clear the patrols hunting the freed prisoners.','Prison captain'],
 ['Secure the mountain camps','Clear hostile creatures and patrols around the climb.','Protect the escape from the caves','Thin the enemies that could follow Ellis out of the mountain.','Mountain hunter'],
 ['Disrupt the weapon crews','Defeat the Legion troops guarding its weapon supply.','Cut off furnace support','Stop the troops protecting the furnace while the workers escape.','Forge captain'],
 ['Secure the crossing supplies','Clear the raiders and creatures around the wrecks.','Keep the cliff landing safe','Defeat the threats along the climb toward Sunspire.','Shore raider'],
 ['Reclaim the palace grounds','Break the patrols holding the palace courtyards.','Protect the library halls','Clear the Legion troops threatening the rescued scholars.','Palace captain'],
 ['Weaken the castle patrols','Reduce the forces watching the castle approach.','Clear the tower behind you','Defeat the guards that could trap the rescued workers below.','Tower captain']
];
// Explicit encounter locations, separate from finite rescue/boss guards. Coordinates use existing walkable floors.
const camps={
 '0.1':{place:'forest signal path',target:'Legion searchers',at:[-650,-1800,0],near:[-650,-1800,0],radius:550},
 '1.0':{place:'lower cliff paths',target:'cliff predators',at:[-750,-1100,0],near:[-750,-1100,0],radius:800},
 '1.1':{place:'hidden canyon floor',target:'canyon predators',at:[2350,-3310,0],near:[2350,-3310,0],radius:550},
 '2.0':{place:'old bell tower yard',target:'Legion siege troops',at:[-1680,-1800,0],add:[['grunt',-1630,-1800,0],['caster',-1840,-1830,0],['grunt',-1740,-1970,0]]},
 '2.1':{place:'lower prison works',target:'prison search troops',at:[0,-2970,0],add:[['grunt',-180,-2940,0],['caster',180,-3060,0],['grunt',-120,-3200,0]]},
 '3.0':{place:'mountain lift house',target:'Legion mountain troops',at:[-2100,-1300,220],near:[-2100,-1300,220],radius:320},
 '3.1':{place:'cave waterworks',target:'Legion searchers',at:[0,-3600,180],near:[0,-3600,180],radius:280},
 '4.0':{place:'machine control floor',target:'forge guards',at:[0,-3950,100],near:[0,-3950,100],radius:350},
 '4.1':{place:'furnace worker floor',target:'furnace patrol',at:[-1000,-3650,120],near:[-1000,-3650,120],radius:350},
 '5.0':{place:'upper shipwreck',target:'wreck raiders',at:[1390,-1800,350],near:[1390,-1800,350],radius:380},
 '5.1':{place:'lower tide pools',target:'tide slimes',at:[-400,-4200,320],near:[-400,-4200,320],radius:400},
 '6.0':{place:'western palace garden',target:'Legion garden patrol',at:[-1400,-1900,180],add:[['grunt',-1330,-2100,180],['caster',-1490,-1930,180]]},
 '6.1':{place:'sealed display hall',target:'library patrol',at:[-1330,-4000,440],add:[['grunt',-1220,-4010,440],['caster',-1500,-3900,440]]},
 '7.0':{place:'western castle approach',target:'castle patrol',at:[-1230,-1970,150],near:[-1230,-1970,150],radius:400},
 '7.1':{place:'first high tower landing',target:'tower reinforcements',at:[250,-894,500],near:[250,-894,500],radius:180,allowLanding:true}
};
function dressPatrol(e,group){
 e.patrolGroup=group;e.label=({dustjackal:"Dust jackal",cragspitter:"Crag spitter",slime:"Tide slime",siegeknight:"Legion siege knight",royalarcanist:"Legion arcanist"})[e.type]||e.label;
 // Preserve species and its specialized AI; give ordinary soldiers clear, repeatable jobs.
 if(e.type==='grunt'){
  if(e.role==='exploder')e.speed/=1.28;else if(e.role==='flanker')e.speed/=1.15;
  const flank=e.patrolStyle==='flank';Object.assign(e,{role:flank?'flanker':'shielder',roleCol:flank?'#c99b72':'#a9b1be',label:flank?'Legion runner':'Legion shield guard',h:flank?48:61,r:flank?17:22});e.speed*=flank?1.12:.88;
 }else if(e.type==='caster'){e.role=null;e.roleCol=null;e.label='Legion spellcaster';e.h=57;e.shootCd=Math.max(2.8,e.shootCd||0);}
}
function definition(zone,area){const t=themes[zone];return t&&area>=0&&area<2?{id:'combat.'+zone+'.'+area,title:t[area*2],text:t[area*2+1],total:area?12:10,elite:t[4]}:null;}
function dressRaider(e,role){
 if(e.role==='exploder')e.speed/=1.28;else if(e.role==='flanker')e.speed/=1.15;
 e.homeRaid=role;e.role=null;e.roleCol=null;
 if(role==='runner'){Object.assign(e,{label:'Farm raider',role:'flanker',roleCol:'#cf9561',color:'#ad7952',h:44,r:16});e.speed*=1.12;}
 if(role==='caster'){Object.assign(e,{label:'Legion hex caster',color:'#9372ba',h:54,r:14,shootCd:3.1,shootT:1.5});if(e.shot)e.shot={...e.shot,speed:320,size:9};}
 if(role==='heavy'){Object.assign(e,{label:'Farm raid leader',color:'#8b5960',h:64,r:23});e.speed*=.75;}
}
function setup(G,api={}){const d=definition(G.zone,G.area);if(!d)return;const safe=e=>!e.dead&&!e.boss&&!e.elite&&!e.dummy&&!e.practice&&!e.bot&&!e.furnaceGate&&!e.furnaceOffice&&e.kind!=='fly'&&!Object.keys(e).some(k=>/guard|wave|rescue|officer|kingAdd/i.test(k)&&e[k])&&Math.hypot(e.x-G.p.x,e.z-G.p.z)>450&&(G.storyNpcs||[]).every(n=>Math.hypot(e.x-n.x,e.z-n.z)>180);
 const candidates=G.enemies.filter(safe),anchor=candidates[Math.floor(candidates.length*.45)],members=anchor?candidates.filter(e=>Math.hypot(e.x-anchor.x,e.z-anchor.z)<420&&Math.abs(e.y-anchor.y)<40).slice(0,3):[];
 if(G.zone===0&&G.area===0&&G.enemies.some(e=>e.homeRaid)){
  const raiders=G.enemies.filter(e=>e.homeRaid),members=raiders.filter(e=>e.homeRaid!=='heavy');
  G.patrolWork={...d,title:'Drive back the farm raiders',text:'Defeat 10 farm raiders or Legion hex casters at the western supply wagon. Keep the supplies safe for Briar.',targeted:true,total:10,elite:'Farm raid leader',slots:members.map(e=>({type:e.type,x:e.x,y:e.y||0,z:e.z,mid:e.mid,role:e.homeRaid,readyAt:null})),anchor:{x:-2400,y:0,z:-820}};
  return {work:G.patrolWork,elite:raiders.find(e=>e.homeRaid==='heavy')};
 }
 const config=camps[G.zone+'.'+G.area];
 if(config){
  const selected=G.enemies.filter(e=>!e.dead&&!e.boss&&!e.elite&&(safe(e)||(config.allowLanding&&e.ascentGuard==='landing'))&&(config.near&&Math.hypot(e.x-config.near[0],e.z-config.near[1])<config.radius&&Math.abs(e.y-config.near[2])<100));
  for(const [type,x,z,y]of config.add||[]){const e=api.spawn?.(type,x,z);if(e){Object.assign(e,{y,sy:y,sx:x,sz:z});selected.push(e);}}
  selected.slice(0,3).forEach((e,i)=>{e.patrolStyle=i===1||i===2?'flank':'guard';dressPatrol(e,d.id);const floor=api.support?.(e);if(Number.isFinite(floor)){e.y=floor;e.sy=floor;}});
  const group=selected.slice(0,3);
  G.patrolWork={...d,targeted:true,group:d.id,place:config.place,target:config.target,text:(config.target.includes('predators')?'Keep these dangerous hunting grounds clear for travelers.':config.target==='tide slimes'?'Clear the tide pools below the climb.':d.text)+' Defeat '+d.total+' '+config.target+' at the '+config.place+'.',slots:group.map(e=>({type:e.type,x:e.x,y:e.y||0,z:e.z,mid:e.mid,group:d.id,style:e.patrolStyle,readyAt:null})),anchor:{x:config.at[0],z:config.at[1],y:config.at[2]}};
  return {work:G.patrolWork,elite:G.area===0&&[2,4,5,7].includes(G.zone)?candidates.find(e=>!group.includes(e)):null};
 }
 G.patrolWork={...d,total:members.length?d.total:Math.min(d.total,G.enemies.filter(e=>!e.boss&&!e.dummy&&!e.practice).length),slots:members.map(e=>({type:e.type,x:e.x,y:e.y||0,z:e.z,mid:e.mid,readyAt:null})),anchor:anchor?{x:anchor.x,y:anchor.y||0,z:anchor.z}:null};
 return {work:G.patrolWork,elite: G.area===0&&[0,2,4,5,7].includes(G.zone)?candidates.find(e=>!members.includes(e)):null};
}
function task(G,s){const d=G.patrolWork||definition(G.zone,G.area);if(!d||!s.flags[d.id+'.known'])return null;const n=Math.min(d.total,s.items[d.id]||0);return {title:d.title,progress:n+'/'+d.total+(d.group?' '+d.target+' defeated · '+d.place:d.targeted?' farm raiders defeated · western supply wagon':' defeated'),done:!!s.flags[d.id+'.done']};}
function tick(G,s,dt,api){const w=G.patrolWork;if(!w)return;
 // Keep authored bodies (quest references), but don't retain unlimited refill corpses.
 if(G.enemies.some(e=>e.patrolReturn&&e.dead&&Number.isFinite(e.defeatedAt)&&G.time-e.defeatedAt>2))G.enemies=G.enemies.filter(e=>!e.patrolReturn||!e.dead||!Number.isFinite(e.defeatedAt)||G.time-e.defeatedAt<=2);
 if(!api.host||G.voyage)return;
 if(w.anchor&&Math.hypot(G.p.x-w.anchor.x,G.p.z-w.anchor.z)<450&&Math.abs((G.p.y||0)-w.anchor.y)<130&&!s.flags[w.id+'.camp']){s.flags[w.id+'.camp']=true;s.flags[w.id+'.known']=true;s.revision++;api.notice(w.title,w.text+' More enemies return here after a short break. You can train here, or continue your journey.');}
 for(const slot of w.slots){if(G.enemies.some(e=>(e.mid===slot.mid||e.patrolParent===slot.mid)&&!e.dead&&e.hp>0)){slot.readyAt=null;continue;}if(slot.readyAt==null)slot.readyAt=G.time+25;
  const near=api.players.some(p=>Math.hypot(p.x-slot.x,p.z-slot.z)<1100&&Math.abs((p.y||0)-slot.y)<180),crowded=api.players.some(p=>Math.hypot(p.x-slot.x,p.z-slot.z)<220&&Math.abs((p.y||0)-slot.y)<100);
  if(G.time<slot.readyAt||!near||crowded)continue;const e=api.spawn(slot.type,slot.x,slot.z);if(!e)continue;if(slot.role)dressRaider(e,slot.role);if(slot.group){e.patrolStyle=slot.style;dressPatrol(e,slot.group);}Object.assign(e,{y:slot.y,sy:slot.y,patrolReturn:true,stunT:1.2,active:false});slot.mid=e.mid;slot.readyAt=null;
 }
}
function killed(G,s,e,api){const d=G.patrolWork||definition(G.zone,G.area);if(!d||!api.host||e.boss||e.practice||e.dummy||e.bot||s.flags[d.id+'.done'])return false;
 if(d.group?e.patrolGroup!==d.group:d.targeted&&!e.homeRaid)return false;
 if(!s.flags[d.id+'.known'])api.notice('New combat task',d.title+' — '+d.text+' Defeat '+d.total+(d.group?' '+d.target+' at the '+d.place+'.':d.targeted?' raiders at the western supply wagon.':' enemies in this part.'));
 s.flags[d.id+'.known']=true;s.items[d.id]=Math.min(d.total,(s.items[d.id]||0)+1);s.revision++;
 if(s.items[d.id]===d.total){s.flags[d.id+'.done']=true;s.rewards[d.id]={kind:'campaign_combat',amount:160+G.zone*55,recipients:api.party};api.notice('Combat task complete',d.title+' — bonus XP and gold earned.');}return true;
}
const api={definition,setup,task,tick,killed,dressRaider,dressPatrol};root.BFCampaignPatrols=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
