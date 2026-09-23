/* Optional Sunspire terrace; no main-route or shard prerequisites. */
(function(root){'use strict';
const paths={climb:[[-1450,-4000,440],[-1950,-3830,460],[-2300,-3660,520],[-2630,-3440,600],[-3160,-3440,600]],supply:[[-2300,-3660,520],[-2330,-3070,520],[-2770,-2830,540]],upper:[[-3160,-3440,600],[-3370,-3720,650],[-3680,-3630,690]],back:[[-3160,-3440,600],[-3080,-4060,540],[-2300,-4220,480],[-1450,-4000,440]]};
const f=(s,k)=>!!s.flags['dr.'+k];
function guards(G){return G.enemies.filter(e=>e.libraryGuard==='nest'&&!e.dead&&e.hp>0).length;}
function available(key,G,s,remote){if(!key.startsWith('dr.'))return true;if(key==='dr.brace')return f(s,'tools');if(key==='dr.winch')return f(s,'brace')&&!(remote?.nest??guards(G));if(key==='dr.release')return f(s,'slack');if(key==='dr.feed')return f(s,'free')&&f(s,'food');return true;}
function route(plat,ps,width=210){for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j],n=Math.ceil(Math.max(Math.hypot(b[0]-a[0],b[1]-a[1])/75,Math.abs(b[2]-a[2])/8));for(let i=0;i<=n;i++)plat(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,a[2]+(b[2]-a[2])*i/n,width,width,{slab:26,checkpoint:true});}}
function build({G,plat,spawn}){G.dragonRescue={};G.nestDragon=null;for(const id of ['climb','supply','upper'])route(plat,paths[id],id==='upper'?145:215);
const part=(name,x,y,z,w,h,d,c)=>G.deco.push({portalPart:name,x,y0:y,z,w,h,d,c});
for(const [name,x,z,y,w,d]of [['Broken nest sign',-1950,-3830,460,350,340],['Supply ledge',-2770,-2830,540,580,460],['Net winch terrace',-3210,-3450,600,740,610],['High nest',-3650,-3590,690,610,570]]){plat(x,z,y,w,d,{slab:38,checkpoint:true});G.rooms.push({name,x,z,y,w,d,encounter:false,cleared:true,monsters:[]});for(const side of [-1,1]){part('pillar',x+side*(w/2-30),y-120,z,45,230,45,'#c2b799');part('cap',x+side*(w/2-30),y+116,z,66,14,66,'#c7a35f');}}
for(const [x,z,y]of [[-2730,-2970,540],[-2870,-2780,540]]){part('stone',x,y+25,z,80,50,65,'#75634e');part('cap',x,y+53,z,90,8,74,'#baa77d');}
for(let i=0;i<10;i++){const a=i*Math.PI/5;part('rubble',-3650+Math.sin(a)*180,700,-3590+Math.cos(a)*150,60,20,25,'#8e8062');}
// Broken outer rail stays outside the walking route; the narrow upper bend is exposed.
for(let i=0;i<5;i++)part('pillar',-3180-i*100,580+i*23,-3190,35,160,35,'#a79c85');
const o=(k,label,x,z,y,kind)=>({key:'dr.'+k,label,x,z,y,kind,dragonObject:true});
G.storyObjects.push(o('clue','Read the torn keeper notice',-1950,-3830,460,'notice'),o('tools','Take the spare beam',-2790,-2910,540,'beam'),o('food','Take the dried meat',-2700,-2790,540,'food'),o('brace','Brace the cracked net frame',-3090,-3450,600,'brace'),o('winch','Lower the net slowly',-3310,-3290,600,'winch'),o('release','Unfasten the loose net',-3630,-3440,690,'release'),o('feed','Offer food and step back',-3500,-3610,690,'feed'));
for(const [type,x,z]of [['grunt',-2990,-3460],['caster',-3240,-3560],['grunt',-3380,-3470]]){const e=spawn(type,x,z,false);Object.assign(e,{y:600,sx:x,sz:z,libraryGuard:'nest'});}
G.healpads.push({x:-2450,z:-3070,y:520,r:31,charge:1,_acc:0});G.bounds.minX=-4050;
}
function sync({G,state:s,plat}){if(!G.dragonRescue)return;if(f(s,'free')&&!G.dragonRescue.bridge){G.dragonRescue.bridge=true;route(plat,paths.back,215);}if(!G.nestDragon)G.nestDragon={id:'sunwing',x:-3670,y:690,z:-3650,yaw:.5,t:0,atkT:0,displayOnly:true};G.nestDragon.rescued=f(s,'bond');G.nestDragon.trapped=!f(s,'free');}
function task(s){if(!f(s,'known')&&!f(s,'tools')&&!f(s,'food'))return null;return {title:'Wings Above the Clouds',progress:f(s,'bond')?'Dragon befriended — finish Sky Library to keep your companion':f(s,'free')?'Bring food from the supply ledge and earn the dragon’s trust':f(s,'slack')?'Climb to the nest and unfasten the loose net':f(s,'brace')?'Defeat the handlers and lower the net slowly':f(s,'tools')?'Brace the cracked frame on the winch terrace':'Explore the western nesting terraces; look for supplies below the winch',done:f(s,'bond')};}
function draw({G,state:s,bx,ring},t){for(const o of G.storyObjects.filter(o=>o.dragonObject)){if(s.flags['event.'+o.key])continue;const y=o.y;if(o.kind==='notice'){bx(o.x,y+40,o.z,12,80,12,'#79705b');bx(o.x,y+80,o.z,60,7,44,'#d6c49a');}else if(o.kind==='beam')bx(o.x,y+16,o.z,120,30,25,'#a68c61');else if(o.kind==='food'){bx(o.x,y+18,o.z,50,36,40,'#806048');bx(o.x,y+39,o.z,30,6,22,'#b67858');}else if(o.kind==='winch'){for(const x of [-30,30])bx(o.x+x,y+33,o.z,10,66,15,'#8c826e');bx(o.x,y+60,o.z,90,12,12,'#6c7279');ring(o.x,y+65,o.z,24,'#bba36d',.6);}else if(o.kind==='brace'){bx(o.x,y+100,o.z,14,200,18,'#796b52');if(f(s,'brace'))bx(o.x+26,y+70,o.z,16,140,20,'#b49b70');}else ring(o.x,y+4,o.z,28,'#d3b66b',.5);}
if(!f(s,'free')){for(let i=0;i<7;i++){const z=-3760+i*36;bx(-3670,746,z,270,3,3,'#6f6654');bx(-3790+i*40,746,-3650,3,3,230,'#6f6654');}for(const x of [-3810,-3530])bx(x,746,-3650,8,115,8,'#7c705a');}
}
const api={paths,guards,available,build,sync,task,draw};root.BFDragonRescue=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
