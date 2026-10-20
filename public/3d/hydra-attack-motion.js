// Head targets follow the game-owned attack clock. No independent attack oscillator.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function hydraAttackPose(h,i,a){
 const active=h.head===i&&!h.freed,broken=(h.broken||[]).includes(i);
 let x=a.x,y=broken?320:215,z=a.z-35,open=0,pitch=0;
 const wind=active&&h.state==='wind',strike=active&&h.state==='strike';
 const w=clamp(1-h.clock/(h.kind==='blast'?2:1.6)),s=clamp(1-h.clock/.45);
 if(wind){
  if(h.kind==='bite'){
   const gather=ease(w/.70),release=ease((w-.84)/.16)*.35;
   y+=80*gather;z-=65*gather;x+=(h.x-x)*release;z+=(h.z-z)*release;y+=(h.y+58-y)*release;open=.85*gather;pitch=-.09*gather;
  }else if(h.kind==='sweep'){
   const gather=ease(w/.85);x+=(-800-x)*gather;y+=(190-y)*gather;z+=(100-z)*gather;open=.18*gather;pitch=.06*gather;
  }else{y+=45*ease(w/.65);open=.75*ease(w/.7);pitch=-.04;}
 }
 if(strike){
  if(h.kind==='bite'){x=h.x;y=h.y+58;z=h.z;open=.85-.70*ease(s/.22);pitch=.12*(1-ease(s));}
  else if(h.kind==='sweep'){x=Math.sin(s*Math.PI-Math.PI/2)*800;y=190;z=100;open=.20;pitch=.035;}
  else{y+=45;open=.80;pitch=-.04;}
 }
 const yaw=active?Math.atan2(h.x-a.x,h.z-a.z):Math.sin((h.elapsed||0)*.7+i)*.08;
 return {x,y:y+Math.sin((h.elapsed||0)*1.6+i*2)*(wind||strike?2:9),z,open,pitch,yaw};
}
