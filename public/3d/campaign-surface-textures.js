// Seamless, shared surface paint. Generated once per material, not per object.
// Every mark has a material purpose: mortar, grain, mineral veins or wear.
export function paintCampaignSurface(c,kind,rnd){
 const N=512,gray=v=>`rgb(${v},${v},${v})`;
 const stroke=(pts,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const wrapped=(x,y,draw)=>{for(const ox of [-N,0,N])for(const oy of [-N,0,N])draw(x+ox,y+oy);};
 c.fillStyle='#dadada';c.fillRect(0,0,N,N);
 // The low-frequency patina repeats seamlessly across neighboring meshes.
 for(let i=0;i<65;i++){
  const x=rnd()*N,y=rnd()*N,r=15+rnd()*58,dark=rnd()<.5;
  wrapped(x,y,(xx,yy)=>{const g=c.createRadialGradient(xx,yy,0,xx,yy,r);g.addColorStop(0,dark?'rgba(65,65,65,.085)':'rgba(255,255,255,.13)');g.addColorStop(1,'rgba(160,160,160,0)');c.fillStyle=g;c.fillRect(xx-r,yy-r,r*2,r*2);});
 }
 if(['masonry','flagstone','marble','metal'].includes(kind)){
  const masonry=kind==='masonry',stone=kind==='flagstone',metal=kind==='metal';
  const rh=masonry?64:128,bw=masonry?128:metal?256:128;
  c.fillStyle=metal?'#777777':kind==='marble'?'#a6a6a6':'#777a77';c.fillRect(0,0,N,N);
  for(let row=0;row<N/rh;row++)for(let col=-1;col<N/bw;col++){
   // Wrapped edge bricks share pigment/cracks with the same brick on the
   // opposite edge, including the half-brick stagger on alternating rows.
   let cellSeed=(row*131+((col+N/bw)%(N/bw))*977+3791)>>>0;
   const cellRnd=()=>{cellSeed=(Math.imul(cellSeed,1664525)+1013904223)>>>0;return cellSeed/4294967296;};
   const x=col*bw+(masonry||stone?row%2*bw/2:0),y=row*rh,v=200+Math.floor(cellRnd()*43),gap=metal?2:kind==='marble'?1.5:3;
   const g=c.createLinearGradient(x,y,x+bw,y+rh);g.addColorStop(0,gray(Math.min(250,v+10)));g.addColorStop(.4,gray(v));g.addColorStop(1,gray(v-13));c.fillStyle=g;c.fillRect(x+gap,y+gap,bw-gap*2,rh-gap*2);
   stroke([[x+gap,y+rh-gap],[x+gap,y+gap],[x+bw-gap,y+gap]],'#f1f1eb',1.5);
   stroke([[x+bw-gap,y+gap],[x+bw-gap,y+rh-gap],[x+gap,y+rh-gap]],'#a3a5a2',2);
   // Eroded corners and small cracks are painted, not chipped polygons.
   if((masonry||stone)&&cellRnd()<.46){const cx=x+12+cellRnd()*(bw-26);stroke([[cx,y+gap],[cx-4,y+rh*.19],[cx+5,y+rh*.34],[cx+2,y+rh*.45]],'#8d928d',1);}
   if(metal)for(const dx of [12,bw-12])for(const dy of [12,rh-12]){c.fillStyle='#747877';c.beginPath();c.arc(x+dx,y+dy,3,0,6.28);c.fill();c.fillStyle='#f0f0e9';c.fillRect(x+dx-1,y+dy-2,2,1);}
  }
 }
 if(kind==='wood'){
  for(let i=0;i<8;i++){
   const x=i*64,v=185+Math.floor(rnd()*51);c.fillStyle=gray(v);c.fillRect(x+2,0,61,N);stroke([[x,0],[x,N]],'#686966',2.4);stroke([[x+3,0],[x+3,N]],'#e9e9df',1.2);
   for(let j=0;j<10;j++){
    const xx=x+5+j*5.5,phase=rnd()*6.28;c.strokeStyle=j%3?'rgba(75,70,65,.25)':'rgba(255,255,245,.35)';c.lineWidth=j%4?1:1.8;c.beginPath();
    for(let yy=0;yy<=N;yy+=8){const px=xx+Math.sin(yy/N*Math.PI*4+phase)*2.5;yy?c.lineTo(px,yy):c.moveTo(px,yy);}c.stroke();
   }
   const ky=80+rnd()*350;c.strokeStyle='#969589';c.lineWidth=1.1;for(let k=0;k<4;k++){c.beginPath();c.ellipse(x+31,ky,2+k*3.7,6+k*10,0,0,6.28);c.stroke();}
  }
 }
 if(['stone','basalt','marble','ice'].includes(kind)){
  const rock=kind==='stone'||kind==='basalt';
  for(let i=0;i<(rock?25:11);i++){
   let x=rnd()*N,y=rnd()*N;const points=[[x,y]];
   for(let j=0;j<8;j++){x+=14+rnd()*27;y+=(rnd()-.48)*(rock?27:59);points.push([x,y]);}
   for(const ox of [-N,0,N])for(const oy of [-N,0,N]){
    const p=points.map(([px,py])=>[px+ox,py+oy]);stroke(p,kind==='ice'?'#f5fcff':rock?'#979e9b':'rgba(92,116,127,.38)',kind==='ice'?2.3:1.4);
    if(rock||kind==='ice')stroke(p.map(([px,py])=>[px,py+2]),kind==='ice'?'#adb9bd':'#e3e5df',1);
   }
  }
 }
 if(['soil','sand','snow','grass'].includes(kind))for(let i=0;i<620;i++){
  const x=rnd()*N,y=rnd()*N,v=kind==='snow'?206+rnd()*39:158+rnd()*88;c.strokeStyle=c.fillStyle=gray(Math.floor(v));c.lineWidth=1.4;
  if(kind==='grass')wrapped(x,y,(px,py)=>{c.beginPath();c.moveTo(px,py);c.quadraticCurveTo(px+5,py-6,px+3,py-10);c.stroke();});
  else wrapped(x,y,(px,py)=>{c.beginPath();c.ellipse(px,py,1+rnd()*2,1,0,0,6.28);c.fill();});
 }
 if(kind==='sand'||kind==='snow'||kind==='water')for(let j=0;j<16;j++){
  const y=j*32;c.strokeStyle=kind==='snow'?'rgba(255,255,255,.45)':'rgba(245,245,239,.5)';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(160,y+12,350,y-12,N,y);c.stroke();
 }
 if(kind==='cloth')for(let i=0;i<N;i+=4){stroke([[i,0],[i,N]],i%8?'#bbc0bc':'#e7e7df',1);stroke([[0,i],[N,i]],'#c6c9c3',1);}
 // Fine pores remain low contrast and mip-filter away instead of sparkling.
 c.globalAlpha=.1;for(let i=0;i<2600;i++){c.fillStyle=rnd()<.5?'#353c35':'#ffffff';c.fillRect(Math.floor(rnd()*N),Math.floor(rnd()*N),1,1);}c.globalAlpha=1;
}
