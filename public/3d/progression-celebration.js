/* Presentation only. The game owns awards, choices, protection and persistence. */
(function(root){'use strict';
const themes={warrior:['#f3bb64','steel'],ranger:['#9ee582','leaf'],mage:['#9cbcff','arcane'],pyromancer:['#ff9b58','flame'],reaper:['#c69bff','spectral'],paladin:['#ffe7a1','radiant'],necromancer:['#9de0ac','bone'],ninja:['#ff899a','blade'],berserker:['#ffac7c','steel'],pirate:['#72d8ce','steel'],chronomancer:['#8be7e7','time'],monk:['#edb7ff','spirit'],stormcaller:['#b5abff','storm'],warlock:['#db8bad','arcane'],skylancer:['#9bdfff','feather'],bladedancer:['#8fe8d5','blade'],beastmaster:['#d8c38d','leaf']};
const theme=cid=>({color:(themes[cid]||themes.mage)[0],family:(themes[cid]||themes.mage)[1]});
function createClock(now=()=>performance.now()){
 let pending=null;
 return {get active(){return !!pending;},begin(valid,done,cancel,duration=900,ready){if(pending)return false;pending={valid,done,cancel,duration,ready,elapsed:0,last:now()};return true;},
 tick(hidden=false){const p=pending;if(!p)return;if(!p.valid()){pending=null;p.cancel?.();return;}const t=now(),delta=Math.max(0,Math.min(100,t-p.last));p.last=t;if(hidden)return;p.elapsed+=delta;if(p.elapsed>=p.duration&&(p.ready?.()!==false||p.elapsed>=p.duration+800)){pending=null;p.done();}},
 clear(){const p=pending;pending=null;p?.cancel?.();}};
}
let host=null,events={},clock=createClock(),lastWorld=null,choice=null,learnQueue=[],barState=new WeakMap(),slotLights=[],soundQueue=new Map(),handoff=null,transfers=new Set();
const now=()=>performance.now();
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function variable(n,key,value){n.style.setProperty?.(key,value);}
function reduced(){return !!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||!!document.body.classList.contains?.('progress-reduced');}
function crest(kind,cid){const n=el('span','progress-crest');for(let i=0;i<2;i++)n.append(el('i','crest-orbit'));if(kind==='player')n.append(el('b','progress-level-symbol','↑'));else if(themes[cid]){const img=el('img');img.src='icons/class-'+cid+'.png';img.alt='';img.setAttribute('aria-hidden','true');n.append(img);}else n.append(el('b',null,'✦'));return n;}
function ensure(){if(host)return;host=el('div');host.id='progressCelebrations';host.setAttribute('aria-live','polite');host.setAttribute('aria-atomic','false');document.body.append(host);}
function removeEvent(kind){const e=events[kind];if(!e)return;e.card.remove();e.flare.remove();delete events[kind];}
function milestone(info){const v=Number(info.value)||0,p=Number.isFinite(info.previous)?info.previous:v-1;return p<10&&v>=10?2:p<5&&v>=5?1:0;}
function outfit(cid,tier){return root.BFClassLooks?.catalog?.[cid]?.[tier]||null;}
function modelCard(container,cid,tier){const look=outfit(cid,tier);if(!look)return;container.classList.add('progress-has-look');const box=el('div','progress-look');box.dataset.class=cid;box.dataset.tier=tier;const stage=el('div','progress-look-model');stage.setAttribute('role','img');stage.setAttribute('aria-label',look.name+' unlocked outfit');stage.append(el('span','progress-model-loading','✦'));box.append(stage,el('small',null,'NEW CLASS LOOK'),el('strong',null,look.name),el('span','progress-look-help','Equip at the Stylist · cosmetic only'));container.append(box);root.BFProgressModels?.snapshot(stage,cid,tier);}
function notify(kind,world,info={}){
 if(!world?.p)return;ensure();removeEvent(kind);const t=theme(info.cid),card=el('section','progress-celebration '+kind),copy=el('div','progress-copy');card.setAttribute('role','status');card.dataset.family=t.family;variable(card,'--progress',kind==='player'?'#ffd17f':t.color);
 const label=el('small','progress-label',kind==='class'?(info.value>=10?'CLASS MASTERED':'CLASS RANK UP'):kind==='learned'?(info.kind==='passive'?'PASSIVE LEARNED':'SKILL LEARNED'):'PLAYER LEVEL UP');
 const title=el('strong','progress-title',kind==='class'?(info.name||'Class')+' · Rank '+info.value:kind==='learned'?info.name:'Level '+info.value);
 if(kind==='player'&&Number.isFinite(info.previous)&&info.previous<info.value){title.textContent='';title.append(el('span','progress-old-level',info.previous),el('span','progress-level-arrow','→'),el('span','progress-new-level',info.value));title.setAttribute('aria-label','Level '+info.previous+' to '+info.value);}
 const detail=el('p','progress-detail',info.detail||''),secondary=el('p','progress-secondary');copy.append(label,title,detail,secondary);card.append(crest(kind,info.cid),copy,el('span','progress-card-shine'));host.append(card);
 const flare=el('div','progress-flare '+kind);flare.setAttribute('aria-hidden','true');flare.dataset.family=t.family;variable(flare,'--progress',kind==='player'?'#ffd17f':t.color);for(let i=0;i<3;i++)flare.append(el('i','progress-world-ring'));for(let i=0;i<10;i++){const s=el('b','progress-spark');variable(s,'--i',i);flare.append(s);}host.append(flare);
 const tier=kind==='class'?milestone(info):0;if(tier)modelCard(card,info.cid,tier);
 events[kind]={world,player:world.p,card,flare,copy,title,detail,secondary,info,tier,elapsed:0,last:now()};lastWorld=world;
 const p=events.player,c=events.class;if(p&&c&&p.world===c.world&&Math.abs(p.last-c.last)<1200){c.card.classList.add('combined');c.secondary.textContent='Character Level '+p.info.value+' · '+(p.info.detail||'');p.card.hidden=true;c.companion=p;}
}
function beforeChoice(valid,done,cancel,info={}){
 if(clock.active)return false;const e=events.class;if(e){e.elapsed=0;e.last=now();e.card.classList.add('opening');e.detail.textContent=info.detail||'';e.copy.append(el('small','progress-next','Choose your upgrade next'));}
 const remove=()=>{if(events.class===e){handoff=e?{world:e.world,player:e.player,info:e.info,tier:e.tier,companion:e.companion?.info,from:e.card.querySelector('.progress-crest')?.getBoundingClientRect?.()}:null;if(e?.companion)removeEvent('player');removeEvent('class');}};
 return clock.begin(valid,()=>{remove();done();},()=>{remove();handoff=null;cancel?.();},900,info.ready);
}
function awardSound(kind,world,play){if(typeof play==='function')soundQueue.set(kind,{world,player:world?.p,play,at:now()});}
function paintBar(node,ratio,value,world,kind,reduce=false){if(!node)return;ratio=Math.max(0,Math.min(100,ratio));const old=barState.get(node),previousWidth=node.style.width;barState.set(node,{value,world});const target=ratio+'%';node.style.width=target;
 if(!reduce&&!reduced()&&old?.world===world&&value>old.value&&events[kind]?.world===world&&node.animate){node.getAnimations?.().forEach(a=>a.cancel());node.animate([{width:previousWidth||'0%'},{width:'100%',offset:.32},{width:'0%',offset:.34},{width:target}],{duration:850,easing:'cubic-bezier(.2,.7,.3,1)'});node.parentElement?.classList.add('progress-bar-awarded');slotLights.push({node:node.parentElement,cls:'progress-bar-awarded',until:now()+1600});}}
function statPoints(container,count,open){if(!container)return;let button=container.querySelector?.('.progress-stat-points');if(!count){button?.remove();return;}if(!button){button=el('button','progress-stat-points');button.type='button';container.append(button);}button.textContent='+'+count+' point'+(count===1?'':'s');button.setAttribute('aria-label','Spend '+count+' available character stat points');button.onclick=open;}
function previewKind(option){const s=(option.n+' '+option.d).toLowerCase();if(/summon|skeletons|army|raise the dead/.test(s))return 'summon';if(/teleport|blink|dash|rush through|drive forward|roll|tumble|step behind/.test(s))return 'dash';if(/shield|reducing incoming|reduce incoming|brace|reflect|block/.test(s))return 'shield';if(/heal|restore|drain|siphon/.test(s))return 'heal';if(/pull|draw nearby/.test(s))return 'pull';if(/beam|lance|pierc/.test(s))return 'beam';if(/fan|volley|barrage|three flames/.test(s))return 'fan';if(/bolt|shot|arrow|shuriken|star/.test(s))return 'bolt';if(/nearby|circle|circular|around|nova|ring|stomp|storm/.test(s))return 'area';return 'aura';}
const illustrationImages=new Map();
function illustrationImage(path){if(!illustrationImages.has(path)){const img=new Image();img.src=path;illustrationImages.set(path,img);}return illustrationImages.get(path);}
function drawIllustration(canvas,option,ms,color,still){const ctx=canvas.getContext?.('2d');if(!ctx)return;const w=240,h=90,t=still?.5:(ms%2200)/2200,k=previewKind(option);ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineWidth=2;ctx.strokeStyle='#82939e55';ctx.beginPath();ctx.ellipse(120,65,98,19,0,0,Math.PI*2);ctx.stroke();
 const dot=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};const line=(x,y,u,v,c,width=2)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.stroke();};
 const actor=illustrationImage('icons/class-'+(themes[canvas.dataset.cid]?canvas.dataset.cid:'mage')+'.png'),target=illustrationImage('art-previews/enemies/grunt.png');const ax=k==='dash'?45+t*125:45;dot(ax+10,49,23,'#101c2c');dot(183,49,23,'#101c2c');if(actor.complete&&actor.naturalWidth)ctx.drawImage(actor,ax-9,29,38,38);if(target.complete&&target.naturalWidth)ctx.drawImage(target,164,26,38,47);ctx.shadowColor=color;ctx.shadowBlur=10;
 if(['bolt','beam','fan'].includes(k)){const x=65+t*115;for(const dy of k==='fan'?[-16,0,16]:[0]){line(k==='beam'?65:x-18,48,x,48+dy*t,color,k==='beam'?4:2);dot(x,48+dy*t,3,color);}}
 else if(k==='dash'){for(let j=0;j<3;j++)line(45+t*100-j*12,55,35+t*100-j*12,55,color,2);}
 else if(k==='shield'){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(55,49,22+Math.sin(t*6.28)*2,-1.8,1.8);ctx.stroke();}
 else if(k==='summon'){for(const x of [95,130,165]){dot(x,49-(still?0:Math.sin(t*3.14)*7),5,color);line(x,55,x,65,color,2);}}
 else if(k==='heal'){for(let j=0;j<3;j++){const x=45+j*12,y=62-t*35;line(x-3,y,x+3,y,color);line(x,y-3,x,y+3,color);}}
 else{ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();const radius=k==='pull'?40*(1-t)+8:10+t*42;ctx.ellipse(k==='area'?120:55,58,radius,radius*.4,0,0,6.28);ctx.stroke();for(let j=0;j<5;j++){const a=j*1.256+t;dot((k==='area'?120:55)+Math.cos(a)*radius,58+Math.sin(a)*radius*.4,2,color);}}
 ctx.shadowBlur=0;}
function transferEmblem(target,from,cid){if(!target||!from?.width||reduced())return;const to=target.getBoundingClientRect(),copy=target.cloneNode(true);copy.classList.add('progress-emblem-transfer');variable(copy,'--progress',theme(cid).color);document.body.append(copy);target.style.opacity='0';const clean=()=>{target.style.opacity='';copy.remove();transfers.delete(clean);};transfers.add(clean);const animation=copy.animate?.([{left:(from.left+from.width/2)+'px',top:(from.top+from.height/2)+'px',transform:'translate(-50%,-50%) scale('+from.width/76+')',opacity:1},{left:(to.left+to.width/2)+'px',top:(to.top+to.height/2)+'px',transform:'translate(-50%,-50%) scale('+to.width/76+')',opacity:1}],{duration:320,easing:'cubic-bezier(.25,.8,.25,1)'});if(animation){animation.onfinish=clean;animation.oncancel=clean;}else clean();}
function enhanceChoice(container,info={}){if(!container)return;const cid=info.cid,t=theme(cid);variable(container,'--pick',t.color);container.classList.add('premium-choice');container.dataset.family=t.family;const head=container.querySelector('.pickhead');if(head&&!head.querySelector('.progress-choice-emblem')){const c=crest('class',cid);c.classList.add('progress-choice-emblem');head.prepend(c);}
 const latest=events.class?.world===info.world&&events.class?.info?.cid===cid?events.class:null,carry=handoff?.world===info.world&&handoff?.info?.cid===cid?handoff:latest;
 if(carry?.from&&head)transferEmblem(head.querySelector('.progress-choice-emblem'),carry.from,cid);
 const playerInfo=carry?.companion?.info||carry?.companion||(events.player?.world===info.world?events.player.info:null);
 if(playerInfo&&head)head.append(el('p','progress-combined-note','Also reached Character Level '+playerInfo.value+' · '+playerInfo.detail));
 const tier=carry?.tier||(info.rank===5?1:info.rank===10?2:0);if(tier&&head)modelCard(head,cid,tier);
 // Catch-up/new awards during a live heads-up belong to this menu, not a stale toast afterward.
 if(latest)removeEvent('class');if(playerInfo)removeEvent('player');
 const entries=[];for(const [i,b]of [...container.querySelectorAll('.c2opt')].entries()){b.setAttribute('aria-pressed','false');b.dataset.option=i;b.addEventListener?.('focus',()=>{if(choice?.container===container)focusChoice(i,false);});const o=info.options?.[i];if(info.isSkill&&o){const wrap=el('span','progress-illustration'),canvas=el('canvas');canvas.width=240;canvas.height=90;canvas.dataset.cid=cid;canvas.setAttribute('aria-label','Illustration for '+o.n+'; full effect described below');wrap.append(canvas,el('small',null,'EFFECT ILLUSTRATION'));b.append(wrap);entries.push({canvas,option:o});}}
 choice={container,info,entries,started:now(),focus:0,lastDraw:-Infinity};focusChoice(0,false);handoff=null;
}
function focusChoice(index,moveFocus=true){if(!choice?.container?.isConnected)return;const buttons=[...choice.container.querySelectorAll('.c2opt')];if(!buttons.length)return;choice.focus=(index+buttons.length)%buttons.length;buttons.forEach((b,i)=>b.classList.toggle('progress-focused',i===choice.focus));if(moveFocus)buttons[choice.focus]?.focus({preventScroll:true});}
function choiceKey(e,action){if(!choice?.container?.isConnected||choice.container.getClientRects&&choice.container.getClientRects().length===0||e.ctrlKey||e.metaKey||e.altKey)return false;const tag=e.target?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return false;const review=choice.container.querySelector('#choiceReview');if(review&&!review.hidden)return false;
 if(['ArrowDown','ArrowRight','KeyS','KeyD'].includes(e.code)){if(!e.repeat)focusChoice(choice.focus+1);return true;}if(['ArrowUp','ArrowLeft','KeyW','KeyA'].includes(e.code)){if(!e.repeat)focusChoice(choice.focus-1);return true;}
 if(action==='interact'||e.code==='Enter'){if(!e.repeat)choice.container.querySelectorAll('.c2opt')[choice.focus]?.click();return true;}return false;}
function selected(container,id){container?.querySelectorAll('.c2opt').forEach(b=>{const on=b.dataset.pick===id;b.classList.toggle('is-selected',on);if(on&&choice?.container===container)choice.focus=+b.dataset.option||0;});if(choice?.container===container)focusChoice(choice.focus,false);}
function learned(world,info){if(!world?.p)return;learnQueue.push({world,player:world.p,info});if(learnQueue.length>8)learnQueue.shift();}
function flight(info){const target=Number.isInteger(info.slot)?document.getElementById('bSk'+info.slot):document.getElementById('clsfill')?.parentElement;const rect=target?.getBoundingClientRect?.();if(!rect?.width)return;
 target.classList.add('progress-slot-ready');slotLights.push({node:target,cls:'progress-slot-ready',until:now()+2000});if(reduced())return;
 const n=el('span','progress-flight');variable(n,'--progress',theme(info.cid).color);if(info.art)n.innerHTML=info.art;else n.textContent='✦';host.append(n);const start=info.from||{x:root.innerWidth*.5,y:root.innerHeight*.42};const anim=n.animate?.([{left:start.x+'px',top:start.y+'px',opacity:1,transform:'translate(-50%,-50%) scale(1.3)'},{left:(rect.left+rect.width/2)+'px',top:(rect.top+rect.height/2)+'px',opacity:0,transform:'translate(-50%,-50%) scale(.55)'}],{duration:650,easing:'cubic-bezier(.35,0,.2,1)'});if(anim)anim.onfinish=()=>n.remove();else n.remove();}
function clear(){clock.clear();for(const clean of transfers)clean();transfers.clear();host?.querySelectorAll?.('.progress-flight')?.forEach(n=>{n.getAnimations?.().forEach(a=>a.cancel());n.remove();});for(const k of Object.keys(events))removeEvent(k);learnQueue=[];soundQueue.clear();handoff=null;choice=null;slotLights.forEach(s=>s.node?.classList.remove(s.cls));slotLights=[];lastWorld=null;}
function tick(world,mode,project,opts={}){
 document.body.classList.toggle('progress-reduced',!!opts.reduceMotion);const hidden=!!opts.hidden||!!root.BF_LOADING?.active;
 const previousChoice=choice;clock.tick(hidden||mode!=='play');if(choice&&choice!==previousChoice)mode='upgrade';const alive=!!world?.p&&!world.p.dead&&!world.p.downed&&world.p.hp>0;
 if(lastWorld&&lastWorld!==world||!alive||mode==='title'||mode==='dead'){clear();return;}
 const time=now();for(const [k,s]of soundQueue)if(s.world!==world||s.player!==world.p||opts.hidden)soundQueue.delete(k);
 if(mode==='play'&&!hidden&&soundQueue.size&&[...soundQueue.values()].every(s=>time-s.at>=40)){const s=soundQueue.get('class')||soundQueue.get('player');soundQueue.clear();try{s?.play();}catch(_){}}
 learnQueue=learnQueue.filter(e=>e.world===world&&e.player===world.p&&(!e.info.cid||e.info.cid===root.__BF3?.meta?.classId||!root.__BF3));
 if(mode==='play'&&!hidden&&learnQueue.length){const list=learnQueue.splice(0),i=list[list.length-1].info;notify('learned',world,{...i,detail:list.length>1?list.length+' upgrades learned':i.kind==='passive'?'Active automatically':('Use '+(i.key||('Skill '+((i.slot||0)+1)))+' · ready on your skill bar')});flight(i);}
 if(choice&&(!choice.container.isConnected||mode!=='upgrade'))choice=null;if(choice&&!hidden&&time-choice.lastDraw>50){choice.lastDraw=time;for(const x of choice.entries)drawIllustration(x.canvas,x.option,time-choice.started,theme(choice.info.cid).color,opts.reduceMotion||reduced());}
 slotLights=slotLights.filter(s=>{if(time<s.until)return true;s.node?.classList.remove(s.cls);return false;});
 for(const [kind,e]of Object.entries(events)){
  if(e.world!==world||e.player!==world.p){removeEvent(kind);continue;}const delta=Math.max(0,Math.min(100,time-e.last));e.last=time;if(!hidden&&mode==='play')e.elapsed+=delta;
  const visible=mode==='play'&&!hidden;e.card.hidden=!visible||(kind==='player'&&!!events.class?.companion);e.flare.hidden=!visible||opts.particles===false||kind==='learned'||kind==='player'&&!!events.class?.companion;
  e.card.classList.toggle('reduced',!!opts.reduceMotion);e.flare.classList.toggle('reduced',!!opts.reduceMotion);
  const p=world.p,at=project?.(p.x,(p.y||0)+8,p.z);if(!at)e.flare.hidden=true;else{e.flare.style.left=at[0]+'px';e.flare.style.top=at[1]+'px';const edge=project?.(p.x+65,(p.y||0)+8,p.z);if(edge){const size=Math.max(85,Math.min(260,Math.hypot(edge[0]-at[0],edge[1]-at[1])*2.4));e.flare.style.width=size+'px';e.flare.style.height=size*.75+'px';}}
  if(e.elapsed>(e.tier?4400:kind==='player'?3000:kind==='learned'?2400:3200)&&!clock.active)removeEvent(kind);
 }
}
const api={createClock,theme,notify,beforeChoice,awardSound,paintBar,statPoints,previewKind,drawIllustration,enhanceChoice,choiceKey,selected,learned,clear,tick,get active(){return clock.active;}};root.BFProgressCelebration=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
