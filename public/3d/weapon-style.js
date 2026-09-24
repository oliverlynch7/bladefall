// One rendering palette for the six existing affinities. Legacy IDs remain aliases only.
export const ELEMENT_COLORS={fire:'#e77f45',ice:'#a2dce8',poison:'#91bc61',arcane:'#ad88d2',holy:'#e4c16b',void:'#8971b4'};
export function weaponElement(w){const id=({storm:'arcane',lightning:'arcane'})[w?.el]||w?.el;return Object.hasOwn(ELEMENT_COLORS,id)?id:null;}
export function weaponTint(w){return ELEMENT_COLORS[weaponElement(w)]||null;}
// y is distance along the weapon from its palm. The protected interval includes both hands.
export function presenceFor(name,profile){
 if(name==='Claymore')return {start:.30,grow:1.45,width:1.42,depth:1.2};
 if(name==='Sword_Knight')return {start:.22,grow:1.30,width:1.25,depth:1.12};
 if(name.startsWith('Sword'))return {start:.20,grow:1.24,width:1.20,depth:1.12};
 if(profile.kind==='dagger')return {start:.16,grow:1.09,width:1.10,depth:1.06};
 if(profile.kind==='bow')return {start:.14,grow:1.22,width:1,depth:1.10,bilateral:true};
 if(name==='Spear')return {start:.44,grow:1.16,width:1.20,depth:1.10};
 if(name==='Scythe')return {start:.50,grow:1.20,width:1.16,depth:1.12};
 if(profile.kind==='staff')return {start:.20,grow:1.22,width:1.18,depth:1.12};
 return {start:Math.max(.28,(profile.support||0)+.12),grow:1.22,width:1.26,depth:1.18};
}
export function shapePresence(v,t){
 const y=t.bilateral?Math.abs(v.y):v.y,d=y-t.start;if(d<=0)return v;
 const weight=Math.min(1,d/.16);v.x*=1+(t.width-1)*weight;v.z*=1+(t.depth-1)*weight;
 v.y=(t.bilateral&&v.y<0?-1:1)*(t.start+d*t.grow);return v;
}
