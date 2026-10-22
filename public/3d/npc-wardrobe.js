import * as T from './three.module.js';
import './hero3d.js?v=2362';
import {buildNpcActor} from './npc3d.js?v=2344';
import {loadKitModel} from './mob3d.js?v=2339';
import {NPC_LOOKS} from './npc-looks.js?v=2344';
const groups={
 'Briar Town':['thomas','mara','gus','lewis','beth','bethBrother'],
 'Waystation':['quartermaster','anvil','keeper','drillmaster','beastkeeper','riftkeeper'],
 'Canyon & Keep':['caleb','skip','ward','ruth','grant','felix','walter','sly'],
 'Ice & Furnace':['heath','ellis','hugo','flint','jack','pike','martin'],
 'Coast & Palace':['otto','rose','abe','dash','grace','victor','hugh','simon'],
 'Duskmoor & spirits':['roland','cross','miles','ian','shade'],
 'Trial mentors':Object.keys(NPC_LOOKS).filter(id=>id.startsWith('mentor_')),
 'Escorts':Object.keys(NPC_LOOKS).filter(id=>NPC_LOOKS[id].role==='Escort'),
};
const $=s=>document.querySelector(s),canvas=$('#people'),renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(Math.min(1.5,devicePixelRatio));renderer.setClearColor(0,0);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.05,100),hemi=new T.HemisphereLight('#e1f2ff','#7b7963',2.2),key=new T.DirectionalLight('#ffe8c5',2.5),rim=new T.DirectionalLight('#9fd6e5',1.3);key.position.set(-4,5,7);rim.position.set(3,4,-4);scene.add(hemi,key,rim);
const params=new URLSearchParams(location.search);let group=Object.keys(groups).find(k=>groups[k].includes(params.get('npc')))||'Briar Town',id=params.get('npc')||'thomas',actors=[],seq=0,yaw=.10,pitch=.05,zoom=1,paused=false,disposed=false,lastSize='';
$('#groups').innerHTML=Object.keys(groups).map(k=>`<button data-group="${k}" aria-pressed="false">${k}</button>`).join('');
function options(){for(const b of $('#groups').children)b.setAttribute('aria-pressed',String(b.dataset.group===group));$('#person').innerHTML=groups[group].map(k=>`<option value="${k}">${NPC_LOOKS[k].name}</option>`).join('');if(!groups[group].includes(id))id=groups[group][0];$('#person').value=id;}
async function show(){const generation=++seq;$('#status').hidden=false;for(const a of actors)a.dispose();actors=[];const ids=$('#view').value==='group'?groups[group]:[id],next=[];try{
 for(const name of ids){const p=NPC_LOOKS[name],src=await loadKitModel('chars/'+p.model);if(!src)throw new Error('Model missing: '+p.model);const a=buildNpcActor(name,src);next.push(a);if(generation!==seq){next.forEach(a=>a.dispose());return;}a.id=name;a.src=src;a.chessAnim={};a.root.scale.setScalar(2.8/src._nativeH);a.root.position.y=-src._baseY*a.root.scale.x;a.baseYaw=a.face?.yawOffset||0;a.size=2.8;scene.add(a.root);}
 actors=next;$('#status').hidden=true;$('#names').classList.toggle('single',ids.length===1);canvas.parentElement.classList.toggle('compare',ids.length>1);$('#names').style.gridTemplateColumns=`repeat(${Math.min(4,Math.ceil(ids.length/2))},1fr)`;$('#names').innerHTML=ids.map(k=>{const p=NPC_LOOKS[k];return `<article><h2>${p.name}</h2><small>${p.role}</small>${[p.cloth,p.metal,p.leather,p.accent].map(c=>`<i class="swatch" style="background:${c}"></i>`).join('')}</article>`;}).join('');
 $('#stats').textContent=actors.map(a=>`${a.profile.name}: ${a.profile.model} · ${a.detail.stats.meshes} fitting batches · ${Math.round(a.detail.stats.triangles)} extra triangles`).join('\n');
 const u=new URL(location.href);u.searchParams.set('npc',id);history.replaceState(null,'',u);
 }catch(e){next.forEach(a=>a.dispose());$('#status').textContent='Could not load the preview. Please refresh.';console.error(e);}}
$('#groups').onclick=e=>{const b=e.target.closest('[data-group]');if(b){group=b.dataset.group;options();show();}};$('#person').onchange=()=>{id=$('#person').value;show();};$('#view').onchange=()=>{zoom=1;show();};$('#reset').onclick=()=>{yaw=.10;pitch=.05;zoom=1;};$('#back').onclick=()=>{yaw=Math.PI;};$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Resume motion':'Pause motion';};
const pointers=new Map();let pinch=0;canvas.onpointerdown=e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{const old=pointers.get(e.pointerId);if(!old)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){yaw+=(e.clientX-old[0])*.009;pitch=T.MathUtils.clamp(pitch+(e.clientY-old[1])*.006,-.22,.85);}else{const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)zoom=T.MathUtils.clamp(zoom*pinch/Math.max(1,d),.55,1.7);pinch=d;}};canvas.onpointerup=canvas.onpointercancel=e=>{pointers.delete(e.pointerId);pinch=0;};canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom+e.deltaY*.001,.55,1.7);},{passive:false});canvas.onkeydown=e=>{if(e.key==='ArrowLeft')yaw-=.18;if(e.key==='ArrowRight')yaw+=.18;if(e.key==='ArrowUp')pitch=Math.min(.85,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-.22,pitch-.1);if(e.key.startsWith('Arrow'))e.preventDefault();};
const clock=new T.Clock();
function frame(){if(disposed)return;requestAnimationFrame(frame);const dt=paused||document.hidden?0:Math.min(.05,clock.getDelta()),rect=canvas.getBoundingClientRect(),size=rect.width+':'+rect.height;if(size!==lastSize){lastSize=size;renderer.setSize(rect.width,rect.height,false);cam.aspect=rect.width/rect.height;cam.updateProjectionMatrix();}
 const columns=Math.min(4,Math.ceil(actors.length/2)),rows=Math.ceil(actors.length/columns),pose=$('#pose').value;
 for(let i=0;i<actors.length;i++){const a=actors[i];if(a.pose!==pose){a.pose=pose;a.mixer.stopAllAction();const clip=pose==='Walk'?a.walk:a.src.animations.find(c=>c.name==='Idle');if(clip)a.mixer.clipAction(clip).reset().play();}window.__restoreChessNpc?.(a.chessAnim);a.mixer.update(dt);if(pose==='seated'){a.chessAnim=a.chessAnim||{};window.__poseChessNpc?.({sitting:true,seatBlend:1,walking:false,side:'white'},a.root,a.chessAnim);}a.root.rotation.y=yaw+a.baseYaw;a.root.position.x=(i%columns-(columns-1)/2)*2.1;a.root.position.y=-a.src._baseY*a.root.scale.x+(rows-1-Math.floor(i/columns))*3.25;a.face?.tick(clock.elapsedTime,false);a.root.updateMatrixWorld(true);}
 const target=1.5+(rows-1)*1.62,span=Math.max(3.9*rows,columns*2.3/Math.max(.35,cam.aspect)),dist=span/(2*Math.tan(16*Math.PI/180))*zoom;cam.position.set(0,target+Math.sin(pitch)*dist,Math.cos(pitch)*dist);cam.lookAt(0,target,0);renderer.render(scene,cam);
 window.npcWardrobeState={ids:actors.map(a=>a.id),ready:!$('#status').hidden?false:actors.length>0,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,costumes:actors.map(a=>({id:a.id,...a.detail.stats})),pose};
}
addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;seq++;actors.forEach(a=>a.dispose());renderer.dispose();});
options();show();frame();
