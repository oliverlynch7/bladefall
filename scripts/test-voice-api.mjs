const ascent=JSON.parse(await fs.readFile('public/3d/story/long-ascent.json','utf8'));
const castle=JSON.parse(await fs.readFile('public/3d/story/castle-gates.json','utf8'));
const orb=JSON.parse(await fs.readFile('public/3d/story/sunspire-orb.json','utf8'));
const library=JSON.parse(await fs.readFile('public/3d/story/sky-library.json','utf8'));
const court=JSON.parse(await fs.readFile('public/3d/story/palace-courtyard.json','utf8'));
const thunder=JSON.parse(await fs.readFile('public/3d/story/thunder-cliffs.json','utf8'));
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const briar=JSON.parse(await fs.readFile('public/3d/story/briar-foundation.json','utf8'));
const hub=JSON.parse(await fs.readFile('public/3d/story/hub-dialogue.json','utf8'));
const hall=JSON.parse(await fs.readFile('public/3d/story/rift-hall.json','utf8'));
const cliffs=JSON.parse(await fs.readFile('public/3d/story/hollow-cliffs.json','utf8'));
const canyon=JSON.parse(await fs.readFile('public/3d/story/lost-canyon.json','utf8'));
const keep=JSON.parse(await fs.readFile('public/3d/story/broken-walls.json','utf8'));
const prison=JSON.parse(await fs.readFile('public/3d/story/prison-dungeons.json','utf8'));
const peaks=JSON.parse(await fs.readFile('public/3d/story/snowbound-peaks.json','utf8'));
const caves=JSON.parse(await fs.readFile('public/3d/story/deep-ice-caves.json','utf8'));
const iron=JSON.parse(await fs.readFile('public/3d/story/iron-halls.json','utf8'));
const furnace=JSON.parse(await fs.readFile('public/3d/story/great-furnace.json','utf8'));
const shore=JSON.parse(await fs.readFile('public/3d/story/shipwreck-shore.json','utf8'));
const book={npcs:{...briar.npcs,...hub.npcs,...hall.npcs,...cliffs.npcs,...canyon.npcs,...keep.npcs,...prison.npcs,...peaks.npcs,...caves.npcs,...iron.npcs,...furnace.npcs,...shore.npcs,...thunder.npcs,...court.npcs,...library.npcs,...orb.npcs,...castle.npcs,...ascent.npcs},nodes:{...briar.nodes,...hub.nodes,...hall.nodes,...cliffs.nodes,...canyon.nodes,...keep.nodes,...prison.nodes,...peaks.nodes,...caves.nodes,...iron.nodes,...furnace.nodes,...shore.nodes,...thunder.nodes,...court.nodes,...library.nodes,...orb.nodes,...castle.nodes,...ascent.nodes}};
let source=await fs.readFile('functions/voice-api/[[path]].js','utf8');source=source.replace(/import ascent[^;]+;\s*import castle[^;]+;\s*import orb[^;]+;\s*import library[^;]+;\s*import court[^;]+;\s*import thunder[^;]+;\s*import briar[^;]+;\s*import hub[^;]+;\s*import hall[^;]+;\s*import cliffs[^;]+;\s*import canyon[^;]+;\s*import keep[^;]+;\s*import prison[^;]+;\s*import peaks[^;]+;\s*import caves[^;]+;\s*import iron[^;]+;\s*import furnace[^;]+;\s*import shore[^;]+;\s*const book=[^;]+;/,'const book='+JSON.stringify(book)+';');
const {handle,digest}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
class Bucket{
 data=new Map();seq=0;
 async put(key,value,options={}){const old=this.data.get(key);if(options.onlyIf?.etagMatches&&old?.etag!==options.onlyIf.etagMatches)return null;if(options.onlyIf?.etagDoesNotMatch==='*'&&old)return null;const bytes=typeof value==='string'?new TextEncoder().encode(value):new Uint8Array(value);const r={etag:String(++this.seq),bytes,httpMetadata:options.httpMetadata,customMetadata:options.customMetadata,size:bytes.length};this.data.set(key,r);return r}
 async get(key){const r=this.data.get(key);return r?{...r,json:async()=>JSON.parse(new TextDecoder().decode(r.bytes)),body:r.bytes}:null}
 async head(key){return this.data.get(key)||null}
}
const env={VOICE_BUCKET:new Bucket()};
let cookie='';
async function call(path,{body,method=body?'POST':'GET',origin='https://bladefall.pages.dev',auth=true}={}){
 const headers={};if(auth&&cookie)headers.Cookie=cookie;if(method==='POST')headers.Origin=origin;let payload;
 if(body instanceof FormData)payload=body;else if(body){headers['Content-Type']='application/json';payload=JSON.stringify(body)}
 return handle(new Request('https://bladefall.pages.dev/voice-api/'+path,{method,headers,body:payload}),env);
}
assert.equal((await call('catalog',{auth:false})).status,200);
assert.equal((await call('line',{body:{},origin:'https://evil.example'})).status,403);
assert.equal((await handle(new Request('https://bladefall.pages.dev/voice-api/status'),{VOICE_BUCKET:env.VOICE_BUCKET})).status,200,'no secret config required');
let {lines}=await(await call('catalog')).json();assert.equal(lines.length,Object.keys(book.nodes).length);assert.equal(lines.filter(l=>l.id.startsWith('briar.gus.')).length,10);let line=lines[0];
const wav=new Uint8Array(100);wav.set(new TextEncoder().encode('RIFF'));const take='test-take-123456';
function form(){const f=new FormData();f.set('metadata',JSON.stringify({id:line.id,take,text:line.text,revision:line.revision,duration:1}));f.set('audio',new Blob([wav],{type:'audio/wav'}),'take.wav');return f}
let r=await call('take',{body:form()});assert.equal(r.status,200);line=(await r.json()).line;
assert.equal((await call('audio/'+take,{auth:false})).status,200);
assert.equal((await call('published/'+line.id+'/'+take,{auth:false})).status,404);
r=await call('take',{body:form()});assert.equal((await r.json()).line.takes.length,1,'retries dedupe takes');
r=await call('approve',{body:{id:line.id,take,version:line.version}});assert.equal(r.status,200);line=(await r.json()).line;
assert.equal((await call('published/'+line.id+'/'+take,{auth:false})).status,200);
assert.equal((await(await call('game',{auth:false})).json()).lines[line.id].text,line.text);
const staleVersion=line.version;r=await call('line',{body:{id:line.id,text:'A new line of dialogue.',version:line.version}});assert.equal(r.status,200);line=(await r.json()).line;assert.equal(line.takes.length,1);assert.equal(line.history.length,1);
assert.equal((await call('published/'+line.id+'/'+take,{auth:false})).status,404,'edited wording withdraws stale audio');
assert.equal((await call('approve',{body:{id:line.id,take,version:line.version}})).status,400,'stale take cannot be approved');
assert.equal((await call('line',{body:{id:line.id,text:'overwrite',version:staleVersion}})).status,409);
assert.equal((await call('audio/'+take)).status,200,'older take remains recoverable');
cookie='obsolete-cookie';assert.equal((await call('catalog')).status,200,'old cookies do not block access');
console.log('Voice API passed: password-free reads/writes, origin checks, no secret config, immutable upload/deduplication, exact approval, stale-audio withdrawal, old-take retention, conflicting edits, old-cookie compatibility.');

if(process.argv[2]){
 const backup=JSON.parse(await fs.readFile(process.argv[2],'utf8'));env.VOICE_BUCKET=new Bucket();cookie=cookie.slice(0,-1);
 for(const take of backup.takes){const form=new FormData();form.set('metadata',JSON.stringify({id:backup.line.id,take:take.id,text:take.text,revision:take.revision,duration:take.duration}));const bytes=Buffer.from(take.data,'base64');form.set('audio',new Blob([bytes],{type:take.mime}),'restored.webm');const res=await call('take',{body:form});assert.equal(res.status,200);const restored=await call('audio/'+take.id);assert.equal(await digest(await restored.arrayBuffer()),take.sha);}
 console.log('Backup restored into empty storage: original take IDs, audio hashes and recorded wording retained.');
}
