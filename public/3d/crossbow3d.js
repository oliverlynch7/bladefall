import * as THREE from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// Authored around the trigger palm: +X fires, +Y up, +Z spans the limbs.
export function makeCrossbow(){
 const root=new THREE.Group();root.name='Crossbow';
 const part=(name,size,pos,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshLambertMaterial({color}));m.name=name;m.position.set(...pos);m.castShadow=true;m.userData={_weap:true,signaturePart:true};m.material.userData._weaponPaint=true;root.add(m);return m;};
 const wood='#79502d',dark='#493021',iron='#727d84',edge='#bcc5ca';
 part('TriggerGrip',[.115,.23,.105],[0,0,0],dark);
 part('Stock',[.76,.105,.14],[.25,.17,0],wood);
 part('ShoulderStock',[.15,.16,.18],[-.075,.145,0],wood);
 part('ButtPlate',[.025,.17,.19],[-.16,.145,0],iron);
 part('ForeGrip',[.24,.10,.12],[.32,.035,0],dark);
 for(const z of [-.06,.06])part('BoltRail',[.65,.026,.026],[.255,.235,z],iron);
 for(const x of [-.09,.12,.48])part('StockBand',[.034,.12,.15],[x,.17,0],iron);
 part('TriggerGuardBase',[.15,.022,.065],[.035,-.12,0],iron);
 part('TriggerGuardFront',[.02,.12,.065],[.10,-.055,0],iron);
 part('Trigger',[.016,.085,.025],[.055,-.015,0],edge);
 part('Latch',[.065,.055,.10],[-.04,.25,0],iron);
 for(const side of [-1,1]){
  for(let i=0;i<3;i++){const m=part('IronLimb',[.085,.06,.19],[.49-i*.035,.17,side*(.145+i*.17)],iron);m.rotation.y=side*.20;}
  part('LimbTip',[.075,.065,.05],[.40,.17,side*.59],edge);
 }
 const string=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.4,.18,-.59),new THREE.Vector3(-.03,.25,0),new THREE.Vector3(.4,.18,.59)]),new THREE.LineBasicMaterial({color:'#d7c69c'}));
 string.name='CrossbowString';string.userData={_weap:true,signaturePart:true};root.add(string);
 const bolt=new THREE.Group();bolt.name='CrossbowBolt';root.add(bolt);
 for(const [name,size,pos,color]of [['BoltShaft',[.56,.018,.018],[.29,.27,0],wood],['BoltHead',[.09,.025,.04],[.61,.27,0],edge],['BoltFeather',[.08,.055,.006],[.03,.27,0],'#a39275']]){const m=part(name,size,pos,color);bolt.add(m);}
 // Merge the boxes into two vertex-colored meshes: body and replaceable bolt.
 // Together with the string this is three draw calls, independent of part count.
 for(const parent of [root,bolt]){
  const parts=parent.children.filter(n=>n.isMesh),geometries=[];
  for(const m of parts){m.updateMatrix();const g=m.geometry.clone().applyMatrix4(m.matrix),count=g.attributes.position.count,c=m.material.color;
   const colors=new Float32Array(count*3),metal=new Float32Array(count),isMetal=c.getHexString()===new THREE.Color(iron).getHexString()||c.getHexString()===new THREE.Color(edge).getHexString();for(let i=0;i<count;i++){colors.set([c.r,c.g,c.b],i*3);metal[i]=isMetal?1:0;}
   g.setAttribute('color',new THREE.BufferAttribute(colors,3));g.setAttribute('crossbowBaseColor',new THREE.BufferAttribute(colors.slice(),3));g.setAttribute('crossbowMetal',new THREE.BufferAttribute(metal,1));geometries.push(g);m.removeFromParent();m.geometry.dispose();m.material.dispose();
  }
  const geometry=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({vertexColors:true}));mesh.name=parent===root?'CrossbowBody':'CrossbowAmmunition';mesh.castShadow=true;mesh.userData={_weap:true,signaturePart:true};parent.add(mesh);
 }
 return root;
}

export function paintCrossbow(root,weapon){
 const tint=({fire:'#e77f45',ice:'#a2dce8',poison:'#91bc61',arcane:'#ad88d2',holy:'#e4c16b',void:'#8971b4'})[weapon.el]||null;
 if(root.userData.crossbowTint===tint)return;root.userData.crossbowTint=tint;
 const accent=tint?new THREE.Color(tint):null;
 root.traverse(m=>{const g=m.geometry,base=g?.attributes.crossbowBaseColor,color=g?.attributes.color,mask=g?.attributes.crossbowMetal;if(!base||!color)return;
  for(let i=0;i<color.count;i++){const c=new THREE.Color(base.getX(i),base.getY(i),base.getZ(i));if(accent&&mask.getX(i))c.lerp(accent,.65);color.setXYZ(i,c.r,c.g,c.b);}color.needsUpdate=true;
 });
}
