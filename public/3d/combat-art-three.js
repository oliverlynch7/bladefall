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
 fragmentShader:'varying vec4 vTint; varying vec2 vUv; varying float vKind; void main(){float fade=vKind>.5?pow(max(0.,1.-dot(vUv,vUv)),2.):1.-smoothstep(.5,1.,abs(vUv.x));float filament=vKind>.5?1.:.95+.05*sin(vUv.y*95.+vUv.x*3.);gl_FragColor=vec4(vTint.rgb*filament,vTint.a*fade);}'});
const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=5;mesh.name='Player combat ribbons';
// One shared surface batch: opaque-looking rims and softly shaded magical membranes.
const SURFACE_CAP=12288,surfacePositions=new Float32Array(SURFACE_CAP*3),surfaceNormals=new Float32Array(SURFACE_CAP*3),surfaceTints=new Float32Array(SURFACE_CAP*4),surfaceUvs=new Float32Array(SURFACE_CAP*2),surfaceStyles=new Float32Array(SURFACE_CAP);
const surfaceGeometry=new THREE.BufferGeometry();for(const [key,array,size]of [['position',surfacePositions,3],['normal',surfaceNormals,3],['tint',surfaceTints,4],['surfaceUv',surfaceUvs,2],['surfaceStyle',surfaceStyles,1]])surfaceGeometry.setAttribute(key,new THREE.BufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));
const surfaceMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.NormalBlending,
 vertexShader:'attribute vec4 tint;attribute vec2 surfaceUv;attribute float surfaceStyle;varying vec4 vTint;varying vec3 vNormal;varying vec2 vUv;varying float vStyle;void main(){vTint=tint;vNormal=normal;vUv=surfaceUv;vStyle=surfaceStyle;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec4 vTint;varying vec3 vNormal;varying vec2 vUv;varying float vStyle;void main(){vec3 n=normalize(vNormal);float light=.42+.44*abs(dot(n,normalize(vec3(-.45,.75,.55))));float brushed=.96+.04*sin(vUv.y*260.+sin(vUv.x*54.)*2.);float sheen=pow(max(0.,abs(dot(n,normalize(vec3(.15,.35,1.))))),14.);float alpha=vTint.a;vec3 color=vTint.rgb*light;if(vStyle<1.5){color=color*brushed+vec3(.26)*sheen;}else if(vStyle<2.5){float lines=pow(.5+.5*sin(vUv.y*120.+sin(vUv.x*18.)*2.),18.);color=vTint.rgb*(.65+.35*light)+lines*vTint.rgb*.14;alpha*=.65+.35*sheen;}else if(vStyle<3.5){float heat=pow(max(0.,1.-abs(vUv.x*2.-1.)),1.5);color=mix(vTint.rgb,vec3(1.,.87,.48),heat*.55);alpha*=smoothstep(0.,.15,vUv.y)*(1.-smoothstep(.75,1.,vUv.y))*pow(max(0.,1.-abs(vUv.x*2.-1.)),.5);}else{color*=.9+.1*sin(vUv.y*45.);color+=vec3(.10)*sheen;}gl_FragColor=vec4(color,alpha);}' });
const surfaceMesh=new THREE.Mesh(surfaceGeometry,surfaceMaterial);surfaceMesh.name='Skill detail surfaces';surfaceMesh.frustumCulled=false;surfaceMesh.renderOrder=4;
const surfacePointPool=[],surfaceNormalPool=[];
let surfaceCount=0;const surfaceMatrix=new THREE.Matrix4(),surfaceScaleMatrix=new THREE.Matrix4(),surfaceNormalMatrix=new THREE.Matrix3(),surfacePoint=new THREE.Vector3(),surfaceNormal=new THREE.Vector3();
let n=0,widthScale=1;const stack=[],pool=[];let level=0;const m=new THREE.Matrix4(),tmp=new THREE.Matrix4(),a=new THREE.Vector3(),b=new THREE.Vector3(),side=new THREE.Vector3(),view=new THREE.Vector3(),eye=new THREE.Vector3(),c=new THREE.Color();
function vertex(v,offset,col,alpha){const i=n++;positions[i*3]=v.x+side.x*offset;positions[i*3+1]=v.y+side.y*offset;positions[i*3+2]=v.z+side.z*offset;colors[i*4]=col.r;colors[i*4+1]=col.g;colors[i*4+2]=col.b;colors[i*4+3]=alpha;uvs[i*2]=offset<0?-1:1;uvs[i*2+1]=0;kinds[i]=0;}
function strip(lo,hi,width,col,alpha){
 vertex(a,lo*width,col,alpha);vertex(b,lo*width,col,alpha);vertex(b,hi*width,col,alpha);
 vertex(a,lo*width,col,alpha);vertex(b,hi*width,col,alpha);vertex(a,hi*width,col,alpha);
}
const right=new THREE.Vector3(),up=new THREE.Vector3();
const trailPoints=[],trailSides=[];let trailLength=2;
function trailVertex(index,width,color,alpha){const point=trailPoints[index],normal=trailSides[index],i=n++;positions[i*3]=point.x+normal.x*width;positions[i*3+1]=point.y+normal.y*width;positions[i*3+2]=point.z+normal.z*width;colors[i*4]=color.r;colors[i*4+1]=color.g;colors[i*4+2]=color.b;colors[i*4+3]=alpha;uvs[i*2]=width<0?-1:1;uvs[i*2+1]=index/(trailLength-1);kinds[i]=0;}
const draw={
 surface(shape,scale,color,alpha,style=2){
  if(!shape||alpha<=0||surfaceCount+shape.faces.length*3>SURFACE_CAP)return;
  surfaceMatrix.copy(m).multiply(surfaceScaleMatrix.makeScale(...scale));surfaceNormalMatrix.getNormalMatrix(surfaceMatrix);c.set(color);
  for(let id=0;id<shape.points.length;id++){(surfacePointPool[id]||(surfacePointPool[id]=new THREE.Vector3())).fromArray(shape.points[id]).applyMatrix4(surfaceMatrix);(surfaceNormalPool[id]||(surfaceNormalPool[id]=new THREE.Vector3())).fromArray(shape.normals[id]).applyMatrix3(surfaceNormalMatrix).normalize();}
  for(const face of shape.faces)for(const id of face){const i=surfaceCount++,p=surfacePointPool[id],normal=surfaceNormalPool[id],uv=shape.uv[id];surfacePositions[i*3]=p.x;surfacePositions[i*3+1]=p.y;surfacePositions[i*3+2]=p.z;surfaceNormals[i*3]=normal.x;surfaceNormals[i*3+1]=normal.y;surfaceNormals[i*3+2]=normal.z;surfaceTints[i*4]=c.r;surfaceTints[i*4+1]=c.g;surfaceTints[i*4+2]=c.b;surfaceTints[i*4+3]=alpha;surfaceUvs[i*2]=uv[0];surfaceUvs[i*2+1]=uv[1];surfaceStyles[i]=style;}
 },
 trail(points,widths,color,alpha){
  if(points.length<2||alpha<=0)return;const count=Math.min(points.length,193);trailLength=count;c.set(color);
  for(let i=0;i<count;i++){(trailPoints[i]||(trailPoints[i]=new THREE.Vector3())).fromArray(points[i]).applyMatrix4(m);}
  const closed=trailPoints[0].distanceToSquared(trailPoints[count-1])<1e-10;for(let i=0;i<count;i++){const normal=trailSides[i]||(trailSides[i]=new THREE.Vector3());normal.subVectors(trailPoints[i===count-1&&closed?1:Math.min(count-1,i+1)],trailPoints[i===0&&closed?count-2:Math.max(0,i-1)]);view.subVectors(eye,trailPoints[i]);normal.cross(view).normalize();}
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
 if(!api||!g||!meta){mesh.visible=false;surfaceMesh.visible=false;return;}
 if(mesh.parent!==scene)scene.add(mesh);if(surfaceMesh.parent!==scene)scene.add(surfaceMesh);
 api.threeReady=true;n=0;surfaceCount=0;const scale=1/(context?.unitsPerMeter||1);widthScale=scale;m.makeScale(scale,scale,scale);stack.length=0;level=0;eye.setFromMatrixPosition(camera.matrixWorld);right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);draw.classId=meta.classId;draw.quality=meta.quality;
 draw.particles=meta.particles!==false;
 draw.theme=context?.theme||window.__BF_WORLD?.().theme;
 const totalBudget=draw.quality==='low'?300:900;
 const fieldStrokes=window.BF_FIELD_ART?.render(g,draw)||0;
 const hostileStrokes=window.BF_HOSTILE_ART?.render(g,draw)||0;
 draw.strokeBudget=Math.max(0,totalBudget-hostileStrokes-fieldStrokes);
 api.render(g,draw);
 geometry.setDrawRange(0,n);
 if(n){for(const key of ["position","tint","effectUv","effectKind"]){const attribute=geometry.attributes[key];attribute.clearUpdateRanges();attribute.addUpdateRange(0,n*attribute.itemSize);attribute.needsUpdate=true;}}
 mesh.visible=n>0;surfaceMesh.visible=surfaceCount>0;surfaceGeometry.setDrawRange(0,surfaceCount);
 if(surfaceCount)for(const key of Object.keys(surfaceGeometry.attributes)){const attr=surfaceGeometry.attributes[key];attr.clearUpdateRanges();attr.addUpdateRange(0,surfaceCount*attr.itemSize);attr.needsUpdate=true;}
 let finite=true;if(context?.verify)for(let i=0;i<n;i++){if(![positions[i*3],positions[i*3+1],positions[i*3+2],colors[i*4],colors[i*4+3],uvs[i*2],uvs[i*2+1]].every(Number.isFinite)){finite=false;break;}}
 if(context?.verify)for(let i=0;i<surfaceCount;i++)if(![surfacePositions[i*3],surfacePositions[i*3+1],surfacePositions[i*3+2],surfaceNormals[i*3],surfaceNormals[i*3+1],surfaceNormals[i*3+2],surfaceTints[i*4+3]].every(Number.isFinite)){finite=false;break;}
 return window.__combatArtStats={finite,vertices:n,surfaceVertices:surfaceCount,triangles:(n+surfaceCount)/3,drawCalls:(n?1:0)+(surfaceCount?1:0),events:g.combatArt?.length||0,fieldStrokes,hostileStrokes,hostileEvents:g.hostileArt?.length||0};
}
