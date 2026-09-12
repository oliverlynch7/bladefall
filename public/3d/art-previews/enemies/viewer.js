import * as T from 'three';
import {GLTFLoader} from '../../jsm/loaders/GLTFLoader.js';
const host=document.querySelector('#viewer'),status=document.querySelector('#status'),select=document.querySelector('#creature'),clip=document.querySelector('#clip');
const scene=new T.Scene();scene.background=new T.Color('#202b3a');
const camera=new T.PerspectiveCamera(34,1,.01,30);camera.position.set(2.1,1.4,3.8);camera.lookAt(0,.65,0);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;host.append(renderer.domElement);
scene.add(new T.HemisphereLight(0xd8e8ff,0x55515e,2.1));
for(const [color,intensity,x,y,z] of [[0xffe0b1,3,-3,5,4],[0x9ec9ff,2,3,3,-2]]){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);}
const pedestal=new T.Mesh(new T.CylinderGeometry(.72,.79,.10,10),new T.MeshStandardMaterial({color:0x313d50,roughness:1}));pedestal.position.y=-.07;scene.add(pedestal);
let actor,mixer,actions={},rotate=true,token=0;const loader=new GLTFLoader();
const names={grunt:'Wildwood Grunt',flyer:'Gloomwing',emberling:'Emberling',frostling:'Frostling',toxling:'Toxling',shadeling:'Shadeling',sparkling:'Sparkling',goblin:'Treasure Goblin',bones:'Bones',slime:'Slime',slimelet:'Slimelet',caster:'Ruin Caster',charger:'Charger',mimic:'Mimic',dustjackal:'Dust Jackal',cragspitter:'Crag Spitter',galewisp:'Gale Wisp',thornboar:'Thorn Boar',sporeback:'Sporeback',sentinel:'Sentinel',revenant:'Revenant',dummy:'Training Dummy',bosscrystal:'Ward Crystal',frostshell:'Frostshell',frostlobber:'Frost Lobber',magmaskit:'Magma Skitter',embertotem:'Eruption Totem',blinkstalker:'Blink Stalker',voidtether:'Void Tether',sunpriest:'Sun Priest',marblestatue:'Marble Statue',siegeknight:'Siege Knight',royalarcanist:'Royal Arcanist',brute:'The Brute',warden:'The Fallen',archer:'Hollow Marksman',sorcerer:'Frost Sorcerer',colossus:'Ember Colossus',marblecolossus:'Marble Colossus',king:'Abyss King',tyrant:'The Awakened King'};
const themes={wood:'Outskirts · Root and thorn',sand:'Hollow Pass · Sand and wind',ruin:'Ruined Keep · The fallen watch',ice:'Frostfell · Living ice',fire:'Emberdeep · The furnace brood',void:'The Abyss · The hollow court',sun:'Sunspire · Ivory and gold',royal:'Duskmoor · The violet crown'};
function dispose(root){root.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
function play(){if(!mixer)return;mixer.stopAllAction();const a=actions[clip.value];if(a){a.reset().play();} }
async function show(rec){
 const ticket=++token;select.value=rec.type;status.textContent='Loading model…';document.querySelector('#name').textContent=names[rec.type]||rec.type;
 try{const gltf=await loader.loadAsync('../../enemy-assets/'+rec.type+'.glb');if(ticket!==token){dispose(gltf.scene);return;}
 if(actor){mixer.stopAllAction();mixer.uncacheRoot(actor);scene.remove(actor);dispose(actor);}
 actor=gltf.scene;actor.updateMatrixWorld(true);const box=new T.Box3().setFromObject(actor),s=1.35/(box.max.y-box.min.y);actor.scale.setScalar(s);actor.position.y=-box.min.y*s;scene.add(actor);
 mixer=new T.AnimationMixer(actor);actions={};for(const c of gltf.animations){const a=mixer.clipAction(c);if(!['Idle','Move'].includes(c.name)){a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;}actions[c.name]=a;}
 play();status.textContent=`${rec.triangles.toLocaleString()} triangles · ${(rec.bytes/1024).toFixed(0)} KB · six animations`;
 }catch(e){status.textContent='Model could not load. Reload to retry.';console.error(e);}
}
try{
 const roster=await (await fetch('../../enemy-assets/manifest.json')).json();
 for(const [theme,title] of Object.entries(themes)){const h=document.createElement('h2');h.textContent=title;const grid=document.createElement('div');grid.className='grid';document.querySelector('#roster').append(h,grid);
 for(const rec of roster.filter(r=>r.theme===theme)){const label=names[rec.type]||rec.type;const opt=new Option(label,rec.type);select.add(opt);const card=document.createElement('button');card.className='card';card.innerHTML=`<img loading="lazy" src="${rec.type}.png" alt="Blender render of ${label}" width="480" height="560"><span>${label}</span>`;card.onclick=()=>{show(rec);host.scrollIntoView({behavior:'smooth',block:'start'});};grid.append(card);}}
 select.onchange=()=>show(roster.find(r=>r.type===select.value));clip.onchange=play;document.querySelector('#replay').onclick=play;document.querySelector('#rotate').onclick=e=>{rotate=!rotate;e.currentTarget.setAttribute('aria-pressed',String(rotate));};
 await show(roster.find(r=>r.type==='thornboar'));
}catch(e){status.textContent='Bestiary unavailable. Reload to retry.';console.error(e);}
new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe(host);
let last=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(document.hidden)return;mixer?.update(dt);if(actor&&rotate)actor.rotation.y+=dt*.25;renderer.render(scene,camera);});
