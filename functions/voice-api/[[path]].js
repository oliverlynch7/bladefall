import book from '../../public/3d/story/briar-foundation.json';

const encoder=new TextEncoder(),MAX_AUDIO=12*1024*1024,COOKIE='__Host-bf_voice';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json',...extra}});
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export const digest=async value=>hex(await crypto.subtle.digest('SHA-256',typeof value==='string'?encoder.encode(value):value));
const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9._-]{0,100}$/i.test(id);
const validLine=id=>validId(id)&&Object.prototype.hasOwnProperty.call(book.nodes,id);
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
async function readLimited(request,max){
 if(Number(request.headers.get('Content-Length'))>max)fail('File is too large.',413);
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();let size=0,chunks=[];
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('File is too large.',413)}chunks.push(value)}}finally{reader.releaseLock()}
 const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length}return all;
}
async function bodyJSON(request){try{return JSON.parse(new TextDecoder().decode(await readLimited(request,20000)))}catch(e){if(e.status)throw e;fail('Invalid request body.')}}
async function signingKey(env){return crypto.subtle.importKey('raw',encoder.encode(env.VOICE_SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function session(env){const data=Math.floor(Date.now()/1000+7*86400)+'.'+crypto.randomUUID();return data+'.'+hex(await crypto.subtle.sign('HMAC',await signingKey(env),encoder.encode(data)));}
async function authenticated(request,env){
 const cookie=(request.headers.get('Cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!cookie||cookie.length>200)return false;const parts=cookie.split('.');if(parts.length!==3||!/^[0-9a-f]{64}$/.test(parts[2]))return false;
 const expires=Number(parts[0]),now=Date.now()/1000;if(!Number.isFinite(expires)||expires<now||expires>now+7*86400+60)return false;
 const sig=Uint8Array.from(parts[2].match(/../g),n=>parseInt(n,16));return crypto.subtle.verify('HMAC',await signingKey(env),sig,encoder.encode(parts[0]+'.'+parts[1]));
}
function cookie(value,age){return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;}
function metadata(id){const n=book.nodes[id],speaker=book.npcs[n.voice.speaker];return {id,speaker:speaker.name,role:speaker.role,...n.voice,speakerName:speaker.name,choices:n.choices.map(c=>c.text)};}
async function loadLine(bucket,id){
 const object=await bucket.get('lines/'+id+'.json');
 if(object)return {state:await object.json(),etag:object.etag};
 const text=book.nodes[id].text;return {state:{id,text,revision:await digest(text),version:0,history:[],takes:[],approval:null},etag:null};
}
async function saveLine(bucket,state,etag){
 const saved=await bucket.put('lines/'+state.id+'.json',JSON.stringify(state),{onlyIf:etag?{etagMatches:etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 if(!saved)fail('This line changed on another device. Refresh before saving.',409);
}
function isCurrent(s){return s.approval&&s.approval.revision===s.revision&&s.takes.some(t=>t.id===s.approval.take&&t.revision===s.revision);}
export async function handle(request,env){
 const url=new URL(request.url),parts=url.pathname.replace(/^\/voice-api\/?/,'').split('/').filter(Boolean),action=parts[0]||'status';
 if(!env.VOICE_BUCKET||!env.VOICE_OWNER_KEY_SHA256||!env.VOICE_SESSION_SECRET)return json({error:'Voice Studio storage or sign-in is not configured yet.'},503);
 if(!['GET','HEAD','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open the studio on this site before making changes.'},403);
 try{
  // Game access is deliberately limited to the exact approved, non-stale take.
  if(action==='game'&&request.method==='GET'){
   const lines={};for(const id of Object.keys(book.nodes)){const {state:s}=await loadLine(env.VOICE_BUCKET,id);if(isCurrent(s))lines[id]={text:s.text,revision:s.revision,audio:'/voice-api/published/'+id+'/'+s.approval.take};}
   return json({lines});
  }
  if(action==='published'&&request.method==='GET'){
   const id=parts[1],take=parts[2];if(!validLine(id)||!validId(take))fail('Not found.',404);
   const {state:s}=await loadLine(env.VOICE_BUCKET,id);if(!isCurrent(s)||s.approval.take!==take)fail('Not found.',404);
   const object=await env.VOICE_BUCKET.get('audio/'+take);if(!object)fail('Not found.',404);
   return new Response(object.body,{headers:{...headers,'Content-Type':object.httpMetadata?.contentType||'application/octet-stream'}});
  }
  if(action==='login'&&request.method==='POST'){
   const body=await bodyJSON(request),key=String(body.key||'');
   if(key.length<32||key.length>200||await digest(key)!==env.VOICE_OWNER_KEY_SHA256)return json({error:'That owner key was not accepted.'},401);
   return json({ok:true},200,{'Set-Cookie':cookie(await session(env),7*86400)});
  }
  if(!await authenticated(request,env))return json({error:'Sign in with your owner key.',signedIn:false},401);
  if(action==='logout'&&request.method==='POST')return json({ok:true},200,{'Set-Cookie':cookie('',0)});
  if(action==='status'&&request.method==='GET')return json({signedIn:true});
  if(action==='catalog'&&request.method==='GET'){
   const lines=[];for(const id of Object.keys(book.nodes)){const {state:s}=await loadLine(env.VOICE_BUCKET,id);lines.push({...metadata(id),...s,currentApproval:!!isCurrent(s)});}return json({lines});
  }
  if(action==='audio'&&request.method==='GET'){
   const id=parts[1];if(!validId(id))fail('Not found.',404);const object=await env.VOICE_BUCKET.get('audio/'+id);if(!object)fail('Not found.',404);
   return new Response(object.body,{headers:{...headers,'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Content-Length':String(object.size)}});
  }
  if(action==='line'&&request.method==='POST'){
   const body=await bodyJSON(request);if(!validLine(body.id))fail('Unknown line.');
   const {state:s,etag}=await loadLine(env.VOICE_BUCKET,body.id);if(body.version!==s.version)fail('Another device changed this line. Refresh first.',409);
   const text=typeof body.text==='string'?body.text.trim():'';if(!text||text.length>4000)fail('Use between 1 and 4,000 characters.');
   if(text!==s.text){s.history.push({text:s.text,revision:s.revision,date:new Date().toISOString()});s.text=text;s.revision=await digest(text);s.version++;await saveLine(env.VOICE_BUCKET,s,etag);}return json({line:s});
  }
  if(action==='take'&&request.method==='POST'){
   const raw=await readLimited(request,MAX_AUDIO+20000),form=await new Response(raw,{headers:{'Content-Type':request.headers.get('Content-Type')||''}}).formData();
   let info;try{info=JSON.parse(form.get('metadata'))}catch(_){fail('Invalid take details.')}
   const file=form.get('audio');if(!validLine(info.id)||!validId(info.take)||typeof info.text!=='string'||!info.text.trim()||info.text.length>4000)fail('Invalid take details.');
   if(!file||typeof file.arrayBuffer!=='function'||file.size<32||file.size>MAX_AUDIO)fail('Use a nonempty recording under 12 MB.');
   const mime=file.type.split(';')[0].toLowerCase();if(!['audio/webm','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/mpeg'].includes(mime))fail('Unsupported audio format.');
   const bytes=await file.arrayBuffer(),sha=await digest(bytes),revision=await digest(info.text);
   if(info.revision!==revision)fail('The take text and revision do not match.');
   // Preserve imported or offline takes even if the line has since been edited.
   const prior=await env.VOICE_BUCKET.head('audio/'+info.take);
   if(prior&&(prior.customMetadata?.sha!==sha||prior.customMetadata?.line!==info.id||prior.customMetadata?.revision!==revision))fail('A different recording already uses this take ID.',409);
   if(!prior){const stored=await env.VOICE_BUCKET.put('audio/'+info.take,bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:file.type},customMetadata:{sha,line:info.id,revision}});if(!stored)fail('Upload conflicted. Retry this saved take.',409);}
   const take={id:info.take,line:info.id,text:info.text,revision,sha,mime:file.type,bytes:file.size,duration:Number.isFinite(info.duration)?Math.max(0,Math.min(600,info.duration)):0,date:new Date().toISOString()};
   for(let attempt=0;attempt<4;attempt++){
    const {state:s,etag}=await loadLine(env.VOICE_BUCKET,info.id);if(s.takes.some(t=>t.id===take.id))return json({line:s,take});
    s.takes.push(take);s.version++;
    try{await saveLine(env.VOICE_BUCKET,s,etag);return json({line:s,take})}catch(e){if(e.status!==409||attempt===3)throw e}
   }
  }
  if(action==='approve'&&request.method==='POST'){
   const body=await bodyJSON(request);if(!validLine(body.id))fail('Unknown line.');const {state:s,etag}=await loadLine(env.VOICE_BUCKET,body.id);
   if(body.version!==s.version)fail('This line changed. Refresh before approving.',409);
   const t=s.takes.find(t=>t.id===body.take);if(!t||t.revision!==s.revision)fail('This take uses different wording. Record the current text or restore its wording before approving.');
   if(!await env.VOICE_BUCKET.head('audio/'+t.id))fail('The recording has not finished saving.',409);
   s.approval={take:t.id,revision:s.revision,date:new Date().toISOString()};s.version++;await saveLine(env.VOICE_BUCKET,s,etag);return json({line:s,published:true});
  }
  return json({error:'Not found.'},404);
 }catch(e){return json({error:e.status?e.message:'The server could not finish saving. Your local take has been kept; please retry.'},e.status||500);}
}
export const onRequest=({request,env})=>handle(request,env);
