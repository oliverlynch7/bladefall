/* Adventure HUD presentation. Inventory grants/sales stay in the game, never here. */
(function(){'use strict';
 let api,owner=null,queue=[],current=null,last=null,left=0,panel;
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(a){
  api=a;document.body.classList.add('adventure-hud');
  const gold=$('hudGold');const row=$('lvlbadge').parentElement;row.classList.add('hud-class-row');row.append(gold);row.after($('weapontag'));$('hudDetails').hidden=true;
  const fps=document.createElement('output');fps.id='fpsCounter';fps.hidden=true;fps.setAttribute('aria-label','Frames per second');fps.setAttribute('aria-live','off');document.body.append(fps);
  const dock=document.createElement('div');dock.id='adventureCombat';
  const skills=document.createElement('div');skills.id='adventureSkills';
  ['bLMB','bSk0','bSk1','bSk2','bSk3','bSpace'].forEach(id=>skills.append($(id)));
  dock.append(skills,$('hudprogress'),$('bAuto'));$('controls').append(dock);
  $('hudbag').onclick=()=>api.bag();$('hudAutoSell').onclick=()=>api.toggleSell();
  $('hudJournal').onclick=()=>api.journal();$('hudLootHistory').onclick=()=>{if(last||current){current=current||last;left=12;paint(current);panel.hidden=false;}else api.bag();};
  panel=$('equipmentFeed');panel.querySelector('[data-dismiss-loot]').onclick=()=>{current=null;panel.hidden=true;};
  new ResizeObserver(entries=>{const h=entries[0].target.getBoundingClientRect().height;if(h)document.body.style.setProperty('--hud-bag-height',h+'px');}).observe($('inventoryDock'));
  panel.querySelector('[data-loot-bag]').onclick=()=>api.bag();
  const placeIdentity=()=>{const h=$('hud').getBoundingClientRect(),pet=$('pethud');if(h.height>0)document.body.style.setProperty('--hud-identity-bottom',h.bottom+'px');document.body.style.setProperty('--hud-companion-space',pet.classList.contains('hide')?'0px':(pet.getBoundingClientRect().height+8)+'px');};
  const identitySize=new ResizeObserver(placeIdentity);identitySize.observe($('hud'));identitySize.observe($('pethud'));window.addEventListener('resize',placeIdentity);placeIdentity();
  // Never let clicks on HUD controls also swing a weapon or rotate the world.
  for(const el of [$('inventoryDock'),panel,$('hud')])for(const type of ['pointerdown','mousedown','touchstart'])el.addEventListener(type,e=>e.stopPropagation());
 }
 function reset(g){if(owner!==g){owner=g;queue=[];current=null;last=null;left=0;if(panel)panel.hidden=true;}}
 function show(data,g){
  reset(g);
  // One physical item can go from blocked to collected/sold. Never replay its stale outcome.
  queue=queue.filter(d=>d.item!==data.item);
  if(last?.item===data.item)last=data;
  if(current?.item===data.item){current=data;last=data;left=10;paint(data);return;}
  queue.push(data);if(queue.length>10)queue.shift();
 }
 function paint(d){
  const o=d.item,old=d.equipped,rar=d.rarity||{};
  panel.style.setProperty('--loot-color',rar.color||'#d8c9a3');
  panel.querySelector('.loot-icon').src=d.icon;panel.querySelector('.loot-name').textContent=o.name;
  panel.querySelector('.loot-rarity').textContent=(rar.name||o.rarity)+' · '+d.type;
  panel.querySelector('.loot-outcome').textContent=d.sold?'Auto-sold · +'+d.gold+' gold':d.blocked?'Bag full · still on the ground':'Added to bag';
  panel.dataset.outcome=d.sold?'sold':d.blocked?'blocked':'kept';
  const rows=comparison(d);
  panel.querySelector('.loot-comparison').innerHTML=rows;
  panel.querySelector('.loot-usability').textContent=d.sold?'Change Auto-sell below to keep future gear.':d.blocked?'Free a bag slot, then walk over this item.':d.usability||'';
  panel.querySelector('[data-loot-bag]').textContent=api.hint('bag')+' · Bag';
 }
 function comparison(d){const o=d.item,old=d.equipped;
  const row=(label,before,after,lower=false)=>{before=Number(before)||0;after=Number(after)||0;const delta=after-before,good=lower?delta<0:delta>0;return '<div class="loot-stat"><span>'+esc(label)+'</span><span>'+before+' → <b class="'+(delta===0?'equal':good?'gain':'loss')+'">'+after+' '+(delta===0?'=':delta>0?'▲':'▼')+'</b></span></div>';};
  let rows='';
  if(d.kind==='weapon')rows=row('Damage',old?.dmg,o.dmg)+row('Delay · lower is faster',old?.cd,o.cd,true);
  else if(d.kind==='armor')rows=row('Defense',old?.defense,o.defense);
  const names={hp:'Max HP',def:'Bonus defense',powerMul:'Damage %',magPowerMul:'Magic damage %',speedMul:'Move speed %',atkSpeedMul:'Attack speed %',crit:'Crit chance %',lifesteal:'Lifesteal %',dodgeMul:'Dodge recovery %',cdr:'Skill recovery %',goldFind:'Gold found %'};
  const totals=it=>{const out={};for(const af of it?.affixes||[])out[af.stat]=(out[af.stat]||0)+(Number(af.val)||0);return out;},before=totals(old),after=totals(o);
  for(const stat of new Set([...Object.keys(before),...Object.keys(after)])){const n=['hp','def'].includes(stat)?1:100;rows+=row(names[stat]||stat,Math.round((before[stat]||0)*n*10)/10,Math.round((after[stat]||0)*n*10)/10);}
  const effects=it=>[...(it?.affixes||[]).map(x=>x.label),it?.el?it.el+' element':'',it?.lifesteal?Math.round(it.lifesteal*100)+'% lifesteal':''].filter(Boolean).join(' · ')||'None';
  rows+='<div class="loot-effects"><span>Found: '+esc(effects(o))+'</span><span>Equipped: '+esc(effects(old))+'</span></div>';
return rows;
 }
 function tick(dt,visible,g){
  if(!panel)return;reset(g);panel.hidden=!visible||!current;
  const note=$('journalNotice'),reading=note&&!note.hidden;
  // On short/phone screens preserve the reading lane; keep collected gear queued.
  if(!visible||reading&&(innerHeight<820||innerWidth<1050)){panel.hidden=true;return;}
  if(!current&&queue.length){current=queue.shift();last=current;left=10;paint(current);}
  if(!current)return;
  panel.hidden=false;
  if(reading){const n=note.getBoundingClientRect(),r=panel.getBoundingClientRect();if(n.bottom+12>r.top&&n.left<r.right&&n.right>r.left){panel.hidden=true;return;}}
  panel.querySelector('[data-loot-bag]').textContent=api.hint('bag')+' · Bag';
  if(!panel.matches(':hover')&&!panel.contains(document.activeElement))left-=dt;
  panel.querySelector('.loot-waiting').textContent=queue.length?'+'+queue.length+' more':'';
  if(left<=0){current=null;panel.hidden=true;}
 }
 let fpsStart=null,fpsFrames=0,fpsLast=null;
 function fps(ts,enabled,visible){const el=$('fpsCounter');if(!el)return;el.hidden=!enabled||!visible;
  if(el.hidden||!Number.isFinite(ts)){fpsStart=null;fpsFrames=0;fpsLast=null;return;}
  if(fpsStart===null||fpsLast!==null&&ts-fpsLast>1000){fpsStart=ts;fpsFrames=0;el.textContent='FPS …';}else fpsFrames++;
  fpsLast=ts;const elapsed=ts-fpsStart;if(elapsed>=500){el.textContent=Math.round(fpsFrames*1000/elapsed)+' FPS';fpsStart=ts;fpsFrames=0;}
 }
 window.BFAdventureHud={mount,show,tick,fps,comparison,remember(data,g){reset(g);last=data;},clear(){queue=[];current=null;left=0;if(panel)panel.hidden=true;}};
})();
