// Small original Web Audio cues for the optional chess table.
let context,output;
function audio(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;context||=new C();if(!output){output=context.createGain();output.connect(context.destination);}if(context.state==='suspended')context.resume().catch(()=>{});return context;}
function tone(c,f,at,duration,volume,type='sine'){
 const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g).connect(output);o.start(at);o.stop(at+duration+.01);
}
function knock(c,at,volume){const length=Math.floor(c.sampleRate*.055),buffer=c.createBuffer(1,length,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(length*.13));const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=1050;gain.gain.value=volume;source.connect(filter).connect(gain).connect(output);source.start(at);}
export function chessSfx(kind){const meta=window.__BF3?.meta;if(meta?.soundOn===false||/[?&]mute=1\b/.test(location.search))return;const c=audio();if(!c)return;output.gain.value=Math.max(0,Math.min(1,Number(meta?.sfxVol??1)));if(output.gain.value===0)return;const t=c.currentTime+.008;
 if(kind==='move'){knock(c,t,.075);tone(c,420,t,.07,.018,'triangle');}
 else if(kind==='capture'){knock(c,t,.14);knock(c,t+.07,.1);tone(c,220,t,.17,.035,'triangle');}
 else if(kind==='check'){tone(c,554,t,.16,.055);tone(c,740,t+.09,.28,.045);}
 else if(kind==='mate'){tone(c,392,t,.28,.06);tone(c,494,t+.09,.36,.05);tone(c,659,t+.18,.7,.075);}
 else if(kind==='illegal'){tone(c,170,t,.11,.025,'triangle');}
}
