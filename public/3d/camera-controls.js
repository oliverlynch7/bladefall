(function(root){'use strict';
const clamp=(n,min,max,fallback)=>Math.max(min,Math.min(max,Number.isFinite(+n)?+n:fallback));
function fov(meta){return clamp(meta.fpsFov,70,115,92);}
function zoom(meta,mode=meta.camMode){return mode==='shoulder'?clamp(meta.shoulderZoom,.75,1.4,1):mode==='far'?clamp(meta.overheadZoom,.7,1.5,1):1;}
function wheel(meta,delta,unit=0){
 if(!Number.isFinite(delta)||delta===0)return false;
 const pixels=clamp(delta*(unit===1?16:unit===2?400:1),-120,120,0);
 if(meta.camMode==='fps'){const before=fov(meta);meta.fpsFov=clamp(before+pixels*.04,70,115,92);return before!==meta.fpsFov;}
 const key=meta.camMode==='shoulder'?'shoulderZoom':meta.camMode==='far'?'overheadZoom':null;if(!key)return false;
 const before=zoom(meta),next=before*Math.exp(-pixels*.0015);meta[key]=clamp(next,meta.camMode==='far'?.7:.75,meta.camMode==='far'?1.5:1.4,1);return before!==meta[key];
}
root.BFCameraControls={fov,zoom,wheel};if(typeof module!=='undefined')module.exports=root.BFCameraControls;
})(typeof window!=='undefined'?window:globalThis);
