/* Beta-only continuous ground. Rendering uses exactly the same triangle split as physics. */
window.BFBriarTerrain=(()=>{
 const cell=80;
 function make(part){
  const hills=part?[[ -480,-3070,125,620,680],[450,-3660,145,650,540],[-950,-4250,210,480,560]]:[[-520,-2210,105,620,620],[520,-3190,155,750,650],[-870,-3710,190,530,530]];
  const raw=(x,z)=>hills.reduce((n,[cx,cz,h,rx,rz])=>{const d=((x-cx)/rx)**2+((z-cz)/rz)**2;return n+(d<1?h*(1-d)**2:0);},0);
  const height=(x,z)=>{const ix=Math.floor(x/cell),iz=Math.floor(z/cell),u=x/cell-ix,v=z/cell-iz,a=raw(ix*cell,iz*cell),b=raw((ix+1)*cell,iz*cell),c=raw(ix*cell,(iz+1)*cell),d=raw((ix+1)*cell,(iz+1)*cell);return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);};
  return {cell,height,hills};
 }
 return {make};
})();
