import {buildDeep} from './deep-art.js?v=2017';
import * as T from './three.module.js';
let orb=null;
export function buildMarbleGuardian(scene,w){const art=buildDeep(scene,{...w,portalProfile:{name:'Sunspire · Guardian Hall',fog:'#a8b8c3',sky:[.53,.64,.71],sun:'#fff0cf',body:'#b4ad9a',lamp:'#f2d49b',hazard:['#a1b5c1','#c7d4dc'],sunGlow:[.18,.15,.10]}});art.counts.name='Guardian Hall';
 const root=new T.Group();root.position.set(0,354,-1780);art.group.add(root);
 const pearl=new T.MeshStandardMaterial({color:0xd1e7ec,emissive:0x637da8,emissiveIntensity:.5,roughness:.25,metalness:.28}),gold=new T.MeshStandardMaterial({color:0xd1b16f,roughness:.4,metalness:.65});
 const ball=new T.Mesh(new T.IcosahedronGeometry(37,2),pearl);root.add(ball);const rings=[];
 for(let i=0;i<2;i++){const ring=new T.Mesh(new T.TorusGeometry(50+i*6,1.7,6,40),gold);ring.rotation.x=i?Math.PI/3:Math.PI/2;ring.rotation.y=i?.6:0;root.add(ring);rings.push(ring);}
 const souls=new T.Group();art.group.add(souls);const spirit=new T.MeshBasicMaterial({color:0xb4c5ee,transparent:true,opacity:.46,depthWrite:false}),face=new T.MeshBasicMaterial({color:0xe4e4ff,transparent:true,opacity:.72,depthWrite:false});
 const headGeo=new T.IcosahedronGeometry(9,1),bodyGeo=new T.CylinderGeometry(8,15,36,7),armGeo=new T.CylinderGeometry(3,2,23,5),figures=[];
 for(let i=0;i<26;i++){const a=i*2.4,r=170+(i%5)*65,g=new T.Group();g.position.set(Math.sin(a)*r,300+(i%4)*65,-1780+Math.cos(a)*r);const body=new T.Mesh(bodyGeo,spirit),head=new T.Mesh(headGeo,face);head.position.y=28;g.add(body,head);for(const sign of [-1,1]){const arm=new T.Mesh(armGeo,spirit);arm.position.set(sign*12,5,0);arm.rotation.z=sign*.25;g.add(arm);}souls.add(g);figures.push(g);}souls.visible=false;
 const own={root,ball,rings,pearl,souls,figures};orb=own;const previous=art.group.userData.dispose;art.group.userData.dispose=()=>{previous?.();root.traverse(o=>o.geometry?.dispose());headGeo.dispose();bodyGeo.dispose();armGeo.dispose();spirit.dispose();face.dispose();pearl.dispose();gold.dispose();if(orb===own)orb=null;};return art;
}
export function updateMarbleOrb(w){if(!orb||!String(w.palaceScene).startsWith('guardian:'))return;const t=performance.now()/1000,line=window.__BF3?.G?.storyState?.conversation?.node;orb.root.position.y=354+Math.sin(t*1.2)*4;orb.ball.rotation.y=t*.12;orb.rings[0].rotation.z=t*.15;orb.rings[1].rotation.z=-t*.12;orb.pearl.emissive.set(line==='mc.orb.souls'?0x74629a:0x637da8);orb.souls.visible=line==='mc.orb.souls';for(let i=0;i<orb.figures.length;i++)orb.figures[i].position.y=300+(i%4)*65+Math.sin(t+i)*12;}
