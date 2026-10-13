/* Standalone design review. Never loads the game, reads saves, or writes preferences. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const icon = (name, cls = '') => `<img class="art ${cls}" src="/3d/icons/${name}" alt="" draggable="false">`;
  const descriptions = {
    a: {title:'Classic Compact', description:'The easiest transition from the current HUD. Keeps Bladefall’s gold trim and familiar corner positions.', benefit:'A smaller player panel and paired XP tracks give the world more room. Companion, clue, and loot messages each have a consistent place.', tradeoff:'Your eyes still travel between top-left health, bottom-center skills, and the map in the opposite corner.'},
    b: {title:'Adventure Focus', description:'A lighter, more open layout built around finding your way through the world.', benefit:'The map sits directly above your next objective. Quieter frames and a narrower hotbar leave more space around your character.', tradeoff:'The upper-right navigation column takes more vertical space. Health and cooldowns remain separated.'},
    c: {title:'Combat Focus', description:'Health, mana, cooldowns, and XP become one compact group below your character.', benefit:'You can check your resources and next skill in one glance. The upper-left corner becomes a small identity and party area.', tradeoff:'The lower-center cluster is taller, and health moves away from its familiar corner. It needs extra care around parkour views.'}
  };
  const scenarioNames = {explore:'Exploring',combat:'In combat',clue:'Reading a clue',coop:'Co-op',beginner:'New player'};
  const initial = new URLSearchParams(location.search);
  const state = {
    design:descriptions[initial.get('design')] ? initial.get('design') : 'a',
    scenario:scenarioNames[initial.get('scene')] ? initial.get('scene') : 'explore',
    details:false,current:false,actual:false,screen:'desktop',clueClosed:false
  };
  const cooldowns = new Map();
  let tooltipTimer;
  const skills = [
    {name:'Attack',key:'LMB',art:'hud-basic-attack-warrior.png',rank:0,cd:0.7,description:'Basic attack. The small Auto label keeps the toggle next to its action.'},
    {name:'Cleave',key:'1',art:'skill-cleave.png',rank:2,cd:2,description:'A quick sweep hits nearby enemies.'},
    {name:'Charge',key:'2',art:'skill-charge.png',rank:4,cd:9,description:'Rush through enemies, damaging and stunning them.'},
    {name:'Iron Guard',key:'3',art:'warrior_iron_guard.png',rank:6,cd:13,description:'Briefly reduce incoming damage.'},
    {name:'Execution',key:'4',art:'warrior_execution.png',rank:8,cd:20,description:'A heavy finishing strike. Unlocked at class rank 8.'},
    {name:'Dodge',key:'Shift',art:'hud-dodge.png',rank:0,cd:2,description:'Dodge / dash. Right-click also works with the default bindings.'}
  ];
  const lock = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="8" width="12" height="10" rx="2"/><path d="M7 8V5a3 3 0 0 1 6 0v3M10 11v4"/></svg>';
  const data = () => ({beginner:state.scenario==='beginner',combat:state.scenario==='combat',coop:state.scenario==='coop',clue:state.scenario==='clue'&&!state.clueClosed});

  function vitals(d) {
    const hp = d.beginner ? 110 : d.combat ? 62 : 240, max = d.beginner ? 110 : 240;
    return `<div class="vitals" aria-label="Health ${hp} of ${max}. Mana ${d.combat?44:75} of 75."><div class="vital-row health"><div class="bar"><i style="--fill:${hp/max*100}%"></i></div><div class="vital-words"><span>${d.combat?'HP · LOW':'HP'}</span><span>${hp} / ${max}</span></div></div><div class="vital-row mana"><div class="bar"><i style="--fill:${d.combat?59:100}%"></i></div><div class="vital-words"><span>MANA</span><span>${d.combat?44:75} / 75</span></div></div></div>`;
  }
  function player(d) {
    return `<div class="player-panel hud-panel" data-region="player"><div class="hero-portrait">${icon('skins/skin-knight.png')}<span class="hero-level">Lv ${d.beginner?1:8}</span></div><div class="player-info"><div class="identity"><strong>Rowan</strong><span>Warrior · Rank ${d.beginner?1:7}</span></div>${state.design==='c'?'':vitals(d)}${state.details?`<div class="gear-detail">${icon('items/weapons/sword.png')}<span>${d.beginner?'Rusty':'Iron'} Sword</span><b>·</b><span class="gold">${d.beginner?0:346} gold</span></div>`:''}</div></div>`;
  }
  function allies(d) {
    if(d.beginner) return '';
    return `<div class="allies" data-region="allies">${d.coop?`<div class="ally friend">${icon('class-ranger.png')}<div class="ally-info"><div class="ally-name"><span>◇ Alex · Lv 8</span><small>32 m</small></div><div class="ally-bar"><i style="--fill:86%"></i></div></div></div>`:''}<div class="ally">${icon('pets/pet-shepherd.svg')}<div class="ally-info"><div class="ally-name"><span>Shepherd</span><small>${d.combat?'74':'100'}% HP</small></div><div class="ally-bar"><i style="--fill:${d.combat?74:100}%"></i></div></div></div></div>`;
  }
  function quest(d) {
    return `<div class="quest-panel hud-panel" data-region="quest"><div class="quest-heading">${icon('ui/quest-main.png')}<span class="hud-label">Main objective</span></div><h3 class="quest-title">Escape from Briar</h3><p class="quest-next">${d.combat?'Defeat the Hollow Brute.':d.beginner?'Speak to Thomas by the wagon gate.':'Restore the mill crossing.'}</p>${!d.beginner?`<div class="quest-side">${icon('ui/quest-hunt.png')}<span>Optional · Hollow patrol</span><strong>${d.coop?'8':'6'} / 12</strong></div>`:''}<div class="quest-foot"><span><b>N</b> Journal</span><span>${d.beginner?'One step at a time':'Other tasks in journal'}</span></div></div>`;
  }
  function map(d) {
    return `<div class="map-block" data-region="map"><div class="mini-map" role="img" aria-label="Illustrative local map: gold diamond is the objective, cyan diamond is your teammate."><svg viewBox="0 0 180 180" aria-hidden="true"><defs><radialGradient id="mapShade"><stop stop-color="#536b51"/><stop offset="1" stop-color="#263e37"/></radialGradient></defs><rect width="180" height="180" fill="url(#mapShade)"/><g fill="#6c8162" opacity=".6"><path d="M6 25l27-17 11 15-12 21H10z M16 109l27-10 12 15-6 25-24 3z M127 20l30-9 19 29-22 8z M118 137l24-10 27 25-12 19-32-7z"/></g><path d="M120-5l-11 39 9 31-7 35 8 37-16 55" stroke="#6cbcb7" stroke-width="16" opacity=".75" fill="none"/><path d="M87 183L85 108 89 87 84 58 71 27 79-8M-5 68l45 12 48 7 29-9 70 7" fill="none" stroke="#b1a987" stroke-width="11"/><path d="M87 183L85 108 89 87 84 58 71 27 79-8M-5 68l45 12 48 7 29-9 70 7" fill="none" stroke="#d4c8a2" stroke-width="3" opacity=".7"/><g fill="#b0b9a1" stroke="#20362e" stroke-width="2"><path d="M21 45h29v25H21z M135 50h30v39h-30z M31 149h20v19H31z M111 145h17v23h-17z"/></g><path d="M107 73l18-3 3 14-19 2z" fill="#ba8e65" stroke="#e6be8b" stroke-width="1"/><path d="M90 87l-7 15 7-4 7 4z" class="map-player"/><path d="M114 71l5 7-5 7-5-7z" class="map-objective"/>${d.coop?'<path class="map-friend" d="M152 100l5 6-5 6-5-6z"/>':''}${d.combat?'<circle class="map-foe" cx="88" cy="67" r="3"/><circle class="map-foe" cx="73" cy="71" r="3"/>':''}</svg><span class="map-heading">N</span></div><div class="map-title">BRIAR TOWN · THE MILL</div><div class="map-legend"><span><i>◆</i> Objective</span>${d.coop?'<span><i class="friend-key">◇</i> Alex</span>':''}</div></div>`;
  }
  function hotbar(d) {
    const rank = d.beginner?1:7;
    return `<div class="combat-dock" data-region="dock">${state.design==='c'?vitals(d):''}<div class="skill-list">${skills.map((s,i)=>{const locked=s.rank>rank,remaining=d.combat?(i===2?5:i===3?8:0):0;return `<div class="skill-slot ${locked?'is-locked':''}"><button class="skill-btn ${locked?'locked':''}" data-skill="${i}" aria-label="${s.name}${locked?`: unlocks at rank ${s.rank}`:'. Preview cooldown'}" title="${s.description}" ${locked?'disabled':''}>${locked?`<span class="rank-lock">${lock}Rank ${s.rank}</span>`:icon(s.art)}${!i?'<span class="auto-label">Auto off</span>':''}<kbd>${s.key}</kbd><span class="cooldown" ${remaining?'':'hidden'}>${remaining||''}</span></button><span class="skill-name">${locked?'Not unlocked':s.name}</span></div>`;}).join('')}</div><div class="progress-pair"><div class="progress-item"><div class="progress-title"><strong>Character · Level ${d.beginner?1:8}</strong><span>${d.beginner?'60 / 230':'410 / 640'} XP</span></div><div class="xp-track"><i style="--fill:${d.beginner?26:64}%"></i></div></div><div class="progress-item class-xp"><div class="progress-title"><strong>Warrior · Rank ${rank}</strong><span>${d.beginner?'50 / 150':'210 / 350'} XP</span></div><div class="xp-track"><i style="--fill:${d.beginner?33:60}%"></i></div></div></div></div>`;
  }
  function clue(d) {
    if(state.scenario!=='clue') return '';
    if(!d.clue) return '<button class="journal-return" data-open-clue>New clue saved <b>· Read note</b></button>';
    return `<article class="journal-card" data-region="clue" aria-label="New readable clue"><button class="close-clue" data-close-clue aria-label="Close the clue">×</button><span class="hud-label">New clue · Mill crossing</span><h3>Millkeeper’s note</h3><p>The sluice shuts when the plate is empty. Leave the grain crate on it to keep the water flowing. Then clear the jam at the wheel.</p><div class="clue-footer"><span>Saved in Journal → This level.<br>Stays until you close it.</span><button data-close-clue>Got it</button></div></article>`;
  }
  function notices(d) {
    if(d.combat) return `<div class="notice-feed" data-region="notices"><div class="notice">${icon('coin.png')}<div><strong class="gold">+18 gold · +35 XP</strong><small>Patrol defeated · Added to your totals</small></div></div><div class="notice">${icon('ui/journal-clue.png')}<div><strong>New clue saved</strong><small>Read when ready · N Journal</small></div></div></div>`;
    if(d.coop) return `<div class="notice-feed" data-region="notices"><div class="notice">${icon('ui/quest-hunt.png')}<div><strong class="shared">Alex defeated a patrol</strong><small>Shared progress · 8 / 12</small></div></div><div class="notice">${icon('items/weapons/sword.png')}<div><strong class="positive">Iron Sword → Bag</strong><small>17 / 30 slots · Uncommon</small></div></div></div>`;
    return '';
  }
  function render() {
    cooldowns.clear();clearTimeout(tooltipTimer);
    const d=data(),stage=$('stage');
    stage.dataset.design=state.design;stage.dataset.screen=state.screen;
    stage.className=`stage${d.combat?' low-health is-combat':''}${state.details?' has-details':''}`;
    stage.innerHTML=`<div class="hud-demo-label">${state.design.toUpperCase()} · ${descriptions[state.design].title} · ${scenarioNames[state.scenario]}</div>${player(d)}${allies(d)}<div class="pause-hint"><kbd>Esc</kbd> Menu</div>${quest(d)}${map(d)}${hotbar(d)}${clue(d)}${notices(d)}${d.combat?`<div class="boss-panel hud-panel" data-region="boss"><div class="boss-sub">Boss encounter</div><strong>Hollow Brute</strong><div class="boss-bar"><i></i></div><small>870 / 1,280 HP</small></div><div class="buff-chip" data-region="buff">${icon('warrior_iron_guard.png')}Iron Guard <b>2s</b></div>`:`<div class="world-marker" aria-label="Main objective 12 metres away"><i></i><small>12 m</small></div>${!d.clue?`<div class="interact-prompt" data-region="interaction"><kbd>E</kbd>${d.beginner?'Talk to Thomas':'Inspect mill mechanism'}</div>`:''}`}${d.coop?'<div class="friend-marker" data-region="friend-arrow">◇ Alex →<span>32 m · Hold T to join</span></div>':''}<div class="quick-links" data-region="shortcuts"><span>${icon('action_bag_stash.png')}<kbd>B</kbd> ${d.beginner?'0':'17'}/30</span><button data-open-clue>${icon('ui/journal.png')}<kbd>N</kbd> Journal</button></div><div class="sample-tooltip" id="sampleTooltip" role="status" hidden></div>${state.current?'<img class="current-image" src="current-hud.jpg" alt="Actual current Bladefall HUD at the mill, with a rank one character"><div class="current-label"><strong>Current gameplay HUD</strong><span>Actual starter-character capture.<br>The redesigned layouts use sample values.</span><button data-return-design>Return to design '+state.design.toUpperCase()+'</button></div>':''}`;
    for(const b of document.querySelectorAll('[data-design].design-option'))b.setAttribute('aria-pressed',String(b.dataset.design===state.design));
    for(const b of document.querySelectorAll('button[data-scenario]'))b.setAttribute('aria-pressed',String(b.dataset.scenario===state.scenario));
    const desc=descriptions[state.design];
    $('designLetter').textContent=`Option ${state.design.toUpperCase()}`;$('designTitle').textContent=desc.title;$('designDescription').textContent=desc.description;$('designBenefit').textContent=desc.benefit;$('designTradeoff').textContent=desc.tradeoff;
    $('currentToggle').setAttribute('aria-pressed',String(state.current));$('currentToggle').textContent=state.current?'Return to design':'Compare current HUD';
    $('sceneCaption').textContent=state.current?'Actual current HUD · Starter character at the mill':'Real Briar Town scenery · Illustrative HUD values & minimap';
    $('detailsToggle').checked=state.details;$('detailsToggle').disabled=state.current;
    $('fullscreenDesign').value=state.design;
    // Current screenshot is 1440 × 900. Keep its aspect ratio even if a laptop preview was selected.
    fit();
    const url=new URL(location.href);url.searchParams.set('design',state.design);url.searchParams.set('scene',state.scenario);history.replaceState(null,'',url);
  }
  function fit() {
    const w=state.current||state.screen==='desktop'?1440:1280,h=state.current||state.screen==='desktop'?900:720;
    const scroll=$('stageScroll');
    let scale=state.actual?1:Math.min(1,scroll.clientWidth/w);
    const maxHeight=parseFloat(getComputedStyle(scroll).maxHeight);
    if(!state.actual&&Number.isFinite(maxHeight))scale=Math.min(scale,maxHeight/h);
    if(document.fullscreenElement&&!state.actual)scale=Math.min(scale,scroll.clientHeight/h);
    $('stage').style.width=w+'px';$('stage').style.height=h+'px';$('stage').style.transform=`scale(${scale})`;
    $('stageSizer').style.width=Math.round(w*scale)+'px';$('stageSizer').style.height=Math.round(h*scale)+'px';
    $('fullSize').setAttribute('aria-pressed',String(state.actual));$('fullSize').textContent=state.actual?'Fit to view':'Actual size';
  }
  function report(message) {$('reviewStatus').textContent=message;}
  function sample(message) {
    clearTimeout(tooltipTimer);const el=$('sampleTooltip');el.textContent=message;el.hidden=false;tooltipTimer=setTimeout(()=>{el.hidden=true;},3400);
  }
  document.querySelector('.design-options').addEventListener('click',e=>{const b=e.target.closest('[data-design]');if(!b)return;state.design=b.dataset.design;state.current=false;render();report(`Previewing ${state.design.toUpperCase()}: ${descriptions[state.design].title}. Gameplay is unchanged.`);});
  document.querySelector('.scenarios').addEventListener('click',e=>{const b=e.target.closest('[data-scenario]');if(!b)return;state.scenario=b.dataset.scenario;state.clueClosed=false;state.current=false;render();report(`${scenarioNames[state.scenario]} sample.`);});
  $('stage').addEventListener('click',e=>{
    const close=e.target.closest('[data-close-clue]');if(close){state.clueClosed=true;render();$('stage').querySelector('[data-open-clue]')?.focus({preventScroll:true});return;}
    if(e.target.closest('[data-open-clue]')){state.scenario='clue';state.clueClosed=false;state.current=false;render();$('stage').querySelector('[data-close-clue]')?.focus({preventScroll:true});return;}
    if(e.target.closest('[data-return-design]')){state.current=false;render();$('currentToggle').focus({preventScroll:true});return;}
    const skill=e.target.closest('[data-skill]');if(skill&&!skill.disabled){const i=Number(skill.dataset.skill),s=skills[i];if(cooldowns.has(i))return;cooldowns.set(i,performance.now()+s.cd*1000);sample(`${s.name} · ${s.description} (Preview only)`);updateCooldowns();}
  });
  function updateCooldowns(){for(const [i,end]of cooldowns){const el=$('stage').querySelector(`[data-skill="${i}"] .cooldown`);if(!el){cooldowns.delete(i);continue;}const seconds=(end-performance.now())/1000;el.hidden=seconds<=0;el.textContent=seconds<1?Math.max(0,seconds).toFixed(1):Math.ceil(seconds);if(seconds<=0)cooldowns.delete(i);}}
  setInterval(updateCooldowns,100);
  $('screen').addEventListener('change',()=>{state.screen=$('screen').value;render();});
  $('fullscreenDesign').addEventListener('change',()=>{state.design=$('fullscreenDesign').value;state.current=false;render();});
  $('fullSize').addEventListener('click',()=>{state.actual=!state.actual;fit();report(state.actual?'Full pixel size. Scroll or swipe around the preview.':'Preview fitted to the available width.');});
  $('currentToggle').addEventListener('click',()=>{state.current=!state.current;render();});
  $('detailsToggle').addEventListener('change',()=>{state.details=$('detailsToggle').checked;render();});
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('viewer').requestFullscreen)await $('viewer').requestFullscreen();else{state.actual=true;fit();$('viewer').scrollIntoView({block:'start'});report('Fullscreen is unavailable in this browser. Showing the full-size preview; swipe to explore.');}}catch{report('This browser did not open fullscreen. Use Actual size to inspect the preview.');}});
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').innerHTML=document.fullscreenElement?'⛶ <span>Exit fullscreen</span>':'⛶ <span>Fullscreen</span>';requestAnimationFrame(fit);});
  new ResizeObserver(fit).observe($('stageScroll'));
  render();
})();
