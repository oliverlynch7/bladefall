import assert from 'node:assert/strict';import fs from 'node:fs';
const text=fs.readFileSync('public/3d/texture-recovery.js','utf8'),{recoverTexture}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
let n=0,f=0,retries=0,failures=0,delays=[];const opts={wait:async ms=>delays.push(ms),onRetry:()=>retries++,onFailure:()=>failures++};
const texture={map:true};assert.equal(await recoverTexture(async()=>{n++;return texture;},null,opts),texture);assert.equal(n,1);assert.equal(retries,0);
n=0;assert.equal(await recoverTexture(async()=>{if(++n===1)throw Error('network');return texture;},null,opts),texture);assert.equal(n,2);assert.equal(retries,1);
n=0;assert.equal(await recoverTexture(async()=>{n++;throw Error('decode');},async()=>{f++;return texture;},opts),texture);assert.equal(n,2);assert.equal(f,1);assert.equal(failures,0);
n=0;await assert.rejects(()=>recoverTexture(async()=>{n++;throw Error('permanent');},null,opts),/permanent/);assert.equal(n,3);assert.equal(failures,1);assert(delays.every(n=>n===120||n===240));
const loader=fs.readFileSync('public/3d/jsm/loaders/GLTFLoader.js','utf8');assert(loader.includes('return recoverTexture( () => attempt( loader )'));assert(loader.includes('imageLoader.setCrossOrigin( options.crossOrigin )'));assert(loader.includes('imageLoader.setRequestHeader( options.requestHeader )'));assert(loader.includes('texture.flipY = false;'));assert(loader.includes('this.sourceCache[ sourceIndex ] = promise;'));
console.log('Texture recovery passed: first load, retry, decoder fallback, bounded failure, source cache, sampler/orientation and loader configuration.');

const html=fs.readFileSync('public/3d/index.html','utf8');assert(html.includes('"./jsm/loaders/GLTFLoader.js":"./jsm/loaders/GLTFLoader.js?v=2254"'),'all imported loaders receive recovery despite cached older modules');
