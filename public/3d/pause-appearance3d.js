// Temporary, opaque grayscale for one paused party avatar. Shared materials stay intact.
const shades=new WeakMap();
function grey(source){
 if(shades.has(source))return shades.get(source);
 const material=source.clone(),compile=source.onBeforeCompile,key=source.customProgramCacheKey();
 material.onBeforeCompile=function(shader,renderer){
  compile.call(this,shader,renderer);
  shader.fragmentShader=shader.fragmentShader.replace('#include <colorspace_fragment>',`#include <colorspace_fragment>
    gl_FragColor.rgb=vec3(dot(gl_FragColor.rgb,vec3(.2126,.7152,.0722)))*.72+vec3(.035);`);
 };
 material.customProgramCacheKey=()=>key+'|bf-paused-grey-v1';
 source.addEventListener('dispose',()=>{material.dispose();shades.delete(source);});
 shades.set(source,material);return material;
}
export function pauseAppearance(root){
 const originals=[];
 root.traverse(node=>{if(!node.material)return;const source=node.material;originals.push([node,source]);node.material=Array.isArray(source)?source.map(grey):grey(source);});
 return ()=>{for(const [node,source]of originals)node.material=source;};
}
