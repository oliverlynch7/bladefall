/* Shared warning and damage shapes. The animal never has a killable body. */
(function(root){'use strict';
const heads=[{x:-550,z:-250,y:120},{x:0,z:-520,y:120},{x:550,z:-250,y:120}],covers=[{x:-330,z:140,w:130,d:140},{x:330,z:140,w:130,d:140}];
const live=G=>G.enemies.filter(e=>e.hydraChain&&!e.dead&&e.hp>0);
function build({G,plat,spawn}){
 G.hydraArena={clock:2,state:'recover',kind:'bite',head:0,seq:0,beat:0,revision:0,elapsed:0,x:0,z:0,y:120,freed:false,retreat:0,broken:[],totalHp:0};G.haz=null;G.boss=null;G.vertical=true;G.npc=null;G.secret=null;G.storyNpcs=[];G.storyObjects=[];
 for(const k of ['segments','obstacles','walls','deco','rooms','enemies','pickups','projectiles','healpads','chests','qmarks','dens','movers','pads','shockwaves','trails','crumbles','geysers','springs','spikefields','torches','keys','doors','plates'])G[k]=[];
 const floor=(x,z,h,w,d)=>plat(x,z,h,w,d,{slab:35,checkpoint:true});
 floor(0,650,120,700,400);floor(0,385,120,190,300);for(const side of [-1,1]){floor(side*350,510,120,560,170);floor(side*610,20,120,520,850);floor(side*550,-250,120,500,350);floor(side*280,-450,120,550,180);}floor(0,-520,120,480,430);floor(0,100,120,1100,430);
 // Raised rear crescent offers another response to the low sweep.
 for(const side of [-1,1])for(let i=0;i<=15;i++)floor(side*(780-i*18),550+i*14,120+i*8,160,170);
 floor(0,760,240,1180,250);for(const p of covers)G.walls.push({...p,y0:120,h:170,c:'#58747a',hydraCover:true});
 for(const side of [-1,1])for(let i=0;i<=22;i++)floor(side*(860-i*25),-200-i*42,120+i*10,180,180);
 floor(0,-1140,340,900,320);
 G.rooms=[{name:'The Hydra Ledges',x:0,z:100,y:120,w:1700,d:1750,cleared:true,encounter:false,monsters:[]}];
 G.bounds={minX:-1100,maxX:1100,minZ:-1430,maxZ:1080};G.startPos={x:0,z:510,y:120};G.lastSafe={...G.startPos};G.portalPos={x:0,z:-1140,y:340};G.goalPos={...G.portalPos};G.progressEnd=-1300;
 heads.forEach((p,i)=>{const e=spawn('grunt',p.x,p.z,false),hp=Math.round(e.maxHp*3.5);Object.assign(e,{...p,h:95,r:42,hp,maxHp:hp,boss:false,hydraChain:true,hydraIndex:i,kind:'walk',active:true,dropT:0,immobile:true,speed:0,role:null,spec:null,shot:null,ranged:false,home:null,label:'Neck restraint '+(i+1),xp:0,atkTimer:99999});if(i===0)G.boss=e;G.hydraArena.totalHp+=hp;});
 Object.assign(G.p,{...G.startPos,vy:0,vx:0,vz:0});
}
function step(G,dt,p,cue){const h=G.hydraArena;if(!h)return;dt=Math.min(.05,Math.max(0,dt));h.elapsed+=dt;h.revision++;if(h.freed){h.retreat=Math.min(1,h.retreat+dt/5);return;}
 const alive=live(G);if(!alive.length){h.freed=true;h.state='free';h.clock=0;cue?.('free');return;}
 h.clock=Math.max(0,h.clock-dt);if(h.clock)return;
 if(h.state==='recover'){const e=alive[h.beat%alive.length];h.head=e.hydraIndex;h.kind=['bite','sweep','blast'][h.beat++%3];h.state='wind';h.clock=h.kind==='blast'?2:1.6;h.x=p.x;h.z=p.z;h.y=p.y;cue?.('wind');}
 else if(h.state==='wind'){h.state='strike';h.clock=.45;h.seq++;cue?.('strike');}
 else{h.state='recover';h.clock=8;cue?.('rest');}
}
function exposed(G,e){const h=G.hydraArena;return !!h&&!h.freed&&h.state==='recover'&&h.head===e.hydraIndex;}
function lineDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,u=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(l||1)));return Math.hypot(p.x-a.x-u*dx,p.z-a.z-u*dz);}
function blocked(p,a){return covers.some(c=>{const dx=p.x-a.x,dz=p.z-a.z;let lo=0,hi=1;for(const [v,d,min,max]of [[a.x,dx,c.x-c.w/2,c.x+c.w/2],[a.z,dz,c.z-c.d/2,c.z+c.d/2]]){if(Math.abs(d)<.001){if(v<min||v>max)return false;}else{const t1=(min-v)/d,t2=(max-v)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;}}return lo<1&&hi>0;});}
function inAttack(G,p){const h=G.hydraArena;if(!h||h.freed||h.state!=='strike'||p.downed||p.hp<=0)return false;const r=p.r||16;
 if(h.kind==='bite')return Math.hypot(p.x-h.x,p.z-h.z)<150+r&&Math.abs(p.y-h.y)<110;
 if(h.kind==='sweep')return Math.abs(p.x)<820+r&&p.z>-230-r&&p.z<420+r&&p.y<215;
 const a=heads[h.head],dx=h.x-a.x,dz=h.z-a.z,len=Math.hypot(dx,dz)||1,b={x:a.x+dx/len*2200,z:a.z+dz/len*2200};return Math.abs(p.y-120)<100&&lineDistance(p,a,b)<75+r&&!blocked(p,a);
}
function snapshot(G,epoch){return {epoch,...G.hydraArena,chains:G.enemies.filter(e=>e.hydraChain).map(e=>({i:e.hydraIndex,hp:e.hp,maxHp:e.maxHp,dead:e.dead}))};}
function apply(G,s,epoch){if(!G.hydraArena||!s||s.epoch!==epoch||!Number.isFinite(s.revision)||s.revision<G.hydraArena.revision)return false;const {chains,epoch:_,...state}=s;Object.assign(G.hydraArena,state);for(const e of G.enemies)if(e.hydraChain&&(s.broken||[]).includes(e.hydraIndex)){e.dead=true;e.hp=0;}for(const q of chains||[]){const e=G.enemies.find(e=>e.hydraChain&&e.hydraIndex===q.i);if(e){e.hp=q.hp;e.maxHp=q.maxHp;e.dead=q.dead;}}return true;}
function draw({G,bx,ring},t){const h=G.hydraArena;if(!h||h.freed)return;const col=h.state==='strike'?'#e7faff':'#e8ba62';
 if(h.state==='wind'||h.state==='strike'){
 if(h.kind==='bite')ring(h.x,h.y+5,h.z,150,col,.85);
 else if(h.kind==='sweep'){for(const z of [-230,420])bx(0,124,z,1640,4,8,col);for(const x of [-820,820])bx(x,124,95,8,4,650,col);}
 else{const a=heads[h.head],dx=h.x-a.x,dz=h.z-a.z,len=Math.hypot(dx,dz)||1;for(let i=1;i<=22;i++){const p={x:a.x+dx/len*i*95,z:a.z+dz/len*i*95};if(blocked(p,a))break;ring(p.x,125,p.z,75,col,.65);}}
 }
 for(const e of live(G))if(exposed(G,e))ring(e.x,e.y+4,e.z,65,'#e5f4c4',.85);
}
const api={build,step,exposed,inAttack,snapshot,apply,draw,heads,covers,blocked,live};root.BFHydra=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
