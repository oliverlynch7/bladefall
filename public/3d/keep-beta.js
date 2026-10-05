/* Ruined Keep design-lab slice. No campaign quest/save schema is reused. */
window.BFKeepBeta=(()=>{'use strict';
 let A,config={cid:'warrior',level:12,rank:5,rarity:'uncommon',path:'a',strength:1,god:false,camera:'shoulder'},serial=0;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),copy=x=>JSON.parse(JSON.stringify(x));
 const G=()=>A.g(),S=()=>G()?.devKeep,near=(o,r=110)=>Math.hypot(G().p.x-o.x,G().p.z-o.z)<r&&Math.abs(G().p.y-(o.y||0))<75;
 const exit=()=>location.assign('/3d/');
 function resume(){A.play();A.refresh();if(S())hud();}
 function panel(title,text,buttons){A.menu(`<div class="card narrow keep-menu"><p class="ovkicker">RUINED KEEP · DESIGN LAB</p><h2>${title}</h2><p class="ovsub">${text}</p>${buttons.map((b,i)=>`<button class="bigbtn ${i?'ghost':''}" id="kb${i}">${b[0]}</button>`).join('')}</div>`);buttons.forEach((b,i)=>document.getElementById('kb'+i).onclick=b[1]);}
 function setup(){if(!window.BF_KEEP_ISOLATED){location.assign('/3d/?devkeep=1');return;}
 A.menu(`<div class="card keep-menu"><p class="ovkicker">SOLO LAYOUT PROTOTYPE</p><h2>Ruined Keep · Lift Rescue</h2><p class="ovsub">Explore the prison. Repair its lift. Bring the captives to safety.</p><div class="keep-fields">
 <label>Class<select id="kc">${Object.entries(A.classes).map(([k,v])=>`<option value="${k}" ${k===config.cid?'selected':''}>${v.disp}</option>`).join('')}</select></label>
 <label>Character level<input id="kl" type="number" min="1" max="50" value="${config.level}"></label>
 <label>Class rank<input id="kr" type="number" min="1" max="10" value="${config.rank}"></label>
 <label>Gear<select id="kg">${['common','uncommon','rare','epic','legendary'].map(k=>`<option ${k===config.rarity?'selected':''}>${k}</option>`).join('')}</select></label>
 <label>Skill choices<select id="kp"><option value="a">First choice at each rank</option><option value="b" ${config.path==='b'?'selected':''}>Second choice at each rank</option></select></label>
 <label>Camera<select id="kv"><option value="shoulder">Over the shoulder</option><option value="far" ${config.camera==='far'?'selected':''}>Overhead</option><option value="fps" ${config.camera==='fps'?'selected':''}>First person</option></select></label><label>Enemy strength<select id="ke"><option value="0.65" ${config.strength===.65?'selected':''}>Relaxed · 65%</option><option value="1" ${config.strength===1?'selected':''}>Standard · 100%</option><option value="1.5" ${config.strength===1.5?'selected':''}>Hard · 150%</option></select></label></div>
 <label class="keep-check"><input type="checkbox" id="ki" ${config.god?'checked':''}> Invulnerable player (exploration)</label><p class="hint">Character stats and enemies scale with your test level. Gear uses its selected rarity. Changing these options starts a fresh attempt. No campaign saves, unlocks or gold are used. Co-op is not enabled in this beta.</p><button class="bigbtn" id="kstart">Enter playable beta</button><button class="bigbtn ghost" id="kexit">Back to title</button></div>`);
 document.getElementById('kstart').onclick=()=>{config={cid:document.getElementById('kc').value,level:clamp(+document.getElementById('kl').value||1,1,50)|0,rank:clamp(+document.getElementById('kr').value||1,1,10)|0,rarity:document.getElementById('kg').value,path:document.getElementById('kp').value,strength:+document.getElementById('ke').value,god:document.getElementById('ki').checked,camera:document.getElementById('kv').value};start();};document.getElementById('kexit').onclick=exit;
 }
 function pause(){panel('Test controls','This attempt is temporary. Resetting restores the guards, puzzle and prisoners.',[['Continue',resume],['Change class / loadout',setup],['Reset this attempt',start],['Exit to title',exit]]);}
 function start(){const g=A.create(config);g.devKeep={id:++serial,cells:false,snag:false,stop:0,target:0,moving:false,escort:'waiting',hp:100,hitT:0,wave:false,locket:false,returned:false,shard:false,finish:false,safe:{x:0,z:240,y:0},actors:[],art:[],walls:[],plats:[]};
 const s=S();const floor=(x,z,w,d)=>g.segments.push({x,z,w,d});
 const plat=(x,z,h,w,d,c='#777363')=>{const o={kind:'plat',x,z,h,w,d,slab:22,color:c};g.obstacles.push(o);s.plats.push(o);return o;};
 const wall=(x,z,w,d,h=190,y0=0,c='#484b4c')=>{const o={x,z,w,d,h,y0,kind:'wall',color:c};g.walls.push(o);s.walls.push(o);return o;};
 const art=(x,y,z,w,h,d,c)=>s.art.push({x,y,z,w,h,d,c});
 floor(0,-285,960,1190); // intake, guard station and loading hall share a believable prison floor
 // Solid perimeter with a tall rear wall; the refuge is physically disconnected above it.
 wall(-500,-285,40,1230);wall(500,-410,40,980);wall(0,330,1040,40);wall(-95,-890,830,40,390);
 // Intake arch and columns establish a threshold before the guard station.
 for(const x of [-180,180]){wall(x,35,56,70,205);art(x,15,35,72,30,86,'#6c716b');art(x,195,35,70,22,82,'#848777');}
 art(0,222,35,420,26,70,'#696e67');
 // Cell block: side/rear walls, barred opening and guard-operated lock.
 wall(-150,-645,22,330);wall(-320,-815,360,24);wall(-460,-470,80,20);wall(-175,-470,50,20);
 s.cellGate=wall(-310,-470,240,16,165);s.cellGate.bars=true;
 // Guard desk and deliberate sightline cover, not random boxes.
 wall(70,-235,130,46,48,0,'#65543d');wall(175,-385,56,65,90,0,'#53595b');wall(-55,-100,52,72,82,0,'#53595b');
 // Upper refuge: 420 units above the loading floor. No competing staircase.
 plat(300,-1160,420,460,460,'#929083');plat(300,-910,420,220,100,'#929083');wall(60,-1160,20,460,640,420);wall(540,-1160,20,460,640,420);wall(300,-1400,500,24,660,420);
 // Maintenance approach has four measured jumps, then the weight-cage bridge.
 plat(390,160,55,120,115,'#557a79');plat(560,130,115,100,110,'#557a79');plat(650,-25,165,100,110,'#557a79');plat(650,-190,210,120,140,'#557a79');
 plat(650,-690,210,150,220);wall(730,-690,20,240,390,210);wall(650,-810,180,20,390,210);
 // Harder optional spur, isolated from the refuge.
 plat(850,-40,205,85,85,'#697c79');plat(990,-130,270,78,78,'#697c79');plat(1000,-300,335,95,95,'#697c79');
 s.lift={x:300,z:-780,h:0,px:300,py:0,w:220,d:220,betaMover:true};
 s.cage={x:650,z:-430,h:420,px:650,py:420,w:130,d:180,betaMover:true};g.movers.push(s.lift,s.cage);
 // Machinery shows that these platforms belong to one system.
 for(const x of [184,416])art(x,255,-780,14,550,16,'#433c30');
 for(const x of [579,721])art(x,255,-430,12,550,14,'#433c30');
 art(460,535,-600,590,22,22,'#5a4b34');
 for(const z of [-20,-300,-750]){art(-480,118,z,12,45,12,'#4a3828');art(-480,148,z,14,22,14,'#ffcd79');}
 // Beds and supplies are inside cells/refuge, records stay at the guard desk.
 for(const z of [-570,-720]){art(-370,13,z,110,26,55,'#594d3e');art(-370,29,z,100,6,47,'#a0997c');g.obstacles.push({kind:'plat',x:-370,z,h:32,w:110,d:55});}
 art(70,52,-235,46,7,29,'#d9cfaa');art(375,445,-1280,100,50,48,'#68543b');g.obstacles.push({kind:'plat',x:375,z:-1280,h:470,y0:420,w:100,d:48});
 for(const x of [150,445]){art(x,545,-1385,58,130,5,'#324e62');art(x,552,-1380,10,60,4,'#c9b67c');}
 s.actors=[{id:'walter',name:'Walter',x:-275,z:-580,y:0,color:'#87949b'},{id:'prison_escape1',name:'Wounded captive',x:-335,z:-675,y:0,color:'#9c755d'},{id:'sly',name:'Sly',x:-240,z:-740,y:0,color:'#786c86'}];
 g.bounds={minX:-525,maxX:1120,minZ:-1440,maxZ:355};g.progressEnd=-1400;g.startPos={x:0,z:240};g.goalPos={x:300,z:-1200};g.lastSafe={x:0,z:240,y:0};
 guard('prison_pike',0,-120);guard('prison_hound',250,-320);guard('prison_pike',-90,-400);guard('prison_vessel',340,-535);
 A.rebuild();resume();A.toast('Ruined Keep beta · Clear the guard station and find the prisoners.');hud();
 }
 function guard(type,x,z,wave=false){const e=A.spawn(type,x,z),f=config.strength*(.7+config.level*.085);e.hp=e.maxHp=Math.round(55*f*(type==='prison_hound'?.75:1));e.dmg=(6+config.level*.8)*config.strength;e.active=true;e.dropT=0;e.betaWave=wave;e.role=null;e.betaGuard=true;return e;}
 function objective(){const s=S();if(s.finish)return 'Rescue complete';if(s.escort==='failed')return 'Return to Walter to retry the escort';if(s.escort==='walking')return 'Protect the captives as they reach the lift';if(s.escort==='boarded')return 'Board the lift and raise it to the refuge';if(s.escort==='unloading')return 'Follow the captives into the refuge';if(s.escort==='arrived')return 'Speak to Walter in the upper refuge';if(!s.cells)return 'Clear the guard station · Open the cells';if(!s.snag)return 'Repair the lift · Explore the maintenance ledges';return 'Lower the lift · Ask Walter to follow';}
 function hud(){let el=document.getElementById('keep-beta-hud');if(!el){el=document.createElement('div');el.id='keep-beta-hud';document.body.append(el);}const s=S();if(!s)return;
 const text=`<b>RUINED KEEP · BETA</b><span>${objective()}</span>${['walking','boarded','paused'].includes(s.escort)?`<label>Captive health · ${Math.ceil(s.hp)} / 100</label><progress max="100" value="${s.hp}"></progress>`:''}<button id="keep-test-options">Test controls</button>`;if(el.innerHTML!==text){el.innerHTML=text;document.getElementById('keep-test-options').onclick=pause;}document.getElementById('questbox')?.classList.add('hide');}
 function controls(){const s=S();panel('Cargo lift',s.snag?'Chain clear. The cage moves opposite the lift.':'The upper chain is caught. A service stop lines up the weight cage with the maintenance ledges.',[['Lower dock',()=>selectStop(0)],['Service stop',()=>selectStop(210)],['Upper refuge',()=>selectStop(420)],['Back',resume]]);}
 function selectStop(y){const s=S(),p=G().p;
 if(s.moving){A.toast('Wait for the lift to stop.');return;}
 if(y===420&&!s.snag){A.toast('The chain is caught. Clear it from the service gallery.');return;}
 if(Math.abs(p.x-s.cage.x)<100&&Math.abs(p.z-s.cage.z)<135&&Math.abs(p.y-s.cage.h)<90){A.toast('Step off the weight cage first.');return;}
 if(s.escort==='walking'||s.escort==='paused'||s.escort==='unloading'){A.toast('Let everyone reach safe ground first.');return;}
 if(s.escort==='boarded'&&y!==420){A.toast('The prisoners are aboard. Take them to the upper refuge.');return;}
 if(s.escort==='boarded'&&(Math.abs(p.x-300)>96||Math.abs(p.z+780)>96||Math.abs(p.y-s.lift.h)>10)){A.toast('Board the lift with the prisoners first.');return;}
 if(s.escort==='boarded'&&G().enemies.some(e=>!e.dead&&Math.hypot(e.x-300,e.z+650)<310)){A.toast('Clear the loading hall before raising the lift.');return;}
 s.target=y;s.moving=y!==s.lift.h;resume();
 }
 function cellSwitch(){const s=S();if(G().enemies.some(e=>e.betaGuard&&!e.betaWave&&!e.dead)){A.toast('The guard station must be clear first.');return;}s.cells=true;G().walls=G().walls.filter(o=>o!==s.cellGate);A.toast('Cells unlocked. Walter is waiting inside.');A.rebuild();}
 function talk(){const s=S();if(s.escort==='arrived'){s.finish=true;s.returned=s.locket;panel('The captives are safe','Walter: “The prison records name Professor Ellis. They were searching for him in Frostfell.”'+(s.returned?' Sly returns the stolen locket.':''),[['Finish beta',()=>panel('Thanks for testing','This slice ends before The Fallen. Nothing was added to your campaign. Try another class, or explore the route again.',[['New loadout',setup],['Reset same loadout',start],['Back to title',exit]])],['Keep exploring',resume]]);return;}
 if(s.escort==='boarded'||s.escort==='unloading'){panel('Walter',s.escort==='boarded'?'“We’re aboard. Join us and raise the lift.”':'“Nearly there. Follow us into the refuge.”',[['Leave conversation',resume]]);return;}
 if(s.escort==='failed'){panel('Try the rescue again','Restore the escort to its starting state. The repaired lift stays repaired.',[['Retry escort',retry],['Back',resume]]);return;}
 if(s.escort==='walking'||s.escort==='paused'){const paused=s.escort==='paused';panel('Walter',paused?'“We’ll follow when you’re ready.”':'“We’re right behind you.”',[[paused?'Keep moving':'Wait here',()=>{s.escort=paused?'walking':'paused';resume();}],['Back',resume]]);return;}
 panel('Walter','“One of us can barely walk. Get the lift working, then we can leave together.”',[['Start the rescue',escort],['Ask about the lift',()=>panel('Walter’s hint','“Raise the lift halfway. The weight cage should meet those broken ledges.”',[['Back',talk]])],['Leave conversation',resume]]);
 }
 function escort(){const s=S();if(!s.snag||s.moving||s.lift.h!==0){A.toast('Repair the lift and bring it to the lower dock first.');return;}if(G().enemies.some(e=>!e.dead)){A.toast('Clear the guards before moving the prisoners.');return;}
 s.snapshot=A.snapshot();s.escort='walking';s.hp=100;s.route=0;s.wave=false;s.hitT=0;s.actors.forEach((n,i)=>Object.assign(n,{x:-280+i*35,z:-535,y:0}));resume();A.toast('Protect the captives. Guards can hurt the wounded prisoner.');}
 function retry(){const s=S();if(s.snapshot)A.restore(s.snapshot);G().enemies=G().enemies.filter(e=>!e.betaWave);G().projectiles=[];G().pickups=[];s.target=0;s.lift.h=0;s.cage.h=420;s.moving=false;s.escort='waiting';s.actors.forEach((n,i)=>Object.assign(n,{x:-280+i*35,z:-535,y:0}));s.hp=100;s.wave=false;s.snapshot=null;Object.assign(G().p,{x:-150,z:-350,y:0,vx:0,vy:0,vz:0,dead:false});resume();}
 function interact(){const s=S();if(!s)return null;const list=[];const add=(x,z,y,label,act,r=105)=>{const o={x,z,y,label,act};if(near(o,r))list.push(o);};
 if(!s.cells)add(70,-175,0,'Open cell locks',cellSwitch);
 if(s.cells){const w=s.actors[0];add(w.x,w.z,w.y,'Talk to Walter',talk,100);}
 add(310,-585,0,'Use winch controls',controls,115);add(355,-785,s.lift.h,'Use lift controls',controls,105);
 if(!s.snag)add(650,-735,210,'Clear the trapped chain',()=>{s.snag=true;A.toast('Chain released. The lift can reach the upper refuge.');},90);
 if(!s.locket&&s.cells)add(-405,-750,0,'Pick up the stolen locket',()=>{s.locket=true;A.toast('Locket recovered. Return it when the captives are safe.');},65);
 if(!s.shard)add(1000,-300,335,'Collect test Rift Shard',()=>{s.shard=true;A.toast('Optional route complete! Test shard collected — campaign shards unchanged.');},75);
 list.sort((a,b)=>Math.hypot(a.x-G().p.x,a.z-G().p.z)-Math.hypot(b.x-G().p.x,b.z-G().p.z));return list[0]?{...list[0],y:list[0].y+85}:null;
 }
 function movePlatforms(dt){const s=S();if(!s)return;const p=G().p;for(const o of [s.lift,s.cage]){o.px=o.x;o.py=o.h;}
 if(!s.moving)return;const next=s.lift.h+Math.sign(s.target-s.lift.h)*Math.min(Math.abs(s.target-s.lift.h),65*dt);s.lift.h=next;s.cage.h=420-next;for(const o of [s.lift,s.cage])if(p.onGround&&Math.abs(p.y-o.py)<3&&Math.abs(p.x-o.x)<o.w/2&&Math.abs(p.z-o.z)<o.d/2){p.y+=o.h-o.py;break;}
 if(s.escort==='boarded')s.actors.forEach(n=>n.y=next);
 if(next===s.target){s.moving=false;s.stop=next;if(next===420&&s.escort==='boarded'){s.escort='unloading';A.toast('Upper dock reached. Follow the captives into the refuge.');} }
 }
 function tick(dt){const s=S();if(!s)return;const g=G(),p=g.p;if(config.god){p.hp=A.maxHp();p.invuln=Math.max(p.invuln,.2);}
 if(p.y< -100){Object.assign(p,{...s.safe,vx:0,vy:0,vz:0});p.hp=Math.max(1,p.hp-A.maxHp()*.07);A.toast('Back to solid ground. Hold jump for a longer leap.');}
 if(p.onGround&&!s.moving&&p.y>=0&&p.x<490&&p.z>-820)s.safe={x:p.x,y:p.y,z:p.z};
 if(s.escort==='walking'){
  const points=[{x:-270,z:-390},{x:90,z:-390},{x:285,z:-620},{x:300,z:-780}];const target=points[s.route],lead=s.actors[0];
  if(Math.hypot(p.x-lead.x,p.z-lead.z)<320){const d=Math.hypot(target.x-lead.x,target.z-lead.z),step=Math.min(d,58*dt);if(d>1){lead.x+=(target.x-lead.x)/d*step;lead.z+=(target.z-lead.z)/d*step;}if(d<5){s.route++;if(s.route===points.length){s.escort='boarded';s.actors.forEach((n,i)=>Object.assign(n,{x:255+i*42,z:-810+(i%2)*42,y:0}));A.toast('Everyone is aboard. Join them and raise the lift.');}}}
  if(s.escort==='walking')for(let i=1;i<s.actors.length;i++){const n=s.actors[i],prev=s.actors[i-1],d=Math.hypot(prev.x-n.x,prev.z-n.z);if(d>36){n.x+=(prev.x-n.x)/d*58*dt;n.z+=(prev.z-n.z)/d*58*dt;}}
  if(!s.wave&&lead.x> -100){s.wave=true;guard('prison_pike',0,-120,true);guard('prison_hound',145,-170,true);A.toast('Reinforcements are coming through the guard station!');}
 }
 if(s.escort==='unloading'){let done=true;s.actors.forEach((n,i)=>{const tx=220+i*70,tz=-1090,dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);if(d>2){const step=Math.min(d,58*dt);n.x+=dx/d*step;n.z+=dz/d*step;done=false;}});if(done){s.escort='arrived';A.toast('Everyone is safe. Speak to Walter.');}}
 for(const n of s.actors){n.walking=s.escort==='walking'||s.escort==='unloading';n.hp=s.hp;n.h=58;n.r=13;}
 if(s.hp<=0&&s.escort!=='failed'){s.escort='failed';panel('The escort fell','Retry from the rescue start. The lift stays repaired; escort resources reset.',[['Retry escort',retry],['Test controls',pause]]);}
 hud();
 }
 function target(e,p){const s=S();if(!s||!['walking','paused','boarded'].includes(s.escort))return p;const c=s.actors[1];c.hp=s.hp;c.r=13;c.h=58;return Math.abs(c.y-e.y)<65&&(!p||Math.hypot(e.x-c.x,e.z-c.z)<Math.hypot(e.x-p.x,e.z-p.z))?c:p;}
 function captiveHit(e,blocked){const s=S();if(!s||!['walking','paused','boarded'].includes(s.escort))return;const c=s.actors[1];c.hp=s.hp;if(e._betaHit!==e.pcSerial&&BFPrisonCombat.contains(e,c)&&!blocked(c)){e._betaHit=e.pcSerial;s.hp=Math.max(0,s.hp-12*config.strength);A.toast('The captive was hit!');}}
 function death(){const s=S();panel('Try again',s.snapshot?'Retry the escort with its starting health and resources.':'Reset this test attempt with the same loadout.',[[s.snapshot?'Retry escort':'Reset attempt',s.snapshot?retry:start],['Change loadout',setup],['Back to title',exit]]);}
 function draw(t){const s=S(),g=G(),b=A.box;if(!s)return;
 for(const f of g.segments){b(f.x,-18,f.z,f.w,36,f.d,'#555b5d');for(let z=f.z-f.d/2+30,row=0;z<f.z+f.d/2;z+=100,row++){b(f.x,0.3,z,f.w-8,.6,2,'#42494b');for(let x=f.x-f.w/2+40+(row%2)*70;x<f.x+f.w/2;x+=140)b(x,.3,z-48,1.5,.6,94,'#42494b');}}
 const masonry=o=>{b(o.x,(o.y0+o.h)/2,o.z,o.w,o.h-o.y0,o.d,o.color);for(let y=o.y0+48;y<o.h;y+=48)b(o.x,y,o.z,o.w+.3,2,o.d+.3,'#30383b');};
 for(const o of s.walls){if(o===s.cellGate){if(!s.cells)for(let x=o.x-110;x<o.x+120;x+=22)b(x,82,o.z,6,164,6,'#272e31');continue;}masonry(o);}
 for(const o of s.plats){b(o.x,o.h-13,o.z,o.w,26,o.d,o.color);b(o.x,o.h-2,o.z,o.w-5,4,o.d-5,'#9b9987');}
 // A deep stone shaft makes the maintenance gap legible, not a floating obstacle course.
 b(725,-150,-370,830,28,1000,'#232d31');
 for(const x of [390,650]){b(x,5,160,40,90,44,'#495858');}for(const z of [-25,-190])b(650,60,z,36,210,44,'#3f5053');
 for(const o of s.art)b(o.x,o.y,o.z,o.w,o.h,o.d,o.c);
 for(const o of [s.lift,s.cage]){b(o.x,o.h-10,o.z,o.w,20,o.d,'#493e2e');for(let x=o.x-o.w/2+12;x<o.x+o.w/2;x+=25)b(x,o.h-2,o.z,22,5,o.d-8,'#9b8260');for(const x of [-1,1]){b(o.x+x*(o.w/2-6),o.h+35,o.z,7,70,7,'#403d32');b(o.x+x*(o.w/2-6),(o.h+535)/2,o.z,4,535-o.h,4,'#a99a75');}}
 if(!s.snag){b(650,250,-745,105,14,20,'#b89552');b(650,270,-745,12,50,12,'#d6ad60');}
 if(!s.locket)b(-405,28,-750,16,8,16,'#f1cf70');
 if(!s.shard)b(1000,360+Math.sin(t*2)*5,-300,18,30,18,'#bd80f0');
 b(310,28,-585,28,56,28,'#94774c');b(355,s.lift.h+28,-785,16,56,16,'#b18c53');
 for(const n of s.actors){const moving=s.escort==='walking';if(!window.__npc3dDrawn?.(n.id))A.person(n,t,moving);}
 }
 function install(api){A=api;const style=document.createElement('style');style.textContent='.keep-menu{max-width:660px!important}.keep-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left}.keep-fields label{display:flex;flex-direction:column;gap:6px;color:#dfd5bb}.keep-fields select,.keep-fields input{width:100%;min-width:0;padding:10px;border:1px solid #756648;border-radius:6px;background:#172029;color:#fff;font:inherit}.keep-check{display:block;margin:16px 0}#keep-beta-hud{position:fixed;top:110px;right:16px;max-width:260px;padding:12px;background:#15212de8;border:1px solid #9c875c;border-radius:8px;color:#f1e4c4;z-index:12;font:13px sans-serif}#keep-beta-hud span,#keep-beta-hud label{display:block;margin-top:7px}#keep-beta-hud button{margin-top:8px;padding:7px 12px;color:#fff;background:#51442e;border:1px solid #8a754e;border-radius:5px}#keep-beta-hud progress{width:100%;accent-color:#6ac484}@media(max-width:600px){#keep-beta-hud{top:96px;right:6px;max-width:175px;font-size:11px;padding:7px}.keep-fields{gap:10px}}';document.head.append(style);}
 return {install,setup,start,pause,target,captiveHit,tick,movePlatforms,interact,draw,death,hud,selectStop,get config(){return {...config};}};
})();
