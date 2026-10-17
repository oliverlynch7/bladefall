// Node geometry QA only. Never imported by the browser game.
import fs from 'node:fs';
import path from 'node:path';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const url=pathToFileURL(path.join(root,'public/3d/three.module.js')).href;
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url,shortCircuit:true}:next(specifier,context);}});
globalThis.ProgressEvent??=class ProgressEvent{constructor(type,values){this.type=type;Object.assign(this,values);}};
export const T=await import(url);
const {GLTFLoader}=await import('../../public/3d/jsm/loaders/GLTFLoader.js');
export async function asset(name){
 const bytes=fs.readFileSync(path.join(root,'public/slice3d/assets',name));let data;
 if(name.endsWith('.glb')){const length=bytes.readUInt32LE(12);data=JSON.parse(bytes.toString('utf8',20,20+length));const offset=20+length;data.buffers[0].uri='data:application/octet-stream;base64,'+bytes.subarray(offset+8,offset+8+bytes.readUInt32LE(offset)).toString('base64');}
 else data=JSON.parse(bytes);
 data.images=[];data.textures=[];data.samplers=[];data.materials=[{name:'Geometry audit'}];
 for(const mesh of data.meshes)for(const p of mesh.primitives)p.material=0;
 return new GLTFLoader().parseAsync(JSON.stringify(data),'');
}
