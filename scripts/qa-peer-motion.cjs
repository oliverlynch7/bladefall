async page=>{
 const context=await page.context().browser().newContext({viewport:{width:1280,height:900}}),guest=await context.newPage();
 const checks=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 try{
 for(const p of [page,guest]){await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.HERO3D?.ready);await p.evaluate(()=>{const b=__BF3;b.loadMode('rl');b.meta.introSeen=true;b.meta.classUnlocked={warrior:true};b.meta.classId='warrior';b.meta.autoAttack=false;b.openHub();});await p.waitForFunction(()=>document.getElementById('world-loading')?.style.display==='none');}
 for(const [label,ground,vx,pose,expected] of [['casting',true,0,{clip:'Spell2',serial:701,remaining:.42},'Spell2'],['running',true,180,null,'Run'],['jumping',false,180,null,'Roll'],['landed',true,0,null,'Idle']]){
 const packet=await page.evaluate(v=>{const b=__BF3,p=b.G.p;b.meta.classId='mage';p.weapon=b.makeWeapon('firestaff','rare');Object.assign(p,{onGround:v.ground,vx:v.vx,vz:0,vy:v.ground?0:120,combatPose:v.pose,atkTimer:0,chargeAmt:0,throwHideT:0});return b.MP.selfState();},{ground,vx,pose});
 const received=await guest.evaluate(s=>{const b=__BF3,m=b.MP;clearInterval(window.qaMotionKeep);m.active=true;m.isHost=true;m.conns=[];m.zone=m.HUB;s.id='motion-peer';s.zone=m.HUB;s.x=b.G.p.x+65;s.y=b.G.p.y;s.z=b.G.p.z+65;const q=m.peers[s.id]||m.mkPeer(s);m.applyPos(q,s);m.peers[s.id]=q;window.qaMotionKeep=setInterval(()=>{q.last=0;if(q.motion?.pose)q.motion.pose.remaining=.42;},25);return {motion:q.motion,relay:m.snap(q).am};},packet);
 ok(label+' relay',JSON.stringify(received.motion)===JSON.stringify(received.relay));
 await guest.waitForFunction(expected=>__hero3dRigs().peers.some(r=>r.id==='motion-peer'&&r.clip===expected),expected);ok(label+' rendered clip',true);
 if(label==='casting')await guest.screenshot({path:'output/playwright/peer-skill-motion.png'});
 }
 const boundary=await guest.evaluate(()=>{const b=__BF3,m=b.MP;clearInterval(window.qaMotionKeep);const q=m.peers['motion-peer'];q.motion=m.motion({ground:false,vx:Infinity,vz:999999,pose:{clip:'not-a-clip',serial:1,remaining:99}});const invalid=q.motion.vx===0&&q.motion.vz===3000&&!q.motion.pose;const old=m.mkPeer({id:'old',x:0,y:0,z:0});q.motion=m.motion({pose:{clip:'Spell1',serial:800,remaining:.02}});m.tick(.03);const expired=q.motion.pose.remaining===0;m.applyPos(q,{...m.snap(q),am:undefined});return {invalid,expired,legacy:old.motion===null&&q.motion===null};});for(const [name,value]of Object.entries(boundary))ok(name,value);
 return {checks};
 }finally{await context.close();}
}

