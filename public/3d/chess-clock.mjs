// Host-monotonic chess time. Rendering and packet frequency never add increment.
export class ChessClock {
 constructor(config={},now=0){this.configure(config,now);}
 configure({enabled=false,base=300,increment=0},now){
  if(typeof enabled!=='boolean'||!Number.isInteger(base)||base<15||base>10800||!Number.isInteger(increment)||increment<0||increment>120)throw Error('Invalid time control');
  Object.assign(this,{enabled,base,increment,left:{w:base,b:base},ready:{w:false,b:false},running:null,started:!enabled,anchor:now});
 }
 settle(now){const elapsed=Math.max(0,(now-this.anchor)/1000);this.anchor=Math.max(this.anchor,now);if(this.running)this.left[this.running]=Math.max(0,this.left[this.running]-elapsed);return this.running&&this.left[this.running]<=0?this.running:null;}
 confirm(side,turn,now){this.settle(now);this.ready[side]=true;if(this.ready.w&&this.ready.b&&!this.started){this.started=true;this.running=this.enabled?turn:null;this.anchor=now;}}
 stop(now){this.settle(now);this.running=null;}
 finishMove(side,turn,now,ended=false){if(this.enabled)this.left[side]+=this.increment;this.running=this.enabled&&!ended?turn:null;this.anchor=now;}
 suspend(now){this.stop(now);this.started=!this.enabled;this.ready={w:false,b:false};}
 view(now){const left={...this.left};if(this.running)left[this.running]=Math.max(0,left[this.running]-Math.max(0,now-this.anchor)/1000);return {enabled:this.enabled,base:this.base,increment:this.increment,left,ready:{...this.ready},running:this.running,started:this.started};}
}
