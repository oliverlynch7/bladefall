import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// A small, flat-lidded savings coffer. Timber and iron, never a rarity crown or gemstone.
let template;
function build(){
 const root=new T.Group(),lid=new T.Group(),coins=new T.Group();root.name='Coin savings coffer';lid.name='Coin coffer hinged lid';coins.name='Saved coins';lid.position.set(0,27,-15);root.add(lid,coins);
 const mats={wood:new T.MeshLambertMaterial({vertexColors:true}),iron:new T.MeshLambertMaterial({vertexColors:true}),coin:new T.MeshStandardMaterial({vertexColors:true,metalness:.55,roughness:.4})},bins=new Map();
 const put=(parent,geo,key,color,x,y,z,rx=0)=>{if(geo.index){const old=geo;geo=geo.toNonIndexed();old.dispose();}geo.deleteAttribute('uv');geo.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,0,0)),new T.Vector3(1,1,1)));const c=new T.Color(color),a=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}geo.setAttribute('color',new T.BufferAttribute(a,3));const k=parent.uuid+key;if(!bins.has(k))bins.set(k,{parent,key,parts:[]});bins.get(k).parts.push(geo);};
 const box=(p,x,y,z,w,h,d,c='#825b3b',key='wood')=>put(p,new T.BoxGeometry(w,h,d),key,c,x,y,z);
 box(root,0,3,0,57,6,36);box(root,0,14,-16,57,25,4);box(root,0,14,16,57,25,4);for(const x of [-27,27])box(root,x,14,0,4,25,32);
 box(root,0,7,0,48,3,27,'#473a2d');
 for(const y of [8,17,25])for(const z of [-18.1,18.1])box(root,0,y,z,53,1,1,'#503e2e');
 for(const x of [-24,24]){box(root,x,14,18.8,5,28,2,'#637c7a','iron');box(root,x,14,-18.8,5,28,2,'#637c7a','iron');for(const z of [-14,14])box(root,x,2,z,8,4,9,'#414d50','iron');}
 box(lid,0,2,15,59,5,39,'#936a46');for(const x of [-24,24])box(lid,x,5,15,5,2,39,'#6c8580','iron');
 for(const x of [-17,-9,-1,7,15,23])box(lid,x,4.7,15,1,1,36,'#63472f');
 for(const x of [-18,18])box(root,x,27,-19,9,4,5,'#758b8a','iron');
 // A broad coin medallion and central coin slot identify currency at a glance.
 put(root,new T.CylinderGeometry(8,8,2,20),'coin','#c4a052',0,17,19,Math.PI/2);box(root,0,17,20.3,2,9,1,'#7d6537','iron');box(root,0,19,20.5,7,1,1,'#e4c77d','coin');
 box(lid,0,5.2,15,17,1,5,'#3f413a','iron');
 for(let i=0;i<18;i++)put(coins,new T.CylinderGeometry(4.1,4.1,1.6,12),'coin',i%3?'#c6a250':'#e5c475',-19+(i%6)*7.5,11+Math.floor(i/6)*1.8,-8+(Math.floor(i/6)%3)*8);
 for(const {parent,key,parts}of bins.values()){const geo=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());geo.computeBoundingBox();geo.computeBoundingSphere();const m=new T.Mesh(geo,mats[key]);m.castShadow=true;m.receiveShadow=true;parent.add(m);}
 root.userData.currencyOnly=true;root.userData.triangles=0;root.traverse(n=>{if(n.isMesh)root.userData.triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;});return root;
}
export function createCoinCoffer(){template||=build();const root=template.clone(true);return {root,lid:root.getObjectByName('Coin coffer hinged lid'),coins:root.getObjectByName('Saved coins'),opening:0};}
export function animateCoinCoffer(rec,opened,dt){rec.opening=opened?Math.min(1,rec.opening+Math.max(0,Math.min(.1,dt||0))/.6):0;rec.lid.rotation.x=-1.75*(1-(1-rec.opening)**3);rec.coins.visible=!opened;}
