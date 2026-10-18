/* Audio recipes only. Remote attacks never execute skills or change game state. */
(function(root){'use strict';
const methods=new Set(['slash','shoot','wand','magic','dodge','growl']);
const elements=new Set(['fire','ice','storm','poison','holy','void','arcane']);
const files=new Set(['swordswing','axeswing','spearswing','custom_shoot','xbowclick','xbowlatch','wandfire','wandcharge','firecharge','fireshot','fireball','warskill1','warcharge','arcaneskill','cast1','cast2','cast3','cast4','cast5','cast6','cast7',...['py_bolt','py_fan','py_blast','py_ward','py_lance','py_nova','py_inferno','py_sun'].map(id=>'skillcast_'+id)]);
let capture=null,depth=0,gain=1;
function recipe(cue){
 if(!Array.isArray(cue)||cue.length>3)return null;const [name,arg,volume]=cue;
 if(name==='file')return files.has(arg)&&Number.isFinite(volume)&&volume>0&&volume<=1.5?['file',arg,volume]:null;
 if(!methods.has(name))return null;
 if(name==='magic')return arg==null||elements.has(arg)?[name,arg||null]:null;
 if(name==='growl')return arg==null||Number.isFinite(arg)&&arg>=.25&&arg<=3?[name,arg??1]:null;
 return arg==null?[name]:null;
}
function clean(cues){if(!Array.isArray(cues)||cues.length>8)return [];return cues.map(recipe).filter(Boolean);}
function add(cue){if(capture&&depth===0&&capture.length<8){const c=recipe(cue);if(c&&!capture.some(x=>JSON.stringify(x)===JSON.stringify(c)))capture.push(c);}}
function begin(){const ticket={previous:capture,previousDepth:depth,cues:[]};capture=ticket.cues;depth=0;return ticket;}
function end(ticket){
 if(!ticket)return [];capture=ticket.previous;depth=ticket.previousDepth;
 const cues=clean(ticket.cues),pyro=cues.some(c=>c[0]==='file'&&c[1].startsWith('skillcast_')),bow=cues.some(c=>c[0]==='file'&&c[1]==='custom_shoot');
 return cues.filter(c=>!(pyro&&c[0]==='file'&&c[1]==='cast1')&&!(bow&&c[0]==='shoot'));
}
function bind(sfx){for(const name of methods){const fn=sfx[name];if(typeof fn!=='function'||fn._coopAudio)continue;const wrapped=function(...args){add([name,args[0]]);depth++;try{return fn.apply(this,args);}finally{depth--;}};wrapped._coopAudio=true;sfx[name]=wrapped;}}
function file(key,volume){add(['file',key,volume==null?1:volume]);}
function fallback(cid){const el={mage:'arcane',pyromancer:'fire',stormcaller:'storm',warlock:'void',necromancer:'poison',chronomancer:'arcane',reaper:'void',paladin:'holy'}[cid];return el?[['magic',el]]:[['slash']];}
function volume(listener,speaker){if(!listener||!speaker)return 0;const coords=[listener.x,listener.y||0,listener.z,speaker.tx??speaker.x,speaker.ty??speaker.y??0,speaker.tz??speaker.z];if(!coords.every(Number.isFinite))return 0;const d=Math.hypot(coords[0]-coords[3],(coords[1]-coords[4])*.75,coords[2]-coords[5]);return .55*Math.max(0,Math.min(1,(1600-d)/1340));}
function withGain(level,fn){const before=gain;gain=Number.isFinite(level)?Math.max(0,Math.min(.55,level)):0;try{return fn();}finally{gain=before;}}
function play(cues,level,sfx,playFile){
 if(!Number.isFinite(level)||level<=0)return 0;const before=gain;gain=Math.min(.55,level);let played=0;
 try{for(const c of clean(cues)){try{if(c[0]==='file'){
   const done=playFile(c[1],c[2]);if(!done&&c[1]==='custom_shoot')sfx.shoot();else if(!done&&c[1].startsWith('skillcast_')){if(!playFile('cast1',.65))sfx.magic.call(Object.create(sfx),'fire');}
  }else{const receiver=Object.create(sfx);receiver._castT=-Infinity;sfx[c[0]].call(receiver,c[1]);}played++;}catch(_){} }
 }finally{gain=before;}return played;
}
root.BFCoopAudio={bind,begin,end,file,clean,fallback,volume,play,withGain,get gain(){return gain;}};
if(typeof module!=='undefined')module.exports=root.BFCoopAudio;
})(typeof window!=='undefined'?window:globalThis);
