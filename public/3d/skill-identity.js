/* Per-ability effects. Shared curve/surface primitives, explicit current skill compositions.
   Cosmetic only: no targeting, collision, damage, actor transforms or random gameplay state. */
(function(root){
'use strict';
root.BF_SKILL_IDENTITY=function(pr,c){
 const {line,glow,pushM,popM,mv,rotX,rotY,q,v,a,r,col,hot,event}=c,N=c.detail<40?20:48,TAU=Math.PI*2;
 const R=Math.min(125,Math.max(36,r)),fade=Math.max(0,a),white='#fff4dc';
 const L=(p,t,w=1.8,color=col,alpha=fade)=>line(p,t,w,color,alpha);
 const G=(p,size=7,color=col,alpha=fade)=>glow(p,size,color,alpha);
 const S=(kind,scale,color=col,alpha=fade*.35,style=2)=>{const max=Math.max(...scale),shape=kind==='sphere'&&max<3?'stud':kind;const mesh=root.BF_SKILL_SURFACES?.get(shape,(kind==='sphere'&&max<16)||(kind==='barrel'&&scale[0]<3&&scale[2]<3)?24:N);if(mesh)c.surface?.(mesh,scale,color,alpha,style);};
 const path=(pts,w=1.8,color=col,alpha=fade)=>{if(c.trail&&pts.length>=8)c.trail(pts,pts.map(()=>w),color,alpha);else for(let i=1;i<pts.length;i++)L(pts[i-1],pts[i],w,color,alpha);};
 const curve=(fn,w=2,color=col,alpha=fade,steps=N)=>{const points=[],widths=[];for(let i=0;i<=steps;i++){const t=i/steps;points.push(fn(t));widths.push(w*(.25+.75*Math.sin(Math.PI*t)));}if(c.trail)c.trail(points,widths,color,alpha);else for(let i=1;i<points.length;i++)L(points[i-1],points[i],widths[i],color,alpha);};
 const at=(x,y,z,fn)=>{pushM();mv(x,y,z);fn();popM();};
 const circle=(rr,y=2,color=col,w=1.7,start=0,end=TAU)=>curve(t=>[Math.sin(start+t*(end-start))*rr,y,Math.cos(start+t*(end-start))*rr],w,color,fade,N);
 const upright=(rr,y=35,z=0,color=col,start=0,end=TAU)=>curve(t=>[Math.sin(start+t*(end-start))*rr,y+Math.cos(start+t*(end-start))*rr,z],2,color);
 const spiral=(rr,y,turns=2,inward=false,color=col)=>curve(t=>{const rad=rr*(inward?1-t:t),an=t*TAU*turns+q*2;return [Math.sin(an)*rad,y+Math.sin(t*Math.PI)*8,Math.cos(an)*rad];},2.4,color,fade,N*2);
 const sparks=(n=10,reach=35,y=20,color=col,rise=18)=>{for(let i=0;i<n;i++){const an=i*2.39996,t=(q+i/n)%1,rr=reach*Math.sqrt(t);G([Math.sin(an)*rr,y+t*rise,Math.cos(an)*rr],2.2+2*(1-t),color,fade*(1-t));}};
 const orb=(x,y,z,rr,color=col)=>at(x,y,z,()=>{S('sphere',[rr*.79,rr*.79,rr*.93],color,fade*.55,2);G([0,0,0],rr*1.8,color,.30*fade);G([0,0,0],rr*.48,hot,.75*fade);for(let k=0;k<(N<40?2:3);k++){pushM();rotX(k*Math.PI/3);rotY(k*1.2+q*2);circle(rr*(.80+k*.1),0,color,1.1);popM();}for(let k=0;k<4;k++){const an=k*2.399+q*2;G([Math.sin(an)*rr*.9,Math.cos(an)*rr*.7,-rr*.3],rr*.12,hot,fade*.6);}});
 const sweep=(rr,y,start,end,color=col,thick=8)=>{at(0,y,0,()=>{pushM();rotY((start+end)/2);S('crescent',[rr,2,rr],color,fade*.30,2);popM();});for(let k=0;k<3;k++)curve(t=>{const an=start+(end-start)*t;return [Math.sin(an)*(rr-k*3),y+Math.sin(t*Math.PI)*3,Math.cos(an)*(rr-k*3)];},thick*(1-k*.25),k===2?hot:color,fade*(1-k*.23));for(let j=0;j<4;j++){const t=(j+.5)/4,an=start+(end-start)*t;G([Math.sin(an)*(rr-3),y+3,Math.cos(an)*(rr-3)],1.3+1.2*Math.sin(q*Math.PI+j),hot,fade*.7);}};
 const shield=(x,y,z,size=1,color=col)=>at(x,y,z,()=>{
 const holy=pr.cls==='paladin',wild=pr.cls==='beastmaster',mirror=pr.cls==='bladedancer',time=pr.cls==='chronomancer',blood=pr.cls==='berserker',magic=time||mirror;
 const kind=holy||mirror?'kite':wild?'leaf':'heater',mesh=root.BF_SKILL_SURFACES?.get(kind,N),w=18*size,h=21*size,plate=magic?color:holy?'#967337':blood?'#7b3b3a':wild?'#647249':'#647b8d';
 S(kind,[w,h,8*size],plate,fade*(magic?.42:.90),magic?2:1);
 if(mesh?.outline){const points=mesh.outline.map(p=>[p[0]*w,p[1]*h,p[2]*8*size+.4]);path([...points,points[0]],2.5*size,color);const inner=points.map(p=>[p[0]*.87,p[1]*.87,p[2]+1]);path([...inner,inner[0]],.8*size,hot,fade*.55);}
 else path([[-w*.8,h*.8,0],[w*.8,h*.8,0],[w*.7,-h*.3,0],[0,-h,0],[-w*.7,-h*.3,0],[-w*.8,h*.8,0]],2.3,color);
 at(0,2*size,3.5*size,()=>{S('sphere',[5*size,5*size,3*size],holy?'#e9c779':magic?hot:'#b4bec5',fade*.85,magic?2:1);});
 if(holy){for(let k=0;k<8;k++){const an=k*TAU/8;L([Math.sin(an)*7*size,2*size+Math.cos(an)*7*size,4],[Math.sin(an)*11*size,2*size+Math.cos(an)*11*size,3],1.4*size,'#ffe7a0');}path([[-9*size,-8*size,3],[0,-15*size,4],[9*size,-8*size,3]],1.5*size,hot);}
 else if(time){path([[-7,12,4],[7,12,4],[-7,-10,4],[7,-10,4],[-7,12,4]],1.4,'#e9d5a0');}
 else if(mirror){path([[0,15*size,4],[9*size,0,5],[0,-15*size,4],[-9*size,0,5],[0,15*size,4]],1.2,hot);}
 else if(wild){for(const sign of [-1,1])for(let j=0;j<2;j++)G([sign*(4+j*4)*size,(7+j*4)*size,4],2.1*size,hot,fade*.65);}
 else{for(let j=0;j<2;j++)path([[-9*size,(-6-j*5)*size,3],[0,(-12-j*5)*size,4],[9*size,(-6-j*5)*size,3]],1.5*size,blood?'#edab91':hot);}
 if(!magic)for(const [rx,ry]of [[-.68,.62],[.68,.62],[-.54,-.20],[.54,-.20]])at(rx*w,ry*h,1,()=>{S('sphere',[1.4*size,1.4*size,1.1*size],hot,fade*.9,1);});
 });
 const burst=(rr,y,color=col,count=12)=>{for(let k=0;k<count;k++){const an=k*TAU/count;curve(t=>{const rad=(12+t*rr)*v;return [Math.sin(an)*rad,y+Math.sin(t*Math.PI)*18*(1-q),Math.cos(an)*rad];},3,color,fade,N<40?10:16);}sparks(count,rr,y,color,24);};
 const shock=(rr,color=col)=>{const radius=12+rr*v;S('ring',[radius,1,radius],color,fade*.2,2);circle(radius,2,color,4);circle(8+rr*v*.82,4,hot,1);sparks(8,rr*v,2,color,6);};
 const bolt=(x,y,z,len=70,color=col)=>{curve(t=>[x+Math.sin(t*6-q*8)*5*(1-t),y+Math.cos(t*5-q*5)*4*(1-t),z+t*len],5,color);orb(x,y,z+len,7,color);};
 const beam=(len=120,color=col)=>{at(0,30,18,()=>{pushM();rotX(Math.PI/2);S('needle',[2,len*v+1,2],hot,fade*.6,2);popM();});for(let k=0;k<3;k++){const an=k*TAU/3;curve(t=>[Math.sin(t*TAU*2-q*9+an)*5,30+Math.cos(t*TAU*2-q*9+an)*5,18+t*len*v],3,color);}L([0,30,18],[0,30,18+len*v],5,hot);G([0,30,18],13,color);};
 const arrow=(x,y,z,length=45,color=col,fletched=true)=>{L([x,y,z-length*.5],[x,y,z+length*.5],1.7,hot);at(x,y,z+length*.25,()=>{pushM();rotX(Math.PI/2);S('needle',[4,Math.max(7,length*.25),1.5],hot,fade*.85,1);popM();});path([[x-5,y,z+length*.25],[x,y,z+length*.5],[x+5,y,z+length*.25]],1.3,color);if(fletched)for(const side of [-1,1]){path([[x,y,z-length*.25],[x+side*5,y,z-length*.5]],1.4,color);for(let j=0;j<3;j++)L([x+side*2,y,z-length*.3-j*2],[x+side*5,y,z-length*.4-j*2],.6,hot,fade*.65);}};
 const smoke=(count=9,color='#8d99a8',height=16)=>{for(let k=0;k<count;k++){const an=k*2.39996,t=(q+k*.071)%1,rr=(10+40*v)*Math.sqrt((k+.5)/count);G([Math.sin(an)*rr,height+t*25,Math.cos(an)*rr],12+12*t,color,fade*.35);curve(u=>[Math.sin(an+u)*rr,height+t*25+u*10,Math.cos(an+u)*rr],4,color,fade*.25,12);}};
 const lightning=(from,to,color=col,seed=0)=>{let p=from;for(let k=1;k<=12;k++){const t=k/12,n=from.map((x,j)=>x+(to[j]-x)*t+(k===12?0:Math.sin(k*13+j*7+seed+Math.floor(q*14))*6*Math.sin(t*Math.PI)));L(p,n,k%3?2.1:3,color);L(p,n,.65,hot,fade*.75);if(k%4===0){const fork=[n[0]+Math.sin(k)*13,n[1]+9,n[2]-8];L(n,fork,1,color,fade*.6);L(fork,[fork[0]+Math.sin(k+2)*6,fork[1]+6,fork[2]-3],.6,hot,fade*.45);G(n,3,color,fade*.6);}p=n;}G(to,4,hot,fade*.6);};
 const flame=(x,y,z,h=44,color='#ff7c32',lean=0)=>{at(x,y,z,()=>{for(const side of (N<40?[1]:[-1,1])){pushM();rotY(side*.65+q*.6);S('plume',[h*.24,h,h*.12],color,fade*.65,3);popM();}});for(let j=0;j<3;j++)curve(t=>[x+Math.sin(t*8-q*12+j)*7*t+lean*t,y+t*h,z+Math.cos(t*7-q*7+j)*4*t],(j?2:3.2)*(1-q*.3),j===2?'#ffe7a0':color,fade*.85,N<40?10:16);G([x,y+5,z],10,color,.4*fade);};
 const crosshair=()=>{upright(15,48,0,'#e5e68a',0,TAU);for(let k=0;k<4;k++){const an=k*Math.PI/2;L([Math.sin(an)*19,48+Math.cos(an)*19,0],[Math.sin(an)*26,48+Math.cos(an)*26,0],1.6,hot);const t=an+q*.9;G([Math.sin(t)*18,48+Math.cos(t)*18,0],2,'#eeefa3',fade*.65);}for(let k=0;k<8;k++){const an=k*TAU/8;L([Math.sin(an)*12,48+Math.cos(an)*12,0],[Math.sin(an)*14,48+Math.cos(an)*14,0],.65,'#fff2bb');}G([0,48,0],3,hot);};
 const skull=(y=45,color=col)=>{at(0,y+2,-2,()=>{S('sphere',[13,14,6],color,fade*.65,4);});curve(t=>{const an=t*TAU;return [Math.sin(an)*(Math.cos(an)<0?10:14),y+Math.cos(an)*16,0];},1.5,color);for(const side of [-1,1]){at(side*5,y+2,4,()=>{S('sphere',[4.2,4.5,1.1],'#252534',fade*.9,4);});G([side*5,y+2,5.5],2.3,hot);L([side*5,y-10,0],[side*5,y-17,0],1.7,color);}path([[-10,y-12,0],[0,y-16,1],[10,y-12,0]],2,color);for(let j=-2;j<=2;j++)L([j*3,y-10,1],[j*3,y-15+Math.abs(j),1],.9,hot);};
 const clock=(rr=29,y=35,angle=q*8,color=col)=>{at(0,y,-1.6,()=>{S('sphere',[rr*.94,rr*.94,1.6],color,fade*.16,2);});upright(rr,y,0,color);upright(rr*.88,y,0,hot,0,TAU);for(let k=0;k<12;k++){const an=k*TAU/12;L([Math.sin(an)*(rr-4),y+Math.cos(an)*(rr-4),0],[Math.sin(an)*rr,y+Math.cos(an)*rr,0],k%3?1:2,color);}L([0,y,1],[Math.sin(angle)*rr*.72,y+Math.cos(angle)*rr*.72,1],2.1,hot);L([0,y,1],[Math.sin(angle*.3+1)*rr*.48,y+Math.cos(angle*.3+1)*rr*.48,1],1.7,color);G([0,y,2],2.5,white);for(const sign of [-1,1])at(sign*rr*.5,y-rr*.5,0,()=>{curve(t=>{const an=t*TAU,rad=rr*.18*(1+.16*Math.cos(an*8));return [Math.sin(an)*rad,Math.cos(an)*rad,0];},.75,color,fade*.6,24);});};
 const bone=(x,y,z,h=34)=>{at(x,y,z,()=>{S('bone',[9,h,8],'#cbd5b5',fade*.8,4);});L([x,y,z],[x,y+h,z],1.3,hot);for(const side of [-1,1]){G([x+side*3,y,z],2,col);G([x+side*3,y+h,z],2,col);}};
 const feathers=(count=7,y=25,z=15,color=col)=>{for(let j=0;j<count;j++){const side=j%2?1:-1,x=side*(12+j*6),height=34-j*2;at(x*.45,y+height*.08,z-5,()=>{pushM();rotY(side*.4);rotX(-.35);S('feather',[5,height*.82,3],color,fade*.42,2);popM();});curve(t=>[x*t,y+t*height,z-t*22],2,color);for(let k=1;k<5;k++){const t=k/5;L([x*t,y+t*height,z-t*22],[x*t+side*5,y+t*height+2,z-t*22-5],.75,hot,fade*.6);}}};
 const footprints=(color=col,count=5)=>{for(let k=0;k<count;k++)at((k%2?1:-1)*9,1,-k*16*v,()=>{curve(t=>[Math.sin(t*TAU)*4,0,Math.cos(t*TAU)*7],2,color,fade*(1-k/count),16);});};
 const slashX=(z=45,color=col)=>{for(const s of [-1,1])curve(t=>[s*(-30+60*t),65-55*t,z+Math.sin(t*Math.PI)*9],7,color);G([0,38,z+5],9,hot);};
 const cage=(radius=31,color=col)=>{at(0,31,0,()=>{S('sphere',[radius,31,radius],color,fade*.13,2);});for(let k=0;k<4;k++){const an=k*TAU/4;curve(t=>[Math.sin(an)*radius*Math.sin(t*Math.PI),4+62*t,Math.cos(an)*radius*Math.sin(t*Math.PI)],2,color);}circle(radius*.6,8,color);};
 const claws=(y=35,z=36,color=col)=>{for(let k=-1;k<=1;k++)curve(t=>[k*10+Math.sin(t*Math.PI)*10,y+25-48*t,z+15*Math.sin(t*Math.PI)],4,color);};
 const shuriken=(x,y,z,rr=17,color=col)=>at(x,y,z,()=>{pushM();rotX(Math.PI/2);rotY(q*16);S('star',[rr,2,rr],'#bdc7d5',fade*.8,1);for(let k=0;k<4;k++){pushM();rotY(k*Math.PI/2);path([[0,0,rr*.12],[-rr*.18,0,rr*.32],[0,0,rr],[rr*.23,0,rr*.30],[0,0,rr*.12]],rr<16?1.2:2,color);popM();}circle(rr*.13,0,hot,.8);popM();});
 // Every case below is authored for one current skill; class names do not select a generic motif.
 switch(pr.id){
 // Warrior: steel follows the equipped swing; defense, charge and shockwave have different spaces.
 case 'w_cleave':sweep(53,26,-1.2+q,1.3+q,col,6);sparks(6,45,24,hot,4);break;
 case 'w_bash':shield(-8,21,25+24*v,.85);for(let j=0;j<4;j++)L([(j-1.5)*10,20,0],[(j-1.5)*10,20,35*v],2);G([0,30,45],12,hot);break;
 case 'w_charge':for(const s of [-1,1])curve(t=>[s*(18+6*t),15+8*Math.sin(t*Math.PI),-80*t*v],5);footprints(hot,4);break;
 case 'w_whirl':for(let j=0;j<3;j++)sweep(45+j*9,17+j*10,q*8+j*2,q*8+j*2+2.8,col,5-j);break;
 case 'w_guard':shield(-10,21,24,1.05,'#b3d8ef');circle(27,2,'#779bb4',3);for(const s of [-1,1])L([s*18,3,0],[s*18,10,0],3,hot);break;
 case 'w_stomp':shock(R,'#e9b96f');for(let j=0;j<7;j++){const an=j*TAU/7;path([[Math.sin(an)*18,1,Math.cos(an)*18],[Math.sin(an+.07)*R*.6,1,Math.cos(an+.07)*R*.6],[Math.sin(an-.05)*R,1,Math.cos(an-.05)*R]],2,'#b98b55');}sparks(12,R,2,'#e1bd8b',20);break;
 case 'w_berserk':for(let k=0;k<3;k++){pushM();rotX(Math.PI/2);upright(24+k*18*v,38,0,'#edbb67',-.9,.9);popM();}sparks(10,28,35,'#ffb45f',30);break;
 case 'w_execute':curve(t=>[0,85-77*t,16+Math.sin(t*Math.PI)*43],11,hot);at(0,2,40,()=>{burst(42,2,'#e3b45e',8);});break;
 // Ranger: arrows, shadow travel, physical spikes, smoke, aim and volatile marks.
 case 'r_volley':for(let j=-2;j<=2;j++){pushM();rotY(j*.25);const fly=Math.max(0,Math.min(1,(q-.12-Math.abs(j)*.035)*1.8));arrow(0,29+Math.abs(j)*2,18+100*fly,39,'#b5df96');curve(t=>[0,29+Math.abs(j)*2+Math.sin(t*Math.PI)*2,18+100*fly-27*t],1.6,'#92be80',fade*.65,16);popM();}break;
 case 'r_pierce':const shot=Math.max(0,Math.min(1,(q-.26)/.65));arrow(0,30,20+140*shot,69,'#e3f7b0');for(const side of [-1,1])curve(t=>[side*(2+10*Math.sin(t*Math.PI)),30,18+140*shot-48*t],2,'#c8e2aa',fade*.7,24);at(0,30,18+140*shot,()=>{pushM();rotX(Math.PI/2);circle(7+shot*9,0,'#f0f7cb',1,0,TAU);popM();});break;
 case 'r_tumble':footprints('#c0c8a2',3);curve(t=>[0,8+17*Math.sin(t*Math.PI),-52*t],2,'#a5ba8e',fade*.55,24);at(0,0,0,()=>{pushM();rotY(Math.PI*.12);arrow(0,32,20+65*Math.max(0,q-.27),30,'#dde9bd');popM();});break;
 case 'r_shadow':for(const side of [-1,1])curve(t=>[side*(8+9*Math.sin(t*Math.PI)),10+12*Math.sin(t*Math.PI),-70+125*t],3,'#9c86b8',fade*.7,24);curve(t=>[-25+50*t,48-26*t,35+Math.sin(t*Math.PI)*8],6,'#d8c3f2',fade,24);for(let j=0;j<4;j++)G([(j%2?1:-1)*10,12+j*6,-50+j*22],3,'#baa2d0',fade*.4);break;
 case 'r_spike':at(0,2,0,()=>{S('barrel',[24,3,24],'#665f47',fade*.80,1);});circle(25,4,'#c9ba82',2);for(let k=0;k<8;k++){const an=k*TAU/8,x=Math.sin(an)*20,z=Math.cos(an)*20;at(x,5,z,()=>{S('needle',[3,12+7*v,3],'#cad3b2',fade*.88,1);});}path([[-16,6,0],[16,6,0]],2,'#e0d6a7');G([0,7,0],4,'#bad18a',fade*.45);break;
 case 'r_smoke':at(0,5,10,()=>{S('barrel',[5,8,5],'#7f7657',fade*.85,1);circle(5,5,'#c9c29b',1.4);});for(let k=0;k<(N<40?5:8);k++){const an=k*2.39996,rr=10+36*v;G([Math.sin(an)*rr,7+(k%3)*5,10+Math.cos(an)*rr],15,'#8bb2a1',fade*.30);curve(t=>[Math.sin(an+t)*rr,6+t*7,10+Math.cos(an+t)*rr],4,'#a2c6ae',fade*.32,12);}break;
 case 'r_mark':const focus=1-q*.34;for(const side of [-1,1]){path([[side*22*focus,61,0],[side*15*focus,61,0],[side*15*focus,35,0],[side*22*focus,35,0]],2,'#dbeaa2');L([side*6,48,0],[side*11,48,0],1.4,hot);}path([[-5,76,0],[0,69,0],[5,76,0]],2,'#f4d88c');G([0,48,0],3,'#fff1b0',fade*.75);break;
 case 'r_deathmark':skull(49,'#e8ab6d');for(let j=0;j<3;j++){const x=(j-1)*28;at(x,25,0,()=>{path([[-5,0,0],[0,8,0],[5,0,0],[0,-6,0],[-5,0,0]],1.7,'#eeac6e');curve(t=>[0,8+12*t,Math.sin(t*5+q*9)*3],1.2,'#ffd7a0',fade*.8,12);G([0,20,0],3.5,'#ffd491',fade*.8);});}break;
 // Mage: bolt = compact moving orb; beam = narrow continuous lance. No shared crystal cage.
 case 'm_bolt':bolt(0,30,20,48*v,'#ac9bff');for(let k=0;k<5;k++)G([Math.sin(k*2+q*8)*8,30+Math.cos(k*2)*5,20+48*v-k*9],4-k*.4,'#bba9ff',fade*.65);break;
 case 'm_beam':beam(140,'#a4ceff');at(0,30,17,()=>{pushM();rotX(Math.PI/2);circle(13,0,'#d8e5ff',2);popM();});break;
 case 'm_blink':for(let k=0;k<2;k++)at((k?1:-1)*12,0,-k*32,()=>{upright(12+v*9,32,0,'#b4baff',-.5,Math.PI*1.5);});sparks(12,23,7,'#ddcfff',57);break;
 case 'm_nova':shock(R,'#98e9ff');for(let k=0;k<9;k++){pushM();rotY(k*TAU/9);at(0,5,R*v*.8,()=>{for(let b=0;b<3;b++){const an=b*Math.PI/3;L([Math.sin(an)*-9,0,Math.cos(an)*-9],[Math.sin(an)*9,0,Math.cos(an)*9],1.3,'#c7f5ff');}});popM();}break;
 case 'm_gravity':at(0,15,0,()=>{S('sphere',[14,8,14],'#241733',fade*.8,2);});G([0,15,0],21,'#442568',fade*.6);for(let k=0;k<3;k++){pushM();rotY(k*TAU/3);spiral(R*(1-q*.6),4+k*5,1.2,true,'#a78bdc');popM();}circle(15,15,'#d2b6ff',3);break;
 case 'm_barrier':cage(29,'#bfa2ff');for(let k=0;k<4;k++){pushM();rotY(k*Math.PI/2);path([[-5,24,28],[-5,34,28],[4,34,28],[0,29,28],[5,23,28]],2,'#e6dbff');popM();}break;
 case 'm_tempest':for(let j=0;j<3;j++){pushM();rotY(j*TAU/3+q*2);const color=['#ff925a','#82dcff','#d09bff'][j];curve(t=>[Math.sin(t*4+q*3)*29,8+65*t,Math.cos(t*4+q*3)*29],3,color);orb(0,25+j*15,32,6,color);popM();}break;
 case 'm_overload':for(let k=0;k<3;k++){const color=['#ffac60','#a6eaff','#d2a5ff'][k];pushM();rotY(k*TAU/3);sweep(R*(.6+k*.16)*v,9+k*12,0,4.4,color,5);popM();}G([0,25,0],27,white,fade*.5);burst(R,15,'#d8b3ff',N<40?5:9);break;
 // Pyromancer: coherent flame tongues, pressure blast, ember shell and solar eruption.
 case 'py_bolt':orb(0,29,25+55*v,9,'#ff9b36');flame(0,29,18+42*v,25,'#ff7229',-8);break;
 case 'py_fan':for(let j=-1;j<=1;j++){pushM();rotY(j*.4);flame(0,24,25+50*v,26,'#ff8b35',j*10);curve(t=>[Math.sin(t*7-q*8)*4,24+7*t,17+50*v*t],6,'#f36e28');popM();}break;
 case 'py_blast':for(let k=0;k<8;k++){pushM();rotY(k*TAU/8);curve(t=>[0,4+35*Math.sin(t*Math.PI),10+R*v*t],7,'#ff9a42');popM();}smoke(6,'#a47a68',3);break;
 case 'py_ward':for(let k=0;k<6;k++){const an=k*TAU/6+q;flame(Math.sin(an)*27,5,Math.cos(an)*27,37,'#ffb85a');}circle(29,4,'#ffd585',3);break;
 case 'py_lance':beam(145,'#ff8d32');for(let k=0;k<4;k++)flame((k%2?1:-1)*5,26,30+k*24*v,13,'#ffcc64',8);break;
 case 'py_nova':for(let k=0;k<(N<40?6:9);k++){const an=k*TAU/(N<40?6:9);flame(Math.sin(an)*R*v,2,Math.cos(an)*R*v,24,'#ff8d35');}circle(R*v,2,'#ffbc67',5);break;
 case 'py_inferno':for(let k=0;k<(N<40?4:9);k++){const an=k*TAU/(N<40?4:9)+q*.5;flame(Math.sin(an)*R*.65,2,Math.cos(an)*R*.65,38+(k%3)*13);}spiral(R,2,1.4,false,'#db6828');sparks(16,R,15,'#ffc267',65);break;
 case 'py_sun':orb(0,60-40*v,0,22,'#ffd26a');burst(R,12,'#ff9c3d',N<40?8:16);for(let k=0;k<(N<40?3:6);k++){pushM();rotY(k*TAU/(N<40?3:6));curve(t=>[0,25+70*t,4+Math.sin(t*Math.PI)*15],4,'#ffe3a0');popM();}break;
 // Reaper: scythe crescents, shadow wisps, chains and draining souls.
 case 'x_reap':sweep(50,27,-1.1+q,1.6+q,'#b293ec',7);curve(t=>[Math.sin(t*3)*20,18+t*16,20*(1-t)],2,'#d9c8ff');break;
 case 'x_cleave':at(0,26,24+100*v,()=>{pushM();rotY(Math.PI/2);sweep(32,0,-1.5,1.5,'#d3b5f4',7);popM();});for(const side of [-1,1])curve(t=>[side*6,26,20+100*v-48*t],2,'#967bbf',fade*.6,24);break;
 case 'x_step':footprints('#a88cce',4);smoke(6,'#8a79a9',9);break;
 case 'x_wraith':for(const sign of [-1,1])at(sign*15,0,-5,()=>{pushM();rotY(sign*.9);S('plume',[12,59,6],'#9081b3',fade*.20,2);popM();});for(const s of [-1,1])curve(t=>[s*(15+Math.sin(t*5+q*4)*7),7+65*t,-12*t],6,'#ad99d8',fade*.45);G([0,30,0],28,'#8c78b4',fade*.2);break;
 case 'x_pull':for(let k=0;k<5;k++){pushM();rotY(k*TAU/5);curve(t=>[Math.sin(t*4)*10,8+8*Math.sin(t*Math.PI),R*(1-t)],4,'#b59be1');popM();}G([0,12,0],13,'#e5d3ff');break;
 case 'x_bind':for(let k=0;k<(N<40?4:8);k++){const an=k*1.2+q;at(Math.sin(an)*13,8+k*6,Math.cos(an)*11,()=>{pushM();rotX(Math.PI/2);rotY(k%2*Math.PI/2);S('ring',[4,1.6,6],'#b5a6c8',fade*.65,1);popM();});}for(const s of [-1,1])curve(t=>[s*16*Math.cos(t*TAU*2+q),8+52*t,Math.sin(t*TAU*2+q)*11],3,'#c8b4e3');circle(24,2,'#b6a0cf');break;
 case 'x_siphon':sweep(62,25,-1.5,1.8,'#c8a4f1',8);for(let j=0;j<7;j++){const an=j*TAU/7;curve(t=>[Math.sin(an+t)*R*(1-t),12+22*t,Math.cos(an+t)*R*(1-t)],3,'#9de5ba');}break;
 case 'x_vortex':for(let j=0;j<3;j++){pushM();rotY(j*TAU/3);curve(t=>[Math.sin(t*TAU+q*4)*(R*(1-t*.7)),4+70*t,Math.cos(t*TAU+q*4)*(R*(1-t*.7))],5,'#b295df');popM();}skull(72,'#cbb5ef');break;
 // Paladin: heraldry, holy light, ground consecration, recovery and a falling hammer.
 case 'pal_bash':shield(-8,21,24+24*v,1,'#ffd977');burst(30,25,'#fff0bd',6);break;
 case 'pal_smite':L([0,150*(1-q),0],[0,5,0],7,'#ffedb3');shock(48,'#ffe38a');sparks(12,23,3,'#ffe5a6',60);break;
 case 'pal_taunt':for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2);path([[-10,23,R*(1-v)],[0,23,R*(1-v)-16],[10,23,R*(1-v)]],3,'#ffd777');popM();}shield(0,28,20,.65);break;
 case 'pal_ground':circle(R*v,2,'#ffdb78',3);for(let j=0;j<8;j++){const an=j*TAU/8;G([Math.sin(an)*R*.7,3+35*v,Math.cos(an)*R*.7],8,'#ffe9a4',fade*.6);}path([[-22,2,0],[22,2,0],[0,2,0],[0,2,-30],[0,2,30]],3,'#fff0be');break;
 case 'pal_guard':shield(-9,22,23,1.15,'#ffe299');upright(35,34,0,'#edce88',0,Math.PI);break;
 case 'pal_burst':burst(R,27,'#ffe399',14);G([0,28,0],30,'#fff7da',fade*.6);break;
 case 'pal_laststand':for(const s of [-1,1])shield(s*25,27,0,.7,'#f4d387');circle(33,2,'#ffe5ac',4);for(let k=0;k<3;k++)G([0,20+k*13,0],6,'#fff3bc');break;
 case 'pal_sky':at(0,24+(1-v)*100,0,()=>{at(0,31,0,()=>{S('hammer',[23,24,13],'#cfa84f',fade*.8,1);});at(0,-12,0,()=>{S('barrel',[2.5,34,2.5],'#9d7948',fade*.85,1);});path([[-18,20,7],[18,20,7],[23,25,7],[23,37,7],[18,43,7],[-18,43,7],[-23,37,7],[-23,25,7],[-18,20,7]],2.3,'#ffe59c');upright(6,31,7,'#fff1ba');L([0,20,0],[0,-12,0],5,hot);G([0,25,0],27,'#ffdf88',fade*.4);});burst(R,2,'#ffd576',10);break;
 // Necromancer: anatomical bones and earth-to-soul rise, not the same ribcage every cast.
 case 'necro_summon':for(const s of [-1,1])at(s*32,0,15,()=>{bone(0,0,0,35*v);skull(38*v,'#bfe5b2');});circle(46,1,'#91bb8e');break;
 case 'necro_bolt':orb(0,28,24+50*v,8,'#86cc83');for(let k=0;k<6;k++)G([Math.sin(k*3)*9,27+Math.cos(k*2)*7,20+50*v-k*7],3,'#bcdd9b',fade*.65);break;
 case 'necro_raise':at(0,0,25,()=>{bone(0,2,0,42*v);for(const s of [-1,1])L([0,30*v,0],[s*15,44*v,0],3,'#c5d9aa');skull(55*v,'#bad8a4');});spiral(30,2,1,true,'#92bd83');break;
 case 'necro_nova':for(let k=0;k<10;k++){const an=k*TAU/10;at(Math.sin(an)*R*v,10,Math.cos(an)*R*v,()=>{pushM();rotX(an);bone(0,0,0,15);popM();});}shock(R,'#c9d7a9');break;
 case 'necro_wall':for(let k=-3;k<=3;k++)bone(k*9,0,25,45*v-(Math.abs(k)*5));curve(t=>[-28+56*t,39*v+10*Math.sin(t*Math.PI),25],4,'#d3dfb9');break;
 case 'necro_grip':for(let k=0;k<5;k++){const an=(k-2)*.5;curve(t=>[Math.sin(an)*(R*(1-t)),6+40*Math.sin(t*Math.PI),Math.cos(an)*(R*(1-t))],4,'#bed29d');}G([0,12,0],14,'#9fcc94');break;
 case 'necro_army':for(let k=0;k<(N<40?2:5);k++){const an=k*TAU/(N<40?2:5);at(Math.sin(an)*48,0,Math.cos(an)*48,()=>{skull(25+25*v);bone(0,0,0,20+20*v);});}circle(62,1,'#92ba84',3);break;
 case 'necro_storm':for(let k=0;k<(N<40?7:12);k++){const an=k*2.399+q*4;at(Math.sin(an)*R*.7,12+(k%4)*12,Math.cos(an)*R*.7,()=>{pushM();rotX(k);bone(0,0,0,13);popM();});}smoke(8,'#77916c',3);break;
 // Ninja: slicing, thrown stars, smoke, curse and self-empowerment are separate motions.
 case 'nin_strike':curve(t=>{const u=t*Math.min(1,q/.48);return [-32+64*u,21+42*u,28+9*Math.sin(u*Math.PI)]},7,'#ffd2d1',fade,32);curve(t=>[-25+50*t,17+40*t,25],2.5,'#cb596f',fade*.8,24);for(let k=0;k<5;k++)G([-22+k*11,27+k*7,29],2,'#ffb8b7',fade*.65);break;
 case 'nin_barrage':for(let wave=0;wave<3;wave++){const age=q-wave*.22;if(age<0||(wave<2&&age>=.22))continue;const fly=Math.min(1,age/.25);for(let k=-1;k<=1;k++){pushM();rotY(k*.29);shuriken(0,27+wave*3,20+100*fly,10,'#e6b4b7');L([0,27+wave*3,8+100*fly],[0,27+wave*3,20+100*fly],1.2,'#b8798b',fade*(1-fly*.5));popM();}}break;
 case 'nin_step':for(const side of [-1,1])curve(t=>[side*12,10+3*Math.sin(t*Math.PI),-80*t],3,'#c28b9c',fade*.65,24);for(let j=0;j<3;j++)at(0,0,-j*25,()=>{path([[-10,12,0],[-13,29,0],[-6,40,0],[7,38,0],[12,18,0]],1.2,'#977e9e',fade*(.5-j*.12));});break;
 case 'nin_smoke':at(0,4,8,()=>{S('sphere',[6,6,6],'#514754',fade*.9,1);curve(t=>[0,4+9*t,Math.sin(t*5)*3],1.2,'#c3b7ad',fade,12);});for(let k=0;k<(N<40?6:9);k++){const an=k*2.4,rr=12+35*v;G([Math.sin(an)*rr,5+(k%3)*8,Math.cos(an)*rr],17,'#898096',fade*.30);curve(t=>[Math.sin(an+t*.8)*rr,4+16*Math.sin(t*Math.PI),Math.cos(an+t*.8)*rr],4,'#b395a4',fade*.28,12);}break;
 case 'nin_mark':// A fixed brush seal, never a rotating projectile.
 at(0,48,0,()=>{path([[-12,17,0],[12,17,0],[12,-16,0],[-12,-16,0],[-12,17,0]],2,'#c56676');path([[-7,9,1],[5,9,1],[1,2,1],[-6,-2,1],[7,-2,1],[1,-11,1]],3.1,'#f1a4a6');path([[-5,14,1],[0,19,1],[6,13,1]],1.2,'#ffe2c5');G([0,1,-1],15,'#a83b58',fade*.25);});break;
 case 'nin_pierce':at(0,31,22+120*v,()=>{pushM();rotY(.16);shuriken(0,0,0,30,'#f2d2cb');popM();});for(const side of [-1,1])curve(t=>[side*6*Math.sin(t*Math.PI),31+side*9,18+120*v-70*t],3,'#d797a0',fade*.75,24);G([0,31,22+120*v],5,'#fff2e0',fade*.75);break;
 case 'nin_fury':for(const side of [-1,1]){curve(t=>[side*(10+15*t),22+30*t,18-9*t],4,'#eb8f9b',fade,24);path([[side*22,23,14],[side*25,16,12],[side*18,18,14]],1.3,'#ffd4c4');for(let k=0;k<3;k++)G([side*24,13+k*12,12],2.5,'#f6b1ae',fade*.6);}break;
 case 'nin_storm':// Tall folding shadow curtains contrast with the low smoke bomb.
 for(const side of [-1,1])for(let j=0;j<3;j++){const x=side*(10+j*5)*(1-q*.5),z=-8+j*8;curve(t=>[x+side*5*Math.sin(t*Math.PI+q*4),3+68*t,z+4*Math.sin(t*7-q*5)],4-j*.6,j===1?'#c19cb8':'#72627f',fade*.55,24);}for(let j=0;j<4;j++)path([[(j%2?1:-1)*16,12+j*13,0],[(j%2?1:-1)*11,18+j*13,0]],2,'#e4b6bf',fade*.65);break;
 // Berserker: blood expenditure, physical horn impact, rage and heavy finishing impacts.
 case 'bsk_cleave':sweep(65,22,-1.5+q*.8,1.6+q*.8,'#ec7059',9);sparks(12,48,15,'#cf5747',-18);break;
 case 'bsk_bash':at(0,42,31+v*12,()=>{for(const s of [-1,1])curve(t=>[s*(4+12*t),5+8*Math.sin(t*Math.PI),10*t],3,'#e3b783');});burst(26,40,'#ffad79',7);break;
 case 'bsk_charge':for(const s of [-1,1])curve(t=>[s*(20+10*t),8+17*Math.sin(t*Math.PI),-85*t*v],7,'#d87955');sparks(9,20,4,'#daa779',12);break;
 case 'bsk_stomp':shock(R,'#f0a264');burst(R*.8,1,'#cc7050',9);G([0,3,0],23,'#ffc190',fade*.6);break;
 case 'bsk_whirl':for(let k=0;k<(N<40?3:4);k++)sweep(42+k*6,16+k*6,q*8+k*1.6,q*8+k*1.6+2.2,'#dc7757',6);break;
 case 'bsk_execute':curve(t=>[-12+20*t,90-84*t,10+40*Math.sin(t*Math.PI)],13,'#eb9977');slashX(30,'#bd4d43');break;
 case 'bsk_berserk':for(const s of [-1,1])flame(s*23,8,0,45,'#d75847',-s*8);sparks(14,25,10,'#f5b27a',60);break;
 case 'bsk_guard':shield(-9,21,22,1.05,'#bd6a60');for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2);curve(t=>[0,4+5*Math.sin(t*Math.PI),R*(1-t)],3,'#d7846c');popM();}break;
 // Pirate: muzzle pressure, multiple guns, saber slash, smoke, coins and a real keg silhouette.
 case 'pir_pierce':at(0,29,30,()=>{burst(16,0,'#ffd190',5);});for(let j=0;j<3;j++)G([0,29,37+j*18*v],4-j,'#ffe4aa');break;
 case 'pir_volley':for(let k=-2;k<=2;k++){pushM();rotY(k*.25);L([0,28,20],[0,28,36+60*v],3,'#f3c17a');G([0,28,22],9,'#ffd89f',fade*.5);popM();}break;
 case 'pir_shadow':sweep(50,30,-1.4+q*2,1.1+q*2,'#f0c092',7);curve(t=>[-17,14,-60*t*v],4,'#acb9b7');break;
 case 'pir_tumble':footprints('#d3c2a5',3);G([0,30,27],12,'#ffd58a');L([0,30,24],[0,30,45+30*v],2,'#ffe7c1');break;
 case 'pir_smoke':smoke(12,'#b2a79a',3);sparks(9,35,10,'#e5b475',26);break;
 case 'pir_goldrush':for(let k=0;k<(N<40?5:7);k++)at(Math.sin(k*2.4)*25,10+((q+k/7)%1)*45,Math.cos(k*2.4)*25,()=>{S('sphere',[5,5,.85],'#d7a84e',fade*.85,1);upright(5,0,0,'#ffd882');L([0,-3,0],[0,3,0],1.5,white);});break;
 case 'pir_deathmark':upright(20,45,0,'#e8aa73');path([[-12,32,0],[12,57,0],[0,45,0],[-12,57,0],[12,32,0]],3,'#f1ce9e');flame(0,68,0,13,'#ffc46c');break;
 case 'pir_spike':S('barrel',[16,24,16],'#806044',fade*.78,4);for(const y of [3,24])circle(16,y,'#dba46b',3);for(let k=0;k<8;k++){const an=k*TAU/8;L([Math.sin(an)*16,3,Math.cos(an)*16],[Math.sin(an)*16,24,Math.cos(an)*16],2,'#ad8159');}curve(t=>[0,25+18*t,8*Math.sin(t*Math.PI)],2,'#d6c6a4');G([0,43,0],5,'#ffbf66');break;
 // Chronomancer: clock faces are reserved for actual time manipulation, not every shot.
 case 'chr_bolt':orb(0,29,24+48*v,6,'#e9c274');for(let j=0;j<3;j++)upright(5+j*2,29,20+45*v-j*13,'#b6e8df',0,Math.PI*1.5);break;
 case 'chr_beam':beam(125,'#e3d495');for(let j=0;j<4;j++){pushM();mv(0,30,30+j*24);rotX(Math.PI/2);circle(7,0,'#89d2c7');popM();}break;
 case 'chr_nova':clock(R*.6,12,q*.6,'#b4dccb');circle(R*v,1,'#dfc183',3);break;
 case 'chr_blink':for(let j=0;j<(N<40?2:3);j++)at(0,0,-j*22,()=>{clock(13,30,-q*6+j,'#d6c394');});break;
 case 'chr_gravity':for(let k=0;k<3;k++){pushM();rotY(k*TAU/3);spiral(R,3,1.4,true,'#92d9cf');popM();}clock(16,30,-q*10,'#ead59c');break;
 case 'chr_barrier':shield(-8,22,24,1.05,'#9bd7cc');clock(17,32,q*2,'#e6d194');break;
 case 'chr_tempest':clock(38,47,Math.PI*.3,'#efdaa0');for(let k=0;k<10;k++){const an=k*TAU/10;L([Math.sin(an)*R,1,Math.cos(an)*R],[Math.sin(an)*(R-7),1,Math.cos(an)*(R-7)],2,'#90d2c9');}G([0,47,0],10,'#fff0c6',fade*.4);break;
 case 'chr_overload':orb(0,28,0,17,'#78cfc8');for(let j=0;j<3;j++){pushM();rotX(j*Math.PI/3);circle(R*v,20,'#e6cc8e',3);popM();}sparks(16,R,8,'#f3dfaa',55);break;
 // Monk: contact waves, parry, footprints, chi rings and a dragon-shaped kick wake.
 case 'mon_flurry':for(let k=0;k<4;k++){const z=25+10*k;G([k%2?9:-9,28+Math.sin(k*3)*7,z],7,'#f6ddad');curve(t=>[(k%2?1:-1)*9,30,z-17*t],3,'#d9bb89');}break;
 case 'mon_palm':at(0,29,25+25*v,()=>{S('sphere',[14,14,1.2],'#ecd8ab',fade*.12,2);upright(16,0,0,'#ecd8ab',-.8,2.5);G([0,0,0],13,'#fff0c3',fade*.5);});for(let k=0;k<3;k++)L([(k-1)*7,29,15],[(k-1)*7,29,35+30*v],2,'#d9c49f');break;
 case 'mon_deflect':for(const s of [-1,1])curve(t=>[s*(20-12*t),22+32*t,24+8*Math.sin(t*Math.PI)],4,'#e4d5ac');upright(27,31,26,'#fff0d0',-.9,.9);break;
 case 'mon_roll':footprints('#e7cfa2',4);curve(t=>[18*Math.sin(t*Math.PI),6+20*Math.sin(t*Math.PI),-38*t],3,'#d6c4a0');break;
 case 'mon_whirl':sweep(52,14,q*7,q*7+4.8,'#e3c68c',7);sweep(46,24,q*7+1,q*7+3.5,'#fff1c8',2);break;
 case 'mon_stun':at(0,28,25,()=>{S('sphere',[18,18,1.5],'#edcd92',fade*.12,2);});shock(R*.7,'#e6c992');for(let j=0;j<3;j++){const an=j*TAU/3+q;at(Math.sin(an)*13,62,25+Math.cos(an)*7,()=>{path([[0,4,0],[2,0,0],[6,0,0],[3,-2,0],[4,-6,0],[0,-3,0],[-4,-5,0],[-3,0,0],[-6,1,0],[0,1,0],[0,4,0]],1.1,'#fff0c1');});}break;
 case 'mon_thousand':circle(28,1,'#dbbd87',3);for(let j=0;j<6;j++){const an=j*TAU/6;G([Math.sin(an)*26,6+v*8,Math.cos(an)*26],5,'#f5e1b4',fade*.5);}upright(24,52,-9,'#f2d99d',-.9,.9);break;
 case 'mon_dragon':at(0,64,70,()=>{S('sphere',[10,8,7],'#dcba75',fade*.35,2);at(0,-4,8,()=>{S('sphere',[6,4,8],'#e8cf90',fade*.45,2);});for(const side of [-1,1]){G([side*4,2,7],2,'#fff4bc',fade*.8);at(side*7,7,0,()=>{S('needle',[2,11,2],'#f1d79e',fade*.5,2);});}});curve(t=>[Math.sin(t*7)*16,8+55*t,20+55*t],7,'#e3bd73');at(0,64,70,()=>{path([[-12,-2,0],[-8,12,0],[0,7,8],[8,12,0],[12,-2,0],[0,-10,13],[-12,-2,0]],2,'#ffdf98');});shock(56,'#ebce99');break;
 // Stormcaller: branching paths, piercing discharge, localized field, sphere and enemy links.
 case 'st_bolt':lightning([0,30,18],[10,31,70],'#83dcff',1);lightning([10,31,70],[-22,28,92],'#b5edff',3);break;
 case 'st_lance':L([0,29,15],[0,29,145*v],4,'#d8f7ff');for(const s of [-1,1])lightning([s*8,30,18],[0,30,140*v],'#76cbff',s);break;
 case 'st_step':lightning([-18,2,-24],[0,65,0],'#96dcff',1);lightning([0,65,0],[18,2,24],'#c6f2ff',7);sparks(9,28,9,'#9de9ff',30);break;
 case 'st_nova':circle(R*v,2,'#81d6ff',3);for(let j=0;j<7;j++){const an=j*TAU/7;lightning([Math.sin(an)*20,2,Math.cos(an)*20],[Math.sin(an)*R,4,Math.cos(an)*R],'#b8efff',j);}break;
 case 'st_orb':orb(0,28,0,23,'#82d9ff');for(let j=0;j<5;j++){const an=j*TAU/5;lightning([0,28,0],[Math.sin(an)*R,6,Math.cos(an)*R],'#b2edff',j);}break;
 case 'st_barrier':at(0,31,0,()=>{S('sphere',[28,31,28],'#65c7f7',fade*.10,2);});for(let j=0;j<6;j++){const an=j*TAU/6;lightning([Math.sin(an)*28,3,Math.cos(an)*28],[0,64,0],'#a1e4ff',j);}circle(29,3,'#78c8ff');break;
 case 'st_storm':for(let j=0;j<3;j++){const an=j*TAU/3;at(Math.sin(an)*50,0,Math.cos(an)*50,()=>{G([0,30,0],8,'#d7f8ff');});const b=an+TAU/3;lightning([Math.sin(an)*50,30,Math.cos(an)*50],[Math.sin(b)*50,30,Math.cos(b)*50],'#91dfff',j);}break;
 case 'st_overload':G([0,25,0],26,'#d0f5ff',fade*.65);for(let j=0;j<(N<40?8:10);j++){const an=j*TAU/(N<40?8:10);lightning([0,25,0],[Math.sin(an)*R*v,7+(j%3)*22,Math.cos(an)*R*v],'#87d6ff',j);}break;
 // Warlock: void, blood, curse, drain, paired rifts, collapse, sacrifice and delayed condemnation.
 case 'war_bolt':orb(0,28,24+60*v,8,'#d186bb');curve(t=>[Math.sin(t*7+q*6)*7,28,20+60*v-42*t],4,'#a45f98');break;
 case 'war_lance':at(0,29,20,()=>{pushM();rotX(Math.PI/2);S('needle',[4,100*v+1,4],'#bf536f',fade*.7,2);popM();});path([[0,29,20],[0,29,115*v]],5,'#d86b88');at(0,29,115*v,()=>{path([[-6,0,-18],[0,0,10],[6,0,-18]],3,'#f1a1b3');});sparks(7,9,25,'#d96b8b',12);break;
 case 'war_curse':circle(35,2,'#d17fa8',2);for(let j=0;j<3;j++){pushM();rotY(j*TAU/3);path([[-8,8,24],[0,18,24],[8,8,24],[0,11,24],[-8,8,24]],2,'#e5abc9');popM();}break;
 case 'war_drain':for(let j=0;j<3;j++)curve(t=>[Math.sin(t*8+j)*9,26+8*Math.cos(t*8+j),90*(1-t)],4,'#db8aaa');G([0,28,8],15,'#f2b1c6',fade*.5);break;
 case 'war_step':for(const s of [-1,1])at(s*18,0,s*22,()=>{curve(t=>[Math.sin(t*8)*5,3+65*t,0],4,'#c580ba');});burst(32,4,'#a85d9b',6);break;
 case 'war_orb':orb(0,28,0,25*(1-q*.6),'#b16cae');for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2);spiral(R,7,1.2,true,'#cf8bbb');popM();}break;
 case 'war_storm':for(let j=0;j<9;j++){const an=j*TAU/9;curve(t=>[Math.sin(an)*R*t,32-28*t,Math.cos(an)*R*t],5,'#ca627f');}G([0,32,0],18,'#ed94ab',fade*.6);circle(R*v,2,'#d28a98',4);break;
 case 'war_final':at(0,75-20*v,0,()=>{skull(0,'#e6a5ce');});for(const s of [-1,1])curve(t=>[s*23*Math.sin(t*Math.PI),10+60*t,0],3,'#bd7aaf');circle(32*(1-q*.6),2,'#c77fae',3);break;
 // Skylancer: wind wakes follow the direction of ascent/dive, actual raining spear silhouettes.
 case 'sky_rise':curve(t=>[0,4+90*t,22*Math.sin(t*Math.PI)],6,'#b1e8f1');feathers(5,10,5,'#93d5e5');break;
 case 'sky_gale':arrow(0,30,25+80*v,75,'#c7eff0',false);for(const s of [-1,1])curve(t=>[s*12*Math.sin(t*Math.PI),30,20+70*v-35*t],3,'#9ed8df');break;
 case 'sky_dive':for(const s of [-1,1])curve(t=>[s*15,80-75*t,-30+70*t],5,'#a2e0ec');sweep(38,3,-1.4,1.4,'#d0f1f5',3);break;
 case 'sky_lift':for(let j=0;j<3;j++){pushM();rotY(j*TAU/3);curve(t=>[Math.sin(t*TAU+q*3)*(36-18*t),5+80*t,Math.cos(t*TAU+q*3)*(36-18*t)],4,'#a5deea');popM();}break;
 case 'sky_dash':feathers(N<40?6:8,20,-20,'#b6e5ee');for(const s of [-1,1])curve(t=>[s*(12+30*t),20+3*Math.sin(t*4),-90*t],5,'#8dcedb');break;
 case 'sky_rain':for(let j=0;j<5;j++){const an=j*TAU/5;at(Math.sin(an)*38,100*(1-v),Math.cos(an)*38,()=>{pushM();rotX(Math.PI/2);arrow(0,0,0,60,'#c5edf4',false);popM();});}circle(51,2,'#90d2df');break;
 case 'sky_crash':lightning([0,130*(1-q),0],[0,3,0],'#b2e9ff',5);shock(R,'#b6e7f3');feathers(N<40?5:8,3,0,'#d3f4ff');break;
 case 'sky_cyclone':for(let j=0;j<4;j++){pushM();rotY(j*Math.PI/2);curve(t=>[Math.sin(t*TAU+q*5)*R*.6,4+70*t,Math.cos(t*TAU+q*5)*R*.6],5,'#a6dfe9');popM();}sweep(R,12,q*7,q*7+4,'#d2f4fa',4);break;
 // Bladedancer: contact windows differ from active cuts; no phantom extra weapons on the body.
 case 'bd_counter':path([[-24,15,25],[7,51,25],[12,48,25]],3,'#f9d7ec');curve(t=>[-26+55*t,20+4*Math.sin(t*Math.PI),28],2,'#d79ebf',fade*.65,24);G([0,39,26],5,'#ffe5ee',fade*.65);break;
 case 'bd_twin':sweep(48,31,-1.4+q*2,1.1+q*2,'#e8afd2',6);sweep(52,20,1.3-q*2,3.7-q*2,'#f7d6eb',4);break;
 case 'bd_riposte':curve(t=>[0,31,16+85*t*v],5,'#ffd6ef');sweep(39,30,-.7,1.6,'#de9ec8',6);break;
 case 'bd_step':footprints('#eab9dc',4);for(const s of [-1,1])curve(t=>[s*14+Math.sin(t*4)*12,9,-65*t],3,'#dba8d0');break;
 case 'bd_mirror':for(const side of [-1,1])at(side*(16+7*v),31,21,()=>{path([[0,22,0],[11,0,2],[0,-22,0],[-11,0,2],[0,22,0]],2,'#f0cee5');S('kite',[10,21,1.3],'#ceb9e4',fade*.23,2);L([0,-16,1],[0,16,1],.9,hot,fade*.6);});break;
 case 'bd_cross':slashX(43,'#f5c1e4');sparks(9,20,35,'#ffdef2',5);break;
 case 'bd_steel':for(const side of [-1,1])at(side*7,34,24,()=>{pushM();rotY(Math.PI/2);rotX(side*.65);S('needle',[2,22,1],'#b9bdcf',fade*.70,1);popM();}); // Crossed steel and a contact spark, not another magic mirror panel.
 for(const side of [-1,1])path([[side*17,14,24],[-side*12,54,24],[-side*15,57,24]],3.2,'#ded5df');G([0,36,26],7,'#fff1de',fade*.6);for(let j=0;j<5;j++){const an=j*TAU/5;L([Math.sin(an)*7,36+Math.cos(an)*7,26],[Math.sin(an)*15,36+Math.cos(an)*15,26],1.4,'#edb4ce');}break;
 case 'bd_perfect':curve(t=>[-29+17*t,13+44*t,24],4,'#ffdaed',fade,24);curve(t=>[28-17*t,13+44*t,24],4,'#e9acd0',fade,24);path([[-13,58,24],[0,65,24],[13,58,24]],2,'#f9d3e9');for(const side of [-1,1])curve(t=>[side*(24-18*t),8,18+24*t],1.7,'#c68fb6',fade*.65,16);break;
 // Beastmaster: companion commands, ties and care use paw/pack cues, not generic claw attacks.
 case 'bst_sic':for(let j=0;j<3;j++)path([[-9,12,20+j*15],[0,12,30+j*15],[9,12,20+j*15]],2,'#e1cf9e');claws(24,65,'#d5bd84');break;
 case 'bst_coordinated':arrow(-10,29,32+45*v,35,'#d7cf9e');claws(28,64,'#e6d4a1');upright(13,45,64,'#e4c994',-.7,.7);break;
 case 'bst_guardian':shield(-26,22,-12,.8,'#c4ce94');curve(t=>[-26+26*t,20+18*Math.sin(t*Math.PI),-12+12*t],4,'#e2d3a2');G([0,27,0],12,'#d8d5a1',fade*.4);break;
 case 'bst_step':for(const s of [-1,1])curve(t=>[s*(8+40*t),8+10*Math.sin(t*Math.PI),-45*t],4,'#c9c592');footprints('#e2cf9c',3);break;
 case 'bst_mend':for(const s of [-1,1])at(s*22,0,-8,()=>{sparks(5,12,3,'#bde6a2',38);path([[-7,27,0],[7,27,0],[0,27,0],[0,20,0],[0,34,0]],2,'#d9f3b7');});break;
 case 'bst_roar':for(let j=0;j<3;j++){pushM();rotX(Math.PI/2);upright(23+j*17*v,27,0,'#dacb91',-1,1);popM();}claws(48,0,'#f0dcaa');break;
 case 'bst_stampede':for(let k=0;k<(N<40?2:4);k++)at((k-(N<40?.5:1.5))*27,0,30+65*v-(k%2)*20,()=>{const color='#d4d3ab';S('herd',[14,25,25],color,fade*.30,2);for(const side of [-1,1])for(const fore of [-1,1])at(side*4.5,17,fore*12,()=>{pushM();rotX(Math.sin(q*TAU*2+k*.8+(side*fore>0?0:Math.PI))*.65);mv(0,-13,0);S('barrel',[1.6,13,1.6],color,fade*.30,2);popM();});for(const side of [-1,1])G([side*2.6,26,24],1.6,hot,fade*.7);curve(t=>[Math.sin(t*3+q*9)*8,18-7*t,-15-20*t],2,'#e0d8b2',fade*.6,12);});break;
 case 'bst_apex':for(let j=0;j<6;j++){const an=j*TAU/6;G([Math.sin(an)*29,8+30*v,Math.cos(an)*29],6,'#e1dba8');}at(-24,20,-12,()=>{claws(0,0,'#e8d5a0');upright(22,0,0,'#bdca91',0,Math.PI);});break;
 default:return false;
 }
 return true;
};
root.BF_SKILL_IDENTITY.targeted=new Set(['r_mark','r_deathmark','nin_mark','m_gravity','m_overload','pal_smite','war_drain','war_orb','war_final','py_sun','sky_rain','st_orb','st_overload','chr_overload','pir_deathmark']);
})(window);
