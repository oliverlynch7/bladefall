import {buildDeep} from './deep-art.js?v=2342';
export function buildSkyLibrary(scene,w){
 const result=buildDeep(scene,{...w,portalProfile:{name:'Sunspire Palace · Sky Library',fog:'#a8c7d9',sky:[.44,.65,.83],sun:'#fff1d3',body:'#b5ad98',lamp:'#f5d48c',hazard:['#9aaebf','#c3d1db'],sunGlow:[.18,.15,.10]}});
 result.counts.name='Sky Library';return result;
}
