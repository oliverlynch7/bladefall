/* Physical shutdown timing. The host validates all uses; clients only display it. */
(function(root){'use strict';
const windowSeconds=8;
function pressure(clock){const t=((clock%7)+7)%7;return {safe:t>=3&&t<6,level:t<3?1-t/4:t<6?.25:(t-6)*.75+.25};}
function available(key,G,remote){if(!/^ih\.(line\.|brace$)/.test(key))return true;const s=G.storyState,k=remote||G.iron,step=s.items['ih.line']||0;if(s.flags['ih.line.open'])return !/^ih\.(line\.|brace$)/.test(key);if(key==='ih.line.1')return step===0;if(key==='ih.line.2')return step===1&&pressure(k.clock||0).safe;if(key==='ih.brace')return step===2;if(key==='ih.line.3')return step===2&&(k.braceUntil||0)>(k.clock||0);return true;}
function sync(G,s){const k=G.iron,n=s.items['ih.braces']||0;if(k.braceCount==null)k.braceCount=n;if(n>k.braceCount)k.braceUntil=k.clock+windowSeconds;k.braceCount=n;}
function task(G,s){const step=s.items['ih.line']||0;if(!s.flags['ih.plate'])return 'Read the machine plate beside the weapon line';if(step===0)return 'Cut the metal feed at the west machine';if(step===1)return 'Vent the tank while its gauge is in the marked safe band';if((G.iron.braceUntil||0)>G.iron.clock)return 'Reach the hammer lock before the safety cable releases';return 'Pull the safety cable, then hurry to the hammer lock';}
function draw(G,s,bx,ring){const k=G.iron,step=s.items['ih.line']||0,done=!!s.flags['ih.line.open'],p=pressure(k.clock),left=Math.max(0,(k.braceUntil||0)-k.clock);
 // Tall tank and a large gauge: the pale bracket and needle are readable without color.
 bx(380,195,-4020,100,190,100,'#50585b');bx(380,298,-4020,110,16,110,'#88785b');
 bx(300,226,-3940,120,112,12,'#242d34');bx(300,207,-3932,92,28,3,'#91bda9');for(const x of [246,354])bx(x,207,-3930,5,32,4,'#e9e5c5');bx(300,184+(done||step>=2?0:p.level)*82,-3926,88,5,5,'#f6efcf');
 bx(300,151,-3928,14,14,5,done||step>=2?'#91bda9':p.safe?'#eef0ca':'#db9550');
 // The held press visibly drops again when the eight-second cable runs out.
 const y=done?290:left>0?290:156;for(const x of [175,365])bx(x,223,-4440,18,246,26,'#44484b');bx(270,350,-4440,230,25,100,'#a08c6e');bx(270,y,-4440,160,48,110,done?'#879f8d':'#7e8588');
 bx(-350,155,-3700,70,110,55,'#51545a');bx(-350,217,-3700,100,14,24,left>0?'#e9d29b':'#a58a65');
 if(step===2&&!done){for(let j=0;j<8;j++)bx(-413+j*18,242,-3700,12,9,12,j<Math.ceil(left)?'#eee0ad':'#4e5357');ring(-350,103,-3700,62,'#d9c18c',.65,4);ring(270,103,-4380,62,left>0?'#e8db9c':'#77716b',.65,4);}
 if(done)return;for(let j=0;j<10;j++){const f=j/9;bx(-350+620*f,102.4,-3700-680*f,9,2,18,left>0?'#cdb875':'#6a6251');}
}
const api={windowSeconds,pressure,available,sync,task,draw};root.BFIronMachinery=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
