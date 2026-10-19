/* Weapon presentation only. Metres, +Z forward. Combat remains owned by index.html. */
(function(root){'use strict';
let actionSerial=0;
const clamp=x=>Math.max(0,Math.min(1,Number(x)||0)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function curve(q,keys){for(let i=1;i<keys.length;i++){const a=keys[i-1],b=keys[i];if(q<=b[0]){const t=smooth((q-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*t);}}return keys.at(-1).slice(1);}
// grip XYZ, shaft direction XYZ, torso yaw, torso pitch. Deliberately separate paths.
const rows={
 sword:{name:'Sword · diagonal cut',duration:.34,tip:.94,keys:[[0,-.45,1.28,.28,-.8,.55,.25,-.25,-.03],[.18,-.52,1.39,.27,-.70,.65,.30,-.34,-.06],[.44,-.04,1.17,.63,.75,.12,.65,.28,.12],[.70,.24,1.08,.40,.90,-.1,.45,.35,.10],[1,-.4,1.14,.28,0,.8,.5,0,0]]},
 saber:{name:'Saber · flowing crosscut',duration:.32,tip:1.05,keys:[[0,-.45,1.19,.35,-.75,.5,.4,-.25,0],[.15,-.48,1.25,.29,-.9,.3,.2,-.32,-.03],[.42,.04,1.34,.64,.78,.2,.6,.27,.05],[.72,.24,1.22,.48,.95,.1,.2,.35,.06],[1,-.4,1.1,.28,0,.8,.5,0,0]]},
 spellblade:{name:'Spellblade · rising enchanted cut',duration:.36,tip:1.02,keys:[[0,-.46,1.05,.34,-.6,-.5,.7,-.2,.08],[.16,-.53,.97,.30,-.8,-.25,.6,-.30,.12],[.45,.02,1.43,.65,.65,.6,.55,.24,-.06],[.70,.20,1.56,.43,.85,.5,.2,.3,-.05],[1,-.4,1.15,.28,0,.8,.5,0,0]]},
 dagger:{name:'Daggers · compact alternating thrust',duration:.23,tip:.48,keys:[[0,-.35,1.28,.30,-.3,.2,.95,-.15,0],[.16,-.42,1.30,.22,0,.12,1,-.22,-.02],[.40,-.24,1.33,.82,.05,.08,1,.17,.10],[.63,-.27,1.31,.68,.1,.2,1,.13,.05],[1,-.35,1.24,.30,0,.4,.9,0,0]]},
 great:{name:'Greatsword · two-handed weight transfer',duration:.51,tip:1.32,support:true,keys:[[0,-.18,1.23,.32,-.75,.60,.25,-.24,-.04],[.19,-.24,1.48,.24,-.8,.57,.2,-.38,-.12],[.46,.02,1.13,.66,.66,.05,.75,.30,.17],[.69,.27,1.05,.48,.9,-.2,.25,.45,.12],[1,-.12,1.14,.30,0,.8,.55,0,0]]},
 axe:{name:'Battle axe · hooked diagonal chop',duration:.44,tip:1.08,support:true,keys:[[0,-.22,1.23,.30,-.55,.8,.20,-.24,-.08],[.18,-.33,1.53,.27,-.50,.85,.2,-.35,-.13],[.44,.02,1.08,.64,.45,-.2,.87,.23,.23],[.70,.12,.99,.48,.65,-.35,.68,.3,.15],[1,-.16,1.15,.30,0,.85,.45,0,0]]},
 hammer:{name:'Warhammer · weighted overhead slam',duration:.59,tip:1.12,support:true,keys:[[0,-.28,1.17,.40,-.25,.92,.3,-.12,-.05],[.24,-.40,1.52,.22,-.58,.60,-.55,-.2,-.18],[.46,-.10,.94,.64,.1,-.40,.91,.12,.32],[.68,-.04,.86,.57,.1,-.48,.87,.15,.24],[1,-.25,1.05,.38,0,.5,.86,0,0]]},
 scythe:{name:'Scythe · returning crescent throw',duration:.48,tip:1.28,support:true,keys:[[0,-.26,1.4,.26,-.7,.64,.3,-.3,0],[.22,-.36,1.49,.16,-.85,.4,.3,-.42,-.06],[.43,.04,1.32,.70,.6,.1,.8,.30,.08],[.65,.15,1.23,.64,.9,.15,.3,.40,.1],[1,-.12,1.17,.3,0,.8,.5,0,0]]},
 bow:{name:'Longbow · draw, loose and recover',duration:.34,tip:0,bow:true,keys:[[0,-.25,1.47,.5,0,-.2,.98,-.16,0],[.18,-.27,1.49,.53,0,-.2,.98,-.22,-.02],[.35,-.25,1.48,.55,0,-.18,.98,-.16,.01],[.62,-.25,1.47,.50,0,-.18,.98,-.12,.02],[1,-.25,1.45,.5,0,-.2,.98,0,0]]},
 cross:{name:'Crossbow · braced shot and recoil',duration:.34,tip:0,support:true,keys:[[0,-.18,1.32,.46,0,1,0,-.07,0],[.19,-.18,1.32,.50,0,1,0,-.1,0],[.35,-.18,1.36,.39,0,.99,-.1,-.14,-.04],[.64,-.18,1.32,.47,0,1,0,-.08,0],[1,-.18,1.28,.36,0,1,0,0,0]]},
 javelin:{name:'Javelin · forward spear thrust',duration:.34,tip:1.5,support:true,keys:[[0,-.17,1.22,.35,0,.18,.98,-.15,0],[.18,-.25,1.25,.26,0,.12,1,-.23,-.03],[.42,-.10,1.31,.72,0,.04,1,.18,.12],[.64,-.12,1.27,.62,0,.1,1,.12,.07],[1,-.15,1.18,.30,0,.25,.97,0,0]]},
 flintlock:{name:'Flintlock · sighted shot and kick',duration:.44,tip:0,keys:[[0,-.4,1.45,.52,0,1,0,-.1,0],[.17,-.4,1.50,.63,0,1,0,-.13,0],[.34,-.42,1.58,.49,0,.96,-.28,-.19,-.05],[.65,-.4,1.48,.58,0,1,0,-.1,0],[1,-.4,1.28,.35,0,1,0,0,0]]},
 staff:{name:'Staff · focus and channel',duration:.42,tip:1.1,keys:[[0,-.40,1.18,.36,-.12,.8,.6,-.1,0],[.20,-.46,1.24,.30,-.15,.93,.34,-.2,-.06],[.44,-.32,1.38,.64,.05,.45,.89,.16,.09],[.68,-.30,1.31,.55,.05,.55,.83,.12,.05],[1,-.40,1.16,.3,0,.84,.54,0,0]]},
 wand:{name:'Wand · precise wrist casting',duration:.24,tip:.62,keys:[[0,-.4,1.32,.34,-.15,.7,.7,-.08,0],[.18,-.43,1.39,.29,-.3,.9,.3,-.13,-.02],[.43,-.34,1.39,.67,.02,.12,.99,.10,.04],[.65,-.34,1.36,.57,.08,.25,.97,.08,.02],[1,-.4,1.26,.30,0,.75,.66,0,0]]},
 fist:{name:'Unarmed · alternating guarded punches',duration:.25,tip:0,keys:[[0,-.31,1.44,.31,0,.2,1,-.15,0],[.18,-.36,1.43,.26,0,.12,1,-.22,-.03],[.40,-.20,1.45,.85,0,.04,1,.20,.10],[.63,-.24,1.43,.65,0,.08,1,.15,.05],[1,-.31,1.40,.34,0,.3,.95,0,0]]},
 palm:{name:'Pyromancer · palm flame burst',duration:.34,tip:0,keys:[[0,-.37,1.35,.32,0,.5,1,-.16,0],[.18,-.44,1.31,.22,0,.7,.7,-.22,-.05],[.41,-.27,1.40,.77,0,0,1,.18,.10],[.65,-.30,1.39,.62,0,.15,1,.12,.05],[1,-.37,1.34,.32,0,.5,1,0,0]]}
};
rows.bash={name:'Close-range weapon bash',duration:.28,tip:.45,keys:[[0,-.32,1.28,.34,0,.4,.9,-.1,0],[.18,-.34,1.28,.25,0,.5,.86,-.18,-.02],[.42,-.23,1.31,.75,0,.3,.95,.16,.12],[.67,-.25,1.28,.61,0,.3,.95,.1,.06],[1,-.32,1.24,.34,0,.7,.7,0,0]]};
const throws=new Set(['hurl','daggerthrow','javelin','scythethrow']);
function key(w,charged=false){if(w?.intrinsic==='pyromancer')return 'palm';if(w?.intrinsic==='pirate'&&charged)return 'saber';return w?.arche==='saber'?'saber':w?.art==='scepter'?'wand':w?.art||'fist';}
function valid(a){if(!a||!rows[a.key]||![a.serial,a.remaining,a.duration].every(Number.isFinite)||a.duration<.1||a.duration>.9||a.remaining<0)return null;return {key:a.key,serial:Math.max(0,Math.min(1e12,a.serial)),charged:!!a.charged,amount:clamp(a.amount),alt:a.alt===1?1:0,thrown:!!a.thrown,duration:a.duration,remaining:Math.min(a.duration,a.remaining)};}
function start(p,charged,amount){const k=!charged&&p.basicActionKind==='bash'?'bash':key(p.weapon,charged),r=rows[k];if(!r)return null;const duration=charged?Math.max(.42,r.duration):r.duration;p.weaponAction={key:k,serial:++actionSerial,charged:!!charged,amount:clamp(amount),alt:(p.swingId||0)%2,thrown:charged&&throws.has(p.weapon?.chg),duration,remaining:duration};return p.weaponAction;}
function sample(k,q,charged=false,alt=0,hold=null){const r=rows[k];if(!r)return null;q=clamp(q);let keys=r.keys;
 if(charged){const wind={hammer:[-.43,1.52,.20,-.58,.60,-.55,-.24,-.18],great:[-.28,1.37,.23,-.94,.25,.21,-.48,-.1],axe:[-.43,1.52,.17,-.80,.5,.25,-.38,-.1],dagger:[-.44,1.56,.17,-.25,.7,.65,-.25,-.04],javelin:[-.43,1.56,.09,0,.04,1,-.35,-.08],scythe:[-.36,1.50,.18,-.86,.42,.25,-.4,-.08],spellblade:[-.47,1.02,.3,-.85,-.2,.48,-.36,.1],staff:[-.42,1.29,.32,-.1,.9,.42,-.22,-.05],wand:[-.4,1.48,.32,0,.8,.6,-.18,-.04],saber:[-.47,1.28,.24,-.9,.3,.2,-.38,-.05],palm:[-.47,1.29,.25,0,.7,.7,-.12,-.08]}[k]||keys[1].slice(1);
 const contact=k==='hammer'?[-.10,.86,.66,.1,-.45,.89,.17,.36]:k==='great'?[.22,1.20,.62,.95,.08,.3,.65,.12]:k==='palm'?[-.45,1.4,.73,0,0,1,.08,.13]:k==='javelin'?[-.16,1.47,.76,0,-.05,1,.28,.15]:keys[2].slice(1);
 keys=[[0,...wind],[.16,...wind],[.42,...contact],[.66,...keys[3].slice(1)],[1,...keys.at(-1).slice(1)]];
 }
 // Existing melee hit window is the first156ms: put heavy contacts inside it, then recover.
 const timed=charged?curve(q,[[0,0],[.05,.16],[.22,.42],[.58,.66],[1,1]])[0]:['great','axe','hammer'].includes(k)?curve(q,[[0,0],[.10,.20],[.24,.46],[.64,.70],[1,1]])[0]:q;
 const t=hold==null?timed:.16,kf=curve(t,keys),right=kf.slice(0,3),axis=kf.slice(3,6),len=Math.hypot(...axis);axis.forEach((v,i)=>axis[i]=v/len);
 let torso=[kf[7],kf[6],0],left=[.32,1.40,.36],primary='R';
 if(['sword','saber','spellblade'].includes(k)&&alt&&!charged){right[0]*=-.75;axis[0]*=-1;torso[1]*=-1;}
 if((k==='fist'||k==='palm')&&alt&&!charged){right[0]*=-1;axis[0]*=-1;torso[1]*=-1;primary='L';left=[-.32,1.40,.36];}
 if(k==='palm'&&charged){left=[.45,1.40,.73];torso[1]=0;}
 if(k==='staff'){left=[.36,1.43,.64];}if(k==='wand'){left=[.35,1.22,.35];}
 const release=smooth((q-(charged?.02:.12))/(charged?.16:.18)),draw=hold==null?(charged?.19:.15)*(1-release):.05+.14*clamp(hold);
 const weight=hold==null?(charged?1:smooth(q/.07))*(1-smooth((q-.70)/.30)):smooth(clamp(hold)*9+.15);
 const turn=k==='great'&&charged&&hold==null?Math.PI*2*smooth((q-.12)/.62):0;if(turn){const c=Math.cos(turn),sn=Math.sin(turn);for(const vec of [right,left,axis]){const x=vec[0],z=vec[2];vec[0]=x*c+z*sn;vec[2]=z*c-x*sn;}}
 return {turn,key:k,q,charged,weight,right,left,axis,primary,torso,head:[-torso[0]*.28,-torso[1]*.28,0],support:!!r.support,bow:!!r.bow,draw,tip:r.tip,duration:charged?Math.max(.42,r.duration):r.duration,hold:hold==null?null:clamp(hold)};
}
const frames=new Map();function publish(id,data){frames.set(id,{...data,stamp:Date.now()});if(frames.size>16)frames.delete(frames.keys().next().value);}function frame(id){const f=frames.get(id);return f&&Date.now()-f.stamp<220?f:null;}
// These cues share the existing bounded ribbon/glow batch, no per-charge meshes or materials.
function chargeRender(d){for(const [id]of frames){const f=frame(id);if(!f||f.charge==null||f.charge<=0)continue;d.pushM();d.mv(f.x,f.y,f.z);d.rotY(f.yaw);const c=f.color||'#e8c47a',a=.35+.5*f.charge,at=f.tip.map(v=>v*20),full=f.charge>=.98,segments=d.detail>=40?32:20;
 // Partial crescent becomes a complete, brighter ring at full charge. It does not grow into the face.
 for(let i=0;i<segments;i++){const u=i/segments,v=(i+1)/segments;if(u>f.charge)break;const angle=u*Math.PI*2-Math.PI/2,next=Math.min(v,f.charge)*Math.PI*2-Math.PI/2,r=5.2;d.line([at[0]+Math.cos(angle)*r,at[1]+Math.sin(angle)*r,at[2]],[at[0]+Math.cos(next)*r,at[1]+Math.sin(next)*r,at[2]],full?1.2:.7,full?'#fff2c2':c,a);d.line([at[0]+Math.cos(angle)*r,at[1],at[2]+Math.sin(angle)*r],[at[0]+Math.cos(next)*r,at[1],at[2]+Math.sin(next)*r],.55,c,a*.4);}
 if(['staff','wand','palm','spellblade','scythe'].includes(f.key)){for(let j=0;j<2;j++){const pts=[],widths=[];for(let i=0;i<=12;i++){const u=i/12,ang=u*4.5+f.time*3+j*Math.PI,r=(1-u)*(8+f.charge*3);pts.push([at[0]+Math.cos(ang)*r,at[1]+(u-.5)*9,at[2]+Math.sin(ang)*r]);widths.push(.15+.7*u);}d.trail(pts,widths,c,a*.48);}d.glow(at,1.4+f.charge*1.3,c,a*.7);}
 else if(full)d.glow(at,2.4,'#fff0bd',.35+.15*Math.sin(f.time*4));d.popM();}}
function render(event,q,d){const key=event.profile.actionKey;if(!rows[key]||key==='palm')return false;const f=frame(event.actorId);if(!f||f.key!==key||f.serial!==event.profile.actionSerial)return true;const k=f.key;
 d.pushM();const ey=event.yaw||0,dx=f.x-event.x,dz=f.z-event.z;d.mv(dx*Math.cos(ey)-dz*Math.sin(ey),f.y-event.y,dx*Math.sin(ey)+dz*Math.cos(ey));d.rotY(f.yaw-ey);
 const power=event.profile.slot===2?1.5:1,at=f.tip.map(v=>v*20),point=(x,y,z)=>[at[0]+x*power,at[1]+y*power,at[2]+z*power];
 if(k==='bow'){for(let j=-1;j<=1;j+=2){const pts=[],widths=[];for(let i=0;i<=12;i++){const u=i/12;pts.push(point(j*(1-u)*2,Math.sin(u*Math.PI)*j*1.1,u*17));widths.push(.12+(1-u)*.6);}d.trail(pts,widths,d.col,d.a*.42);}}
 else if(k==='cross'){for(let j=-1;j<=1;j++){d.line(point(j*2,0,0),point(j*3,Math.sin(q*7+j)*.6,9+q*6),.6,d.hot,d.a*.4);d.glow(point(j*2,0,2),1,d.col,d.a*.28);}}
 else if(k==='flintlock'){const fade=Math.max(0,1-q/.58);for(let j=0;j<7;j++){const ang=j*Math.PI*2/7;d.line(point(0,0,0),point(Math.cos(ang)*(2+q*4),Math.sin(ang)*(2+q*4),5+q*6),.6,'#ffc679',fade*.8);}d.glow(point(0,0,2),2.2,'#ffe9bd',fade*.7);}
 else if(k==='staff'||k==='wand'){const count=k==='staff'?3:2;for(let j=0;j<count;j++){const pts=[],widths=[];for(let i=0;i<=14;i++){const u=i/14,ang=u*4.8+j*Math.PI*2/count+q*3,r=(k==='staff'?4.5:2.5)*(1-u*.7);pts.push(point(Math.cos(ang)*r,Math.sin(ang)*r,u*(k==='staff'?13:9)));widths.push(.15+(1-u)*.65);}d.trail(pts,widths,d.col,d.a*.55);}d.glow(point(0,0,2),k==='staff'?2.4:1.4,d.hot,d.a*.5);}
 else {const hist=f.history||[];if(hist.length>=2){const pts=hist.map(p=>p.map(v=>v*20)),widths=pts.map((p,i)=>.15+1.5*i/pts.length);d.trail(pts,widths.map(w=>w*1.25),d.col,d.a*.48);d.trail(pts,widths.map(w=>w*.4),d.hot,d.a*.72);if(k==='spellblade'||event.profile.slot===2)d.trail(pts.map(p=>[p[0],p[1]+1.1,p[2]]),widths.map(w=>w*.55),d.col,d.a*.48);}}
 d.popM();return true;}

const api={rows,keys:Object.keys(rows),key,valid,start,sample,publish,frame,clear:id=>frames.delete(id),chargeRender,render};root.BFWeaponActions=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
