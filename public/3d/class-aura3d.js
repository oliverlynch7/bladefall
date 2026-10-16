import * as T from './three.module.js';

// Rank-10 cosmetic energy. Four bounded draws, no scene lights or particle history.
// Shared tiny textures contain computed alpha, so they require no image downloads.
const textures=new Map(),V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const THEMES={
 warrior:{motif:'Royal command pennants',color:'#ffbd54',core:'#fff0b0',shape:'star',motion:'rise'},
 ranger:{motif:'Emerald woodland crescents',color:'#57dfa2',core:'#e1ffbd',shape:'leaf',motion:'rise'},
 mage:{motif:'Violet constellation sweep',color:'#b17bff',core:'#b9f1ff',shape:'star',motion:'orbit'},
 reaper:{motif:'Violet soul mantle',color:'#a27bff',core:'#e6d9ff',shape:'soul',motion:'rise'},
 paladin:{motif:'Ivory-gold sun wings',color:'#ffd35b',core:'#fffbe3',shape:'star',motion:'rise'},
 necromancer:{motif:'Jade soul procession',color:'#52e8a2',core:'#d7ffe7',shape:'soul',motion:'orbit'},
 ninja:{motif:'Indigo afterimage slashes',color:'#7d9cfa',core:'#d8f3ff',shape:'spark',motion:'fall'},
 berserker:{motif:'Scarlet rage flares',color:'#ff4653',core:'#ffd1ab',shape:'diamond',motion:'rise'},
 pirate:{motif:'Teal tide and compass',color:'#48ded7',core:'#ffe6aa',shape:'pearl',motion:'tide'},
 chronomancer:{motif:'Amber clock dial',color:'#ffbd65',core:'#fff2be',shape:'glyph',motion:'orbit'},
 monk:{motif:'Jade-gold lotus mandala',color:'#95e7b5',core:'#ffe1a2',shape:'pearl',motion:'petals'},
 stormcaller:{motif:'Cyan lightning cage',color:'#62cfff',core:'#e2f8ff',shape:'spark',motion:'rise'},
 warlock:{motif:'Broken eclipse corona',color:'#e174dc',core:'#ffc6e3',shape:'glyph',motion:'orbit'},
 skylancer:{motif:'Azure slipstream wings',color:'#7bc7ff',core:'#e9fbff',shape:'spark',motion:'rise'},
 bladedancer:{motif:'Sea-silk ribbon sweeps',color:'#6ce1d4',core:'#ffd0e2',shape:'leaf',motion:'petals'},
 beastmaster:{motif:'Amber spirit antlers',color:'#eebd63',core:'#d6ef9f',shape:'star',motion:'rise'},
 pyromancer:{motif:'Living flame mantle',color:'#ff793a',core:'#ffe9a0',shape:'ember',motion:'rise'}
};
export const AURA_THEMES=THEMES;
function texture(kind){
 if(textures.has(kind))return textures.get(kind);
 const n=64,pixels=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const u=(x+.5)/n,v=(y+.5)/n,a=u*2-1,b=v*2-1,r=Math.hypot(a,b);let alpha;
  if(kind==='ribbon')alpha=Math.pow(Math.max(0,1-Math.abs(a)),2.5)*Math.pow(Math.sin(v*Math.PI),.35);
  else if(kind==='leaf')alpha=Math.pow(Math.max(0,1-Math.abs(a)*2.1-b*b),2);
  else if(kind==='star')alpha=Math.max(0,1-r)*(Math.pow(Math.max(0,1-Math.min(Math.abs(a),Math.abs(b))*7),2));
  else if(kind==='spark'||kind==='diamond')alpha=Math.pow(Math.max(0,1-Math.abs(a)*2-Math.abs(b)),1.4);
  else if(kind==='soul'||kind==='ember')alpha=Math.pow(Math.max(0,1-Math.hypot(a*(1.4+.5*b),b)),2);
  else if(kind==='glyph')alpha=Math.max(0,1-Math.abs(r-.48)*6)*Math.max(0,1-r);
  else alpha=Math.pow(Math.max(0,1-r),2.2);
  const i=(y*n+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(255*alpha);
 }
 const t=new T.DataTexture(pixels,n,n,T.RGBAFormat);t.minFilter=t.magFilter=T.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;textures.set(kind,t);return t;
}
const arc=(cx,cy,r,start,end,n=28)=>Array.from({length:n+1},(_,i)=>{const a=start+(end-start)*i/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];});
const pair=points=>[-1,1].map(s=>points.map(([x,y,z=0])=>[s*x,y,z]));
function paths(cls){
 if(cls==='warrior')return [...pair([[.35,-.4],[.65,.1],[.70,1.25],[.91,1.1],[.8,.45]]),...pair([[.45,.45],[.95,.82],[.85,1.45]])];
 if(cls==='ranger')return [...pair(arc(.2,.25,.76,-1.45,1.3,20)),...pair([[.45,-.6],[.77,-.25],[.90,.25],[.72,.85]])];
 if(cls==='mage')return [arc(0,.35,.94,-.65,2.35),arc(0,.35,.76,2.5,5.7),[[-.82,.7],[-.43,1.14],[.12,.88],[.62,1.25],[.88,.64]]];
 if(cls==='reaper')return [...pair([[.28,.82],[.66,.67],[.79,.10],[.52,-.35],[.73,-.8],[.31,-1.0]]),...pair([[.49,.55],[.96,.3],[.76,-.22],[.99,-.58]])];
 if(cls==='paladin')return [-1,1].flatMap(s=>Array.from({length:5},(_,i)=>[[s*.30,.47],[s*(.72+i*.08),1.3-i*.15],[s*(.95+i*.045),.98-i*.16],[s*.47,.24-i*.08]]));
 if(cls==='necromancer')return [...pair([[.30,-.60],[.76,-.17],[.89,.55],[.68,1.20],[.39,.99]]),...pair([[.45,.24],[.70,.42],[.73,.77],[.57,.95]])];
 if(cls==='ninja')return [...pair([[.30,.65],[.88,.95],[.63,.30],[1.02,-.05]]),...pair([[.33,-.35],[.77,-.57],[.51,-.76]])];
 if(cls==='berserker')return [...pair([[.30,-.50],[.76,-.08],[.58,.20],[.99,.64],[.77,.59],[.87,1.13],[.40,.71]]),...pair([[.55,.21],[1.03,.18],[.83,-.25]])];
 if(cls==='pirate')return [...pair([[.23,-.64],[.75,-.58],[1.04,-.14],[.95,.28],[.65,.38],[.51,.17],[.71,.06]]),...Array.from({length:4},(_,i)=>{const a=i*Math.PI/2;return [[Math.cos(a)*.63,.24+Math.sin(a)*.63],[Math.cos(a)*.90,.24+Math.sin(a)*.90]];})];
 if(cls==='chronomancer')return [arc(0,.30,.88,0,Math.PI*2),...Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return [[Math.cos(a)*.77,.30+Math.sin(a)*.77],[Math.cos(a)*.92,.30+Math.sin(a)*.92]];}),[[0,.30],[.40,.75]],[[0,.30],[-.42,.14]]];
 if(cls==='monk')return Array.from({length:6},(_,i)=>{const a=i*Math.PI/3,turn=(x,y)=>[Math.cos(a)*x-Math.sin(a)*y,.10+Math.sin(a)*x+Math.cos(a)*y];return [[0,.10],turn(.30,.34),turn(.83,0),turn(.30,-.34),[0,.10]];});
 if(cls==='stormcaller')return [...pair([[.28,-.68],[.71,-.33],[.53,-.21],[.98,.32],[.71,.29],[.91,.90],[.59,.79],[.67,1.34]]),...pair([[.34,.68],[.55,1.11],[.40,1.03],[.48,1.48]])];
 if(cls==='warlock')return [arc(0,.38,.90,.20,2.92),arc(0,.38,.90,3.34,6.06),...pair([[.63,-.29],[1.06,-.04],[.92,.47],[1.07,.91],[.57,1.23]])];
 if(cls==='skylancer')return [-1,1].flatMap(s=>Array.from({length:4},(_,i)=>[[s*.25,.52-i*.10],[s*(.77+i*.07),.85-i*.15],[s*(1.18+i*.025),.55-i*.20],[s*.62,.08-i*.13]]));
 if(cls==='bladedancer')return [...pair([[.25,-.76],[.81,-.46],[.89,.03],[.49,.37],[.82,.89],[.49,1.13]]),...pair([[.37,-.40],[1.02,-.04],[.68,.58]])];
 if(cls==='beastmaster')return [...pair([[.28,-.30],[.38,.52],[.72,.90],[.78,1.47]]),...pair([[.46,.64],[.98,.83],[1.12,1.17]]),...pair([[.63,.92],[.45,1.25],[.54,1.51]])];
 return [...pair([[.24,-.81],[.62,-.44],[.43,-.14],[.86,.29],[.63,.21],[.99,.86],[.61,.65],[.76,1.40],[.36,.92]]),...pair([[.43,-.51],[.97,-.12],[.73,.13],[1.05,.51]])];
}
function ribbons(lines,width){
 const position=[],uv=[],indices=[];
 for(const line of lines){const start=position.length/3;
  for(let i=0;i<line.length;i++){
   const p=line[i],prev=line[Math.max(0,i-1)],next=line[Math.min(line.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],d=Math.hypot(dx,dy)||1,t=i/(line.length-1),w=width*(.28+.72*Math.sin(t*Math.PI));
   for(const s of [-1,1]){position.push(p[0]-dy/d*w*s,p[1]+dx/d*w*s,p[2]||0);uv.push(s===-1?0:1,t);}
   if(i<line.length-1){const k=start+i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(position,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeBoundingSphere();return g;
}
export function createClassAura(parent,cls){
 const theme=THEMES[cls];if(!parent||!theme)return null;
 const group=new T.Group();group.name='Rank 10 aura · '+theme.motif;group.position.z=-.37;group.userData.rank10Aura=true;parent.add(group);
 const materials=[],geometries=[],lines=paths(cls);
 const material=(color,opacity)=>{const m=new T.MeshBasicMaterial({color,map:texture('ribbon'),transparent:true,opacity,side:T.DoubleSide,forceSinglePass:true,depthTest:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});materials.push(m);return m;};
 const glowMat=material(theme.color,.42),coreMat=material(theme.core,.86),glowGeo=ribbons(lines,.12),coreGeo=ribbons(lines,.014);geometries.push(glowGeo,coreGeo);
 const glow=new T.Mesh(glowGeo,glowMat),core=new T.Mesh(coreGeo,coreMat);core.position.z=.008;group.add(glow,core);
 const washMat=new T.SpriteMaterial({map:texture('wash'),color:theme.color,opacity:.20,depthTest:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});materials.push(washMat);
 const wash=new T.Sprite(washMat);wash.position.set(0,.27,-.08);wash.scale.set(2.05,2.3,1);group.add(wash);
 const moteGeo=new T.BufferGeometry(),motePositions=new T.Float32BufferAttribute(new Float32Array(12*3),3);moteGeo.setAttribute('position',motePositions);moteGeo.boundingSphere=new T.Sphere(V(0,.25,0),2.3);geometries.push(moteGeo);
 const moteMat=new T.PointsMaterial({map:texture(theme.shape),color:theme.core,size:.075,sizeAttenuation:true,transparent:true,opacity:.83,alphaTest:.015,depthTest:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});materials.push(moteMat);
 const motes=new T.Points(moteGeo,moteMat);motes.frustumCulled=false;group.add(motes);
 for(const n of [glow,core,wash,motes]){n.frustumCulled=false;n.userData.classLookPart=true;n.userData.rank10Aura=true;}
 return {group,theme,glowMat,coreMat,wash,motes,motePositions,moteMat,worldScale:V(),stats:{motif:theme.motif,drawCalls:4,motes:12,triangles:(glowGeo.index.count+coreGeo.index.count)/3+2},dispose(){group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
export function syncClassAura(a,time=0,motion=true,low=false){
 if(!a)return;const t=motion?time:0,{theme,group,motePositions}=a;
 group.updateWorldMatrix(true,false);group.getWorldScale(a.worldScale);a.moteMat.size=.075*Math.max(Math.abs(a.worldScale.x),Math.abs(a.worldScale.y),Math.abs(a.worldScale.z));
 a.wash.visible=a.motes.visible=!low;a.glowMat.opacity=.40+(motion?Math.sin(t*1.15)*.035:0);a.coreMat.opacity=.86;
 a.wash.material.opacity=theme.motion==='petals'?.20+(motion?Math.sin(t*.8)*.045:0):.18;
 if(low)return;
 for(let i=0;i<12;i++){
  const phase=i/12,angle=phase*Math.PI*2+t*.28,s=i%2?-1:1;let x,y,z=-.04;
  if(theme.motion==='orbit'){x=Math.cos(angle)*.91;y=.30+Math.sin(angle)*.91;z=Math.sin(angle)*.12;}
  else if(theme.motion==='petals'){x=Math.cos(angle)*.82;y=.14+Math.sin(angle)*.73;z=Math.sin(angle*2)*.10;}
  else if(theme.motion==='tide'){x=Math.cos(angle)*.97;y=-.35+Math.sin(angle*2)*.25;z=Math.sin(angle)*.20;}
  else{const progress=(phase+t*(theme.motion==='fall'?.12:clsSpeed(theme)))%1;x=s*(.48+.35*Math.sin(phase*7+progress*2));y=theme.motion==='fall'?1.22-progress*2.12:-.87+progress*2.20;z=Math.sin(phase*9+progress)*.12;}
  motePositions.setXYZ(i,x,y,z);
 }
 motePositions.needsUpdate=true;
}
const clsSpeed=theme=>theme.shape==='ember'?.20:theme.shape==='diamond'?.17:.105;
