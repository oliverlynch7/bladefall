import * as T from './three.module.js';
import {createClassDisplay} from './hero3d.js?v=2362';
const $=s=>document.querySelector(s),canvas=$('#wardrobe'),scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.05,120),renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(Math.min(1.75,devicePixelRatio));
const hemi=new T.HemisphereLight(0xd7ecff,0x86725a,2.15),key=new T.DirectionalLight(0xffefce,2.6),rim=new T.DirectionalLight(0x8bbdde,1.6);key.position.set(-3,6,6);rim.position.set(4,4,-3);scene.add(hemi,key,rim);
const platform=new T.Group();scene.add(platform);for(let i=0;i<3;i++){const m=new T.Mesh(new T.CylinderGeometry(.83,.92,.08,48),new T.MeshStandardMaterial({color:'#354d56',roughness:.84,metalness:.18}));m.position.set((i-1)*2.50,-.065,0);platform.add(m);const ring=new T.Mesh(new T.TorusGeometry(.85,.014,6,48),new T.MeshStandardMaterial({color:i===2?'#d6b977':'#8faaa9',metalness:.6,roughness:.4}));ring.rotation.x=Math.PI/2;ring.position.copy(m.position);ring.position.y=-.018;platform.add(ring);}
const catalog=window.BFClassLooks.catalog,ids=Object.keys(catalog),label=c=>c==='beastmaster'?'Beastmaster':c==='bladedancer'?'Bladedancer':c.charAt(0).toUpperCase()+c.slice(1),params=new URLSearchParams(location.search);
if(params.get('preview')==='1'){
 $('.intro>p:last-child').textContent='REFERENCE WARDROBE · All 17 classes, three complete outfits each. Compare starter, Rank 5 and Rank 10; rotate to inspect the fitted details.';
 $('.back').href='https://bladefall.pages.dev/3d/';$('.brand').href='https://bladefall.pages.dev/3d/class-skins.html';
}
let cls=ids.includes(params.get('class'))?params.get('class'):'mage',rigs=[],yaw=.15,pitch=.07,zoom=1,paused=false,sequence=0,disposed=false;
$('#classes').innerHTML=ids.map(c=>`<button data-class="${c}" aria-pressed="false"><img src="./icons/class-${c}.png" alt="">${label(c)}</button>`).join('');
$('#classes').addEventListener('click',e=>{const b=e.target.closest('[data-class]');if(b)show(b.dataset.class);});
function view(){const v=$('#view').value;return v==='all'?null:Number(v);}
function cards(){const focus=view();document.body.dataset.single=focus!==null;$('#lookCards').innerHTML=catalog[cls].map((l,i)=>focus!==null&&i!==focus?'':`<article class="look-card" data-tier="${i}"><span class="rank">${i===0?'YOUR STARTING LOOK':'UNLOCK AT RANK '+l.rank}</span><h2>${l.name}</h2><p>${l.detail}</p><button data-focus="${i}">${focus===null?'Inspect this look':'Compare all ranks'}</button><span class="swatches">${[l.metal,l.cloth,l.leather].filter(Boolean).map(c=>`<i style="background:${c}"></i>`).join('')}</span></article>`).join('');}
$('#lookCards').addEventListener('click',e=>{const b=e.target.closest('[data-focus]');if(b){$('#view').value=view()===null?b.dataset.focus:'all';zoom=1;cards();}});
async function show(id){
 const seq=++sequence;cls=id;$('#loading').hidden=false;$('#loading').textContent='Dressing the '+label(cls)+'…';$('#stageClass').textContent=label(cls);for(const b of document.querySelectorAll('[data-class]'))b.setAttribute('aria-pressed',String(b.dataset.class===cls));
 rigs.forEach(r=>r.dispose());rigs=[];cards();const next=[];
 try{for(let i=0;i<3;i++){const r=await createClassDisplay(id,i);next.push(r);if(seq!==sequence){next.forEach(r=>r.dispose());return;}}
  if($('#weapon').value!=='class')await Promise.all(next.map(r=>r.equip($('#weapon').value)));
  if(seq!==sequence){next.forEach(r=>r.dispose());return;}rigs=next;rigs.forEach(r=>scene.add(r.wrap));$('#loading').hidden=true;const u=new URL(location.href);u.searchParams.set('class',id);history.replaceState(null,'',u);updateStats();
 }catch(e){next.forEach(r=>r.dispose());$('#loading').textContent='Preview could not load. Please refresh.';console.error(e);}
}
function updateStats(){const stats=rigs.map(r=>({tier:r.tier,...r.stats}));$('#stats').textContent=stats.map(s=>`${s.tier===0?'Default':'Rank '+(s.tier===1?5:10)}: ${s.triangles.toLocaleString()} extra triangles · ${s.meshes} fitted detail meshes · ${s.animated} animated details`).join('\n');$('#stats').dataset.results=JSON.stringify(stats);}
$('#view').onchange=()=>{zoom=1;cards();};$('#weapon').onchange=async()=>{const seq=sequence;$('#loading').hidden=false;$('#loading').textContent='Fitting weapon…';await Promise.all(rigs.map(r=>r.equip($('#weapon').value)));if(seq===sequence)$('#loading').hidden=true;};
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Resume motion':'Pause motion';};$('#still').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#reset').onclick=()=>{yaw=.15;pitch=.07;zoom=1;};$('#zoomIn').onclick=()=>zoom=Math.max(.60,zoom-.12);$('#zoomOut').onclick=()=>zoom=Math.min(1.7,zoom+.12);
const pointers=new Map();let pinch=0;canvas.onpointerdown=e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){yaw+=dx*.009;pitch=T.MathUtils.clamp(pitch+dy*.006,-.15,.75);}else{const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)zoom=T.MathUtils.clamp(zoom*pinch/d,.60,1.7);pinch=d;}};canvas.onpointerup=canvas.onpointercancel=e=>{pointers.delete(e.pointerId);pinch=0;};canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom+e.deltaY*.001,.60,1.7);},{passive:false});
canvas.onkeydown=e=>{if(e.key==='ArrowLeft')yaw-=.18;if(e.key==='ArrowRight')yaw+=.18;if(e.key==='ArrowUp')pitch=Math.min(.75,pitch+.08);if(e.key==='ArrowDown')pitch=Math.max(-.15,pitch-.08);if(e.key==='+'||e.key==='=')zoom=Math.max(.60,zoom-.12);if(e.key==='-')zoom=Math.min(1.7,zoom+.12);if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))e.preventDefault();};
const clock=new T.Clock();let lastSize='',statsTime=0;
function frame(){if(disposed)return;requestAnimationFrame(frame);const raw=Math.min(.05,clock.getDelta()),dt=paused||document.hidden?0:raw,r=canvas.getBoundingClientRect(),size=r.width+':'+r.height;
 if(lastSize!==size){lastSize=size;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
 const focus=view(),single=focus!==null;if($('#rotate').checked&&!paused)yaw+=dt*.24;
 const night=$('#lighting').value==='night';hemi.intensity=night?.65:2.15;key.intensity=night?1.1:2.6;rim.intensity=night?1.9:1.6;
 for(let i=0;i<rigs.length;i++){const rig=rigs[i];rig.wrap.visible=!single||focus===i;if(!rig.wrap.visible)continue;rig.update(dt,{animation:$('#animation').value,cape:$('#cape').value,motion:!$('#still').checked});rig.wrap.position.x=single?0:(i-1)*2.50;rig.wrap.rotation.y=yaw;}
 platform.children.forEach((m,i)=>{m.visible=!single||i<2;if(single)m.position.x=0;else m.position.x=(Math.floor(i/2)-1)*2.50;});
 const extent=single?2.8:8.5,distance=Math.max(2.18,extent/(2*Math.max(.3,camera.aspect)))/Math.tan(16*Math.PI/180)*zoom;
 camera.position.set(0,1.63+Math.sin(pitch)*distance,Math.cos(pitch)*distance);camera.lookAt(0,1.63,0);renderer.render(scene,camera);
 statsTime+=raw;if(statsTime>1){statsTime=0;updateStats();$('#viewLabel').textContent=single?(focus===0?'INSPECTING DEFAULT':'INSPECTING RANK '+catalog[cls][focus].rank):'THREE RANKS · SAME LIGHTING';}
}
addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;sequence++;rigs.forEach(r=>r.dispose());renderer.dispose();});
if(params.has('tier')&&['0','1','2'].includes(params.get('tier')))$('#view').value=params.get('tier');
if(innerWidth<700&&!params.has('tier'))$('#view').value='2';
show(cls);frame();
