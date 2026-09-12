import {readFile,writeFile} from 'node:fs/promises';
import {registerHooks} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../public/3d/',import.meta.url));
registerHooks({resolve(s,c,next){return next(s==='three'?pathToFileURL(root+'three.module.js').href:s,c)}});
globalThis.window={};globalThis.location={search:''};globalThis.ProgressEvent=class{constructor(type,o){Object.assign(this,{type},o)}};
const NR=globalThis.Request;globalThis.Request=class extends NR{constructor(u,o){super(new URL(u,'http://test/3d/'),o)}};
const fetches={};globalThis.fetch=async r=>{const p=new URL(r.url||r).pathname.replace('/3d/','');fetches[p]=(fetches[p]||0)+1;return new Response(await readFile(root+p));};
const T=await import(pathToFileURL(root+'three.module.js'));const art=await import(pathToFileURL(root+'mob3d.js'));
const manifest=JSON.parse(await readFile(root+'enemy-assets/manifest.json'));const registry=JSON.parse(await readFile(new URL('./enemy-roster.json',import.meta.url)));
assert.equal(manifest.length,Object.keys(registry).length+1);
const report=[];
for(const m of manifest){const src=await art.loadKitModel('enemy-assets/'+m.type);assert(src,m.type);assert.deepEqual(src.animations.map(a=>a.name),['Idle','Move','Windup','Attack','Hit','Death']);
 let meshes=0,skin;src.scene.traverse(o=>{if(o.isMesh){meshes++;skin=o;assert(o.isSkinnedMesh);assert(o.geometry.attributes.color);}});assert.equal(meshes,1);assert.equal(skin.skeleton.bones.length,10);
 assert(src._nativeH>.3&&src._nativeH<2,m.type+' height '+src._nativeH);report.push({type:m.type,h:src._nativeH,base:src._baseY,triangles:m.triangles,bytes:m.bytes});
}
let w={theme:'plains',p:{x:9999,y:0,z:9999,r:14},enemies:[]};window.__BF_WORLD=()=>w;
const scene=new T.Scene();const a={...registry.thornboar,type:'thornboar',x:0,y:0,z:0},b={...a,x:100};w.enemies=[a,b];const before=JSON.stringify(w);art.syncMobs(scene,.016);assert.equal(JSON.stringify(w),before,'rendering is read-only');
const roots=scene.getObjectByName('mob3d').children;let sk=[];for(const r of roots)r.traverse(o=>{if(o.isSkinnedMesh)sk.push(o)});assert.notEqual(sk[0].skeleton,sk[1].skeleton);assert.equal(sk[0].geometry,sk[1].geometry);
a.x+=5;art.syncMobs(scene,.016);assert.equal(window.__mob3d().actors[0].clip,'Move');w.enemies.reverse();art.syncMobs(scene,.016);assert.equal(roots[0].position.x,5,'stable identity after reordering');
a.windT=.6;art.syncMobs(scene,.016);assert.equal(window.__mob3d().actors[0].clip,'Windup');a.windT=0;art.syncMobs(scene,.016);assert.equal(window.__mob3d().actors[0].clip,'Attack');a.dead=true;w.enemies=[b];art.syncMobs(scene,.016);assert.equal(window.__mob3d().actors[0].clip,'Death');assert(!art.mobDrawn(a));
for(let i=0;i<60;i++)art.syncMobs(scene,.016);assert.equal(window.__mob3d().actors.length,1);
w.theme='marble';w.enemies=[{...registry.colossus,type:'colossus',x:0,z:0}];art.syncMobs(scene,.016);assert.equal(window.__mob3d().actors[0].type,'marblecolossus');
// Every track must produce finite skinned positions and genuinely change a pose.
for(const m of manifest){const src=art.kitModel('enemy-assets/'+m.type);let mesh;src.scene.traverse(o=>{if(o.isSkinnedMesh)mesh=o});const mixer=new T.AnimationMixer(src.scene);
 for(const clip of src.animations){mixer.stopAllAction();const ac=mixer.clipAction(clip).play();mixer.update(0);src.scene.updateMatrixWorld(true);mesh.skeleton.update();const initial=[...mesh.skeleton.boneMatrices];mixer.update(clip.duration*.37);src.scene.updateMatrixWorld(true);mesh.skeleton.update();assert([...mesh.skeleton.boneMatrices].every(Number.isFinite),m.type+' '+clip.name);assert(mesh.skeleton.boneMatrices.some((v,i)=>Math.abs(v-initial[i])>0.00001),m.type+' '+clip.name+' animates bones');const v=new T.Vector3();for(let i=0;i<mesh.geometry.attributes.position.count;i+=17){mesh.getVertexPosition(i,v);assert(v.toArray().every(Number.isFinite));}ac.stop();}
}
art.clearMobs();assert.equal(scene.getObjectByName('mob3d').children.length,0);assert.equal(window.__mob3d().err,null);
await writeFile(new URL('../../docs/art-validation/enemy-unit.json',import.meta.url),JSON.stringify({report,checks:['41 mappings','six clips each','single skinned mesh','10 bones each','independent skeletons/shared geometry','read-only gameplay state','stable identity','move/wind/attack/death','marble variant','finite skinned vertices','clear lifecycle'],fetches},null,2));console.log(JSON.stringify({appearances:report.length,minH:Math.min(...report.map(r=>r.h)),maxH:Math.max(...report.map(r=>r.h)),checks:'passed'}));
