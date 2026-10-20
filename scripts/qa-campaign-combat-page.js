/* Local-only staged combat review. Storage isolated by the builder, never live saves. */
progressQA.button('Audit all campaign combat sections',async()=>{
 const {fresh,until,check,results,write,pump}=progressQA,b=await fresh('warrior'),rows=[];b.skipTrial();await until(()=>!BF_LOADING.active);
 for(let zone=0;zone<8;zone++)for(let area=0;area<2;area++){
  b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(zone);await until(()=>!BF_LOADING.active);
  if(area){b.G.area=area;b.loadArea();await until(()=>!BF_LOADING.active);}
  const G=b.G;b.G.p.hp=10000;b.G.p.maxHp=10000;for(const e of G.enemies)e.stunT=100;
  pump(b,2);const troops=G.enemies.filter(e=>e.briarRole||e.campaignRole),specialists=G.enemies.filter(e=>!e.boss&&!e.ceKind&&!e.dummy);
  const row={zone,area,total:G.enemies.length,troops:troops.length,kits:[...new Set(troops.map(e=>e.ceKind))],specialists:[...new Set(specialists.map(e=>e.type))],mode:b.mode,unconverted:G.enemies.filter(e=>['grunt','caster'].includes(e.type)&&!e.ceKind).map(e=>({type:e.type,spec:e.spec,flags:Object.keys(e).filter(k=>/guard|escort|wave|rescue|officer|kingAdd|furnace|library|prison/i.test(k)&&e[k])}))};
  check('Campaign section loaded '+zone+'/'+area,G.zone===zone&&G.area===area&&b.mode==='play');
  check('Tactical enemies exist '+zone+'/'+area,troops.length>0);rows.push(row);results.sections=rows;write();
 }
 return {status:'PASS',sections:rows};
});
progressQA.button('Verify real combat hit evade cover and guest warnings',async()=>{
 const {fresh,until,check,results,write,place,pump}=progressQA,b=await fresh('warrior'),rows=[];b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(2);await until(()=>!BF_LOADING.active);
 const G=b.G;G.enemies=[];G.projectiles=[];const p=G.p;
 // Stage on the actual supported campaign entrance floor, without changing the map.
 const x=p.x,z=p.z-150,y=b.floorAt(x,z,18,p.y+20);check('Review floor exists',Number.isFinite(y));
 for(const kind of ['briar_runner','briar_guard','briar_hex','keep_lance','cliff_lunge','frost_ring','ember_fan','ember_ring','coast_volley','palace_cross','dusk_curse']){
  const e=b.spawnEnemy('grunt',x,z,false),k=BFCampaignElites.kits[kind];G.enemies=[e];
  Object.assign(e,{x,y,z,sx:x,sy:y,sz:z,hp:1000,maxHp:1000,active:true,dropT:0,role:null,spec:null,kind:'walk',shot:null,ceKind:kind,campaignRole:kind.startsWith('briar')?null:kind.includes('ring')||kind.includes('volley')||kind.includes('curse')||kind.includes('cross')?'caster':'runner',briarRole:kind.startsWith('briar')?kind.slice(6):null,stunT:0,hurtKbX:0,hurtKbZ:0});
  const target={x,y,z:z+100,hp:1000,r:p.r};
  function reset(){Object.assign(e,{x,y,z,ceState:'hunt',ceClock:0,ceSerial:(e.ceSerial||0)+1,ceHomeX:x,ceHomeZ:z,ceHomeY:y,briarHomeX:x,briarHomeZ:z,briarHomeY:y,_ceSeen:0});Object.assign(p,{...target,hp:1000,maxHp:1000,invuln:0,hurtFlash:0,vx:0,vz:0,vy:0,onGround:true});}
  reset();b.updateCampaignElite(e,.016,p,0);check('Actual tell '+kind,e.ceState==='wind');
  const attackOrigin={x:e.ceX,z:e.ceZ};let landed=0;
  for(let n=0;n<250&&e.ceState!=='recover';n++){p.invuln=0;const hp=p.hp;b.updateCampaignElite(e,.016,p,0);landed+=hp-p.hp;}
  check('Standing in danger takes damage '+kind,landed>0);
  reset();b.updateCampaignElite(e,.016,p,0);p.x=x+500;for(let n=0;n<250&&e.ceState!=='recover';n++)b.updateCampaignElite(e,.016,p,0);check('Moving outside avoids damage '+kind,p.hp===1000);
  reset();const wall={x,z:z+50,y0:y,w:100,d:15,h:y+140};G.obstacles.push(wall);G._obsDirty=true;for(let n=0;n<90;n++)b.updateCampaignElite(e,.016,p,0);check('Solid wall blocks new tells '+kind,e.ceState==='hunt');G.obstacles.splice(G.obstacles.indexOf(wall),1);G._obsDirty=true;
  reset();Object.assign(b.MP,{active:true,isHost:false,zone:G.zone,peers:{},hostConn:{send(){}}});Object.assign(e,{ceState:'strike',ceClock:k.strike,ceX:x,ceY:y,ceZ:z,ceDX:0,ceDZ:1,_ceWarnSerial:-1});const packet=[e.mid,b.MP.typeIdx('grunt'),x,z,1000,1000,1,BFCampaignElites.snapshot(e)];e.ceKind=null;e.campaignRole=null;e.briarRole=null;b.MP.applyEnemies([packet],[]);check('Actual co-op packet carries attack phase '+kind,e.ceKind===kind&&e.ceState==='strike');b.updateCampaignElite(e,.016,p,0);check('Missed guest warning harmless '+kind,p.hp===1000);b.MP.active=false;
  rows.push({kind,landed,evaded:true,cover:true,guestMissedWarning:true,attackOrigin});results.combat=rows;write();
 }
 G.enemies=[];b.openHub();await until(()=>!BF_LOADING.active);check('Return hub HP/mana restored',b.G.p.hp===b.effMaxHp(b.G.p)&&b.G.p.mana===b.G.p.maxMana);return {status:'PASS',rows};
});
progressQA.button('Review Keep combat warning',async()=>{
 const {fresh,until,check,results,write,pump,place}=progressQA,b=await fresh('warrior');b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(2);await until(()=>!BF_LOADING.active);pump(b,2);
 const e=b.G.enemies.find(e=>e.campaignRole==='runner'||e.campaignRole==='guard');check('Keep troop',e);for(const q of b.G.enemies)q.stunT=99999;place(b,e,120);Object.assign(e,{active:true,dropT:0,stunT:0,ceState:'hunt',ceClock:0});b.updateCampaignElite(e,.016,b.G.p,0);e.stunT=99999;b.render(1);results.visual={kind:e.ceKind,warning:e.ceState};write();return results.visual;
});

progressQA.button('Review Palace cross warning',async()=>{
 const {fresh,until,pump,place,check,results,write}=progressQA,b=await fresh('mage');b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(6);await until(()=>!BF_LOADING.active);pump(b,2);
 const e=b.G.enemies.find(e=>e.ceKind==='palace_cross');check('Palace arcanist',e);for(const q of b.G.enemies)q.stunT=99999;place(b,e,150);Object.assign(e,{active:true,dropT:0,stunT:0,ceState:'hunt',ceClock:0});b.updateCampaignElite(e,.016,b.G.p,0);e.stunT=99999;b.render(1);results.visual={kind:e.ceKind,warning:e.ceState};write();return results.visual;
});
progressQA.button('Verify Keep boss action cue',async()=>{
 const {fresh,until,results,write,check,pump}=progressQA,b=await fresh('warrior');b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(2);await until(()=>!BF_LOADING.active);b.G.area=-1;b.loadArea();await until(()=>!BF_LOADING.active);
 const e=b.G.boss;check('Fallen encounter exists',e?.fallenDuel);progressQA.place(b,e,280);Object.assign(b.G.p,{hp:10000,maxHp:10000});Object.assign(e,{active:false,dropT:.001,fallState:'hunt',fallClock:0,fallTurn:0,stunT:0});pump(b,4);
 const text=document.getElementById('bosscue').textContent;check('Actual boss bar explains the thrust',text.includes('Thrust')&&text.includes('pillar')&&document.getElementById('bosshpwrap').classList.contains('on'));e.stunT=99999;
 results.bossCue={zone:2,state:e.fallState,text};write();return results.bossCue;
});
