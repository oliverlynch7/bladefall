import {readFile,writeFile} from 'node:fs/promises';
import {registerHooks} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../public/3d/',import.meta.url));
registerHooks({resolve(s,c,next){return next(s==='three'?pathToFileURL(root+'three.module.js').href:s,c)}});
globalThis.window={};globalThis.location={search:''};globalThis.ProgressEvent=class{constructor(type,o){Object.assign(this,{type},o)}};
const NR=globalThis.Request;globalThis.Request=class extends NR{constructor(u,o){super(new URL(u,'http://test/3d/'),o)}};
globalThis.fetch=async r=>new Response(await readFile(root+new URL(r.url||r).pathname.replace('/3d/','')));
const T=await import(pathToFileURL(root+'three.module.js')),art=await import(pathToFileURL(root+'mob3d.js')),motion=await import(pathToFileURL(root+'enemy-motion.js'));

const report=[];for(const type of ['archer','brute','warden']){const src=await art.loadKitModel('enemy-assets/articulated/'+type+'-v1980'),bones={};src.scene.traverse(o=>{if(o.isBone)bones[o.name]=o});const clips=motion.revisedClips(src.scene,type,src.animations),mixer=new T.AnimationMixer(src.scene);for(const [name,u]of [['Windup',.99],['Attack',.18],['Attack',.4]]){mixer.stopAllAction();const clip=clips.find(c=>c.name===name),action=mixer.clipAction(clip).play();action.time=u*clip.duration;mixer.update(0);src.scene.updateMatrixWorld(true);const hand=bones.forearmL.localToWorld(new T.Vector3(-.025,-.17,.0225));if(type!=='archer'){const target=bones.weapon.localToWorld(new T.Vector3(0,-.055,0)),error=hand.distanceTo(target);assert(error<.025,type+' '+name+' contact '+error);report.push({type,name,u,error});}else{const dir=bones.bow.getWorldPosition(new T.Vector3()).sub(bones.nock.getWorldPosition(new T.Vector3())).normalize(),axis=new T.Vector3(0,0,1).applyQuaternion(bones.nock.getWorldQuaternion(new T.Quaternion()));assert(dir.dot(axis)>.995);report.push({type,name,u,arrowAlignment:dir.dot(axis)});}}}
await writeFile(new URL('../../docs/art-validation/weapon-contacts.json',import.meta.url),JSON.stringify(report,null,2));console.log('Weapon contacts and nock alignment passed');
