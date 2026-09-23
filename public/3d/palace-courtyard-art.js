import {buildDeep} from './deep-art.js?v=2017';
// Palace-kit geometry is shared with existing Sunspire art, including chunk culling.
export function buildPalaceCourt(scene,w){
 const s=window.__BF3?.G?.storyState||{flags:{},items:{}},f=k=>!!s.flags['pc.'+k],deco=[...w.deco];
 const add=(name,x,y,z,ww,h,d,c)=>deco.push({portalPart:name,x,y0:y,z,w:ww,h,d,c});
 // Settled water and new plants are solid geometry; neither depends on particles.
 if(f('court')){add('cap',0,211,-1470,160,3,150,'#a1d8d2');for(let i=0;i<8;i++)add('glow',Math.sin(i*Math.PI/4)*80,230,-1470+Math.cos(i*Math.PI/4)*80,5,10,5,'#d3eee4');}
 if(f('garden.water'))for(let i=0;i<12;i++)add('cap',1400+i*22,164,-1070-i*30,30,3,42,'#94c8bb');
 if(f('garden.done'))for(const [x,z,y]of [[-360,-1490,200],[360,-1490,200],[1560,-1000,160],[1840,-1210,160]])for(let j=0;j<12;j++){const px=x+(j%4-1.5)*24,pz=z+(Math.floor(j/4)-1)*25;add('rubble',px,y+22,pz,22,32,22,'#789d64');add('cap',px,y+49,pz,16,8,16,j%3?'#ead9ab':'#afbed5');}
 for(const side of ['west','east'])if(f(side)){const x=side==='west'?-1050:1050,z=side==='west'?-2450:-2070;add('stone',x+65,345,z-90,70,9,95,'#595a5c');}
 const result=buildDeep(scene,{...w,deco,portalProfile:{name:'Sunspire Palace · Palace Courtyard',fog:'#aebfc4',sky:[.57,.68,.73],sun:'#fff2d6',body:'#b1ad9c',lamp:'#f6d997',hazard:['#8faeba','#c3d4d6'],sunGlow:[.18,.15,.10]}});result.counts.name='Palace Courtyard';return result;
}
