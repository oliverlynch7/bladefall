/* Isolated two-part Briar remake. All progression belongs to this disposable lab. */
window.BFBriarBeta=(()=>{'use strict';
 let A,serial=0,part=0,progress,config={cid:'warrior',level:3,rank:2,rarity:'common',path:'a',strength:1,god:false,camera:'shoulder'};
 const G=()=>A.g(),S=()=>G()?.devBriar,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const fresh=()=>({medicine:false,healing:false,bridge:false,evacuated:false,signal:false,captive:false,dogs:false,hunt:false,huntKills:0,huntPaid:false,boss:false,shards:[],dead:[],deaths:0,falls:0,part:0,smallHeals:2,started:Date.now()});
 const near=(o,r=100)=>dist(G().p,o)<r&&Math.abs(G().p.y-(o.y||0))<65;
 function resume(){A.play();A.refresh();hud();}
 function panel(title,text,buttons){A.menu(`<div class="card narrow keep-menu"><p class="ovkicker">BRIAR TOWN · BETA</p><h2>${title}</h2><p class="ovsub">${text}</p>${buttons.map((b,i)=>`<button class="bigbtn ${i?'ghost':''}" id="bb${i}">${b[0]}</button>`).join('')}</div>`);buttons.forEach((b,i)=>document.getElementById('bb'+i).onclick=b[1]);}
 function setup(){if(!window.BF_KEEP_ISOLATED||new URLSearchParams(location.search).get('devbriar')!=='1'){location.assign('/3d/?devbriar=1');return;}
 A.menu(`<div class="card keep-menu"><p class="ovkicker">ISOLATED SOLO REMAKE · TWO CHAPTERS</p><h2>Briar Town · Hold on to home</h2><p class="ovsub">Climb the rooftops. Restore the crossing. Lead the fight into the Black Woods.</p><div class="keep-fields"><label>Class<select id="bc">${Object.entries(A.classes).map(([k,v])=>`<option value="${k}" ${config.cid===k?'selected':''}>${v.disp}</option>`).join('')}</select></label><label>Player level<input id="bl" type="number" min="1" max="50" value="${config.level}"></label><label>Class rank<input id="br" type="number" min="1" max="10" value="${config.rank}"></label><label>Gear<select id="bg">${['common','uncommon','rare','epic','legendary'].map(k=>`<option ${config.rarity===k?'selected':''}>${k}</option>`).join('')}</select></label><label>Skill branch<select id="bp"><option value="a">First choices</option><option value="b" ${config.path==='b'?'selected':''}>Second choices</option></select></label><label>Enemy strength<select id="be"><option value="0.65" ${config.strength===.65?'selected':''}>Relaxed</option><option value="1" ${config.strength===1?'selected':''}>Standard</option><option value="1.5" ${config.strength===1.5?'selected':''}>Hard</option></select></label><label>Camera<select id="bv">${[['shoulder','Over the shoulder'],['far','Overhead'],['fps','First person']].map(([k,n])=>`<option value="${k}" ${config.camera===k?'selected':''}>${n}</option>`).join('')}</select></label></div><label class="keep-check"><input id="bi" type="checkbox" ${config.god?'checked':''}> Invulnerable exploration</label><p class="hint">No real saves or unlocks are read or changed. Rank/XP stays fixed for encounter comparison. Death retries this chapter with completed tasks retained. This beta is solo; reload resets it.</p><button class="bigbtn" id="bstart">Start Homefields beta</button><button class="bigbtn ghost" id="bexit">Back to title</button></div>`);
 document.getElementById('bstart').onclick=()=>{config={cid:document.getElementById('bc').value,level:clamp(+document.getElementById('bl').value||1,1,50)|0,rank:clamp(+document.getElementById('br').value||1,1,10)|0,rarity:document.getElementById('bg').value,path:document.getElementById('bp').value,strength:+document.getElementById('be').value,camera:document.getElementById('bv').value,god:document.getElementById('bi').checked};start();};document.getElementById('bexit').onclick=exit;
 }
 function exit(){location.assign('/3d/');}
 function start(){progress=fresh();part=0;build();}
 function pause(){panel('Beta controls','Your campaign is untouched. Completed tasks survive a chapter retry; a new loadout starts over.',[['Continue',resume],['Test torn transport map',()=>BFInspection.open('map')],['Inspect painting clue',()=>BFInspection.open('painting')],['Route map',map],['Current clues',journal],['Retry this chapter',()=>build()],['Change loadout / restart',setup],['Back to title',exit]]);}
 function journal(){panel('Current clues',part?'The Legion signal is above the timber scaffold. Cut its cable to protect the refuge. West: captive pen and logging patrol. East: two dogs. The transport order is beyond the warbeast.':'The medical satchel is in the granary loft. The loading scaffold leads up to the loft. At the mill, weight on the broad plate diverts the water. Leave the grain crate there while you climb to the jammed timber.',[['Back to the adventure',resume],['Route map',map]]);}
 function map(){panel(part?'Black Woods routes':'Homefields routes',part?'Refuge → broken timber walk → signal scaffold → warbeast clearing. West: captive pen and logging patrol. East: dog pen and high shard route. An old watch stands off the northern trail. Five shards across both chapters.':'Home lane → Mara → granary roof supplies → mill sluice and scaffold → far-bank guards → woods. The river divides the village from the escape gate. Gold edges mark climbable timber.',[['Continue',resume],['Open overhead plan',()=>window.open('/design/briar-beta/','_blank','noopener')],['Test controls',pause]]);}
 function build(){
 const g=A.create(config);g.zone=0;g.area=part;g.stageIndex=part;g.areaName=part?'Briar Beta · Black Woods':'Briar Beta · Homefields';
 const s=g.devBriar=g.devKeep={id:++serial,part,actors:[],houses:[],trees:[],rocks:[],paths:[],props:[],plats:[],solids:[],groups:[],shards:[],plate:0,water:1,bridgeT:progress.bridge?1:0,drag:false,safe:part?{x:0,z:420,y:0}:{x:0,z:480,y:0},elapsed:0,huntClock:0,events:[],healingT:0};
 s.terrain=BFBriarTerrain.make(part);
 const floor=(x,z,w,d)=>g.segments.push({x,z,w,d});
 const plat=(id,x,z,h,w,d,kind='wood')=>{const o={id,kind:'plat',x,z,h,w,d,slab:22,color:kind==='stone'?'#8d9785':'#a88b58',briarKind:kind};g.obstacles.push(o);s.plats.push(o);return o;};
 const solid=(x,z,w,d,h=140,y0=0,kind='stone')=>{const o={x,z,w,d,h:h+y0,y0,kind:'wall',color:kind==='wood'?'#68503a':'#6b7769',briarKind:kind};g.walls.push(o);s.solids.push(o);return o;};
 const house=(x,z,w,d,h,roof)=>{s.houses.push({x,z,w,d,h,roof});solid(x,z,w,d,h,0,'house');};
 const tree=(x,z,h=200,r=25)=>{s.trees.push({x,z,h,r});solid(x,z,r*2,r*2,h*.8,0,'tree');};
 const path=(x,z,w,d)=>s.paths.push({x,z,w,d});
 const actor=(id,name,x,z)=>s.actors.push({id,name,x,z,y:0,walking:false});
 const shard=(id,x,z,y)=>s.shards.push({id,x,z,y});
 const group=(id,x,z,foes,r=420)=>s.groups.push({id,x,z,foes,r,spawned:false});
 if(!part){
  floor(0,0,1900,1500);floor(0,-1450,1900,900); // real river gap, no hidden ground under the water
  path(0,180,190,1100);path(-330,-120,650,150);path(370,-130,600,150);path(0,-1440,210,850);
  house(-600,390,280,240,145,'red');house(470,390,260,240,145,'ochre');house(710,-230,310,300,235,'green');house(-790,-515,250,300,210,'red');
  g.obstacles.push({kind:'col',x:-470,z:-240,w:55,d:40,h:27,invisible:true});
  actor('thomas','Thomas',60,400);actor('mara','Mara',-360,220);actor('gus','Gus',-500,-270);
  s.props.push({kind:'medical',x:-400,z:120},{kind:'cart',x:160,z:390},{kind:'well',x:210,z:80},{kind:'mill',x:-575,z:-710});
  // Usable roof route: broad teaching landings, then a turning loft approach.
  plat('roof0',340,-80,42,115,115);plat('roof1',465,-180,92,100,110);plat('roof2',435,-340,145,105,115);plat('roof3',575,-445,195,110,110);plat('loft',720,-490,235,210,120);
  s.med={x:730,z:-500,y:235};
  plat('ridge0',895,-545,285,80,90);plat('ridge1',985,-700,325,80,90);plat('ridge2',860,-850,350,95,100);shard('home-roof',860,-850,350);
  // Sluice courtyard: body weight demonstrates the rule; a movable grain crate holds it.
  s.plateAt={x:-475,z:-490,y:0};s.crate={x:-260,z:-445,y:0,w:64,d:64};
  s.crateSolid=solid(s.crate.x,s.crate.z,64,64,65,0,'crate');
  plat('mill0',-360,-635,50,110,110);plat('mill1',-490,-710,105,100,100);plat('mill2',-620,-820,150,100,110);plat('mill3',-485,-935,190,110,100);plat('catch',-320,-950,205,140,125);
  s.jam={x:-320,z:-960,y:205};
  s.bridge={x:0,z:-875,h:0,w:250,d:250,px:0,py:0};if(progress.bridge)g.movers.push(s.bridge);
  // Riverbank discovery becomes reachable through the lowered bridge, not a second code puzzle.
  plat('bank0',300,-1070,45,115,115,'stone');plat('bank1',450,-1170,95,100,100,'stone');shard('home-bank',450,-1170,95);
  for(const x of [-865,-680,-495])for(const z of [-1480,-1690])tree(x,z,165,20);
  for(const [x,z]of [[-900,670],[870,660],[-915,-80],[890,-1280],[820,-1690]])tree(x,z,240,25);
  for(const [x,z]of [[240,-1320],[-230,-1510]]){solid(x,z,90,120,55);s.props.push({kind:'bales',x,z});}
  group('raiders',290,-210,[['prison_pike',220,-280],['prison_hound',120,-400]],310);
  group('bank',0,-1390,[['prison_guard',-90,-1280],['prison_pike',150,-1470],['prison_hound',-100,-1620]],410);
  g.bounds={minX:-980,maxX:1080,minZ:-1900,maxZ:750};s.exit={x:0,z:-1770,y:0};
 }else{
  floor(0,125,1500,1250);floor(0,-1270,1900,950);floor(0,-2370,1900,1100);
  // Stream at -500..-795: broken logging walk is the required main crossing.
  path(0,130,180,1150);path(0,-1260,180,920);path(0,-2350,200,1000);path(-410,-1080,820,130);path(410,-1370,820,130);
  actor('lewis','Lewis',-120,390);actor('beth','Beth',-740,-990);actor('bethBrother','Beth’s brother',-790,-1060);
  s.props.push({kind:'camp',x:-230,z:440},{kind:'pen',x:-760,z:-1030},{kind:'dogs',x:690,z:-1450},{kind:'signal',x:0,z:-1850});
  plat('stream0',0,-440,38,120,115);plat('stream1',130,-565,80,105,110);plat('stream2',15,-715,105,115,105);plat('stream3',-80,-865,55,130,120);
  // Real lower catch ledges recover toward the refuge without masking the jumping route.
  plat('catch-low',220,-650,-65,240,360,'stone');plat('recover0',320,-420,-20,150,140,'stone');
  plat('tower0',0,-1500,45,110,115);plat('tower1',150,-1580,100,100,110);plat('tower2',250,-1730,150,105,110);plat('tower3',115,-1860,205,115,110);plat('tower-top',-40,-1900,255,150,160);s.signal={x:-40,z:-1920,y:255};
  plat('canopy0',440,-1680,195,85,95);plat('canopy1',605,-1750,245,85,85);plat('canopy2',700,-1900,300,100,100);shard('woods-canopy',700,-1900,300);
  plat('pen-roof0',-500,-950,55,100,100);plat('pen-roof1',-630,-820,110,95,95);plat('pen-roof2',-780,-730,160,100,110);shard('woods-pen',-780,-730,160);
  // The north watch is a deliberate side route: guards below, then rising and
  // turning jumps to a visible shard. It does not duplicate the mill's plate.
  plat('watch0',390,-3260,48,125,115,'stone');plat('watch1',505,-3350,92,92,90);plat('watch2',635,-3430,138,82,88);
  plat('watch3',705,-3565,180,88,84);plat('watch4',590,-3665,218,82,82);plat('watch-top',730,-3740,255,120,115);
  shard('woods-lookout',730,-3740,255);
  for(const [x,z,h]of [[-640,500,220],[640,520,230],[-610,50,290],[620,-180,260],[-680,-430,250],[790,-850,290],[-910,-1280,260],[900,-1690,260],[-910,-1980,280],[850,-2170,290],[-910,-2630,250],[770,-2850,230]])tree(x,z,h,28);
  for(const [x,z]of [[-300,-2400],[350,-2590]]){solid(x,z,110,130,90);s.props.push({kind:'stone',x,z});}
  s.heal={x:260,z:-1100,y:0};s.exit={x:0,z:-2820,y:0};
  group('crossing',0,-1010,[['prison_pike',130,-1020],['prison_hound',-70,-1190]],320);
  group('pen',-650,-1040,[['prison_guard',-640,-1020]],300);
  group('dogs',650,-1450,[['prison_hound',550,-1410],['prison_pike',770,-1310]],320);
  group('signal',0,-1660,[['prison_pike',-200,-1500],['prison_guard',-180,-1670]],320);
  group('boss',0,-2390,[['prison_maw',0,-2430]],480);
  g.bounds={minX:-980,maxX:980,minZ:-2950,maxZ:750};
 }
 // Full-size northern districts; the approved mill is deliberately not scaled.
 if(!part){
  floor(-180,-2190,1540,580);floor(30,-2850,2060,740);floor(120,-3690,1800,940);floor(0,-4290,920,260);
  s.escortRoute=[{x:0,z:-580},{x:0,z:-1130},{x:-170,z:-1720},{x:-420,z:-2200},{x:30,z:-2700},{x:430,z:-3200},{x:160,z:-3770},{x:0,z:-4160}];
  s.exit={x:0,z:-4250,y:0};g.bounds={minX:-1120,maxX:1120,minZ:-4480,maxZ:750};s.road=s.escortRoute.slice(1);
  for(const x of [-830,-620,680,890])for(const z of [-1930,-2260,-2660,-3020,-3450,-3880])tree(x,z,280,15);
  for(const [x,z]of [[-510,-2770],[710,-3710],[-600,-4110],[440,-4210]])tree(x,z,340,18);
  for(const [x,z,w,d]of [[-800,-3220,280,32],[750,-2680,32,280],[-380,-3780,260,32]])solid(x,z,w,d,65,0,'stone');
  s.props.push({kind:'cart',x:-680,z:-2390},{kind:'bales',x:720,z:-2950});
  plat('bank2',575,-1300,145,85,95,'stone');plat('bank3',715,-1410,200,80,90,'stone');plat('bank4',635,-1570,245,85,95,'stone');plat('bank5',775,-1680,290,110,115,'stone');
  Object.assign(s.shards.find(q=>q.id==='home-bank'),{x:775,z:-1680,y:290});
 }else{
  floor(-150,-3120,1450,400);floor(0,-3570,1770,500);floor(0,-4260,2100,880);floor(0,-4740,850,80);
  s.road=[{x:0,z:-2720},{x:-350,z:-3050},{x:40,z:-3500},{x:340,z:-3830},{x:0,z:-4220},{x:0,z:-4620}];
  s.exit={x:0,z:-4620,y:0};g.bounds={minX:-1120,maxX:1120,minZ:-4810,maxZ:750};
  Object.assign(s.groups.find(q=>q.id==='boss'),{x:0,z:-4220,foes:[['prison_maw',0,-4220]],r:470});
  group('north-patrol',-350,-3100,[['prison_pike',-370,-3100],['prison_hound',-210,-3230]],320);
  group('north-guard',300,-3750,[['prison_guard',420,-3750],['prison_pike',130,-3810]],300);
  group('watch-guard',455,-3300,[['prison_pike',420,-3290],['prison_guard',540,-3390]],275);
  for(const [x,z]of [[-780,-2950],[480,-3010],[-750,-3310],[990,-3380],[-740,-3650],[1020,-3760],[-890,-3990],[920,-4130],[-830,-4450],[750,-4530],[-450,-4720],[460,-4750]])tree(x,z,340+Math.abs(x)%70,18);
  for(const [x,z]of [[-500,-4100],[530,-4390]])solid(x,z,140,160,100);
 }
 for(const q of s.trees){q.y=s.terrain.height(q.x,q.z);q.variant=part?(q.z< -2900?2:1):(q.z< -1800?1:0);q.rotation=(q.x+q.z)*.01;}
 for(const q of s.solids){const y=s.terrain.height(q.x,q.z);q.y0+=y;q.h+=y;}
 // Workstation/cart props have collision matching their visible footprint.
 for(const q of s.props)if(q.kind==='well')solid(q.x,q.z,86,86,56,0,'prop');else if(q.kind==='medical')solid(q.x,q.z,120,65,40,0,'prop');else if(q.kind==='cart')solid(q.x,q.z,110,65,72,s.terrain.height(q.x,q.z),'prop');else if(q.kind==='camp')solid(q.x,q.z,160,100,115,0,'prop');
 g.rooms=[{name:g.areaName,x:0,z:part?-1000:-500,y:0,w:1800,d:part?3500:2500,encounter:false,cleared:true,monsters:[]}];
 if(!part&&progress.bridge){s.safe={x:0,z:-1120,y:0};s.actors.forEach((n,i)=>Object.assign(n,{x:(i-1)*35,z:progress.evacuated?-4160:-580,exitStep:progress.evacuated?s.escortRoute.length:1}));}
 else if(!part&&progress.healing)s.safe={x:-150,z:-380,y:0};else if(!part&&progress.medicine)s.safe={x:-260,z:220,y:0};
 Object.assign(g.p,{...s.safe,vx:0,vy:0,vz:0,onGround:true,yaw:Math.PI});g.cam={x:g.p.x,y:g.p.y,z:g.p.z};g.camYaw=Math.PI;g.lastSafe={...s.safe};g.startPos={...s.safe};g.goalPos={...s.exit};g.progressEnd=s.exit.z;
 document.getElementById('stagetag').textContent=part?'BRIAR BETA · BLACK WOODS':'BRIAR BETA · HOMEFIELDS';
 A.rebuild();resume();A.toast(part?'Lewis’s refuge is ahead. The Legion signal must go dark.':'Your home is under attack. Mara needs the supplies in the granary loft.');
 }
 function spawn(id,type,x,z){if(progress.dead.includes(id))return;const e=A.spawn(type,x,z,type==='prison_maw');e.y=S().terrain.height(x,z);e.betaAppearance=type==='prison_guard'?'sentinel':type==='prison_pike'?'grunt':'thornboar';e.h=type==='prison_maw'?125:type==='prison_hound'?42:72;const f=(.85+config.level*.12)*config.strength;
 Object.assign(e,{betaId:id,betaOrigin:{x,z},hp:Math.round((type==='prison_maw'?360:type==='prison_guard'?65:42)*f),maxHp:Math.round((type==='prison_maw'?360:type==='prison_guard'?65:42)*f),dmg:(type==='prison_maw'?24:6)*(.8+config.level*.10)*config.strength,active:true,dropT:0});
 e.label=type==='prison_maw'?'LEGION WARBEAST':type==='prison_guard'?'Hollowed Shieldbearer':type==='prison_hound'?'Legion Hound':'Hollowed Spearman';
 if(type==='prison_maw'){G().boss=e;e.boss=true;}return e;
 }
 function living(prefix){return G().enemies.some(e=>e.betaId?.startsWith(prefix)&&!e.dead&&e.hp>0);}
 function objective(){if(!part){if(!progress.medicine)return 'Reach the granary loft · Recover Mara’s supplies';if(!progress.healing)return 'Bring the supplies to Mara';if(!progress.bridge)return 'Restore the mill crossing · Divert water, then free the timber';if(living('bank')||!S().groups.find(g=>g.id==='bank').spawned)return 'Clear the far bank so the village can escape';if(!progress.evacuated)return 'Protect the villagers as they cross · Stay nearby; clear each ambush';return 'Follow the escape lane into the Black Woods';}if(!progress.signal)return 'Reach the signal tower · Cut the cable';if(!progress.boss)return 'Defeat the Legion warbeast blocking the refuge route';return 'Read the transport order at the north gate';}
 function navigation(){const s=S();if(!s)return null;const t=!part?(!progress.medicine?s.med:!progress.healing?s.actors[1]:!progress.bridge?{x:-475,z:-550,y:0}:s.exit):!progress.signal?s.signal:!progress.boss?{x:0,z:-4220,y:0}:s.exit;return {...t,navLabel:!part?(!progress.medicine?'Granary loft':!progress.healing?'Mara':!progress.bridge?'Mill yard':'Escape lane'):!progress.signal?'Signal tower':!progress.boss?'Warbeast clearing':'Transport order'};}
 function hud(){let el=document.getElementById('briar-beta-hud');if(!el){el=document.createElement('div');el.id='briar-beta-hud';document.body.append(el);}if(!S())return;
 const text=`<b>${part?'BLACK WOODS':'HOMEFIELDS'} · BETA</b><span>${objective()}</span><small>Shards ${progress.shards.length}/5${part?` · Dogs ${progress.dogs?'safe':'missing'} · Captives ${progress.captive?'safe':'held'}`:''}${progress.hunt?` · Patrol ${Math.min(12,progress.huntKills)}/12`:''}</small>${S().drag?'<strong>Moving crate · Walk to position it · E to let go</strong>':''}<button id="boptions">Map / test controls</button>`;
 const html=text+(S().evac&&!progress.evacuated?`${S().actors.map(n=>`<small>${n.name}: ${Math.ceil(n.hp??100)} / 100</small><progress max="100" value="${n.hp??100}"></progress>`).join('')}`:'');
 if(el.innerHTML!==html){el.innerHTML=html;document.getElementById('boptions').onclick=pause;}document.getElementById('questbox')?.classList.add('hide');
 }
 function mara(){const done=progress.healing;panel('Mara',done?'“The large pad here keeps healing. Small pads on the road have limited charges.”':progress.medicine?'“You found them. Put the supplies here; I can treat everyone now.”':'“The dressings are in the granary loft. The street is blocked—climb the loading scaffold.”',[[progress.medicine&&!done?'Deliver supplies':'Leave conversation',()=>{if(progress.medicine&&!progress.healing){progress.healing=true;A.toast('Medical station opened · Large pad: unlimited healing. Small pads: limited charges.');}resume();}],...(done?[]:[['Leave conversation',resume]])]);}
 function thomas(){panel('Thomas',progress.bridge?'“The crossing is down. Clear the far bank, and we can get everyone into the woods.”':'“I know you won’t leave them. Help Mara, then get that mill crossing down. I’ll keep our neighbors together.”',[['Leave conversation',resume],['Where do I go?',map]]);}
 function lewis(){panel('Lewis',progress.signal?'“The signal is dark. The beast still holds the north trail. There are prisoners being taken through Hollow Pass—we need to find out where.”':'“That signal brings patrols to our refuge. Reach the tower and cut its cable.”',[['Leave conversation',resume],['Any other people missing?',()=>panel('The logging camp','“Beth and her brother are in the west pen. Two dogs were dragged east. Help them if you can.”',[['I’ll look',resume]])],[progress.hunt?'Patrol progress':'Help hold back the patrol',()=>{progress.hunt=true;if(progress.huntKills>=12&&!progress.huntPaid){progress.huntPaid=true;progress.smallHeals+=2;A.toast('Patrol held back · Two extra recovery charges earned.');}panel('Hold the logging camp',progress.huntPaid?'“You bought us time. Take those recovery supplies.”':`Defeat twelve enemies at the west logging camp. ${Math.min(12,progress.huntKills)}/12 defeated. Only two patrol enemies can be active at once.`,[['Leave conversation',resume]]);}]]);}
 function releaseJam(){if(S().plate<.8){A.toast('The turning wheel strains the catch. Weigh down the sluice plate to stop the waterwheel.');return;}progress.bridge=true;S().events.push({kind:'bridge',time:G().time});A.toast('Timber freed! The crossing is lowering.');}
 function collect(id){if(progress.shards.includes(id))return;progress.shards.push(id);A.toast(`Rift Shard ${progress.shards.length}/5 · Five shards open the Berserker trial in the Rift Hall. Beta collection stays here.`);}
 function interact(){if(!S())return null;const s=S(),list=[];const add=(o,label,act,r=90)=>{if(near(o,r))list.push({...o,label,act});};
 if(!part){add({x:-470,z:-240,y:0},'Examine the torn transport map',()=>BFInspection.open('map',{x:-470,y:40,z:-240}));add({x:470,z:248,y:0},'Examine the granary painting',()=>BFInspection.open('painting',{x:470,y:60,z:248}));}
 if(!part){add(s.actors[0],'Talk to Thomas',thomas);add(s.actors[1],progress.medicine&&!progress.healing?'Deliver Mara’s supplies':'Talk to Mara',mara);
 add(s.actors[2],'Ask Gus about the mill',()=>panel('Gus','“That plate lowers the sluice. Your weight works—but who holds it while you climb? There’s a grain crate right beside it.”',[['Leave conversation',resume]]));
 if(!progress.medicine)add(s.med,'Take the medical satchel',()=>{progress.medicine=true;A.toast('Medical satchel collected · Bring it to Mara.');},75);
 add(s.crate,s.drag?'Let go of the grain crate':'Move the grain crate',()=>{s.drag=!s.drag;if(s.drag){s.dragOffset={x:s.crate.x-G().p.x,z:s.crate.z-G().p.z};A.toast('Walk to move the crate. E releases it.');}},125);
 add({x:-320,z:-380,y:0},'Reset the grain crate',()=>{s.drag=false;Object.assign(s.crate,{x:-260,z:-445});A.toast('Grain crate returned to the mill yard.');},65);
 if(!progress.bridge)add(s.jam,'Free the jammed timber',releaseJam,80);
 if(progress.healing&&progress.bridge)add(s.exit,'Enter the Black Woods',()=>{if(!progress.evacuated){A.toast('Keep the route clear until all three villagers reach safety.');return;}part=1;progress.part=1;build();});
 }else{
 add(s.actors[0],'Talk to Lewis',lewis);
 if(!progress.signal)add(s.signal,'Cut the signal cable',()=>{progress.signal=true;A.toast('Signal silenced. The refuge is hidden from new patrols.');},85);
 if(!progress.captive)add({x:-690,z:-1030,y:0},'Open the captive pen',()=>{if(living('pen')||!s.groups.find(q=>q.id==='pen').spawned){A.toast('Defeat the pen guard first.');return;}progress.captive=true;A.toast('Beth and her brother are free. They are moving to shelter.');});
 if(!progress.dogs)add({x:690,z:-1410,y:0},'Release the two dogs',()=>{if(living('dogs')||!s.groups.find(q=>q.id==='dogs').spawned){A.toast('Clear the dog handlers first.');return;}progress.dogs=true;progress.smallHeals++;A.toast('Two dogs rescued · One recovery charge found in the handlers’ pack.');});
 add(s.heal,`Use recovery pad (${progress.smallHeals} charges)`,()=>{if(!progress.smallHeals){A.toast('This small pad is empty.');return;}if(G().p.hp>=A.maxHp()){A.toast('Health is already full.');return;}progress.smallHeals--;G().p.hp=A.maxHp();A.toast('Health restored · One charge used.');});
 if(progress.signal&&progress.boss)add(s.exit,'Read the transport order',finish);
 }
 for(const q of s.shards)if(!progress.shards.includes(q.id))add(q,'Collect Rift Shard',()=>collect(q.id),65);
 list.sort((a,b)=>dist(a,G().p)-dist(b,G().p));return list[0]?{...list[0],y:(list[0].y||0)+85}:null;
 }
 function finish(){panel('Briar Town is safe—for now','“Move prisoners through Hollow Pass.” The order points beyond your home. Thomas and the neighbors have reached shelter. This ends the isolated beta.',[['Explore a little longer',resume],['Test summary',()=>panel('Your beta run',`Shards: ${progress.shards.length}/5. Captives: ${progress.captive?'rescued':'not rescued'}. Dogs: ${progress.dogs?'rescued':'not rescued'}. Falls: ${progress.falls}. Deaths: ${progress.deaths}. Nothing was added to your campaign save.`,[['Continue exploring',resume],['Exit to title',exit]])],['Exit to title',exit]]);}
 function movePlatforms(dt){const s=S();if(!s)return;const p=G().p;
 if(!part){if(s.drag){const x=p.x+s.dragOffset.x,z=p.z+s.dragOffset.z;
  // A movable floor prop must never enter a wall, water or upper platform.
  const blocked=Math.abs(p.y)>12||x< -600||x>150||z< -660||z> -290||s.solids.some(o=>o!==s.crateSolid&&Math.abs(x-o.x)<o.w/2+35&&Math.abs(z-o.z)<o.d/2+35);
  if(!blocked){s.crate.x=x;s.crate.z=z;}else if(dist(s.crate,p)>160){s.drag=false;A.toast('Crate released on safe ground.');}
 }
 s.crateSolid.x=s.crate.x;s.crateSolid.z=s.crate.z;
 const pressed=(Math.abs(s.crate.x-s.plateAt.x)<50&&Math.abs(s.crate.z-s.plateAt.z)<50)||(near(s.plateAt,50)&&p.y<15);
 s.plate+=((pressed?1:0)-s.plate)*Math.min(1,dt*7);s.water=1-s.plate;s.wheelAngle=(s.wheelAngle||0)+s.water*dt*1.8;
 if(progress.bridge&&s.bridgeT<1){s.bridgeT=Math.min(1,s.bridgeT+dt*.5);if(s.bridgeT===1&&!G().movers.includes(s.bridge)){G().movers.push(s.bridge);A.toast('Crossing ready. Clear the far bank.');}}
 }
 }
 function tick(dt){const s=S(),g=G(),p=g.p;if(!s)return;s.elapsed+=dt;
 if(config.god){p.hp=A.maxHp();p.invuln=Math.max(p.invuln,.2);}
 if(p.y< -115){progress.falls++;Object.assign(p,{...s.safe,vx:0,vy:0,vz:0,onGround:true,jumps:0});p.hp=Math.max(1,p.hp-A.maxHp()*.06);s.drag=false;A.toast('Back to the last safe landing. Hold jump for more height.');}
 if(p.onGround&&p.y>=0&&!s.drag){const f=g.segments.find(o=>Math.abs(p.x-o.x)<o.w/2-35&&Math.abs(p.z-o.z)<o.d/2-35);if(f)s.safe={x:p.x,z:p.z,y:s.terrain.height(p.x,p.z)};else{const q=s.plats.find(o=>Math.abs(p.y-o.h)<3&&Math.abs(p.x-o.x)<o.w/2-15&&Math.abs(p.z-o.z)<o.d/2-15);if(q)s.safe={x:q.x,z:q.z,y:q.h};}}
 for(const q of s.groups)if(!q.spawned&&dist(p,q)<q.r&&Math.abs(p.y-s.terrain.height(p.x,p.z))<80&&(q.id!=='boss'||progress.signal)){q.spawned=true;q.foes.forEach(([type,x,z],i)=>spawn(q.id+':'+i,type,x,z));}
 for(const e of g.enemies){if(e.dead||e.hp<=0){if(e.betaId&&!progress.dead.includes(e.betaId)){progress.dead.push(e.betaId);if(e.betaId.startsWith('hunt:'))progress.huntKills++;if(e.betaId.startsWith('boss')){progress.boss=true;A.toast('The north trail is clear. Read the order by the gate.');}}continue;}
  // Keep encounters in their authored clearings. A full-map chase would erase pacing.
  if(e.betaOrigin&&dist(e,e.betaOrigin)>450){Object.assign(e,{x:e.betaOrigin.x,z:e.betaOrigin.z,pcState:'approach',pcClock:.8});}
 }
 if(!part&&progress.healing&&near({x:-360,z:220,y:0},95)){p.hp=Math.min(A.maxHp(),p.hp+A.maxHp()*.35*dt);}
 if(!part&&progress.bridge&&s.bridgeT===1&&s.groups.find(q=>q.id==='bank').spawned&&!living('bank')&&!progress.evacuated){
  if(!s.evac){s.evac={hp:100,time:0,waves:0};for(const n of s.actors)n.hp=100;A.toast('The villagers are crossing. Keep the patrols away from them.');}
  s.evac.time+=dt;
  if(s.evac.waves<4&&!living('evac')&&s.actors[0].z<[-1100,-1980,-2830,-3660][s.evac.waves]){const w=s.evac.waves++,n=s.actors[0],side=w%2?-1:1;spawn('evac'+w+':0',w%2?'prison_guard':'prison_hound',n.x+side*250,n.z-120);spawn('evac'+w+':1','prison_pike',n.x+side*310,n.z-210);A.toast('Patrol approaching the escape lane!');}
  const route=s.escortRoute;
  for(const [i,n]of s.actors.entries()){n.exitStep=n.exitStep||0;const q=route[n.exitStep];n.walking=!!q&&(n.exitStep<2||dist(p,n)<360)&&!living('evac');if(!n.walking)continue;const tx=q.x+(i-1)*35,d=Math.hypot(tx-n.x,q.z-n.z);if(d<8)n.exitStep++;else{n.x+=(tx-n.x)/d*95*dt;n.z+=(q.z-n.z)/d*95*dt;n.y=s.terrain.height(n.x,n.z);}}
  if(s.actors.every(n=>n.exitStep===s.escortRoute.length)&&s.evac.waves===4&&!living('evac')){progress.evacuated=true;A.toast('Everyone is safe. Follow them into the Black Woods.');}
  if(s.evac.hp<=0){progress.dead=progress.dead.filter(id=>!id.startsWith('evac'));panel('The escape route was overrun','Regroup at the repaired crossing. Supplies and discoveries stay collected.',[['Retry the crossing defense',build],['Test controls',pause]]);}
 }
 if(part&&progress.hunt&&progress.huntKills<12&&dist(p,{x:-550,z:-1250})<380){s.huntClock-=dt;const n=g.enemies.filter(e=>e.betaId?.startsWith('hunt:')&&!e.dead&&e.hp>0).length;if(n<2&&s.huntClock<=0){s.huntClock=4;spawn('hunt:'+serial+':'+Math.floor(s.elapsed*100),n?'prison_pike':'prison_hound',-580+n*140,-1260);}}
 if(part&&progress.captive)for(const [i,n]of s.actors.entries()){if(!i)continue;const tx=-470-i*60,tz=-900,d=Math.hypot(tx-n.x,tz-n.z);n.walking=d>5;if(d>5){n.x+=(tx-n.x)/d*55*dt;n.z+=(tz-n.z)/d*55*dt;}}
 hud();
 }
 function death(){progress.deaths++;panel('Try again','Completed tasks and discoveries stay done. This chapter’s surviving enemies reset; health is restored.',[['Retry this chapter',build],['Change loadout / restart',setup],['Exit',exit]]);}
 function target(e,p){const s=S();if(!s?.evac||progress.evacuated||!e.betaId?.startsWith('evac'))return p;const n=s.actors.reduce((a,b)=>dist(e,a)<dist(e,b)?a:b);n.r=13;n.h=58;return dist(e,n)<dist(e,p)?n:p;}
 function captiveHit(e,blocked){const s=S();if(!s?.evac||progress.evacuated||!e.betaId?.startsWith('evac')||e._bbHit===e.pcSerial)return;for(const n of s.actors)if(BFPrisonCombat.contains(e,{...n,r:13,h:58})&&!blocked(n)){e._bbHit=e.pcSerial;n.hp=Math.max(0,(n.hp??100)-8*config.strength);s.evac.hp=Math.min(...s.actors.map(a=>a.hp??100));A.toast('A villager was hit!');break;}}
 function draw(t){const s=S();if(!s)return;const b=A.box;
 if(!part){b(-470,25,-240,55,5,40,'#795936');b(-470,28,-240,42,1,28,'#cdb77c');for(const x of [-490,-450])b(x,12,-240,5,24,5,'#59452d');b(470,60,248,65,48,3,'#6b4e31');b(470,60,245,56,39,1,'#a4b7a1');b(470,59,244,29,19,1,'#cfaf7b');b(470,73,244,37,8,1,'#46684f');b(470,80,243,4,5,1,'#ad7fe3');}

 if(!window.__BRIAR_BETA_ART){for(const f of G().segments)b(f.x,-15,f.z,f.w,30,f.d,part?'#435d3b':'#6f884b');for(const q of s.plats)b(q.x,q.h-11,q.z,q.w,22,q.d,q.color);for(const q of s.solids)if(q.briarKind!=='crate')b(q.x,(q.y0+q.h)/2,q.z,q.w,q.h-q.y0,q.d,q.color);}
 if(!part){
  const c=s.crate;b(c.x,32,c.z,64,64,64,'#9e713e');for(const x of [-25,25])b(c.x+x,33,c.z,6,68,67,'#493b2d');
  b(s.plateAt.x,4-s.plate*4,s.plateAt.z,110,8,110,s.plate>.8?'#a2be70':'#a89667');
  b(-600,58-s.plate*48,-700,170,100,16,'#685c43');
  // Visible current diverts west when the plate is weighed down.
  for(let i=0;i<9;i++){const f=(t*.5+i/9)%1;b(-600-(1-s.water)*f*300,-8,-700-f*270*s.water,20,3,28,'#9ad0d1');}
  const bridgeY=140*(1-s.bridgeT);b(0,bridgeY-9,-875,250,18,250,'#947344');for(let x=-110;x<125;x+=30)b(x,bridgeY+2,-875,25,5,242,'#c7a976');
  if(!progress.bridge){b(-320,230,-960,145,25,32,'#63442e');b(-320,250,-960,8,80,8,'#c3ab70');}
  if(!progress.medicine){b(s.med.x,s.med.y+15,s.med.z,35,30,24,'#d4d4b2');b(s.med.x,s.med.y+16,s.med.z-13,7,20,2,'#ab4e46');}
  if(progress.healing)b(-360,2,220,120,4,120,'#87c894','#80bb83',.7);
 }else{
  if(!progress.signal){b(s.signal.x,s.signal.y+70,s.signal.z,8,130,8,'#b7663d');b(s.signal.x,s.signal.y+140,s.signal.z,42,28,42,'#f1a256','#f1a256');}else b(s.signal.x,s.signal.y+55,s.signal.z,8,100,8,'#594633');
  b(s.heal.x,3,s.heal.z,90,6,90,progress.smallHeals?'#86bec1':'#5c6464');
  if(!progress.captive)for(let x=-855;x<-650;x+=25)b(x,60,-965,5,120,5,'#68694e');
  for(let i=0;i<2;i++){const x=progress.dogs?410+i*60:650+i*75,z=progress.dogs?-1190:-1460;b(x,22,z,28,26,50,i?'#a38a64':'#665846');b(x,38,z-22,25,24,23,'#b6a17b');for(const dx of [-10,10])for(const dz of [-15,15])b(x+dx,8,z+dz,7,16,7,'#514539');}
 }
 for(const q of s.shards)if(!progress.shards.includes(q.id)){b(q.x,q.y+28+Math.sin(t*2)*4,q.z,14,32,14,'#b78af0','#a577d1');b(q.x,q.y+3,q.z,40,4,40,'#544669');}
 for(const n of s.actors)if(!window.__npc3dDrawn?.(n.id))A.person(n,t,n.walking);
 }
 function install(api){A=api;const css=document.createElement('style');css.textContent='#briar-beta-hud{position:fixed;top:110px;right:14px;width:265px;background:#17291fe8;border:1px solid #a7ac73;border-radius:9px;padding:12px;color:#eff0d5;z-index:12;font:13px/1.45 sans-serif}#briar-beta-hud span,#briar-beta-hud small,#briar-beta-hud strong{display:block;margin-top:7px}#briar-beta-hud button{margin-top:9px;padding:8px;border:1px solid #a7ac73;background:#354a37;color:white;border-radius:5px}@media(max-width:600px){#briar-beta-hud{top:100px;right:5px;width:170px;font-size:11px;padding:8px}}';document.head.append(css);}
 return {install,setup,start,pause,journal,navigation,draw,tick,interact,movePlatforms,death,target,captiveHit,get config(){return {...config};},get progress(){return progress;},objective};
})();
