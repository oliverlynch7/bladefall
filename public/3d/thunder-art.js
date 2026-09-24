import * as T from './three.module.js';
import {claimSurface} from './surface-regions.js?v=1972';
import {createHydra} from './hydra-art.js?v=2033';
let active;
export function buildCoastHigh(scene,w){
 scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.5:.16);}});
 const textures=[];const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=256;const ctx=groundCanvas.getContext('2d');ctx.fillStyle='#91a7a6';ctx.fillRect(0,0,256,256);for(let i=0;i<85;i++){const x=i*73%256,y=i*113%256;ctx.fillStyle=i%4===0?'#b8b997':i%3===0?'#667f86':'#819c9f';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8+i%13,y-3);ctx.lineTo(x+15,y+5);ctx.lineTo(x+3,y+8);ctx.fill();}ctx.strokeStyle='#6b858b';ctx.lineWidth=2;for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(i*41,0);ctx.lineTo(i*41+12,28+i*9);ctx.lineTo(i*41+4,45+i*9);ctx.stroke();}const groundTex=new T.CanvasTexture(groundCanvas);groundTex.colorSpace=T.SRGBColorSpace;groundTex.wrapS=groundTex.wrapT=T.RepeatWrapping;textures.push(groundTex);
 const group=new T.Group(),bins=new Map(),geos=[],mats=[],dummy=new T.Object3D(),oldFog=scene.fog;
 scene.fog=new T.Fog('#648996',1800,6500);const sun=new T.DirectionalLight('#d2e7ee',2);sun.position.set(-500,1400,600);group.add(sun);group.add(new T.HemisphereLight('#b3d7e7','#273e45',1.4));
 const box=(x,y,z,sx,sy,sz,c,kind='box')=>{const key=kind+':'+c,a=bins.get(key)||[];a.push([x,y,z,sx,sy,sz]);bins.set(key,a);};
 const ledger=new Map();for(const o of w.obstacles.filter(o=>o.kind==='plat'))for(const p of claimSurface(ledger,o,String(o.h))){box(p.x,p.h-15,p.z,p.w,30,p.d,'#82999a');if(!p.thunderCatch)box(p.x,p.h/2-60,p.z,p.w*1.1,Math.max(50,p.h+90),p.d*1.1,'#3c5664','rock');}
 for(const wall of w.walls)box(wall.x,wall.y0+wall.h/2,wall.z,wall.w,wall.h,wall.d,wall.thunderTag?.endsWith('Gate')?'#69757b':'#4a6570');
 box(0,-105,-1900,15000,20,16000,'#1c6274');
 for(const d of w.deco){if(d.kind==='thunderSpire'){box(d.x,d.y0+d.h*.45,d.z,d.w,d.h,d.d,'#3b596b','rock');box(d.x-20,d.y0+d.h*.8,d.z,d.w*.7,d.h*.5,d.d*.7,'#647e89','rock');}if(d.kind==='thunderArch'){for(const s of [-1,1])box(d.x+s*d.w*.5,d.y0+d.h/2,d.z,95,d.h,d.d,'#78908d','rock');box(d.x,d.y0+d.h,d.z,d.w+120,95,140,'#90a19a','rock');}}
 for(const r of w.rooms){for(let j=0;j<16;j++){const a=j/16*Math.PI*2,x=r.x+Math.cos(a)*r.w*.53,z=r.z+Math.sin(a)*r.d*.53;box(x,r.y-6,z,35+j%4*12,35,40+j%3*15,'#889a91','rock');if(j%3===0)box(x,r.y+18,z,4,45,9,'#6b9384');}}
 for(const r of w.rooms)for(let j=0;j<38;j++){const x=r.x+(j*97%Math.max(100,r.w-60))-r.w/2+30,z=r.z+(j*131%Math.max(100,r.d-60))-r.d/2+30;box(x,r.y+2,z,7+j%4*5,3,6+j%5*4,j%5===0?'#b4b18b':'#789693','rock');if(j%7===0&&Math.abs(x-r.x)>r.w*.28)for(let k=0;k<4;k++)box(x+k*4,r.y+12+k*2,z,3,22+k*5,5,'#80a991');}
 let hydra;if(w.shipScene==='hydra'){hydra=createHydra(group);for(const s of [-1,1])for(let j=0;j<5;j++)box(s*(1100+j*90),100+j*75,-650-j*100,230,480+j*110,300,'#476777','rock');}
 else{
 // Fisher's landing: nets, floats, stacked baskets, a shelter facing the sea.
 for(const x of [90,270])for(const z of [100,310])box(x,115,z,12,150,12,'#665c49');for(let j=0;j<5;j++)box(105+j*38,191-j*5,150,38,12,145,j%2?'#9b997e':'#c4b99a');
 for(let j=0;j<6;j++){box(105+j*28,106,307,4,90,4,'#96856a');box(175,70+j*15,307,150,3,3,'#96856a');}for(let j=0;j<3;j++)box(320,59+j*27,235,50-j*4,24,50-j*4,'#9c845a');
 // Lift beams are open; players can stand on and see the traveling wooden deck.
 for(const x of [-410,-190])box(x,235,-650,25,420,25,'#645e50');box(-300,449,-650,270,25,30,'#a1a287');
 for(let j=0;j<8;j++)box(-300,435-j*40,-650,7,25,7,'#8f9c94');
 // Higher white stone stair points toward Sunspire without inventing a second palace.
 for(let j=0;j<12;j++)box(300,875+j*16,-5090-j*55,210,20,65,'#c0c6b1');
 for(const [x,z,y]of [[-2120,-3820,340],[-1560,-4780,300]]){box(x,y+240,z,590,100,540,'#435e69','rock');}
 }
 let triangles=0,instances=0;const cube=new T.BoxGeometry(1,1,1),rock=new T.CylinderGeometry(.43,.62,1,6);geos.push(cube,rock);
 for(const [key,list]of bins){const isRock=key.startsWith('rock:'),m=new T.MeshStandardMaterial({color:key.slice(key.indexOf(':')+1),roughness:.96,flatShading:true});if(key.endsWith('#82999a'))m.map=groundTex;mats.push(m);const mesh=new T.InstancedMesh(isRock?rock:cube,m,list.length);list.forEach(([x,y,z,sx,sy,sz],i)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,isRock?(i%4)*.31:0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();group.add(mesh);triangles+=list.length*(isRock?24:12);instances+=list.length;}
 window.__DEEP_ART_ACTIVE=true;window.__DEEP_ART_LOOK={body:'#46606d',hazard:['#1c6274','#81b9c0'],sky:[.31,.46,.54],sunGlow:[.04,.07,.09]};active={group,hydra};group.userData.dispose=()=>{hydra?.dispose();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());scene.fog=oldFog;if(active?.group===group)active=null;window.__DEEP_ART_ACTIVE=false;window.__DEEP_ART_LOOK=null;};
 return {group,counts:{name:w.shipScene==='hydra'?'Hydra Ledges':'Thunder Cliffs',artObstacles:true,triangles,totalTriangles:triangles,instances}};
}
export function updateCoastHigh(){if(active?.hydra&&window.__BF3?.G?.hydraArena)active.hydra.update(window.__BF3.G);}
