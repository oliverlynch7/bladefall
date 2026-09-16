import * as THREE from './three.module.js';
// A single preallocated transparent mesh for all player effect strokes.
const CAP=16200,positions=new Float32Array(CAP*3),colors=new Float32Array(CAP*4);
const geometry=new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
geometry.setAttribute('tint',new THREE.BufferAttribute(colors,4).setUsage(THREE.DynamicDrawUsage));
const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
 vertexShader:'attribute vec4 tint; varying vec4 vTint; void main(){vTint=tint;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'varying vec4 vTint; void main(){gl_FragColor=vTint;}'});
const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=5;mesh.name='Player combat ribbons';
let n=0;const stack=[],pool=[];let level=0;const m=new THREE.Matrix4(),tmp=new THREE.Matrix4(),a=new THREE.Vector3(),b=new THREE.Vector3(),side=new THREE.Vector3(),view=new THREE.Vector3(),eye=new THREE.Vector3(),c=new THREE.Color();
function vertex(v,offset,col,alpha){const i=n++;positions[i*3]=v.x+side.x*offset;positions[i*3+1]=v.y+side.y*offset;positions[i*3+2]=v.z+side.z*offset;colors[i*4]=col.r;colors[i*4+1]=col.g;colors[i*4+2]=col.b;colors[i*4+3]=alpha;}
function strip(lo,hi,width,col,alpha){
 vertex(a,lo*width,col,alpha);vertex(b,lo*width*.55,col,alpha);vertex(b,hi*width*.55,col,alpha);
 vertex(a,lo*width,col,alpha);vertex(b,hi*width*.55,col,alpha);vertex(a,hi*width,col,alpha);
}
const draw={
 pushM(){const saved=pool[level]||(pool[level]=new THREE.Matrix4());saved.copy(m);stack[level++]=saved;},popM(){m.copy(stack[--level]);},mv(x,y,z){m.multiply(tmp.makeTranslation(x,y,z));},rotY(v){m.multiply(tmp.makeRotationY(v));},rotX(v){m.multiply(tmp.makeRotationX(v));},
 ribbon(from,to,width,color,alpha){
  if(n+18>CAP||alpha<=0)return;
  a.fromArray(from).applyMatrix4(m);b.fromArray(to).applyMatrix4(m);
  side.subVectors(b,a);view.subVectors(eye,a);side.cross(view).normalize();c.set(color);
  strip(-2.4,2.4,width,c,alpha*.09);strip(-.7,.7,width,c,alpha*.5);
  c.r+=(1-c.r)*.55;c.g+=(1-c.g)*.55;c.b+=(1-c.b)*.55;strip(-.17,.17,width,c,alpha*.85);
 }
};
export function syncCombatArt(scene,camera){
 const api=window.BF_COMBAT_ART,g=window.__BF3?.G;
 if(!api||!g){mesh.visible=false;return;}
 if(mesh.parent!==scene)scene.add(mesh);
 api.threeReady=true;n=0;m.identity();stack.length=0;level=0;eye.setFromMatrixPosition(camera.matrixWorld);draw.classId=window.__BF3.meta.classId;draw.quality=window.__BF3.meta.quality;
 draw.particles=window.__BF3.meta.particles!==false;
 draw.theme=window.__BF_WORLD?.().theme;
 const totalBudget=draw.quality==='low'?300:900;
 const fieldStrokes=window.BF_FIELD_ART?.render(g,draw)||0;
 const hostileStrokes=window.BF_HOSTILE_ART?.render(g,draw)||0;
 draw.strokeBudget=Math.max(0,totalBudget-hostileStrokes-fieldStrokes);
 api.render(g,draw);
 geometry.setDrawRange(0,n);
 if(n){for(const key of ["position","tint"]){const attribute=geometry.attributes[key];attribute.clearUpdateRanges();attribute.addUpdateRange(0,n*attribute.itemSize);attribute.needsUpdate=true;}}
 mesh.visible=n>0;
 window.__combatArtStats={vertices:n,triangles:n/3,drawCalls:n?1:0,events:g.combatArt?.length||0,fieldStrokes,hostileStrokes,hostileEvents:g.hostileArt?.length||0};
}
