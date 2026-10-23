import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// Five-class pilot. Three bounded draws per actor; no lights, timers, history or emitters.
export const ASCENSION_CLASSES=new Set(['ninja','necromancer','warrior','ranger','mage']);
export const ASCENSION_THEMES={
 ninja:{name:'Crimson Phantom',motif:'Shadow-silk streamers and scarlet seals',color:'#eb3457',core:'#ffd1bf',mode:0,count:6},
 necromancer:{name:'Sovereign of Souls',motif:'Three ancestral souls and trailing ectoplasm',color:'#43dca0',core:'#dcffe5',mode:1,count:3},
 warrior:{name:'Immortal Vanguard',motif:'Spectral royal standards and oath heraldry',color:'#eba63e',core:'#fff1b8',mode:2,count:6},
 ranger:{name:'Heart of the Wild',motif:'Living emerald fronds and luminous leaves',color:'#46c98d',core:'#e0ffbd',mode:3,count:12},
 mage:{name:'Astral Archmage',motif:'A three-dimensional galaxy and orbiting stars',color:'#658bff',core:'#ccecff',mode:4,count:7}
};
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const vertexShader=`
uniform float uTime;uniform float uMode;
attribute vec3 color;varying vec2 vUv;varying vec3 vColor;varying vec3 vPosition;
void main(){
 vec3 p=position;float tip=clamp((1.5-p.y)*.5,0.,1.);
 if(uMode<.5){p.x+=sin(p.y*5.+uTime*1.1+p.z*3.)*.045*tip;p.z+=sin(p.y*4.-uTime*.8)*.07*tip;}
 else if(uMode<1.5){p.x+=sin(p.y*6.+uTime*.7+p.x*4.)*.035*tip;p.z+=cos(p.y*5.+uTime*.6)*.025;}
 else if(uMode<2.5){p.z+=sin(p.y*3.+uTime*.8+p.x*2.)*.045*tip;}
 else if(uMode<3.5){p.x+=sin(p.y*3.+p.x*5.+uTime*.65)*.022;p.z+=sin(p.y*4.+uTime*.8)*.035;}
 else{float an=uTime*.09;mat2 spin=mat2(cos(an),-sin(an),sin(an),cos(an));p.xz=spin*p.xz;}
 vUv=uv;vColor=color;vPosition=position;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const fragmentShader=`
uniform float uTime;uniform float uMode;uniform float uDetail;
varying vec2 vUv;varying vec3 vColor;varying vec3 vPosition;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 float edge=pow(abs(vUv.x*2.-1.),3.);float alpha=.25+edge*.30;vec3 col=vColor;
 if(uMode<.5){float weave=step(.92,fract(vUv.y*21.+vUv.x*5.));alpha=.22+edge*.30+weave*.10;col*=.70+.30*weave;}
 else if(uMode<1.5){alpha=(.13+edge*.23)*(.65+.35*sin(vUv.y*13.-uTime*.7));}
 else if(uMode<2.5){float hem=step(.96,abs(vUv.x*2.-1.));float crest=step(abs(vUv.x-.5),.07)*(step(.35,vUv.y)-step(.78,vUv.y));float arms=step(abs(vUv.y-.58),.025)*step(abs(vUv.x-.5),.22);alpha=.30+hem*.24+max(crest,arms)*.36;col=mix(col,vec3(1.,.95,.72),max(crest,arms)*.8);}
 else if(uMode<3.5){alpha=.12+edge*.28;col*=.8+.2*sin(vUv.y*16.+uTime*.4);}
 else{vec2 cell=floor(vUv*vec2(25.,35.)),f=fract(vUv*vec2(25.,35.))-.5;float star=step(.95,hash(cell))*pow(max(0.,1.-length(f)*3.),3.);float nebula=pow(.5+.5*sin(vUv.y*10.+vUv.x*7.),2.);alpha=.10+nebula*.16+star*.65;col=mix(col,vec3(.94,.90,1.),star);}
 if(uDetail>.5)alpha=.78;
 alpha*=smoothstep(0.,.06,vUv.y)*smoothstep(1.,.91,vUv.y);
 gl_FragColor=vec4(col*1.25,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
function colored(g,color){if(g.index)g=g.toNonIndexed();const c=new T.Color(color),p=g.attributes.position,colors=new Float32Array(p.count*3);for(let i=0;i<p.count;i++)c.toArray(colors,i*3);g.setAttribute('color',new T.BufferAttribute(colors,3));if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(p.count*2),2));return g;}
function combine(list){const g=mergeGeometries(list,false);list.forEach(p=>p.dispose());g.computeBoundingSphere();return g;}
function tube(list,points,radius,color){const curve=new T.CatmullRomCurve3(points.map(p=>V(...p)));list.push(colored(new T.TubeGeometry(curve,points.length===2?1:Math.max(10,points.length*3),radius,4,false),color));}
function cloth(list,points,width,color,taper=.3){
 const curve=new T.CatmullRomCurve3(points.map(p=>V(...p))),p=[],uv=[],idx=[],rows=18;
 for(let j=0;j<=rows;j++){const t=j/rows,c=curve.getPoint(t),w=width*(1-taper*t);
  for(let k=0;k<3;k++){const x=k/2-.5;p.push(c.x+x*w,c.y,c.z+Math.cos(x*Math.PI)*.025);uv.push(k/2,1-t);}
  if(j<rows)for(let k=0;k<2;k++){const a=j*3+k;idx.push(a,a+3,a+1,a+1,a+3,a+4);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();list.push(colored(g,color));
}
function part(list,g,color,x=0,y=0,z=0,scale=[1,1,1]){g.scale(...scale);g.translate(x,y,z);list.push(colored(g,color));}
function ornamentGeometry(cls,color,core){
 const a=[];
 if(cls==='necromancer'){
  let g=new T.SphereGeometry(1,12,8),p=g.attributes.position,keep=[];
  // Actual eye sockets in the front of the skull; not a green sphere with painted dots.
  for(let i=0;i<g.index.count;i+=3){let x=0,y=0,z=0;for(let j=0;j<3;j++){const k=g.index.getX(i+j);x+=p.getX(k)/3;y+=p.getY(k)/3;z+=p.getZ(k)/3;}const hole=z>.45&&[-1,1].some(s=>((x-s*.36)/.27)**2+((y-.08)/.26)**2<1);if(!hole)keep.push(g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2));}g.setIndex(keep);part(a,g,core,0,.035,0,[.16,.17,.13]);
  part(a,new T.BoxGeometry(.16,.07,.11),core,0,-.10,.025);
  for(const s of [-1,1])part(a,new T.SphereGeometry(.022,6,4),color,s*.055,.045,.115);
  for(let j=0;j<4;j++)part(a,new T.BoxGeometry(.019,.045,.035),core,(j-1.5)*.028,-.145,.068);
 }else{
  const shape=new T.Shape();
  if(cls==='ranger'){shape.moveTo(0,-.16);shape.bezierCurveTo(-.14,-.02,-.12,.10,0,.23);shape.bezierCurveTo(.12,.10,.14,-.02,0,-.16);}
  else if(cls==='mage'){for(let j=0;j<16;j++){const an=j*Math.PI/8,r=j%2?.032:.12;const x=Math.sin(an)*r,y=Math.cos(an)*r;j?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();}
  else if(cls==='warrior'){shape.moveTo(-.075,.12);shape.lineTo(.075,.12);shape.lineTo(.075,0);shape.quadraticCurveTo(.055,-.07,0,-.12);shape.quadraticCurveTo(-.055,-.07,-.075,0);shape.closePath();}
  else{shape.moveTo(-.05,.16);shape.lineTo(.05,.16);shape.lineTo(.043,-.13);shape.lineTo(0,-.18);shape.lineTo(-.043,-.13);shape.closePath();}
  const geo=new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:1,curveSegments:cls==='ranger'?3:5});part(a,geo,color);
  if(cls==='ranger'){tube(a,[[0,-.14,.019],[0,.03,.025],[0,.19,.017]],.005,core);for(const s of [-1,1])for(let j=0;j<3;j++)tube(a,[[0,-.04+j*.06,.025],[s*(.06-j*.012),j*.05,.020]],.003,core);}
  if(cls==='ninja'){tube(a,[[-.025,.09,.023],[.026,.07,.023],[-.02,.01,.023],[.02,-.02,.023],[-.01,-.09,.023]],.006,core);}
  if(cls==='warrior'){tube(a,[[0,-.07,.023],[0,.085,.023]],.007,core);tube(a,[[-.04,.025,.023],[.04,.025,.023]],.006,core);}
 }
 return combine(a);
}
export function createAscension(parent,cls){
 const theme=ASCENSION_THEMES[cls];if(!parent||!theme)return null;
 const surface=[],detail=[],{color,core}=theme;
 if(cls==='ninja')for(const s of [-1,1]){
  const pts=[[s*.27,1.02,-.18],[s*.56,.65,-.35],[s*.82,.08,-.50],[s*.65,-.61,-.42]];cloth(surface,pts,.28,color,.70);
  tube(detail,pts.map(([x,y,z])=>[x+s*.12,y,z+.02]),.009,core);
  cloth(surface,[[s*.30,.71,-.16],[s*.62,.13,-.44],[s*.96,-.39,-.65]],.12,color,.78);
 }else if(cls==='necromancer')for(let j=0;j<3;j++){
  const x=(j-1)*.61,y=1.18+(j===1?.23:0),z=-.37-Math.abs(j-1)*.03;
  cloth(surface,[[x,y,z],[x+(j%2?.10:-.10),y-.36,z-.12],[x*.8,y-.76,z-.17],[x*.65,-.50,z-.20]],.20,color,.88);
  tube(detail,[[x,y-.08,z+.02],[x+.06,y-.40,z-.12],[x*.8,y-.75,z-.15]],.007,core);
 }else if(cls==='warrior')for(const s of [-1,1]){
  const x=s*.65,pts=[[x,1.59,-.28],[x,1.05,-.36],[x,.36,-.43],[x,-.21,-.50]];cloth(surface,pts,.43,color,.15);
  for(const d of [-1,1])tube(detail,pts.map(([x,y,z])=>[x+d*.21*(1-.15*(1.59-y)/1.8),y,z+.008]),.008,core);
  tube(detail,[[x-.25,1.59,-.28],[x+.25,1.59,-.28]],.012,core);
 }else if(cls==='ranger')for(const s of [-1,1])for(let j=0;j<3;j++){
  const pts=[[s*.26,.99,-.18],[s*(.48+j*.13),.67,-.36-j*.05],[s*(.54+j*.14),.17,-.43-j*.06],[s*(.35+j*.12),-.48-j*.06,-.51]];
  cloth(surface,pts,.15,color,.90);tube(detail,pts.slice(0,3),.006,core);
 }else if(cls==='mage'){
  for(const s of [-1,1])cloth(surface,[[s*.30,.95,-.23],[s*.48,.39,-.46],[s*.49,-.32,-.54],[s*.30,-.78,-.64]],.32,color,.22);
  for(let j=0;j<2;j++){const pts=[];for(let i=0;i<=32;i++){const an=i*Math.PI*2/32;pts.push([Math.sin(an)*(.79-j*.10),.28+Math.cos(an)*.26,Math.cos(an)*(.52+j*.08)]);}tube(detail,pts,.007,j?color:core);}
 }
 const group=new T.Group();group.position.z=-.36;group.name='Rank 10 ascension Â· '+theme.name;group.userData.rank10Aura=true;parent.add(group);
 const shader=isDetail=>new T.ShaderMaterial({uniforms:{uTime:{value:0},uMode:{value:theme.mode},uDetail:{value:isDetail?1:0}},vertexShader,fragmentShader,transparent:true,depthTest:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,blending:T.AdditiveBlending,toneMapped:false});
 const veil=new T.Mesh(combine(surface),shader(false)),tracery=new T.Mesh(combine(detail),shader(true));
 const propGeometry=ornamentGeometry(cls,color,core),propMaterial=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:cls==='necromancer'?.70:.86,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,toneMapped:false});
 const ornaments=new T.InstancedMesh(propGeometry,propMaterial,theme.count);ornaments.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(veil,tracery,ornaments);
 for(const n of [veil,tracery,ornaments]){n.frustumCulled=false;n.userData.classLookPart=true;n.userData.rank10Aura=true;}
 const tris=g=>(g.index?.count||g.attributes.position.count)/3;
 const a={group,theme,cls,veil,tracery,ornaments,object:new T.Object3D(),disposed:false,stats:{motif:theme.motif,ascension:theme.name,drawCalls:3,motes:0,ornaments:theme.count,triangles:tris(veil.geometry)+tris(tracery.geometry)+tris(propGeometry)*theme.count},dispose(){if(a.disposed)return;a.disposed=true;group.removeFromParent();for(const n of [veil,tracery,ornaments]){n.geometry.dispose();n.material.dispose();}ornaments.dispose();}};
 syncAscension(a,0);return a;
}
export function syncAscension(a,time=0,motion=true,low=false){
 if(!a||a.disposed)return;const t=motion?time:0,{cls,theme,object:o}=a;
 a.veil.material.uniforms.uTime.value=a.tracery.material.uniforms.uTime.value=t;
 a.tracery.visible=!low;a.ornaments.count=low&&cls!=='necromancer'?Math.ceil(theme.count*.67):theme.count;
 for(let i=0;i<theme.count;i++){
  const phase=i/theme.count,side=i%2?1:-1;o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.setScalar(1);
  if(cls==='ninja'){const j=Math.floor(i/2);o.position.set(side*(.51+j*.15),.80-j*.43,-.35-j*.08);o.position.y+=Math.sin(t*.65+i)*.04;o.rotation.set(.13*Math.sin(t*.4+i),side*.38,side*(.20+Math.sin(t*.5+i)*.14));}
  else if(cls==='necromancer'){o.position.set((i-1)*.61+Math.sin(t*.4+i)*.045,1.18+(i===1?.23:0)+Math.sin(t*.65+i*2)*.055,-.37-Math.abs(i-1)*.03);o.rotation.y=Math.sin(t*.3+i)*.22;o.scale.setScalar(1.06);}
  else if(cls==='warrior'){const j=Math.floor(i/2);o.position.set(side*.65,1.40-j*.53,-.275-j*.055);o.rotation.z=side*.035*Math.sin(t*.5);o.scale.setScalar(j===0?1.0:.75);}
  else if(cls==='ranger'){const j=Math.floor(i/2);o.position.set(side*(.40+.13*Math.sin(j*.8)),.96-j*.25,-.27-j*.055);o.rotation.set(.10*Math.sin(t*.6+i),side*(.32+.20*Math.sin(t*.45+i)),side*(.43+j*.12));o.scale.setScalar(1.15-j*.065);}
  else{const an=phase*Math.PI*2+t*.16;o.position.set(Math.sin(an)*.80,.28+Math.cos(an)*.26,Math.cos(an)*.57);o.rotation.set(.18,t*.17+phase,an*.4);o.scale.setScalar(.50+.22*(.5+.5*Math.sin(t*.8+i)));}
  o.updateMatrix();a.ornaments.setMatrixAt(i,o.matrix);
 }
 a.ornaments.instanceMatrix.needsUpdate=true;
}
