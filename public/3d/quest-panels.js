/* Quest facts are presentation data, never part of the NPC's spoken script. */
(function(root){'use strict';
const requests=[
 {id:'briar.gus.tools',lines:['briar.gus.request','briar.gus.waiting'],title:"Gus's good tools",objective:'Bring Gus his tool roll.',where:'Workshop loft window',returnTo:'Gus',item:'gus_tools',rewards:['1 Rift Shard','Workshop shortcut']},
 {id:'woods.rescue',lines:['briar.beth.first','briar.beth.sheep','briar.beth.trail','briar.bethBrother.first','briar.bethBrother.wait'],title:'Nobody left behind',objective:"Find Beth's brother and clear his way back.",where:'East of the broken bridge · follow the boot prints',returnTo:'Beth',rewards:['Dog companion after leaving the woods']},
 {id:'pc.garden',lines:['pc.grace.garden','pc.grace.garden.wait'],title:'The garden still lives',objective:'Open the greenhouse water channel and bring Grace the seed tin.',where:'East greenhouse',returnTo:'Sister Grace',item:'pc.seeds',readyFlag:'pc.garden.water',rewards:['1 Rift Shard']},
 {id:'sc.bell',lines:['sc.rose.hello','sc.rose.memory','sc.rose.wait','sc.rose.repair'],title:"Rose's last voyage",objective:'Recover the ship bell and learn what happened to the crew.',where:'Old wreck northwest of the work beach',returnTo:'Captain Rose',rewards:['1 Rift Shard']},
 {id:'cg.personal',lines:['cg.roland.personal'],title:"Roland's armor",objective:'Return Roland’s chest piece.',where:'Seized goods room · east of the wagon yard',returnTo:'Roland',rewards:['1 Rift Shard for returning it']},
 {id:'la.workers',lines:['la.miles.workers'],title:'No one left below',objective:'Defeat the cell guards, then turn the release wheel.',where:'Cells on the next stair turn',returnTo:'Miles',rewards:['Free the imprisoned workers']},
 {id:'tc.cave',lines:['tc.dash.hello','tc.dash.offer','tc.dash.help','tc.dash.race'],title:"Dash's claim",objective:'Open the wreck cave together, or win the cliff race.',where:'Western rock arch',returnTo:'Dash',rewards:['Share the coins · win the race to keep them all']}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function decorate(g,s,v){
 if(!v)return v;const panels=[...(v.questPanels||[])];
 const q=requests.find(q=>q.lines.includes(v.lineId));
 if(q&&s?.quests?.[q.id]!=='closed'){
  const phase=s?.quests?.[q.id],ready=q.item&&(s?.items?.[q.item]||0)>0&&(!q.readyFlag||s?.flags?.[q.readyFlag]);
  panels.unshift({...q,choiceIds:(v.choices||[]).filter(c=>!c.end&&c.category==='side'&&!c.id.startsWith('__hunt_')).map(c=>c.id),kind:'Side quest',status:phase==='complete'?'complete':ready?'ready':phase==='active'?'active':'offer'});
 }
 // Return request definitions are also the source of their actual payouts.
 const match=/^rv\.([^.]+)\./.exec(v.lineId),r=match&&root.BFReturnVisits?.defs?.[match[1]];
 if(r){const id=match[1],flags=s?.flags||{},status=flags['rv.done.'+id]?'complete':flags['rv.ready.'+id]?'ready':flags['rv.accepted.'+id]?'active':'offer';
  panels.unshift({id:'rv.'+id,choiceIds:(v.choices||[]).filter(c=>!c.end&&c.category!=='lore'&&!c.id.startsWith('__')).map(c=>c.id),title:r.title,kind:'Side quest',status,objective:r.hint,where:r.where,gold:r.gold,returnTo:r.giver||g?.storyNpcs?.find(n=>n.id===r.npc)?.name||'the quest giver',rewards:r.upgrade==='companionCare'?['Companions gain 10% maximum health']:['Waystation improvement']});
 }
 return panels.length?{...v,questPanels:panels}:v;
}
function render(panels){
 if(!Array.isArray(panels)||!panels.length)return '';
 return '<div class="quest-facts-list" aria-label="Quest details">'+panels.map(q=>{
  const status={offer:'Available',active:'In progress',ready:'Ready to turn in',complete:'Completed'}[q.status]||'Available';
  const rewards=[];if(Number(q.gold)>0)rewards.push('<span class="quest-reward-gold">'+esc(q.gold)+' gold</span>');if(Number(q.xp)>0)rewards.push('<span class="quest-reward-xp">'+esc(q.xp)+' XP</span>');for(const text of q.rewards||[])rewards.push('<span class="quest-reward-perk">'+esc(text)+'</span>');
  return '<section class="quest-facts" data-quest-phase="'+esc(q.status)+'" aria-label="'+esc(q.title)+' quest details"><header><div><small>'+esc(q.kind)+'</small><h3>'+esc(q.title)+'</h3></div><span class="quest-facts-status">'+status+'</span></header>'+(q.reason?'<p class="quest-facts-reason">'+esc(q.reason)+'</p>':'')+'<dl><div class="quest-facts-objective"><dt>Objective</dt><dd>'+esc(q.objective)+(q.progress?'<strong class="quest-facts-count">'+esc(q.progress)+'</strong>':'')+'</dd></div>'+(q.where?'<div><dt>Where</dt><dd>'+esc(q.where)+'</dd></div>':'')+(q.returnTo?'<div><dt>Turn in</dt><dd>'+esc(q.returnTo)+'</dd></div>':'')+'</dl>'+(rewards.length?'<div class="quest-facts-rewards"><b>Reward</b>'+rewards.join('')+'</div>':'')+'<div class="quest-facts-actions" data-quest-actions="'+esc(q.id)+'"></div></section>';
 }).join('')+'</div>';
}
root.BFQuestPanels={decorate,render,requests};if(typeof module!=='undefined')module.exports=root.BFQuestPanels;
})(typeof window!=='undefined'?window:globalThis);
