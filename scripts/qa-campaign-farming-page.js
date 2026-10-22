/* Staged native farming measurements: real input, collision, AI, cooldowns and damage.
   Profiles are explicitly set for comparison; not a fresh-character playthrough. */
(function(){
 const b=__BF3, results=[];
 function profile(zone,area,cid,level=4,rank=4,rarity='common'){
  b.MP.active=false;b.MP.isHost=false;b.MP.peers={};b.MP.conns=[];
  Object.assign(b.meta,{classId:cid,perks:{},hubUpgrades:{},hero:null,bank:null,run:null,gold:0,autoAttack:false,socks:false});
  const cs=b.classState(cid);Object.assign(cs,{rank,xp:0,ch:{},v2:1,sub:null});
  for(let r=2;r<=Math.min(rank,9);r++)if(b.CLASS2[cid]['r'+r])cs.ch[r]=b.CLASS2[cid]['r'+r].a.id;
  b.enterZone(zone);if(area){b.G.area=area;b.loadArea();}
  const g=b.G;let p=b.freshFromSnapshot({level:1,maxHp:100,maxMana:100,stats:{power:1,magPower:1,speed:1,atkSpeed:1,lifesteal:0,defense:0,cdr:0,dodgeCd:.75,crit:0,goldFind:0}});for(let i=1;i<level;i++)b.autoLevelGrow(p);p=b.freshFromSnapshot({...b.snapOf(p),level,tunedLevels:level-1});
  if(rarity!=='common')p.weapon=b.makeWeapon(p.weapon.arche,rarity);
  b.recomputeArmor(p);p.hp=b.effMaxHp(p);p.mana=p.maxMana;
  const w=g.patrolWork;Object.assign(p,{x:w.anchor.x+350,z:w.anchor.z,y:w.anchor.y,onGround:true,yaw:-Math.PI/2});
  g.p=p;g.baseLoadout=b.snapOf(p);g.storyState.quests[w.contract.id]='active';g.storyState.items[w.contract.id]=0;
  b.captureCampaignCheckpoint();g.cam={x:p.x,y:p.y,z:p.z};b.input.attack=b.input.jump=b.input.dodge=false;b.input.jx=b.input.jz=0;
  window.farmPilot={zone,area,cid,level,rank,rarity,start:g.time,startGold:b.meta.gold,startKills:g.kills,hpStart:p.hp,manaMin:p.mana,casts:0,frames:0,trace:[]};
  return state();
 }
 function state(){const g=b.G,p=g.p,r=window.farmPilot;return {...r,time:g.time-r.start,hp:p.hp,maxHp:b.effMaxHp(p),mana:p.mana,maxMana:p.maxMana,kills:g.kills-r.startKills,gold:b.meta.gold-r.startGold,heroLevel:p.level,rankNow:b.classState(b.meta.classId).rank,mode:b.mode,position:[p.x,p.y,p.z],quest:BFCampaignHunts.details(g,g.storyState)};}
 function batch(frames=600){
  const g=b.G,p=g.p,r=window.farmPilot;
  document.getElementById('resBtn')?.click();
  for(let i=0;i<frames&&b.mode==='play'&&p.hp>0&&!p.dead;i++){
   const e=g.enemies.filter(e=>!e.dead&&e.hp>0&&!e.boss&&Math.abs(e.y-p.y)<65&&Math.hypot(e.x-p.x,e.z-p.z)<650).sort((a,c)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(c.x-p.x,c.z-p.z))[0];
   let mx=0,mz=0;b.input.attack=false;
   if(e){const dx=e.x-p.x,dz=e.z-p.z,d=Math.hypot(dx,dz)||1,reach=r.cid==='warrior'?55:260;
    p.yaw=Math.atan2(dx,dz);
    if(d>reach){mx=dx/d;mz=dz/d;}else b.input.attack=!(p.charging&&p.chargeAmt>=.7);
    const wind=g.enemies.find(q=>!q.dead&&q.ceState==='wind'&&q.ceClock<.3&&Math.hypot(q.x-p.x,q.z-p.z)<220);
    if(wind&&p.dodgeCdT<=0){mx=-dz/d;mz=dx/d;b.input.dodgeEdge=true;}
    if(p.skillCd[0]<=0&&d<(r.cid==='warrior'?125:470)&&p.mana>=b.skillManaCost(0)){const before=p.mana;b.useSkill(0);if(p.mana<before)r.casts++;}
    if(mx||mz){const clear=(x,z)=>{const q={...p,x:p.x+x*30,z:p.z+z*30};b.resolveObstacles(q,p.r,null,0);const y=b.floorAt(q.x,q.z,0,p.y+35);return Math.hypot(q.x-(p.x+x*30),q.z-(p.z+z*30))<2&&Number.isFinite(y)&&Math.abs(y-p.y)<35;};
     if(!clear(mx,mz)){let found=false;for(const a of [.65,-.65,1.3,-1.3,1.9,-1.9]){const x=mx*Math.cos(a)-mz*Math.sin(a),z=mx*Math.sin(a)+mz*Math.cos(a);if(clear(x,z)){mx=x;mz=z;found=true;break;}}if(!found)mx=mz=0;}
    }
   }
   b.input.jx=mx;b.input.jz=mz;b.update(1/60);r.frames++;r.manaMin=Math.min(r.manaMin,p.mana);
   if(r.frames%300===0)r.trace.push({time:g.time-r.start,hp:p.hp,mana:p.mana,kills:g.kills-r.startKills});
  }
  b.input.attack=false;b.input.jx=b.input.jz=0;
  const row=state();if(b.mode==='play')b.openPause();results.push(JSON.parse(JSON.stringify(row)));return row;
 }
 window.farmQA={profile,batch,state,results};
})();
