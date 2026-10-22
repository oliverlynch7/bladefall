/* One still image per outfit. No extra live renderer or animation loop during combat. */
let T,createClassDisplay;
async function imports(){if(T)return;const mods=await Promise.all([import('./three.module.js'),import('./hero3d.js?v=2362')]);T=mods[0];createClassDisplay=mods[1].createClassDisplay;}
const cache=new Map();let serial=Promise.resolve();
function image(container,url,name){if(!container.isConnected)return;const img=document.createElement('img');img.alt=name;img.src=url;container.replaceChildren(img);container.dataset.ready='true';}
function snapshot(container,cid,tier){
 const name=window.BFClassLooks?.catalog[cid]?.[tier]?.name;if(!container||!name)return Promise.resolve(false);const key=cid+':'+tier;if(container.dataset.requested===key)return Promise.resolve(false);container.dataset.requested=key;
 if(document.documentElement.dataset.bake!=='true'){return new Promise(resolve=>{const img=document.createElement('img');img.alt=name;img.onload=()=>{if(container.isConnected&&container.dataset.requested===key){container.replaceChildren(img);container.dataset.ready='true';}resolve(true);};img.onerror=()=>{if(container.isConnected&&container.dataset.requested===key){container.textContent='View at the Stylist';container.dataset.ready='fallback';}resolve(false);};img.src='art-previews/progression/'+cid+'-'+tier+'.png?v=2278';});}
 if(cache.has(key)){image(container,cache.get(key),name);return Promise.resolve(true);}
 const work=async()=>{if(!container.isConnected||container.dataset.requested!==key)return false;let rig,renderer;const disposable=[];
 try{await imports();rig=await createClassDisplay(cid,tier);if(!container.isConnected||container.dataset.requested!==key)return false;rig.update(.03,{animation:'Idle',motion:false});
  const canvas=document.createElement('canvas');renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(256,320);renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene(),stage=new T.Group();scene.add(stage);stage.add(rig.wrap);rig.wrap.updateMatrixWorld(true);const box=new T.Box3().setFromObject(rig.wrap,true),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());rig.wrap.position.sub(center);stage.scale.setScalar(4/Math.max(.001,size.y));
  scene.add(new T.HemisphereLight(0xd8efff,0x876f55,2.2));const keyLight=new T.DirectionalLight(0xffefcd,3),rim=new T.DirectionalLight(0x9bbdff,2);keyLight.position.set(-3,5,6);rim.position.set(4,2,-3);scene.add(keyLight,rim);
  const cam=new T.PerspectiveCamera(31,.8,.05,100),width=size.x*stage.scale.x,dist=Math.max(9,width*2.4);cam.position.set(dist*.08,.4,dist);cam.lookAt(0,0,0);scene.updateMatrixWorld(true);renderer.render(scene,cam);const url=canvas.toDataURL('image/png');cache.set(key,url);if(cache.size>12)cache.delete(cache.keys().next().value);image(container,url,name);return true;
 }catch(e){if(container.isConnected){container.textContent='Outfit unlocked';container.dataset.ready='fallback';}console.warn('Class reward preview unavailable',e?.message||'');return false;}
 finally{rig?.dispose();for(const d of disposable)d.dispose();renderer?.dispose();renderer?.forceContextLoss();}};
 const result=serial.catch(()=>{}).then(work);serial=result;return result;
}
window.BFProgressModels={snapshot};
for(const n of document.querySelectorAll('.progress-look-model')){const p=n.closest('.progress-look');if(p)snapshot(n,p.dataset.class,+p.dataset.tier);}
