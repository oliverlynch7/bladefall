(function(root){'use strict';
 function profile(distance){
  const far=Math.min(1,Math.max(0,Number.isFinite(distance)?distance/1500:1)),near=1-far;
  return {label:far<.15?'Very close':far<.33?'Close':far<.55?'Nearby':far<.78?'Faint signal':'Distant',interval:2.35-1.65*Math.pow(near,1.2),volume:.4+.6*near};
 }
 class BeatClock{
  constructor(){this.reset();}
  reset(){this.world=null;this.last=null;}
  due(world,now,interval){
   if(!Number.isFinite(now)||!Number.isFinite(interval)||interval<=0)return false;
   if(this.world!==world||this.last!==null&&now<this.last){this.reset();this.world=world;}
   if(this.last===null||now-this.last>=interval-1e-7){this.last=now;return true;}
   return false;
  }
 }
 root.BFAbyssalHeart={profile,BeatClock};
 if(typeof module!=='undefined')module.exports=root.BFAbyssalHeart;
})(typeof window!=='undefined'?window:globalThis);
