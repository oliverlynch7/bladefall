/* Local isolated-page helpers. Combat uses normal input/cooldowns/damage, no HP/kill/quest edits. */
(function(){
 const b=__BF3,rows=window.liveCampaignQA?.rows||[];
 function state(){const p=b.G.p;return {mode:b.mode,area:b.G.zone+'.'+b.G.area,at:[p.x,p.y,p.z].map(Math.round),hp:p.hp,level:p.level,class:b.classState(b.meta.classId),flags:b.G.storyState.flags,items:b.G.storyState.items};}
 function stop(){b.input.jx=b.input.jz=0;b.input.attack=b.input.dodge=b.input.jump=false;}
 function frame(x,z,jump=false,combat=true){
  const g=b.G,p=g.p;if(b.mode!=='play'||p.dead||p.hp<=0){stop();throw Error('Play interrupted '+JSON.stringify(state()));}
  let dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz),mx=d>8?dx/d:0,mz=d>8?dz/d:0;
  const threat=combat&&g.enemies.filter(e=>!e.dead&&e.hp>0&&!e.dummy&&e.active&&(!e.bruteOrchard||e.bruteState==='stagger')&&Math.abs(e.y-p.y)<65&&Math.hypot(e.x-p.x,e.z-p.z)<240&&b.enemyMeleeClear(e,p)).sort((a,c)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(c.x-p.x,c.z-p.z))[0];
  b.input.attack=false;
  if(threat){
   const ex=threat.x-p.x,ez=threat.z-p.z,ed=Math.hypot(ex,ez)||1;p.yaw=Math.atan2(ex,ez);
   if(ed<60){mx=mz=0;b.input.attack=true;}
   else {mx=ex/ed;mz=ez/ed;}
   if((threat.ceState==='wind'&&threat.ceClock<.5||threat.meleeW>0&&threat.meleeW<.35||threat.windT>0&&threat.windT<.35)&&p.dodgeCdT<=0){mx=-ez/ed;mz=ex/ed;b.input.dodgeEdge=true;}
   if(b.classState(b.meta.classId).rank>=(b.c2CurSkills()[0]?.rank||99)&&p.skillCd[0]<=0&&ed<145)b.useSkill(0);
  }
  // Steer around props using the real collision resolver rather than walking forever into a torch.
  if((threat||g.bruteArena)&&(mx||mz)&&!jump&&p.dodgeTimer<=0){
   const probe=(ax,az)=>{const q={...p,x:p.x+ax*35,z:p.z+az*35};b.resolveObstacles(q,p.r,null,0);const floor=b.floorAt(q.x,q.z,p.r,p.y+24);return Math.hypot(q.x-(p.x+ax*35),q.z-(p.z+az*35))<2&&Number.isFinite(floor)&&Math.abs(floor-p.y)<35;};
   if(!probe(mx,mz)){let found=false;for(const angle of [.55,-.55,1.1,-1.1,1.65,-1.65]){const ax=mx*Math.cos(angle)-mz*Math.sin(angle),az=mx*Math.sin(angle)+mz*Math.cos(angle);if(probe(ax,az)){mx=ax;mz=az;found=true;break;}}if(!found)mx=mz=0;}
  }
  b.input.jx=mx;b.input.jz=mz;b.input.jump=jump;if(jump&&p.onGround)b.input.jumpEdge=true;
  b.update(1/60);
 }
 function walk(x,z,jump=false,combat=true,max=2000){
  const start=state();let i=0;try{
   for(;i<max;i++){const p=b.G.p;if(Math.hypot(p.x-x,p.z-z)<12)break;frame(x,z,jump,combat);}
   stop();for(let j=0;j<15;j++)frame(x,z,false,false);
   const end=state(),ok=Math.hypot(b.G.p.x-x,b.G.p.z-z)<23;rows.push({kind:'walk',target:[x,z],jump,combat,start,end,frames:i,ok});
   if(!ok)throw Error('Walk blocked '+JSON.stringify(rows.at(-1)));return end;
  }finally{stop();}
 }
 function act(key){const before=JSON.parse(JSON.stringify(b.G.storyState));b.briarRequest('world',{key});rows.push({kind:'world',key,before:{flags:before.flags,items:before.items},after:state()});return state();}
 function talk(npc,choices){b.briarRequest('open',{npc});if(!b.G.storyState.conversation)throw Error('Cannot talk '+npc+' '+JSON.stringify(state()));for(const choice of choices){const line=b.G.storyState.conversation?.node;if(!line)throw Error('Missing line '+npc+' '+choice);b.briarRequest('choose',{line,choice});}b.briarRequest('close');rows.push({kind:'dialogue',npc,choices,after:state()});return state();}
 window.liveCampaignQA={state,stop,frame,walk,act,talk,rows};
})();
