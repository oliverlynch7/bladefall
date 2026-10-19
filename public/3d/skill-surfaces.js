/* Cached, unit-sized presentation meshes. No actor references or runtime geometry allocation. */
(function(root){
'use strict';
const cache=new Map();
function finish(points,faces,uv){const normals=points.map(()=>[0,0,0]);for(const [a,b,c]of faces){const p=points[a],u=points[b].map((n,i)=>n-p[i]),v=points[c].map((n,i)=>n-p[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const id of [a,b,c])for(let k=0;k<3;k++)normals[id][k]+=n[k];}for(const n of normals){const len=Math.hypot(...n)||1;for(let k=0;k<3;k++)n[k]/=len;}return {points,faces,uv,normals};}
function get(kind,detail=48){const low=detail<40,key=kind+(low?'L':'H');if(cache.has(key))return cache.get(key);const p=[],f=[],uv=[];let outline=null;
if(kind==='sphere'||kind==='stud'){const nx=kind==='stud'?8:low?12:20,ny=kind==='stud'?5:low?7:12;for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){const a=x/nx*Math.PI*2,b=y/ny*Math.PI;p.push([Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)]);uv.push([x/nx,y/ny]);}for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+nx+1;if(y>0)f.push([a,b,a+1]);if(y<ny-1)f.push([b,b+1,a+1]);}}
else if(kind==='heater'||kind==='kite'||kind==='leaf'){
 const controls=kind==='leaf'?[[-.1,1],[.65,.7],[.9,.1],[.55,-.65],[0,-1.1],[-.55,-.65],[-.9,.1],[-.65,.7]]:kind==='kite'?[[0,1],[.85,.55],[.7,-.25],[0,-1.25],[-.7,-.25],[-.85,.55]]:[[-.75,.82],[.75,.82],[.94,.45],[.72,-.25],[.38,-.78],[0,-1.06],[-.38,-.78],[-.72,-.25],[-.94,.45]];
 const n=controls.length*(low?2:4),rings=low?2:4;p.push([0,0,.3]);uv.push([.5,.5]);
 const edge=t=>{const j=Math.floor(t),u=t-j,a=controls[(j-1+controls.length)%controls.length],b=controls[j%controls.length],c=controls[(j+1)%controls.length],d=controls[(j+2)%controls.length];return [0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*u+(2*a[k]-5*b[k]+4*c[k]-d[k])*u*u+(-a[k]+3*b[k]-3*c[k]+d[k])*u*u*u));};
 for(let j=1;j<=rings;j++){const rr=j/rings;for(let k=0;k<n;k++){const e=edge(k/n*controls.length);p.push([e[0]*rr,e[1]*rr,.3*(1-rr*rr)]);uv.push([.5+e[0]*rr*.45,.5+e[1]*rr*.4]);}}
 outline=p.slice(1+(rings-1)*n);for(let k=0;k<n;k++)f.push([0,1+k,1+(k+1)%n]);for(let j=1;j<rings;j++)for(let k=0;k<n;k++){const a=1+(j-1)*n+k,b=1+j*n+k,c=1+(j-1)*n+(k+1)%n,d=1+j*n+(k+1)%n;f.push([a,b,c],[b,d,c]);}
}
else if(kind==='plume'||kind==='feather'){
 const rows=low?8:14,cols=4;for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const t=y/rows,u=x/cols*2-1,w=Math.sin(Math.PI*t)**.8*(kind==='feather'?.7:1);p.push([u*w+Math.sin(t*6)*.13,t,Math.sin(Math.PI*t)*.16*(1-u*u)]);uv.push([x/cols,t]);}for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+cols+1;f.push([a,b,a+1],[b,b+1,a+1]);}
}
else if(kind==='herd'){
 const add=(kind,scale,offset)=>{const mesh=get(kind,24),base=p.length;for(let i=0;i<mesh.points.length;i++){p.push(mesh.points[i].map((v,k)=>v*scale[k]+offset[k]));uv.push(mesh.uv[i]);}for(const face of mesh.faces)f.push(face.map(i=>i+base));};
 for(const [scale,offset]of [[[.38,.25,.63],[0,.70,0]],[[.25,.25,.25],[0,.86,.46]],[[.25,.23,.30],[0,1,.68]],[[.15,.12,.22],[0,.94,.95]]])add(low?'stud':'sphere',scale,offset);for(const side of [-1,1])add('needle',[.08,.25,.08],[side*.15,1.1,.60]);
}
else if(kind==='hammer'){
 const outline=[[-.8,-.5],[.8,-.5],[1,-.3],[1,.3],[.8,.5],[-.8,.5],[-1,.3],[-1,-.3]];for(const z of [-.5,.5]){p.push([0,0,z]);uv.push([.5,.5]);for(const [x,y]of outline){p.push([x,y,z]);uv.push([.5+x*.5,.5+y]);}}for(let k=0;k<8;k++){const a=1+k,b=1+(k+1)%8,c=10+k,d=10+(k+1)%8;f.push([0,b,a],[9,c,d],[a,b,c],[b,d,c]);}
}
else if(kind==='star'){
 p.push([0,.08,0]);uv.push([.5,.5]);for(let k=0;k<16;k++){const a=k/16*Math.PI*2,r=k%4===0?1:k%2?.35:.2;p.push([Math.sin(a)*r,0,Math.cos(a)*r]);uv.push([.5+Math.sin(a)*r*.5,.5+Math.cos(a)*r*.5]);}for(let k=0;k<16;k++)f.push([0,k+1,(k+1)%16+1]);
}
else if(kind==='crescent'){
 const n=low?20:40;for(let j=0;j<3;j++)for(let k=0;k<=n;k++){const t=k/n,a=-1.25+2.5*t,r=1-j*.06*Math.sin(Math.PI*t);p.push([Math.sin(a)*r,Math.sin(j*Math.PI/2)*.06,Math.cos(a)*r]);uv.push([t,j/2]);}for(let j=0;j<2;j++)for(let k=0;k<n;k++){const a=j*(n+1)+k,b=a+n+1;f.push([a,b,a+1],[b,b+1,a+1]);}
}
else if(kind==='ring'){
 const n=low?24:48;for(let j=0;j<3;j++)for(let k=0;k<=n;k++){const a=k/n*Math.PI*2,r=.84+j*.08;p.push([Math.sin(a)*r,Math.sin(j*Math.PI/2)*.03,Math.cos(a)*r]);uv.push([k/n,j/2]);}for(let j=0;j<2;j++)for(let k=0;k<n;k++){const a=j*(n+1)+k,b=a+n+1;f.push([a,b,a+1],[b,b+1,a+1]);}
}
else if(kind==='bone'||kind==='barrel'){
 const n=low?8:16,profile=kind==='barrel'?[[0,.78],[.10,.88],[.30,.98],[.70,.98],[.90,.88],[1,.78]]:[[0,.23],[.12,.19],[.30,.11],[.70,.11],[.88,.19],[1,.23]];for(const [y,r]of profile)for(let k=0;k<n;k++){const a=k/n*Math.PI*2;p.push([Math.sin(a)*r,y,Math.cos(a)*r]);uv.push([k/n,y]);}for(let j=0;j<profile.length-1;j++)for(let k=0;k<n;k++){const a=j*n+k,b=a+n,c=j*n+(k+1)%n,d=(j+1)*n+(k+1)%n;f.push([a,b,c],[b,d,c]);}
}
else if(kind==='needle'){
 const n=low?8:12;for(const [y,r]of [[0,.28],[.20,1],[.75,.38],[1,0]])for(let k=0;k<n;k++){const a=k/n*Math.PI*2;p.push([Math.sin(a)*r,y,Math.cos(a)*r]);uv.push([k/n,y]);}for(let j=0;j<3;j++)for(let k=0;k<n;k++){const a=j*n+k,b=(j+1)*n+k,c=j*n+(k+1)%n,d=(j+1)*n+(k+1)%n;f.push([a,b,c],[b,d,c]);}
}else throw Error('Unknown skill surface '+kind);
const mesh=finish(p,f,uv);mesh.outline=outline;cache.set(key,mesh);return mesh;}
root.BF_SKILL_SURFACES={get,cache};
})(window);
