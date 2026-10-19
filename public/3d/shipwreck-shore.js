/* Shipwreck Shore: shared story progression, individual discoveries, authored terrain. */
(function(root){'use strict';
const f=(s,k)=>!!s.flags['sc.'+k];
const paths={beach:[[0,500,30],[0,-350,30],[0,-1400,30],[0,-2550,30]],wreck:[[-100,-500,30],[-800,-650,50],[-1350,-1250,110],[-1750,-1820,240],[-1370,-2320,300],[-760,-2320,130],[0,-2200,30]],lookout:[[0,-800,30],[850,-650,100],[1400,-1150,220],[1350,-1900,350],[950,-2440,200],[0,-2550,30]],cave:[[850,-650,100],[1840,-440,30],[2350,-1100,0],[2230,-1950,0],[1780,-2250,200],[950,-2440,200]],rose:[[0,-2550,30],[-750,-2820,50],[-1320,-3400,130],[-850,-3970,80],[0,-4050,30],[0,-2550,30]],cache:[[-1320,-3400,130],[-2130,-3540,200],[-2370,-2870,100],[-1750,-1820,240]]};
const BALLISTA={x:-1510,z:-3310,y:130,eye:{x:-1410,y:276,z:-3285},target:{x:-2140,y:306,z:-3400}};
const HULL={x:-1430,z:-2230,y:300,lever:{x:-1540,z:-2090,y:300},period:1.1,window:.44};
function hullPhase(G,remote){return Math.sin(((remote?.clock??G.shore.clock)||0)*HULL.period);}
function hullReady(G,remote){return Math.abs(hullPhase(G,remote))<=HULL.window;}
function hullMiss(G){if(G?.shore)G.shore.hullMissAt=G.shore.clock;}
const TARGET_YAW=Math.atan2(BALLISTA.target.x-BALLISTA.eye.x,BALLISTA.target.z-BALLISTA.eye.z);
const TARGET_PITCH=Math.atan2(BALLISTA.target.y-BALLISTA.eye.y,Math.hypot(BALLISTA.target.x-BALLISTA.eye.x,BALLISTA.target.z-BALLISTA.eye.z));
function aimHit(yaw,pitch){return Math.abs(yaw-TARGET_YAW)<.056&&Math.abs(pitch-TARGET_PITCH)<.05;}
let aimUI=null;
function quest(s){return !f(s,'met')?'Speak to Otto beside the boat':!f(s,'boat.ready')?(['rudder','sail','rope'].some(k=>(s.items['sc.'+k]||0)>0)?'Fit recovered parts at Otto’s workbench':!f(s,'installed.rudder')?'Find a rudder in the tilted wreck':!f(s,'installed.sail')?'Take sailcloth from the occupied lookout':'Find dry rope in the storage cave'):!f(s,'depart')?'Board the repaired boat beside Otto':'Survive the crossing to Thunder Cliffs';}
function status(G){return {guards:G.enemies.filter(e=>e.shoreLookout&&!e.dead&&e.hp>0).length,clock:G.shore.clock};}
function available(key,G,remote){return (key!=='sc.sail'||!(remote||status(G)).guards)&&(!['sc.ballista','sc.code.fire'].includes(key)||!G.storyState?.flags['sc.code.open'])&&(key!=='sc.code.claim'||!!G.storyState?.flags['sc.code.open'])&&(key!=='sc.hull.release'||!G.storyState?.flags['sc.hull.open']&&hullReady(G,remote));}
function build({G,plat,spawn}){
 for(const key of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','qmarks','dens','chests','healpads','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','gates','keys','doors','plates'])G[key]=[];
 Object.assign(G,{boss:null,haz:null,canyonWind:null,thorns:[],vents:[],phasers:[],debris:[],lights:[],npc:null,secret:null,secretTrigger:null,waystone:null,dashSign:null,beam:null,collapse:[],optionalMissions:[],_midSeq:0,portal:null,bonusPortal:null,bonusActive:false,vertical:true});
 G.shore={clock:0,walks:{},hullMissAt:-100,openAt:-100,ballista:{yaw:TARGET_YAW+.14,pitch:TARGET_PITCH-.075,aiming:false,shot:null}};G.areaName='Storm Coast - Shipwreck Shore';G.campaignLayout={revision:2016,zone:'storm',area:0};
 const floor=(x,z,y,w,d,extra={})=>plat(x,z,y,w,d,{slab:40,checkpoint:true,...extra});
 for(const [id,points]of Object.entries(paths)){const walk=[];for(let j=1;j<points.length;j++){
  const a=points[j-1],b=points[j],jump=id==='wreck'&&j===2,n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/(jump?155:105),Math.abs(b[2]-a[2])/(jump?25:12)));
  for(let i=0;i<=n;i++){const p=a.map((v,k)=>v+(b[k]-v)*i/n);floor(...p,jump?90:id==='cache'?180:300,jump?90:id==='cache'?180:300,{shoreTimber:id==='wreck'});if(jump)floor(p[0],p[1],p[2]-80,210,210);walk.push(p);}
 }G.shore.walks[id]=walk;}
 for(const [name,x,z,y,w,d]of [['Work beach',0,-450,30,820,1900],['Broken hull',-1510,-1830,240,500,500],['Rudder deck',-1370,-2320,300,520,520],['Occupied lookout',1350,-1900,350,620,600],['Dry storage cave',2300,-1380,0,650,1550],['Lower hatch',-1860,-1220,40,500,500],['Rose\'s wreck',-1320,-3400,130,750,650],['Lantern wreck',-2130,-3540,200,630,660],['Crew memorial',0,-4050,30,650,480]]){floor(x,z,y,w,d,{shoreTimber:name==='Broken hull'||name==='Rudder deck'});G.rooms.push({name,x,z,y,w,d,monsters:[],encounter:false,cleared:true});}
 // Lower crawlspace has its own route under the leaning hull, not an invisible pickup.
 G.shore.walks.hatch=[[0,-1500,30],[-700,-1550,30],[-1250,-1800,40],[-1860,-1720,40],[-1860,-1250,40]];
 for(let j=1;j<G.shore.walks.hatch.length;j++){const a=G.shore.walks.hatch[j-1],b=G.shore.walks.hatch[j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/90);for(let i=0;i<=n;i++)floor(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,a[2]+(b[2]-a[2])*i/n,150,170);}
 // Short jumping return from the upper wreck, with a broad low catch beach.
 floor(-790,-1760,20,900,550);G.shore.jumps=[];
 for(let i=0;i<5;i++){const p=[-1090+i*150,-1880,260-i*42];floor(...p,110,120);G.shore.jumps.push(p);}
 for(const [x,z,y,w,d,h]of [[-2700,-2850,-80,200,2300,500],[2820,-1430,-80,180,2200,600],[2630,-2280,0,300,100,420],[1890,-1220,0,110,800,330],[2750,-1150,0,110,1050,380],[1400,-2210,300,650,90,130],[-1750,-3890,130,70,300,180]])G.walls.push({x,z,y0:y,w,d,h,c:'#405158',caveWall:true});
 G.shore.hatch={x:-1860,z:-1460,y0:40,w:500,d:70,h:150,shoreHatch:true,c:'#67482f'};G.walls.push(G.shore.hatch);
 G.walls.push({x:BALLISTA.x,z:BALLISTA.z,y0:BALLISTA.y,w:145,d:90,h:38,c:'#725039',shoreBallista:true});
 for(const [x,z,y,w,d,h]of [[-1500,-1850,240,570,950,180],[-1320,-3400,130,820,700,170],[-2140,-3510,200,530,670,120]])G.deco.push({kind:'shoreWreck',x,z,y0:y,w,d,h});
 for(const [x,z,y]of [[1350,-1900,350],[250,-450,30]])G.deco.push({kind:'shoreShelter',x,z,y0:y,w:260,d:240,h:180});
 for(let i=0;i<30;i++)G.deco.push({kind:'shoreRock',x:(i%2?-1:1)*(2800+(i%4)*100),z:400-i*180,y0:-80,w:180+i%3*100,d:220,h:160+i%5*80});
 for(const d of G.deco)d.c=d.kind==='shoreRock'?'#405359':'#98734c';
 G.storyNpcs=[{id:'otto',name:'Otto',x:170,z:-300,y:30},{id:'rose',name:'Captain Rose',x:-160,z:-2680,y:30}];
 const obj=(key,label,x,z,y,kind)=>({key:'sc.'+key,label,x,z,y,kind});
 G.storyObjects=[obj('rudder','Take the rudder',-1390,-2420,300,'rudder'),obj('sail','Take the sailcloth',1480,-1900,350,'sail'),obj('drain','Open the outside drain',2230,-690,0,'lever'),obj('latch','Lift the dry-room latch',2390,-1190,0,'lever'),obj('rope','Take the dry rope',2370,-1640,0,'rope'),obj('fit','Fit recovered parts at Otto’s workbench',300,-320,30,'workbench'),obj('bell','Take the ship bell',-1290,-3430,130,'bell'),obj('record','Recover the crew logbook',-1120,-3600,130,'book'),obj('memorial','Set the crew board upright',100,-4100,30,'memorial'),obj('hull.note','Read the hull repair marks',-1270,-2110,300,'book'),obj('hull.release','Pull the cargo release at the gold mark',HULL.lever.x,HULL.lever.z,HULL.lever.y,'hullLever'),obj('code.note','Inspect the iron-bound chest',-2140,-3400,200,'chest'),obj('code.claim','Take Stormshot from the opened chest',-2140,-3400,200,'chestclaim'),obj('ballista','Aim the wreck ballista',BALLISTA.x,BALLISTA.z,BALLISTA.y,'ballista'),obj('code.fire','Release the chest binding',BALLISTA.x,BALLISTA.z,BALLISTA.y,'ballistafire'),obj('board','Board the repaired boat',-180,-210,30,'board')];
 for(const o of G.storyObjects)if(['sc.ballista','sc.code.fire'].includes(o.key))o.range=165;
 G.storyObjects.find(o=>o.key==='sc.hull.release').blockedText='The cargo is not over the gold mark yet. Watch it swing across, then pull the release.';
 G.storyObjects.find(o=>o.key==='sc.sail').blockedLabel='Clear the lookout patrol first';G.storyObjects.find(o=>o.key==='sc.sail').blockedText='The patrol still controls the sailcloth.';
 for(const [x,z,y]of [[-210,-550,36],[1235,-643,79],[-278,-2752,40]])G.healpads.push({x,z,y,r:31,charge:1,_acc:0});
 for(const [type,x,z,y,guard]of [['grunt',-950,-850,65],['caster',-1670,-1800,240],['grunt',-720,-2200,120],['grunt',1390,-1700,350,true],['caster',1210,-1840,350,true],['grunt',1550,-2040,350,true],['slime',2350,-1030,0],['slime',2250,-1810,0],['grunt',-1060,-3190,115],['caster',-2050,-3480,200],['grunt',0,-3830,30]]){const e=spawn(type,x,z,false);e.y=y;e.shoreLookout=!!guard;}
 // Coastal art gives wall height above its base; collision and reach use the same convention.
 for(const wall of G.walls)wall.courtWall=true;
 G.bounds={minX:-2900,maxX:2950,minZ:-4400,maxZ:900};G.progressEnd=-4300;G.startPos={x:0,z:490,y:30};G.lastSafe={...G.startPos};G.portalPos={x:-180,z:-210,y:30};G.goalPos={...G.portalPos};Object.assign(G.p,{...G.startPos,vy:0});
}
function sync({G,state:s,plat}){if(s.notes['sc.hull'])s.notes['sc.hull'].text='The cargo cage swings over a painted strike mark. Pull the release as it crosses the mark. Its weight will lift the lower hatch. The broken upper deck can be crossed with ordinary jumps; lower boards catch a miss.';
 if(s.notes['sc.code'])s.notes['sc.code'].text='The chest is held by an iron clasp above its lid. A ship ballista on Rose’s Wreck points across the gap. Aim at the bright clasp and fire; a miss can be retried.';
 if(f(s,'code.open')&&aimUI?.G===G){const msg=aimUI.node?.querySelector('[data-aim-result]');if(msg)msg.textContent='The iron binding broke. Cross back to the chest.';}
 if(f(s,'hull.open')&&!G.shore.hatchOpen){G.shore.openAt=Number.isFinite(G.shore.releaseAt)?G.shore.releaseAt:-100;G.shore.hatchOpen=true;G.walls=G.walls.filter(w=>!w.shoreHatch);G.storyObjects=G.storyObjects.filter(o=>o.key!=='sc.hull.release');G.shore.hatchRamp=[];for(let i=0;i<=6;i++){const q=[-1860,-1600+i*45,40+i*3];plat(...q,145,150,{slab:18,checkpoint:true,shoreTimber:true});G.shore.hatchRamp.push(q);}}
 for(const [part,x,z,y]of [['rudder',-600,-1350,45],['sail',650,-1300,45],['rope',1500,-700,70]])if(s.items['sc.'+part]&&!G.shore[part+'return']){G.shore[part+'return']=true;for(let i=0;i<=6;i++)plat(x*(1-i/6),z+(i/6)*(-850-z),y+(30-y)*i/6,170,190,{slab:28,checkpoint:true});}
 G.shore.parts=['rudder','sail','rope'].map(k=>f(s,'installed.'+k));
}
function shards(s){return f(s,'hull.open')?[{id:'SC-01',x:-1930,z:-1230,y:40}]:[];}
function draw({G,state:s,bx},t){
 for(const o of G.storyObjects){if(root.BFCampaignObjects?.drawn(o))continue;if(['workbench','ballista','ballistafire','chestclaim','hullLever'].includes(o.kind)||s.flags['event.'+o.key]&&!['memorial','chest'].includes(o.kind))continue;const y=o.y;
  if(o.kind==='book'){bx(o.x,y+24,o.z,70,45,50,'#64513b');bx(o.x,y+49,o.z,60,4,40,'#ddcca3');}
  else if(o.kind==='rope'){for(let i=0;i<3;i++){bx(o.x,y+10+i*9,o.z,60-i*5,7,48-i*5,'#c3a775');}}
  else if(o.kind==='sail'){bx(o.x,y+16,o.z,90,25,55,'#dbcca8');for(const x of [-30,30])bx(o.x+x,y+30,o.z,8,5,57,'#5a695e');}
  else if(o.kind==='rudder'){bx(o.x,y+20,o.z,35,15,100,'#96643d');bx(o.x,y+20,o.z-80,12,14,80,'#6f5037');}
  else if(o.kind==='bell'){bx(o.x,y+32,o.z,38,50,38,'#ad8d4f');bx(o.x,y+10,o.z,54,12,48,'#c3a965');}
  else if(o.kind==='memorial'){bx(o.x,y+52,o.z,100,80,12,'#876444');for(let j=0;j<4;j++)bx(o.x,y+70-j*12,o.z+8,65-j*7,3,2,'#ded4b5');}
  else if(o.kind==='chest'){const opened=f(s,'code.open');bx(o.x,y+30,o.z,95,55,60,opened?'#6b806e':'#96663e');bx(o.x,y+(opened?77:61),o.z-14,100,12,65,'#b58f58');for(const x of [-30,30])bx(o.x+x,y+(opened?5:30),o.z,9,opened?14:68,64,'#566775');}
  else if(o.kind!=='board'){bx(o.x,y+25,o.z,48,50,48,'#4d5d60');bx(o.x,y+63,o.z,8,35,8,'#cab780');if(o.kind.startsWith('code'))for(let i=0;i<+o.kind.slice(-1);i++)bx(o.x-16+i*10,y+30,o.z+25,5,15,3,'#efddb0');}
 }
 // Wind-swept salvage cargo, one marked strike point, and an actual line to the lower hatch.
 const open=f(s,'hull.open'),clock=G.shore.remote?.clock??G.shore.clock,phase=Math.sin(clock*HULL.period),ready=Math.abs(phase)<=HULL.window;
 const elapsed=Math.max(0,clock-G.shore.openAt),impact=open?Math.min(1,elapsed/.55):0;
 const loadX=open?HULL.x:HULL.x+phase*150,loadY=open?397-impact*65:397+Math.abs(phase)*19;
 if(!root.BFCampaignCraft?.has('salvage-crane')){for(const x of [-1630,-1230]){bx(x,405,-2240,24,205,27,'#664830');bx(x,312,-2240,48,20,54,'#3c4647');bx(x,512,-2240,65,17,60,'#b58b5a');}
 bx(HULL.x,516,-2240,445,23,46,'#6a4b32');bx(HULL.x,531,-2240,455,8,48,'#c79b5d');
 for(const x of [-1620,-1240])bx(x,489,-2240,11,55,13,'#39494c');}
 // The hanging load and its chain are not footing. Cut away when they hide the hero;
 // it stays fully visible from the release handle, where timing matters.
 const cargoBlocksView=root.BFCameraOcclusion?.blocks(G,{x:(HULL.x+loadX)/2,z:-2240,w:Math.abs(loadX-HULL.x)+90,d:85},loadY-48,523,root.__BF_META?.().camMode||'far',24);
 if(!cargoBlocksView){
 for(let i=0;i<10;i++){const q=i/9;bx(HULL.x+(loadX-HULL.x)*q,508+(loadY-508)*q,-2240,7,15,7,'#d0b881');}
  bx(loadX,loadY,-2240,76,78,70,'#3d4748');for(const dx of [-27,27]){bx(loadX+dx,loadY,-2240,8,82,75,'#a3784c');bx(loadX+dx,loadY+38,-2240,14,8,81,'#c4a26c');}
  bx(loadX,loadY-42,-2240,84,11,78,'#594531');bx(loadX,loadY+43,-2240,84,10,78,'#c8a66d');
 }
 bx(HULL.x,303,-2145,125,5,17,'#dfbe79');bx(HULL.x,330,-2163,92,8,56,'#d4b06a');for(const dx of [-38,0,38])bx(HULL.x+dx,336,-2134,12,5,8,'#fff0b6');
 const miss=clock-G.shore.hullMissAt<.48,mark=open?'#c7e4c3':miss?'#e96d56':ready?'#fce092':'#826a4c';
 bx(HULL.x,355+impact*105,-2190,360,28,36,'#9b7449');bx(HULL.x,379+impact*105,-2180,116,12,43,mark);
 bx(HULL.x,412+impact*105,-2156,32,78,12,mark);bx(HULL.x,451+impact*105,-2154,70,7,15,'#f9e3a2');
 for(let j=0;j<8;j++){const q=j/7;bx(-1600-q*260,388+q*55+impact*55,-2110+q*580,9,9,87,'#d2b47a');}
 bx(HULL.lever.x,313,HULL.lever.z,48,26,49,'#4b5a5b');bx(HULL.lever.x,347,HULL.lever.z-12,11,58,12,open?'#c5e1bc':ready?'#e9c877':'#ac8860');bx(HULL.lever.x,374,HULL.lever.z-12,38,10,18,'#443b30');
 if(open)for(const q of G.shore.hatchRamp||[]){for(const side of [-1,1]){bx(q[0]+side*68,q[2]+19,q[1],7,36,7,'#896d4c');bx(q[0]+side*68,q[2]+35,q[1],8,6,56,'#d0b277');}bx(q[0],q[2]+2,q[1],122,3,9,'#e4c28a');}
 // Rose's salvage ballista: oak stock, braced bow limbs, rope drum and iron bolt.
 const b=BALLISTA,opened=f(s,'code.open'),turn=G.shore.ballista,shot=turn?.shot,shotAge=shot?Math.max(0,performance.now()/1000-shot.at):Infinity,visualOpen=opened&&(!shot?.hit||shotAge>=.52);
 bx(b.x,b.y+12,b.z,160,24,115,'#725039');for(const dx of [-68,68]){bx(b.x+dx,b.y+29,b.z,22,35,120,'#3f474a');bx(b.x+dx,b.y+52,b.z-42,18,18,18,'#c2a367');}
 bx(b.x-35,b.y+57,b.z,185,23,26,'#986b43');bx(b.x-112,b.y+58,b.z,18,85,18,'#a88153');bx(b.x+68,b.y+56,b.z,16,52,16,'#a88153');
 for(let j=0;j<8;j++){const q=j/7;bx(b.x-44-q*106,b.y+67,b.z+(q-.5)*45,16,8,8,'#c5a570');bx(b.x-44-q*106,b.y+61,b.z-(q-.5)*45,16,7,7,'#c5a570');}
 bx(b.x-120,b.y+69,b.z,110,9,10,'#4b565a');bx(b.x-177,b.y+69,b.z,20,16,16,'#c7d0c5');
 // The target lives above the lid, not on a number pad. Its broken state is visible from both wrecks.
 const c=b.target;bx(c.x,c.y-70,c.z,15,62,12,'#667074');bx(c.x,c.y+63,c.z,86,12,12,visualOpen?'#5c6664':'#d0ad62');
 for(let i=0;i<10;i++){const a=i*Math.PI*2/10;bx(c.x+Math.cos(a)*32,c.y+Math.sin(a)*32,c.z+11,12,12,8,visualOpen?'#596462':'#ffd685');}
 if(!visualOpen){for(const dx of [-42,42])bx(c.x+dx,261,c.z,8,112,14,'#56636a');bx(c.x,312,c.z,95,9,15,'#59666c');}
 if(shot&&shotAge<.7){const u=.12+.88*Math.min(1,shotAge/.52),end=shot.hit?c:shot.end;bx(b.eye.x+(end.x-b.eye.x)*u,b.eye.y+(end.y-b.eye.y)*u,b.eye.z+(end.z-b.eye.z)*u,10,4,4,shot.hit?'#f7d993':'#e0b578');if(u>.85)for(let i=0;i<6;i++){const a=i*Math.PI/3;bx(end.x+Math.cos(a)*u*27,end.y+Math.sin(a)*u*27,end.z,4,4,4,shot.hit?'#ffe8aa':'#b09d75');}}
}
function camera(G){if(!aimUI||aimUI.G!==G||!G.shore?.ballista?.aiming)return null;const {yaw,pitch}=G.shore.ballista,eye=BALLISTA.eye,cp=Math.cos(pitch);return {eye,look:{x:eye.x+Math.sin(yaw)*cp*900,y:eye.y+Math.sin(pitch)*900,z:eye.z+Math.cos(yaw)*cp*900}};}
function closeAim(){if(!aimUI)return;const old=aimUI;aimUI=null;old.G.shore.ballista.aiming=false;root.document?.body.classList.remove('shore-ballista-aim');old.node?.remove();root.removeEventListener?.('keydown',old.keys,true);if(old.pointerUp)root.removeEventListener?.('pointerup',old.pointerUp);old.ctx.resume?.();}
function openAim(G,ctx){if(!G.shore||!root.document||f(ctx.getState(),'code.open'))return false;closeAim();const turn=G.shore.ballista;turn.aiming=true;ctx.enter?.();
 const node=root.document.createElement('section');node.id='shoreBallistaAim';node.setAttribute('aria-label','Shipwreck ballista sights');node.style.cssText='position:fixed;inset:0;z-index:80;pointer-events:none;color:#fff2d7;font:600 16px/1.4 system-ui,sans-serif;text-shadow:0 2px 5px #121a20';
 node.innerHTML='<style>body.shore-ballista-aim #questbox,body.shore-ballista-aim #storycard,body.shore-ballista-aim #journalNotice{display:none!important}</style><div data-aim-pad style="position:absolute;inset:4% 3% 135px;cursor:crosshair;pointer-events:auto;touch-action:none"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:45px;color:#ffe4a2;filter:drop-shadow(0 0 6px #000)">⊕</span></div><div style="position:absolute;left:50%;bottom:18px;transform:translateX(-50%);width:min(650px,94vw);box-sizing:border-box;padding:12px 16px;background:#15212ee8;border:2px solid #bca063;border-radius:12px;pointer-events:auto;text-align:center"><strong>Rose’s wreck ballista</strong><div data-aim-result style="font-size:14px;margin:4px 0 9px">Drag to aim at the bright iron clasp. Arrow keys or right stick adjust the sight.</div><button data-aim-fire type="button" style="padding:10px 24px;margin:2px;border:1px solid #ffdb83;border-radius:8px;background:#a56a24;color:#fff;font-weight:800;cursor:pointer">Fire · E / Attack</button><button data-aim-exit type="button" style="padding:10px 24px;margin:2px;border:1px solid #b9c1c2;border-radius:8px;background:#394957;color:#fff;font-weight:800;cursor:pointer">Leave · Esc / Dodge</button></div>';
 root.document.body.append(node);root.document.body.classList.add('shore-ballista-aim');aimUI={G,ctx,node,keys:null,pointerUp:null};const pad=node.querySelector('[data-aim-pad]'),result=node.querySelector('[data-aim-result]');let last=null;
 function steer(dx,dy){turn.yaw=Math.max(TARGET_YAW-.3,Math.min(TARGET_YAW+.3,turn.yaw+dx*.0017));turn.pitch=Math.max(TARGET_PITCH-.22,Math.min(TARGET_PITCH+.22,turn.pitch-dy*.0017));}
 function fire(){if(!aimUI||aimUI.G!==G)return;if(f(ctx.getState(),'code.open')){result.textContent='The binding is already broken. Cross back to the chest.';return;}const hit=aimHit(turn.yaw,turn.pitch),d=Math.hypot(BALLISTA.target.x-BALLISTA.eye.x,BALLISTA.target.z-BALLISTA.eye.z),cp=Math.cos(turn.pitch),end={x:BALLISTA.eye.x+Math.sin(turn.yaw)*cp*d,y:BALLISTA.eye.y+Math.sin(turn.pitch)*d,z:BALLISTA.eye.z+Math.cos(turn.yaw)*cp*d};turn.shot={at:performance.now()/1000,hit,end};result.textContent=hit?'The bolt caught the clasp! The chest binding breaks.':'The bolt missed. Drag the sight toward the bright clasp and fire again.';if(hit)ctx.fire?.();}
 aimUI.steer=steer;aimUI.fire=fire;node.querySelector('[data-aim-fire]').textContent='Fire · '+(root.__BF3?.controlKey('interact')||'Interact')+' / Space';
 pad.addEventListener('pointerdown',e=>{last={x:e.clientX,y:e.clientY,id:e.pointerId};pad.setPointerCapture?.(e.pointerId);e.preventDefault();});pad.addEventListener('pointermove',e=>{if(!last||e.pointerId!==last.id)return;steer(e.clientX-last.x,e.clientY-last.y);last={x:e.clientX,y:e.clientY,id:e.pointerId};});pad.addEventListener('pointerup',()=>{last=null;});node.querySelector('[data-aim-fire]').onclick=fire;node.querySelector('[data-aim-exit]').onclick=closeAim;
 const keys=e=>{if(!aimUI||aimUI.G!==G)return;if((root.__BF3?.keyAction(e.code)==='interact'||['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Escape'].includes(e.code))){e.preventDefault();e.stopImmediatePropagation();if(e.code==='ArrowLeft')steer(-14,0);else if(e.code==='ArrowRight')steer(14,0);else if(e.code==='ArrowUp')steer(0,-14);else if(e.code==='ArrowDown')steer(0,14);else if(e.code==='Escape')closeAim();else fire();}};aimUI.keys=keys;root.addEventListener('keydown',keys,true);return true;}
function control(p,dt){if(!aimUI||!p)return false;const c=root.BFController?.config||{};aimUI.steer(p.rx*(c.invertX?-1:1)*dt*650,p.ry*(c.invertY===false?1:-1)*dt*650);if(p.edge('dodge')||p.edge('pause'))closeAim();else if(p.edge('attack')||p.edge('interact')||p.edge('jump'))aimUI.fire();return true;}
const api={build,sync,status,available,quest,shards,paths,draw,hullPhase,hullReady,hullMiss,openAim,closeAim,camera,aimHit,control,aiming:()=>!!aimUI,ballista:BALLISTA,targetYaw:TARGET_YAW,targetPitch:TARGET_PITCH};root.BFShipwreckShore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
