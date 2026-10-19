/* NPC-owned optional repeatable work. Progress and receipts use existing story dictionaries. */
(function(root){'use strict';
const rows=[
 ['gus','Gus','Supplies for Briar','Raiders keep stealing from the farm wagons.','stolen supply bundles',['grunt','caster']],
 ['lewis','Lewis','Keep the escape route clear','Search parties keep coming through the woods.',null,['grunt','caster']],
 ['caleb','Caleb','Safe passage','Travelers need a clear path through these hunting grounds.',null,['dustjackal','cragspitter']],
 ['ruth','Ruth','A safer shelter','The freed prisoners need room to recover.',null,['dustjackal','cragspitter']],
 ['grant','Grant','Break the siege patrol','The siege troops keep returning to the old bell tower yard.',null,['grunt','caster']],
 ['walter','Walter','Keep the works clear','Search troops are using the lower works to reach the prisoners.',null,['grunt','caster']],
 ['heath','Heath','Keep the shelter route open','Mountain threats keep gathering near the lift house.',null,['frostling','frostlobber']],
 ['ellis','Professor Ellis','Recover the samples','The search troops took my sealed field samples.','sealed sample packets',['grunt','caster']],
 ['flint','Flint','Metal worth saving','The weapon-line guards carry scraps I can use for repairs.','usable metal scraps',['grunt','caster']],
 ['martin','Martin','Keep the worker floor clear','Furnace patrols keep returning to the worker floor.',null,['grunt','caster']],
 ['otto','Otto','Protect the salvage','Wreck raiders keep taking the supplies we need for repairs.',null,['grunt','caster']],
 ['abe','Abe','Clear the tide pools','The tide slimes are spreading across the fishing pools.',null,['slime']],
 ['grace','Sister Grace','Room to recover','The wounded need the western garden kept clear.',null,['grunt','caster']],
 ['hugh','Master Hugh','Protect the collection','The patrols in the display hall threaten the books.',null,['grunt','caster']],
 ['roland','Roland','Thin the castle patrol','The west approach is watched by a returning patrol.',null,['grunt','caster']],
 ['miles','Miles','Keep the landing clear','Reinforcements keep arriving on the first high landing.',null,['grunt','caster']]
];
const definitions=rows.map(([npc,name,title,reason,collect,fallback],i)=>({zone:Math.floor(i/2),area:i%2,id:'hunt.'+Math.floor(i/2)+'.'+i%2,npc,name,title,reason,collect,fallback,total:i<4?10:i<10?12:15,gold:120+Math.floor(i/2)*70+(i%2)*30,xp:160+Math.floor(i/2)*65+(i%2)*30}));
function definition(g){return g&&!g.hub&&!g.trial&&!g.side&&!g.delve&&!g.endless&&!g.escape&&!g.arena&&!g.bonusActive&&!g.devBriar&&!g.devKeep&&g.area>=0?definitions.find(d=>d.zone===g.zone&&d.area===g.area):null;}
function contract(g){const d=definition(g),w=g?.patrolWork;return d&&w?.contract?.id===d.id?w.contract:null;}
function count(s,d){return Math.max(0,Math.min(d.total,Number(s?.items?.[d.id])||0));}
function phase(s,d){return s?.quests?.[d.id]!=='active'?'offer':count(s,d)>=d.total?'ready':'active';}
function setup(g,api){const w=g.patrolWork,d=definition(g);if(!w||!d||(g.storyNpcs||[]).every(n=>n.id!==d.npc))return null;
 // Fill only this authored camp. Do not recycle rescue guards, bosses or arbitrary nearby mobs.
 const offsets=[[0,0],[-90,40],[90,-40],[-150,-90],[150,90],[0,-160],[0,160],[-210,0],[210,0]];
 // Earlier camp slots can overlap later scenery. Repair only these designated bodies.
 for(const slot of w.slots){const e=g.enemies.find(e=>e.mid===slot.mid);if(!e)continue;for(const [dx,dz]of offsets){const q={x:slot.x+dx,z:slot.z+dz,y:slot.y,r:e.r||20},y=api.support?.(q);if(!Number.isFinite(y)||Math.abs(y-slot.y)>100)continue;q.y=y;if(api.clear&&!api.clear(q))continue;if((g.storyNpcs||[]).some(n=>Math.hypot(n.x-q.x,n.z-q.z)<190&&Math.abs((n.y||0)-y)<100))continue;Object.assign(slot,{x:q.x,z:q.z,y});Object.assign(e,{x:q.x,z:q.z,y,sx:q.x,sz:q.z,sy:y});break;}}
 for(const [dx,dz]of offsets){if(w.slots.length>=3||!w.anchor)break;const x=w.anchor.x+dx,z=w.anchor.z+dz;if(w.slots.some(o=>Math.hypot(o.x-x,o.z-z)<65))continue;
  const probe={x,z,y:w.anchor.y,r:20};const y=api.support?.(probe);if(!Number.isFinite(y)||Math.abs(y-w.anchor.y)>100)continue;probe.y=y;if(api.clear&&!api.clear(probe))continue;
  if((g.storyNpcs||[]).some(n=>Math.hypot(n.x-x,n.z-z)<190&&Math.abs((n.y||0)-y)<100))continue;
  const e=api.spawn(d.fallback[w.slots.length%d.fallback.length],x,z);if(!e)continue;Object.assign(e,{y,sy:y,sx:x,sz:z,patrolGroup:w.id,patrolStyle:w.slots.length===1?'flank':'guard'});root.BFCampaignPatrols?.dressPatrol(e,w.id);w.slots.push({type:e.type,x,y,z,mid:e.mid,group:w.id,style:e.patrolStyle,readyAt:null});
 }
 if(!w.slots.length)return null;
 const names=[...new Set(w.slots.map(slot=>api.label?.(g.enemies.find(e=>e.mid===slot.mid))||slot.type))];
 w.contract={...d,payoutXp:api.xp?api.xp(d.xp):d.xp,when:api.book?.npcs[d.npc]?.when||[],place:w.place||(g.zone===0&&g.area===0?'western supply wagon':'patrol camp'),target:names.join(' / ')};w.total=d.total;w.huntSeen=new WeakSet();const state=g.storyState;if(api.host!==false&&state&&state.quests[d.id]==null&&!state.flags[w.id+'.done']&&(state.items[w.id]||0)>0){state.quests[d.id]='active';state.items[d.id]=Math.min(d.total,state.items[w.id]);state.flags[d.id+'.known']=true;state.revision++;}return w.contract;
}
function details(g,s){const d=contract(g);if(!d)return null;const p=phase(s,d),n=count(s,d),xp=d.payoutXp??d.xp;return {...d,xp,phase:p,count:n,instruction:d.collect?'Recover '+d.total+' '+d.collect+' from '+d.target:'Defeat '+d.total+' '+d.target,progress:p==='ready'?'Return to '+d.name+' · '+d.gold+' gold + '+xp+' XP':n+'/'+d.total+' '+(d.collect||'defeated')+' · '+d.place};}
function task(g,s){const d=details(g,s);return d&&d.phase!=='offer'?{title:d.title+' · Repeatable',progress:d.progress,done:false,kind:'hunt'}:null;}
function marker(g,s,npc){const d=contract(g);return d&&d.npc===npc&&(!root.BFStoryState||root.BFStoryState.matches(s,d.when))?(phase(s,d)==='ready'?'ready':phase(s,d)==='offer'?'available':null):null;}
function decorate(g,s,v,book){const d=details(g,s);if(!v||!d||v.npc!==d.npc)return v;
 // A ready main-story hand-in keeps its existing exclusive turn-in path.
 const originals=book.nodes[v.lineId]?.choices||[];if(originals.some(c=>c.turnIn&&v.choices.some(q=>q.id===c.id&&!q.end)))return v;
 const text=v.text+'\n\n'+d.title+' · Repeatable\n'+(d.phase==='offer'?d.reason+'\n'+d.instruction+'.\n'+d.place+' · Orange Hunt marker\n'+d.gold+' gold + '+d.xp+' XP · Return to '+d.name+'.\nEnemies return every 25s; move away from cleared spots.':d.progress+' · '+(d.phase==='ready'?'Green Turn-in marker':'Orange Hunt marker'));
 const option=d.phase==='active'?null:{id:d.phase==='ready'?'__hunt_claim':'__hunt_accept',text:d.phase==='ready'?'Turn in hunt · '+d.gold+' gold + '+d.xp+' XP':'Accept hunt · Repeatable',category:'side',optional:true,questProgress:true};
 const choices=d.phase==='ready'?[option]:[...v.choices.filter(c=>!c.id.startsWith('__hunt_')), ...(option?[option]:[])];
 return {...v,text,choices};
}
// Keep only hunt progress when campaign retries rewind the main quest checkpoint.
function retain(g,route){const d=contract(g),source=g?.storyState;if(!d||!source||!route)return;const target=route.storyState||(route.storyState={version:1,revision:0,flags:{},items:{},quests:{},notes:{},cursors:{},rewards:{},events:{}});for(const k of ['flags','items','quests','rewards'])target[k]||={};
 for(const [kind,keys]of [['quests',[d.id]],['items',[d.id,d.id+'.round']],['flags',[d.id+'.known']]])for(const key of keys)if(Object.hasOwn(source[kind],key))target[kind][key]=source[kind][key];
 route.storyClaims||={};for(const [id,reward]of Object.entries(source.rewards))if(id.startsWith(d.id+'.round.')&&reward.kind==='campaign_hunt'){target.rewards[id]=JSON.parse(JSON.stringify(reward));if(g.storyClaims?.[id])route.storyClaims[id]=true;}
 target.revision=Math.max(target.revision||0,source.revision||0);
}
function navigation(g,s){const d=details(g,s);if(!d||d.phase==='offer')return null;const o=d.phase==='ready'?(g.storyNpcs||[]).find(n=>n.id===d.npc):g.patrolWork.anchor;return o?{...o,label:d.phase==='ready'?'Turn in':'Hunt',color:d.phase==='ready'?'#9be4b0':'#ffb163'}:null;}
function apply(state,book,request,context){const fail=()=>({state,changed:false}),g=context.world,d=contract(g),event=request?.event,c=state.conversation;
 if(!d||!definition(g)||!c||c.owner!==context.actor||c.npc!==d.npc||event?.npc!==d.npc||event.line!==c.node||event.revision!==state.revision||request.epoch!==context.epoch||!context.alive||typeof event.id!=='string'||!event.id||event.id.length>160||['__proto__','constructor','prototype'].includes(event.id)||Object.hasOwn(state.events,event.id))return fail();
 const n=context.npcs.find(n=>n.id===d.npc),p=context.position;if(!n||!p||!book.npcs[d.npc]||!root.BFStoryState.matches(state,book.npcs[d.npc].when)||!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.hypot(p.x-n.x,p.z-n.z)>(n.range||115)||Math.abs((p.y||0)-(n.y||0))>65||context.canReach&&!context.canReach(p,n))return fail();
 const current=phase(state,d);if(event.action!=='accept'&&event.action!=='claim'||event.action==='accept'&&current!=='offer'||event.action==='claim'&&current!=='ready')return fail();
 const s=JSON.parse(JSON.stringify(state));if(event.action==='accept'){s.items[d.id]=0;s.quests[d.id]='active';s.flags[d.id+'.known']=true;}
 else{const round=Math.max(0,Math.floor(Number(s.items[d.id+'.round'])||0))+1,id=d.id+'.round.'+round;if(s.rewards[id])return fail();s.items[d.id+'.round']=round;s.quests[d.id]='closed';s.items[d.id]=0;s.rewards[id]={kind:'campaign_hunt',amount:d.xp,gold:d.gold,title:d.title,recipients:[...new Set(context.party)]};}
 s.cursors[c.npc]=JSON.parse(JSON.stringify(c));s.conversation=null;s.events[event.id]=true;s.revision++;return {state:s,changed:true};
}
function killed(g,s,e,api){const d=contract(g),w=g.patrolWork;if(!d||!api.host||phase(s,d)!=='active'||!e||e.boss||e.elite||e.practice||e.dummy||e.bot||!w.slots.some(slot=>slot.mid===e.mid&&slot.type===e.type)||w.huntSeen?.has(e))return false;
 (w.huntSeen||(w.huntSeen=new WeakSet())).add(e);s.items[d.id]=Math.min(d.total,count(s,d)+1);s.revision++;if(count(s,d)===d.total)api.notice('Hunt ready to turn in',d.title+' · Return to '+d.name+' for '+d.gold+' gold + '+(d.payoutXp??d.xp)+' XP.');return true;
}
root.BFCampaignHunts={definitions,definition,contract,count,phase,setup,details,task,marker,decorate,retain,navigation,apply,killed};if(typeof module!=='undefined')module.exports=root.BFCampaignHunts;
})(typeof window!=='undefined'?window:globalThis);
