// Class-specific constructions. Geometry follows the ability's action; all strokes share the existing budget.
(function(root){root.BF_SKILL_IDENTITY=function(pr,c){
const {line,arc,pushM,popM,mv,rotY,rotX,q,v,a,r,col,hot}=c,id=pr.id,f=pr.form,slot=pr.slot,side=pr.side==='b'?1:0,R=Math.min(r,160),def=['ward','wall','heal','roar','crown'].includes(f),move=['dash','blink','ghost','dive','rise'].includes(f),radial=['nova','vortex','storm','quake','spiral','summon'].includes(f);
const L=(x,y,w=2,color=col,alpha=a)=>line(x,y,w,color,alpha),path=(pts,w=2,color=col)=>{for(let i=1;i<pts.length;i++)L(pts[i-1],pts[i],w,color);};
const ring=(rr,y,rot=0,sweep=Math.PI*2)=>arc(rr,y,rot,rot+sweep,col,a,2,24);
const blade=(x,y,z,h=40)=>{path([[x-5,y,z],[x,y+h,z],[x+5,y,z],[x-5,y,z]],2.5,hot);L([x-9,y+3,z],[x+9,y+3,z]);L([x,y,z],[x,y-12,z]);};
const bolt=(height,z=0)=>{let p=[0,height,z];for(let j=1;j<=9;j++){const n=[j===9?0:Math.sin(j*13+Math.floor(q*14))*11,height*(1-j/9),z+Math.sin(j*7)*4];L(p,n,3.4,hot);if(j%3===0)L(p,[p[0]+20,p[1]+9,p[2]+10],1);p=n;}};
const shield=(x,y,z,s=1)=>path([[x-19*s,y+18*s,z],[x,y+25*s,z],[x+19*s,y+18*s,z],[x+16*s,y-10*s,z],[x,y-27*s,z],[x-16*s,y-10*s,z],[x-19*s,y+18*s,z]],3,hot);
if(pr.cls==='paladin'){
 if(id==='pal_smite'){bolt(330);for(let j=0;j<8;j++){const b=j*Math.PI/4;L([Math.sin(b)*12,3,Math.cos(b)*12],[Math.sin(b)*R*v,3,Math.cos(b)*R*v],2);}ring(20+70*v,2);}
 else if(id==='pal_sky'){pushM();mv(0,(1-v)*240,0);path([[-27,45,0],[27,45,0],[27,67,0],[-27,67,0],[-27,45,0]],5,hot);L([0,45,0],[0,0,0],5);popM();ring(R*v,3);bolt(140);}
 else if(id==='pal_bash'){shield(0,32,20+v*38);L([0,32,20],[0,32,65],5,hot);}
 else if(id==='pal_guard'||id==='pal_laststand'){for(let j=0;j<(slot===3?6:3);j++){pushM();rotY(j*Math.PI*2/(slot===3?6:3));shield(0,32,35,slot===3?1.25:1);popM();}if(slot===3)ring(35,85);}
 else if(id==='pal_ground'){for(let j=0;j<12;j++){pushM();rotY(j*Math.PI/6);L([0,3,22],[0,3,R],3);L([0,3,R*.65],[0,40*v,R*.65],2,hot);popM();}ring(R,3);}
 else if(id==='pal_taunt'){for(let j=0;j<8;j++){pushM();rotY(j*Math.PI/4);path([[-9,20,R*(1-v)+25],[0,20,R*(1-v)+12],[9,20,R*(1-v)+25]],2,hot);popM();}shield(0,30,25);}
 else{for(let j=0;j<16;j++){pushM();rotY(j*Math.PI/8);L([0,15,8],[0,15+Math.sin(j)*10,R*v],3,hot);popM();}}return true;
}
// Every class has a different geometric vocabulary, while action determines travel, containment or impact.
const count=def?5:radial?(slot===3?9:6):move?3:(f==='fan'?5:1),height=def?30:radial?8+v*25:25;
for(let j=0;j<count;j++){pushM();if(radial||def)rotY(j*Math.PI*2/count+(['vortex','spiral'].includes(f)?q*5:0));else if(f==='fan')rotY((j-(count-1)/2)*.28);else if(move)mv((j-1)*18,0,-q*70);const z=def?34:radial?R*(f==='vortex'?1-v*.7:v):20+v*(side?80:45),h=height;
 switch(pr.cls){
 case 'warrior': if(def)shield(0,h,z,.75);else if(f==='quake'){path([[-12,2,z-12],[0,3,z],[14,2,z+18],[5,3,z+38]],3,hot);}else{pushM();mv(0,h,z);rotX(-.7+v*1.4);blade(0,0,0,32+slot*8);popM();}break;
 case 'ranger': if(def||f==='trap'||f==='mark'){path([[-16,4,z],[0,4,z+18],[16,4,z],[0,4,z-18],[-16,4,z]],2);for(const s of [-1,1])path([[0,4,z],[s*8,23*v,z],[s*17,32*v,z+3]],2,hot);}else{L([0,h,z-28],[0,h,z+20],2,hot);path([[-8,h,z+10],[0,h,z+22],[8,h,z+10]],2);for(const s of [-1,1])L([0,h,z-18],[s*7,h,z-26]);}break;
 case 'mage': pushM();mv(0,h,z);rotY(q*(side?-3:3));rotX(.5+slot*.3);for(let k=0;k<6;k++){const b=k*Math.PI/3;path([[Math.sin(b)*24,0,Math.cos(b)*24],[0,side?28:-20,0],[Math.sin(b+Math.PI/3)*24,0,Math.cos(b+Math.PI/3)*24]],1.7,k%2?hot:col);}popM();break;
 case 'reaper': pushM();mv(0,h,z);rotY(q*4);L([0,-12,0],[0,35,0],2.5);path([[0,32,0],[16,38,0],[30,28,0],[36,13,0],[19,26,0],[0,28,0]],2.5,hot);if(def||f==='tether')for(let k=0;k<3;k++)path([[-4,k*13,0],[0,k*13+7,3],[4,k*13,0],[0,k*13-7,-3],[-4,k*13,0]],1.2);popM();break;
 case 'necromancer': if(f==='summon'){path([[-13,0,z],[ -13,35*v,z],[0,46*v,z],[13,35*v,z],[13,0,z]],3,hot);for(let k=0;k<3;k++)L([-10,12+k*8,z],[10,12+k*8,z],2);}else{L([0,h-14,z],[0,h+17,z],3,hot);for(let k=0;k<4;k++)for(const s of [-1,1])path([[0,h+k*6,z],[s*13,h+k*6+4,z],[s*18,h+k*6-4,z]],2,hot);}break;
 case 'ninja': if(f==='smoke'||move){for(let k=0;k<3;k++){pushM();mv(0,h+k*7,z);rotX(k*.5);arc(12+k*7,0,q*4,q*4+3.9,col,a*(1-k*.2),2,12);popM();}}else{pushM();mv(0,h,z);rotX(Math.PI/2);rotY(q*12);for(let k=0;k<4;k++){pushM();rotY(k*Math.PI/2);path([[0,0,2],[-5,0,9],[0,0,25],[5,0,9],[0,0,2]],2,hot);popM();}popM();}break;
 case 'berserker': for(let k=-1;k<=1;k++)path([[k*9-9,h+25,z-12],[k*9+4,h+3,z+8],[k*9-3,h-9,z+30]],3.6,k?col:hot);if(def)path([[-19,h+14,z],[0,h-14,z],[19,h+14,z]],4);break;
 case 'pirate': if(id==='pir_goldrush'){pushM();mv(0,20+v*40,z);rotX(Math.PI/2);ring(12,0);L([-4,-7,0],[4,7,0],3,hot);popM();}else if(f==='trap'){path([[-14,2,z],[ -18,25,z],[14,25,z],[18,2,z],[-14,2,z]],3);path([[0,25,z],[6,33,z],[2,40,z]],2,hot);}else{for(let k=0;k<3;k++){pushM();mv(0,h,z-k*15);rotX(Math.PI/2);arc(5+k*4,0,0,Math.PI*2,k?col:hot,a*(1-k*.25),3,12);popM();}for(let k=0;k<5;k++)L([0,h,z],[Math.sin(k*7)*20,h+Math.cos(k*7)*20,z+25],1.5,hot);}break;
 case 'chronomancer': pushM();mv(0,h,z);rotX(def?0:Math.PI/2);ring(22,0);for(let k=0;k<12;k++){const b=k*Math.PI/6;L([Math.sin(b)*18,0,Math.cos(b)*18],[Math.sin(b)*22,0,Math.cos(b)*22],1.3);}L([0,0,0],[Math.sin(q*(side?-9:5))*17,0,Math.cos(q*(side?-9:5))*17],2,hot);if(slot===3)path([[-10,0,-12],[10,0,-12],[-10,0,12],[10,0,12],[-10,0,-12]],2,hot);popM();break;
 case 'monk': pushM();mv(0,h,z);rotX(side?Math.PI/2:.3);for(let k=0;k<2;k++)arc(16+k*8,0,q*6+k*Math.PI,q*6+k*Math.PI+2.4,k?hot:col,a,4-k*2,18);if(def)for(let k=0;k<3;k++)L([-11,0,k*7-7],[11,0,k*7-7],2,hot);popM();break;
 case 'stormcaller': pushM();mv(0,0,z);bolt(radial?80:55);for(let k=0;k<3;k++)path([[-16,h+k*7,z*.1],[3,h+k*7+8,0],[15,h+k*7-5,0]],1.5);popM();break;
 case 'warlock': path([[-20,h,z],[0,h+16+v*10,z],[20,h,z],[0,h-16-v*10,z],[-20,h,z]],2.7);L([0,h-9,z],[0,h+9,z],4,hot);for(const s of [-1,1])path([[s*20,h,z],[s*28,h+9,z-9],[s*24,h+25,z-14]],2);break;
 case 'skylancer': L([0,h-12,z-30],[0,h+15,z+26],2.5,hot);path([[-7,h+9,z+15],[0,h+15,z+28],[7,h+9,z+15]],2);for(const s of [-1,1])for(let k=0;k<4;k++)L([0,h,z-k*8],[s*(22-k*4),h+7,z-k*8-10],1.7);break;
 case 'bladedancer': for(const s of [-1,1]){pushM();mv(s*14,h,z);rotX(s*(.6+q*2));blade(0,0,0,30);popM();}for(let k=0;k<2;k++)arc(25+k*7,h,q*5+k*Math.PI,q*5+k*Math.PI+2.1,k?hot:col,a,2,12);break;
 case 'beastmaster': for(let k=-1;k<=1;k++)path([[k*9,h+19,z],[k*11,h,z+8],[k*8,h-11,z+3]],3,hot);if(def||slot===3)path([[-23,h+5,z],[-24,h+35,z],[-9,h+22,z],[9,h+22,z],[24,h+35,z],[23,h+5,z],[0,h-9,z+18],[-23,h+5,z]],2);break;
 default:popM();return false;
 }popM();}
return true;};})(window);
