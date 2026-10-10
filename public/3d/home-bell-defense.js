/* Homefields watchtower: a short optional warning-bell defense. */
(function(root){'use strict';
const tower={x:2350,z:-1830,y:168};
const waves=[
 [['grunt',2200,-1700],['grunt',2500,-1700]],
 [['grunt',2180,-1690],['caster',2350,-1680],['grunt',2520,-1690]],
 [['grunt',2470,-1690],['captain',2290,-1680]]
];
function create(){return {wave:0,pause:0,lastAlive:-1,remote:null};}
function foes(G,w){return (G.enemies||[]).filter(e=>e.homeBellWave===w&&!e.dead&&e.hp>0);}
function status(G,s){const h=G.homeBell||create(),remote=h.remote;
 if(remote)return remote;
 return {wave:h.wave,alive:foes(G,h.wave).length,open:!!s.flags['home.bells.open'],active:!!s.flags['home.bell.alarm']};
}
function sync(G,s){const note=s.notes['home.bells'];if(note&&!s.flags['event.home.bell.cache']){note.title='The watchtower chest';note.text=s.flags['home.bells.open']?'The captain fell and dropped the chest key. Open the chest by the eastern pillar.':s.flags['home.bell.alarm']?'The warning bell drew the Legion patrol. Clear each group. Their captain carries the chest key.':'The Legion watch captain took the tower chest key. Ring the warning bell to draw him and his patrol to the roof.';}}
function spawnWave(G,h,n,spawn,elite,setupElite,toast){h.wave=n;h.pause=0;h.lastAlive=-1;
 for(const [type,x,z]of waves[n-1]){const captain=type==='captain',e=spawn(captain?'grunt':type,x,z,false);if(!e)continue;
  Object.assign(e,{y:tower.y,sx:x,sz:z,homeBellWave:n,active:true,dropT:1.2,label:captain?'Watch Captain':'Tower raider'});
  if(captain){elite(e);setupElite(e,0);e.campaignElite=true;e.label='Watch Captain';}
 }
 toast?.(n===1?'The warning bell draws a Legion patrol!':n===3?'The Watch Captain reaches the tower!':'Another patrol reaches the tower!');
}
function tick({G,state:s,host,players,spawn,elite,setupElite,toast,updateQuest},dt){const h=G.homeBell;if(!h||!host||s.flags['home.bells.open']||!s.flags['home.bell.alarm'])return false;
 if(!h.wave){const near=(players||[G.p]).some(p=>p&&Math.hypot((p.x??p.tx)-tower.x,(p.z??p.tz)-tower.z)<700&&Math.abs((p.y??p.ty??tower.y)-tower.y)<270);if(!near)return false;spawnWave(G,h,1,spawn,elite,setupElite,toast);}
 const live=foes(G,h.wave);
 // A pursuer that slips off the raised roof returns by the stair entrance.
 for(const e of live){const away=e.y<tower.y-75||Math.hypot(e.x-tower.x,e.z-tower.z)>610;e.homeBellAway=away?(e.homeBellAway||0)+dt:0;
  if(e.homeBellAway>5){Object.assign(e,{x:tower.x+(e.mid%2?-95:95),z:-1690,y:tower.y,sx:tower.x+(e.mid%2?-95:95),sz:-1690,homeBellAway:0,dropT:.8});}}
 if(h.lastAlive!==live.length){h.lastAlive=live.length;updateQuest?.();}
 if(live.length){h.pause=0;return false;}
 if(h.wave===waves.length)return true;
 h.pause+=dt;if(h.pause>=2.4){spawnWave(G,h,h.wave+1,spawn,elite,setupElite,toast);updateQuest?.();}
 return false;
}
function draw({G,state:s,bx},time){const h=G.homeBell;if(!h)return;const st=h.remote||status(G,s);
 if(st.active&&!st.open){for(let i=0;i<12;i++){const a=i*Math.PI/6;bx(tower.x+Math.cos(a)*215,tower.y+4,tower.z+Math.sin(a)*165,13,3,13,'#d9b970',null,.52);}for(let i=0;i<6;i++){const a=i*Math.PI/3+time*.7;bx(tower.x+Math.cos(a)*90,tower.y+75,tower.z-110+Math.sin(a)*32,7,7,7,'#f5d58c',null,.45);}}
 for(let i=0;i<3;i++){const x=2462+i*38,lit=st.open||st.wave>i+1||st.wave===i+1&&st.alive===0;
  bx(x,213,-1825,26,8,12,lit?'#f7d38a':'#635c58');bx(x,222,-1825,9,9,9,lit?'#fff1b8':'#a9a292',null,lit ? .9 : .55);}
 if(st.open&&!s.flags['event.home.bell.cache']){const y=242+Math.sin(time*2)*5;bx(2500,y,-1830,8,22,7,'#ffe497');bx(2511,y+8,-1830,15,5,7,'#ffe497');bx(2519,y+3,-1830,5,11,7,'#ffe497');}
}
const api={tower,waves,create,foes,status,sync,tick,draw};root.BFHomeBellDefense=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
