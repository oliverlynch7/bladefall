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
function definition(zone,area){const t=themes[zone];return t&&area>=0&&area<2?{id:'combat.'+zone+'.'+area,title:t[area*2],text:t[area*2+1],total:area?12:10,elite:t[4]}:null;}
function setup(G){const d=definition(G.zone,G.area);if(!d)return;const safe=e=>!e.dead&&!e.boss&&!e.elite&&!e.dummy&&!e.practice&&!e.bot&&e.kind!=='fly'&&!Object.keys(e).some(k=>/guard|wave|rescue|officer|kingAdd/i.test(k)&&e[k])&&Math.hypot(e.x-G.p.x,e.z-G.p.z)>450&&(G.storyNpcs||[]).every(n=>Math.hypot(e.x-n.x,e.z-n.z)>180);
 const candidates=G.enemies.filter(safe),anchor=candidates[Math.floor(candidates.length*.45)],members=anchor?candidates.filter(e=>Math.hypot(e.x-anchor.x,e.z-anchor.z)<420&&Math.abs(e.y-anchor.y)<40).slice(0,3):[];
 G.patrolWork={...d,total:members.length?d.total:Math.min(d.total,G.enemies.filter(e=>!e.boss&&!e.dummy&&!e.practice).length),slots:members.map(e=>({type:e.type,x:e.x,y:e.y||0,z:e.z,mid:e.mid,readyAt:null})),anchor:anchor?{x:anchor.x,y:anchor.y||0,z:anchor.z}:null};
 return {work:G.patrolWork,elite: G.area===0&&[0,2,4,5,7].includes(G.zone)?candidates.find(e=>!members.includes(e)):null};
}
function task(G,s){const d=G.patrolWork||definition(G.zone,G.area);if(!d||!s.flags[d.id+'.known'])return null;const n=Math.min(d.total,s.items[d.id]||0);return {title:d.title,progress:n+'/'+d.total+' defeated',done:!!s.flags[d.id+'.done']};}
function tick(G,s,dt,api){const w=G.patrolWork;if(!w||!api.host||G.voyage)return;
 if(w.anchor&&Math.hypot(G.p.x-w.anchor.x,G.p.z-w.anchor.z)<450&&!s.flags[w.id+'.camp']){s.flags[w.id+'.camp']=true;s.flags[w.id+'.known']=true;s.revision++;api.notice(w.title,w.text+' Enemy patrols return here after a short break. You can train here, or continue your journey.');}
 for(const slot of w.slots){if(G.enemies.some(e=>e.mid===slot.mid&&!e.dead&&e.hp>0)){slot.readyAt=null;continue;}if(slot.readyAt==null)slot.readyAt=G.time+25;
  const near=api.players.some(p=>Math.hypot(p.x-slot.x,p.z-slot.z)<1100),crowded=api.players.some(p=>Math.hypot(p.x-slot.x,p.z-slot.z)<220&&Math.abs((p.y||0)-slot.y)<100);
  if(G.time<slot.readyAt||!near||crowded)continue;const e=api.spawn(slot.type,slot.x,slot.z);if(!e)continue;Object.assign(e,{y:slot.y,sy:slot.y,patrolReturn:true,stunT:1.2,active:false});slot.mid=e.mid;slot.readyAt=null;
 }
}
function killed(G,s,e,api){const d=G.patrolWork||definition(G.zone,G.area);if(!d||!api.host||e.boss||e.practice||e.dummy||e.bot||s.flags[d.id+'.done'])return false;
 if(!s.flags[d.id+'.known'])api.notice('New combat task',d.title+' — '+d.text+' Defeat '+d.total+' enemies in this part.');
 s.flags[d.id+'.known']=true;s.items[d.id]=Math.min(d.total,(s.items[d.id]||0)+1);s.revision++;
 if(s.items[d.id]===d.total){s.flags[d.id+'.done']=true;s.rewards[d.id]={kind:'campaign_combat',amount:160+G.zone*55,recipients:api.party};api.notice('Combat task complete',d.title+' — bonus XP and gold earned.');}return true;
}
const api={definition,setup,task,tick,killed};root.BFCampaignPatrols=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
