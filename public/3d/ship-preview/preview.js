import * as THREE from '../three.module.js';
import {createCrossingScene} from '../ship3d.js';
const C=window.BFShipCrossing,$=id=>document.getElementById(id),scene=new THREE.Scene();
scene.background=new THREE.Color('#718e98');scene.fog=new THREE.Fog('#718e98',100,310);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setSize(innerWidth,innerHeight);$('view').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,650);
scene.add(new THREE.HemisphereLight('#d7f1ec','#443b33',2.2));const sun=new THREE.DirectionalLight('#ffe0aa',2.5);sun.position.set(-25,45,25);scene.add(sun);
const art=createCrossingScene(scene);let state,axis=0,seq=0,inspect=false,epoch=0,last=performance.now(),demoActor='player-one';
const keys=new Set();
function reset(){state=C.create({epoch:'preview-'+(++epoch),seed:42,crew:$('coop').checked?[{id:'player-one'},{id:'player-two'}]:[{id:'player-one'}],initiator:'player-one'});axis=0;keys.clear();seq=0;demoActor='player-one';$('notice').textContent='Keep the rocks outside the hull. Pale circles show open water.';renderUI();}
const command=(type,extra={})=>C.command(state,demoActor,{type,epoch:state.epoch,...extra});
$('start').onclick=()=>{demoActor=state.helm;command('start');};
$('reset').onclick=reset;$('coop').onchange=reset;
$('pause').onclick=()=>C.pause(state,!state.paused);
$('camera').onclick=()=>{inspect=!inspect;$('camera').textContent=inspect?'Sailing view':'Inspect boat';};
$('clear').onclick=()=>C.clearWave(state,C.current(state).wave,0);
$('repair').onclick=()=>command('repair');
$('ready').onclick=()=>{command('ready');demoActor=state.crew.find(id=>!state.ready.includes(id))||state.helm;};
for(const [id,value]of [['left',-1],['right',1]]){const el=$(id);el.onpointerdown=e=>{el.setPointerCapture(e.pointerId);axis=value;el.classList.add('active');};el.onpointerup=el.onpointercancel=el.onlostpointercapture=()=>{axis=0;el.classList.remove('active');};}
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)&&!['INPUT','SELECT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();keys.add(e.code);}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();axis=0;C.pause(state,true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();axis=0;C.pause(state,true);}});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
function renderUI(){const v=C.view(state);$('phase').textContent=state.failed?'Boat damaged — restart this preview':v.title;
 $('role').textContent=(state.crew.length===1?'Solo':state.helm==='player-one'?'Player one at the helm':'Player two at the helm')+(state.paused?' · Paused':'');
 $('hp').textContent=Math.ceil(state.hull);$('hull').value=state.hull;$('start').disabled=state.started;$('pause').textContent=state.paused?'Resume':'Pause';
 $('combat').hidden=v.kind!=='fight';$('rest').hidden=v.kind!=='rest';$('repair').disabled=!v.canRepair;
 $('ready').textContent=state.ready.includes(demoActor)?'Waiting':'Ready: '+(demoActor==='player-one'?'player one':'player two');
 $('left').disabled=$('right').disabled=!v.canSteer;
 $('stats').textContent=renderer.info.render.triangles.toLocaleString()+' visible triangles · '+renderer.info.render.calls+' draw calls';
 for(const e of C.drain(state)){
  if(e.type==='hull-hit')$('notice').textContent='Rock struck the hull. Steer into the open water.';
  if(e.type==='boarding')$('notice').textContent='Safe course held. This is the normal-combat handoff.';
  if(e.type==='shelter'){$('notice').textContent=e.swapped?'Sheltered water: trade helm and deck roles.':'Sheltered water: repair before the next stretch.';demoActor=state.helm;}
  if(e.type==='sailing'){$('notice').textContent='Steer toward the pale markers. The boat has room on both sides.';demoActor=state.helm;}
  if(e.type==='repaired')$('notice').textContent='Hull repaired. This repair cannot be repeated.';
  if(e.type==='landed')$('notice').textContent='Thunder Cliffs reached. Preview complete — no campaign rewards or saves changed.';
 }
}
reset();
function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;
 const k=(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0);
 if(C.view(state).canSteer)C.command(state,state.helm,{epoch:state.epoch,type:'steer',seq:++seq,value:axis||k});
 C.advance(state,dt);art.sync(state,state.elapsed);
 const phone=innerWidth<700;
 if(inspect){camera.position.set(state.x+(phone?23:11),phone?18:9,phone?29:14);camera.lookAt(state.x,2,0);}
 else{camera.position.set(state.x*.45,phone?34:25,phone?31:25);camera.lookAt(state.x*.5,0,phone?-13:-22);}
 renderer.render(scene,camera);renderUI();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__SHIP_PREVIEW={get state(){return state;},C,art,renderer,scene,camera,reset,command};
