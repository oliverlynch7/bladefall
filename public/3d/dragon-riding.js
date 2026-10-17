/* Sunspire Dragon travel: transient, bounded and independent of character saves. */
window.BFDragonRiding=(()=>{
 const duration=8,height=180,riderOffset=24;
 const finite=Number.isFinite;
 function allowed(g){return !!g&&!g.riftHall&&!g.sparringRoom&&!g.arena&&!g.trial&&!g.side&&!g.endless&&!g.escape&&!g.delve&&!g.bossRush&&!g.bonusActive&&!g.sprintFun&&!g.devKeep&&!g.devBriar&&!g.voyage&&(g.hub||[[0,0],[0,1],[1,0],[1,1],[2,0],[3,0],[4,0],[4,1],[6,0],[7,0]].some(([z,a])=>g.zone===z&&g.area===a));}
 function key(g){return [g.zone,g.area,g.stageIndex,g.hub,g.runSeed,g.p.warpSerial||0].join(':');}
 function sync(g){const p=g.p,a=g.pet;if(!a||a.id!=='sunwing')return;a.mounted=!!p.dragonRide;a.flying=!!p.dragonRide&&!p.onGround;if(!a.mounted)return;Object.assign(a,{x:p.x,y:p.y,z:p.z,yaw:p.yaw,bob:0,breathT:0,breathWind:0});}
 function stop(g,recover=false){const p=g?.p,r=p?.dragonRide;if(!r)return false;if(recover&&r.safe)Object.assign(p,{x:r.safe.x,y:r.safe.y,z:r.safe.z,onGround:true,jumps:0});p.dragonRide=null;p.vx=p.vy=p.vz=0;p.charging=false;p.attackHeld=false;p.chargeAmt=0;p.emote=null;if(g.pet?.id==='sunwing'){g.pet.mounted=false;g.pet.flying=false;g.pet.breathT=0;g.pet.atkT=Math.max(1,g.pet.atkT||0);g.pet.x=p.x-Math.sin(p.yaw)*60;g.pet.z=p.z-Math.cos(p.yaw)*60;g.pet.y=p.y;}return true;}
 function toggle(g,meta,world){const p=g?.p;if(!p||p.dead||p.downed||p.hp<=0)return false;
  if(p.dragonRide){if(!p.onGround){p.dragonRide.landing=true;world.notice('Landing · steer toward solid ground.');return true;}stop(g);world.notice('Dismounted.');return true;}
  if(!meta.petOwned?.includes('sunwing')||meta.petActive!=='sunwing'||g.pet?.id!=='sunwing'||g.pet.dead||g.pet.hp<=0){world.notice('Equip your rescued Sunspire Dragon at the Beastkeeper first.');return false;}
  if(!allowed(g)){world.notice('Dragon riding is available outdoors, outside trials and challenge modes.');return false;}
  if(!p.onGround||p.sitting||Math.hypot(g.pet.x-p.x,g.pet.z-p.z)>180){world.notice('Stand on solid ground near your dragon to mount.');return false;}
  const floor=world.floor(p.x,p.z,p.r,p.y+2);if(!finite(floor)||Math.abs(floor-p.y)>6){world.notice('Find solid ground before mounting.');return false;}
  const probe={...p,hh:105};world.resolve(probe,p.r+12,p.y);if(Math.hypot(probe.x-p.x,probe.z-p.z)>4){world.notice('Your dragon needs more room here.');return false;}
  p.dragonRide={safe:{x:p.x,y:p.y,z:p.z},base:p.y,landing:false,scene:key(g)};g.dragonFuel=finite(g.dragonFuel)?g.dragonFuel:duration;p.vx=p.vy=p.vz=0;p.dodgeTimer=0;p.atkTimer=0;p.charging=false;p.chargeAmt=0;p.attackHeld=false;p.emote=null;p.combatPose=null;sync(g);world.notice('Mounted · hold Jump to fly, release to glide. Dodge descends; Interact lands.');return true;
 }
 function block(e,r,o){if(o.open)return;const dx=e.x-o.x,dz=e.z-o.z,px=o.w/2+r-Math.abs(dx),pz=o.d/2+r-Math.abs(dz);if(px>0&&pz>0){if(px<pz)e.x+=(dx>=0?1:-1)*px;else e.z+=(dz>=0?1:-1)*pz;}}
 function step(g,dt,input,mx,mz,world){const p=g.p,r=p.dragonRide;if(!r)return false;dt=Math.min(.05,Math.max(0,dt));
  if(!allowed(g)||r.scene!==key(g)||p.dead||p.downed||p.hp<=0||g.pet?.id!=='sunwing'||g.pet.dead||g.pet.hp<=0){stop(g,true);return false;}
  input.jumpEdge=false;input.dodgeEdge=false;p.jets=0;p.charging=false;p.attackHeld=false;p.chargeAmt=0;p.atkTimer=0;p.dodgeTimer=0;
  let fuel=Math.max(0,Math.min(duration,g.dragonFuel??duration));
  if(!input.jump)r.needsJumpRelease=false;
  if(p.onGround){fuel=Math.min(duration,fuel+dt*2);r.safe={x:p.x,y:p.y,z:p.z};r.base=p.y;if(r.landing){g.dragonFuel=fuel;stop(g);world.notice('Dismounted.');return false;}if(input.jump&&!r.needsJumpRelease&&fuel>.15){p.onGround=false;p.vy=150;world.takeoff?.();}}
  const speed=p.onGround?240:320,n=Math.max(1,Math.hypot(mx,mz));p.vx=mx/n*speed;p.vz=mz/n*speed;
  if(Math.hypot(mx,mz)>.1)p.yaw=Math.atan2(mx,mz);
  const wasGround=p.onGround,oldY=p.y;
  if(!p.onGround){fuel=Math.max(0,fuel-dt);p.vy=!r.landing&&fuel>0&&input.jump&&!input.dodge?150:input.dodge?-170:-65;if(p.y>=r.base+height&&p.vy>0)p.vy=0;}
  else p.vy=0;
  const count=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vz)*dt/8)),rad=p.r+12;
  for(let i=0;i<count;i++){p.x+=p.vx*dt/count;p.z+=p.vz*dt/count;
   if(p.onGround){const f=world.floor(p.x,p.z,rad,p.y+50);if(finite(f)&&f>=p.y&&f<=p.y+50)p.y=f;}
   const hh=p.hh;p.hh=105;world.resolve(p,rad,p.y);if(hh==null)delete p.hh;else p.hh=hh;
   // Perimeter walls and closed story doors remain barriers even above their tops.
   for(const o of [...(g.walls||[]),...(g.doors||[])])block(p,rad,o);
  }
  if(!p.onGround){p.y=Math.min(r.base+height,p.y+p.vy*dt);for(const ob of [...(g.obstacles||[]),...(g.walls||[])])if(ob.y0!=null&&ob.y0>=oldY+100&&p.y+105>ob.y0&&Math.abs(p.x-ob.x)<ob.w/2+rad&&Math.abs(p.z-ob.z)<ob.d/2+rad){p.y=ob.y0-105;p.vy=Math.min(0,p.vy);}}
  const floor=world.floor(p.x,p.z,p.r,Math.max(oldY,p.y)+2);
  if(finite(floor)&&p.y<=floor&&p.vy<=0){p.y=floor;p.vy=0;p.onGround=true;p.jumps=0;r.needsJumpRelease=!!input.jump;if(!wasGround)world.land?.();r.safe={x:p.x,y:p.y,z:p.z};r.base=p.y;}
  else if(p.onGround&&(!finite(floor)||p.y>floor+.5))p.onGround=false;
  if(!finite(floor)&&p.y<=r.safe.y-18){Object.assign(p,{x:r.safe.x,y:r.safe.y,z:r.safe.z,vx:0,vy:0,vz:0,onGround:true,jumps:0});r.base=p.y;r.landing=true;world.notice('Your dragon returned to the last safe landing.');}
  g.dragonFuel=fuel;sync(g);return true;
 }
 let panel=null;
 function hud(g,playing,hint,toggleRide){const r=g?.p?.dragonRide;document.body.classList.toggle('dragon-riding',!!r);if(!r||!playing){if(panel)panel.hidden=true;return;}if(!panel){panel=document.createElement('section');panel.id='dragonFlight';panel.setAttribute('aria-label','Dragon flight');panel.innerHTML='<strong>Sunspire Dragon</strong><progress max="8" aria-label="Flight stamina"></progress><span></span><small></small><button type="button">Land / dismount</button>';document.body.append(panel);}
  panel.hidden=false;panel.querySelector('progress').value=g.dragonFuel??duration;panel.querySelector('span').textContent=(g.p.onGround?'Recharging':'Flight')+' · '+(g.dragonFuel??duration).toFixed(1)+'s';panel.querySelector('small').textContent=hint('jump')+' rise · release glide · '+hint('dodge')+' descend · '+hint('interact')+' land · Dismount to attack.';panel.querySelector('button').onclick=toggleRide;
 }
 return {allowed,toggle,step,stop,sync,hud,duration,height,riderOffset};
})();
