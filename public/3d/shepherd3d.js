import * as T from './three.module.js';
// Shared low-poly meshes; articulated limbs are cloned per companion.
const coat=new T.MeshStandardMaterial({color:0xa58151,roughness:1}),dark=new T.MeshStandardMaterial({color:0x343632,roughness:1}),cream=new T.MeshStandardMaterial({color:0xe0cfac,roughness:1}),nose=new T.MeshStandardMaterial({color:0x171b19,roughness:.5}),eye=new T.MeshStandardMaterial({color:0xc68f37,roughness:.3}),leather=new T.MeshStandardMaterial({color:0x526e68,roughness:.85}),brass=new T.MeshStandardMaterial({color:0xbda568,metalness:.6,roughness:.45});
const root=new T.Group();
function ell(parent,mat,x,y,z,sx,sy,sz){const m=new T.Mesh(new T.IcosahedronGeometry(1,1),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
ell(root,coat,0,.49,0,.22,.25,.42);ell(root,dark,0,.65,-.05,.215,.105,.34);ell(root,cream,0,.51,.29,.2,.25,.16);ell(root,coat,0,.55,-.32,.21,.24,.18);
for(const [i,x,z]of [[0,-.145,.26],[1,.145,.26],[2,-.155,-.29],[3,.155,-.29]]){const leg=new T.Group();leg.name='shepherd-leg-'+i;leg.position.set(x,.46,z);root.add(leg);ell(leg,coat,0,-.13,0,.073,.20,.09);ell(leg,cream,0,-.29,.01,.054,.11,.059);ell(leg,dark,0,-.39,.035,.07,.045,.1);}
const head=new T.Group();head.name='shepherd-head';head.position.set(0,.74,.32);root.add(head);ell(head,coat,0,.07,.075,.155,.175,.18);ell(head,dark,0,.095,.18,.135,.105,.1);ell(head,cream,0,-.03,.225,.11,.055,.15);ell(head,nose,0,.005,.35,.058,.04,.04);
const jaw=new T.Group();jaw.name='shepherd-jaw';jaw.position.set(0,-.045,.15);head.add(jaw);ell(jaw,cream,0,-.035,.09,.092,.032,.12);
for(const x of [-.112,.112]){const ear=new T.Mesh(new T.ConeGeometry(.09,.24,4),dark);ear.position.set(x,.25,.015);ear.rotation.z=x<0?.15:-.15;head.add(ear);ell(head,eye,x,.10,.195,.025,.026,.021);ell(head,nose,x,.1,.215,.011,.018,.007);}
const collar=new T.Mesh(new T.TorusGeometry(.18,.025,6,16),leather);collar.rotation.x=Math.PI/2;collar.position.set(0,.63,.29);root.add(collar);ell(root,brass,0,.5,.45,.038,.05,.016);
const tail=new T.Group();tail.name='shepherd-tail';tail.position.set(0,.59,-.40);root.add(tail);ell(tail,coat,0,-.07,-.17,.09,.10,.23);ell(tail,cream,0,-.11,-.35,.067,.067,.10);
export const shepherdAsset={scene:root,animations:[],_nativeH:1.12,_baseY:0};
export function animateShepherd(root,time,moving,attacking){for(let i=0;i<4;i++){const leg=root.getObjectByName('shepherd-leg-'+i);leg.rotation.x=moving?Math.sin(time*12+(i===0||i===3?0:Math.PI))*.5:0;}root.getObjectByName('shepherd-tail').rotation.y=Math.sin(time*(moving?9:4))*.3;root.getObjectByName('shepherd-head').rotation.x=attacking?-.18:Math.sin(time*2)*.035;root.getObjectByName('shepherd-jaw').rotation.x=attacking?.45:.06;}
