/* Runs before any game module. A dev level cannot read or write real saves. */
(()=>{'use strict';
 const params=new URLSearchParams(location.search);if(params.get('devkeep')!=='1'&&params.get('devbriar')!=='1')return;
 const memory=()=>{const m=new Map();return {get length(){return m.size;},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(String(k))??null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()};};
 try{Object.defineProperty(window,'localStorage',{value:memory(),configurable:false});Object.defineProperty(window,'sessionStorage',{value:memory(),configurable:false});window.BF_KEEP_ISOLATED=true;}
 catch(e){location.replace('/3d/');throw Error('Dev save isolation unavailable');}
})();
