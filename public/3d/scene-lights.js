// Fixed light pool: proximity changes uniforms, never the shader's light count.
export function updateLocalLights(state,positions,p,radius,power,low=false,flat=false){
 const lights=state.lights,n=lights.length,nearest=state._localNearest||(state._localNearest=Array(n)),dist=state._localDistances||(state._localDistances=Array(n));
 nearest.fill(null);dist.fill(radius*radius);
 if(!low)for(const v of positions){const d=(v.x-p.x)**2+(flat?0:(v.y-(p.y||0))**2)+(v.z-p.z)**2;
  for(let i=0;i<n;i++)if(d<dist[i]){for(let j=n-1;j>i;j--){dist[j]=dist[j-1];nearest[j]=nearest[j-1];}dist[i]=d;nearest[i]=v;break;}
 }
 for(let i=0;i<n;i++){const light=lights[i];light.visible=true;light.intensity=nearest[i]?power:0;if(nearest[i])light.position.copy(nearest[i]);}
}
