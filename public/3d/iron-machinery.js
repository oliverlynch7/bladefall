/* Iron Halls: push the scrap sled through the live hammer to jam the drive. */
(function(root){'use strict';
const startZ=-3780, targetZ=-4380, hammerZ=-4100, gearZ=-4470, speed=118;
function phase(clock){let t=clock%5.5;if(t<0)t+=5.5;return {t,warn:t>=2.6&&t<4,hit:t>=4&&t<4.35,cycle:Math.floor(clock/5.5)};}
function task(G,s){if(!s.flags['ih.plate'])return 'Read the machine plate beside the weapon line';return 'Push the scrap sled up the track to jam the drive gear. Watch the hammer.';}
function place(G){const k=G.iron,o=k.sledCollider;if(!o)return;const a=Math.floor((o.z-o.d/2)/220),b=Math.floor((o.z+o.d/2)/220);o.z=k.sledZ;if(a!==Math.floor((o.z-o.d/2)/220)||b!==Math.floor((o.z+o.d/2)/220))G._obsDirty=true;}
function sync(G,s){const k=G.iron;if(s.flags['ih.line.open'])k.sledZ=targetZ;place(G);}
function shoveBack(G,k,hurt){const p=G.p;if(Math.abs(p.x)>130||Math.abs(p.z-hammerZ)>260||Math.abs(p.y-100)>55)return;
 if(Math.abs(p.z-hammerZ)<125)hurt?.(Math.max(5,p.maxHp*.08),{x:0,z:hammerZ,name:'forge hammer'});
 if(p.z<k.sledZ+70){p.z=k.sledZ+70;p.vz=0;p.recoverT=Math.max(p.recoverT||0,.25);p.invuln=Math.max(p.invuln||0,.5);}
}
function tick({G,state:s,host,players,complete,toast,hurt},dt){
 const k=G.iron,done=!!s.flags['ih.line.open'],p=phase(k.clock);
 if(!host){if(k.remote&&Number.isFinite(k.remote.sledZ)){
   if(Number.isInteger(k.remote.sledHitCycle)&&k.remote.sledHitCycle!==k.guestHitCycle){k.guestHitCycle=k.remote.sledHitCycle;k.sledZ=k.remote.sledZ;shoveBack(G,k,hurt);}
   else k.sledZ+=(k.remote.sledZ-k.sledZ)*Math.min(1,dt*12);
  }place(G);return;}
 if(done){k.sledZ=targetZ;place(G);return;}
 if(!s.flags['ih.workers.safe']||!s.flags['ih.cart']||!s.flags['ih.plate'])return;
 const pushing=(players||[]).some(q=>q&&q.hp>0&&!q.downed&&Math.abs(q.x)<90&&q.z>=k.sledZ+48&&q.z<=k.sledZ+120&&Math.abs((q.y||0)-100)<48&&(q.vz||0)<-35);
 if(pushing)k.sledZ=Math.max(targetZ,k.sledZ-speed*dt);
 if(p.hit&&Math.abs(k.sledZ-hammerZ)<105&&k.sledHitCycle!==p.cycle){
  k.sledHitCycle=p.cycle;k.sledZ=Math.min(startZ,k.sledZ+150);k.steam=1.25;shoveBack(G,k,hurt);
  toast?.('The hammer knocked the sled back. Wait for the strike, then push again.');
 }
 place(G);
 if(k.sledZ<=targetZ+.01)complete?.('ih.line.complete');
}
function draw(G,s,bx,ring){
 const k=G.iron,done=!!s.flags['ih.line.open'],p=phase(k.clock),z=k.sledZ;
 // Grounded parallel rails, cross ties, and progress lamps show one physical route.
 for(const x of [-96,96]){bx(x,105,-4080,12,10,660,'#9b805a');bx(x,112,-4080,6,4,660,'#e2c78b');}
 for(let i=0;i<9;i++){const tz=-3800-i*72;bx(0,103,tz,210,5,15,i%2?'#554d42':'#66594a');bx(148,121,tz,20,28,20,done||z<tz?'#acd6a0':'#b8773f');}
 // The track stays open on both sides; the sled itself has a real moving collider.
 bx(0,122,z,132,28,88,'#67594a');bx(0,144,z,122,18,82,'#7b8584');bx(0,158,z,96,12,60,'#c8a96e');
 for(const x of [-49,49]){for(const dz of [-34,34]){bx(x,112,z+dz,23,22,20,'#30393e');bx(x,112,z+dz,10,10,22,'#d4ae65');}}
 for(const x of [-70,70])bx(x,165,z+30,12,46,10,'#b29b71');bx(0,179,z+30,155,11,12,'#d3b16b');
 for(const x of [-47,-16,15,45])bx(x,144,z+45,12,16,5,x%2?'#e9bb62':'#393c3d');
 for(const [x,dz,w]of [[-35,-16,37],[17,5,31],[39,-24,26]]){bx(x,175,z+dz,w,22,26,'#4a4e4d');bx(x,189,z+dz,w-8,5,20,'#be9b64');}
 if(!done&&s.flags['ih.plate'])ring?.(0,107,z+92,39,'#e8c579',.65);
 // The floor warns before the hammer falls. It can hit the sled, but is never a hidden reset.
 const hy=done?575:p.hit?165:p.warn?360:575;
 for(const x of [-164,164]){bx(x,383,hammerZ,25,565,40,'#454c50');bx(x,425,hammerZ,41,30,72,'#a09071');}
 bx(0,678,hammerZ,375,28,72,'#5b6262');bx(0,hy,hammerZ,245,70,90,'#7d8584');bx(0,hy-38,hammerZ,205,10,80,'#ab8052');
 for(const dx of [-133,133])bx(dx,105,hammerZ,12,5,152,done?'#93c198':p.hit?'#f7aa5d':p.warn?'#f5d27a':'#806d53');
 for(const dz of [-73,73])bx(0,105,hammerZ+dz,276,5,10,done?'#93c198':p.hit?'#f7aa5d':p.warn?'#f5d27a':'#806d53');
 bx(194,194,hammerZ,65,158,25,'#4c5357');bx(194,284,hammerZ,80,21,35,done?'#91bd99':p.warn?'#f5d27a':'#ac7950');
 if(!done&&(p.warn||p.hit))ring?.(0,109,hammerZ,142,p.hit?'#ff9852':'#ffe391',.9);
 // Large toothed drive at the far end. Motion stops the instant the sled wedges in.
 bx(0,182,gearZ,102,102,78,done?'#7f9f85':'#586068');bx(0,182,gearZ+47,54,54,14,done?'#bce0b0':'#d2a762');
 for(let i=0;i<10;i++){const a=i*Math.PI/5+(done?0:k.clock*1.25);bx(Math.cos(a)*68,182+Math.sin(a)*68,gearZ+5,25,25,23,done?'#8fb497':'#988363');}
 bx(0,106,gearZ+14,238,12,45,done?'#91b994':'#765b43');
 if(done){ring?.(0,112,gearZ,112,'#bfe0ad',.7);for(let i=0;i<4;i++)bx(-50+i*32,257,gearZ,12,12,12,'#bfe0ad');}
}
const api={startZ,targetZ,hammerZ,gearZ,speed,phase,task,place,sync,tick,draw};root.BFIronMachinery=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
