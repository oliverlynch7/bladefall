import {buildDeep} from './deep-art.js?v=2017';
export function buildSkyLibrary(scene,w){
 const result=buildDeep(scene,{...w,portalProfile:{name:'Sunspire Palace · Sky Library',fog:'#aebdc7',sky:[.56,.66,.74],sun:'#fff1d3',body:'#b5ad98',lamp:'#f5d48c',hazard:['#9aaebf','#c3d1db'],sunGlow:[.18,.15,.10]}});
 result.counts.name='Sky Library';return result;
}
