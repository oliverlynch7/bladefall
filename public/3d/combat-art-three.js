import * as THREE from './three.module.js';
// A single preallocated transparent mesh for all player effect strokes.
const CAP=16200,positions=new Float32Array(CAP*3),colors=new Float32Array(CAP*4),uvs=new Float32Array(CAP*2),kinds=new Float32Array(CAP);
const geometry=new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
geometry.setAttribute('tint',new THREE.BufferAttribute(colors,4).setUsage(THREE.DynamicDrawUsage));
geometry.setAttribute('effectUv',new THREE.BufferAttribute(uvs,2).setUsage(THREE.DynamicDrawUsage));
geometry.setAttribute('effectKind',new THREE.BufferAttribute(kinds,1).setUsage(THREE.DynamicDrawUsage));
const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
 vertexShader:'attribute vec4 tint; attribute vec2 effectUv; attribute float effectKind; varying vec4 vTint; varying vec2 vUv; varying float vKind; void main(){vTint=tint;vUv=effectUv;vKind=effectKind;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'varying vec4 vTint; varying vec2 vUv; varying float vKind; void main(){float fade=vKind>.5?pow(max(0.,1.-dot(vUv,vUv)),2.):1.-smoothstep(.5,1.,abs(vUv.x));gl_FragColor=vec4(vTint.rgb,vTint.a*fade);}'});
const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=5;mesh.name='Player combat ribbons';
let n=0,widthScale=1;const stack=[],pool=[];let level=0;const m=new THREE.Matrix4(),tmp=new THREE.Matrix4(),a=new THREE.Vector3(),b=new THREE.Vector3(),side=new THREE.Vector3(),view=new THREE.Vector3(),eye=new THREE.Vector3(),c=new THREE.Color();
function vertex(v,offset,col,alpha){const i=n++;positions[i*3]=v.x+side.x*offset;positions[i*3+1]=v.y+side.y*offset;positions[i*3+2]=v.z+side.z*offset;colors[i*4]=col.r;colors[i*4+1]=col.g;colors[i*4+2]=col.b;colors[i*4+3]=alpha;uvs[i*2]=offset<0?-1:1;uvs[i*2+1]=0;kinds[i]=0;}
function strip(lo,hi,width,col,alpha){
 vertex(a,lo*width,col,alpha);vertex(b,lo*width,col,alpha);vertex(b,hi*width,col,alpha);
 vertex(a,lo*width,col,alpha);vertex(b,hi*width,col,alpha);vertex(a,hi*width,col,alpha);
}
const right=new THREE.Vector3(),up=new THREE.Vector3();
const trailPoints=[],trailSides=[];
function trailVertex(index,width,color,alpha){const point=trailPoints[index],normal=trailSides[index],i=n++;positions[i*3]=point.x+normal.x*width;positions[i*3+1]=point.y+normal.y*width;positions[i*3+2]=point.z+normal.z*width;colors[i*4]=color.r;colors[i*4+1]=color.g;colors[i*4+2]=color.b;colors[i*4+3]=alpha;uvs[i*2]=width<0?-1:1;uvs[i*2+1]=0;kinds[i]=0;}
const draw={
 trail(points,widths,color,alpha){
  if(points.length<2||alpha<=0)return;const count=Math.min(points.length,193);c.set(color);
  for(let i=0;i<count;i++){(trailPoints[i]||(trailPoints[i]=new THREE.Vector3())).fromArray(points[i]).applyMatrix4(m);}
  for(let i=0;i<count;i++){const normal=trailSides[i]||(trailSides[i]=new THREE.Vector3());normal.subVectors(trailPoints[Math.min(count-1,i+1)],trailPoints[Math.max(0,i-1)]);view.subVectors(eye,trailPoints[i]);normal.cross(view).normalize();}
  for(const [size,gain] of [[2.4,.09],[.7,.5],[.17,.85]]){if(size===.17){c.r+=(1-c.r)*.55;c.g+=(1-c.g)*.55;c.b+=(1-c.b)*.55;}for(let i=0;i<count-1;i++){if(n+6>CAP)return;const w1=widths[i]*widthScale*size,w2=widths[i+1]*widthScale*size;trailVertex(i,-w1,c,alpha*gain);trailVertex(i+1,-w2,c,alpha*gain);trailVertex(i+1,w2,c,alpha*gain);trailVertex(i,-w1,c,alpha*gain);trailVertex(i+1,w2,c,alpha*gain);trailVertex(i,w1,c,alpha*gain);}}
 },
 glow(point,radius,color,alpha){
  if(n+6>CAP||alpha<=0)return;a.fromArray(point).applyMatrix4(m);c.set(color);const radiusWorld=radius*widthScale;
  for(const [x,y] of [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]]){const i=n++;positions[i*3]=a.x+(right.x*x+up.x*y)*radiusWorld;positions[i*3+1]=a.y+(right.y*x+up.y*y)*radiusWorld;positions[i*3+2]=a.z+(right.z*x+up.z*y)*radiusWorld;colors[i*4]=c.r;colors[i*4+1]=c.g;colors[i*4+2]=c.b;colors[i*4+3]=alpha;uvs[i*2]=x;uvs[i*2+1]=y;kinds[i]=1;}
 },
 pushM(){const saved=pool[level]||(pool[level]=new THREE.Matrix4());saved.copy(m);stack[level++]=saved;},popM(){m.copy(stack[--level]);},mv(x,y,z){m.multiply(tmp.makeTranslation(x,y,z));},rotY(v){m.multiply(tmp.makeRotationY(v));},rotX(v){m.multiply(tmp.makeRotationX(v));},
 ribbon(from,to,width,color,alpha){
  if(n+18>CAP||alpha<=0)return;
  a.fromArray(from).applyMatrix4(m);b.fromArray(to).applyMatrix4(m);
  side.subVectors(b,a);view.subVectors(eye,a);side.cross(view).normalize();c.set(color);
  width*=widthScale;strip(-2.4,2.4,width,c,alpha*.09);strip(-.7,.7,width,c,alpha*.5);
  c.r+=(1-c.r)*.55;c.g+=(1-c.g)*.55;c.b+=(1-c.b)*.55;strip(-.17,.17,width,c,alpha*.85);
 }
};
export function syncCombatArt(scene,camera,context){
 const api=window.BF_COMBAT_ART,g=context?.g||window.__BF3?.G,meta=context?.meta||window.__BF3?.meta;
 if(!api||!g||!meta){mesh.visible=false;return;}
 if(mesh.parent!==scene)scene.add(mesh);
 api.threeReady=true;n=0;const scale=1/(context?.unitsPerMeter||1);widthScale=scale;m.makeScale(scale,scale,scale);stack.length=0;level=0;eye.setFromMatrixPosition(camera.matrixWorld);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);draw.classId=meta.classId;draw.quality=meta.quality;
 draw.particles=meta.particles!==false;
 draw.theme=context?.theme||window.__BF_WORLD?.().theme;
 const totalBudget=draw.quality==='low'?300:900;
 const fieldStrokes=window.BF_FIELD_ART?.render(g,draw)||0;
 const hostileStrokes=window.BF_HOSTILE_ART?.render(g,draw)||0;
 draw.strokeBudget=Math.max(0,totalBudget-hostileStrokes-fieldStrokes);
 api.render(g,draw);
 geometry.setDrawRange(0,n);
 if(n){for(const key of ["position","tint","effectUv","effectKind"]){const attribute=geometry.attributes[key];attribute.clearUpdateRanges();attribute.addUpdateRange(0,n*attribute.itemSize);attribute.needsUpdate=true;}}
 mesh.visible=n>0;
 let finite=true;if(context?.verify)for(let i=0;i<n;i++){if(![positions[i*3],positions[i*3+1],positions[i*3+2],colors[i*4],colors[i*4+3],uvs[i*2],uvs[i*2+1]].every(Number.isFinite)){finite=false;break;}}
 return window.__combatArtStats={finite,vertices:n,triangles:n/3,drawCalls:n?1:0,events:g.combatArt?.length||0,fieldStrokes,hostileStrokes,hostileEvents:g.hostileArt?.length||0};
}
