/* Device voices vary by OS. Keep assignments stable for each available voice list. */
(function(root){'use strict';
 const women=new Set(['mara','beth','ruth','grace','rose']);
 const calm=new Set(['thomas','ellis','ian','hugh','walter','riftkeeper','mentor_chronomancer','mentor_paladin']);
 const stern=new Set(['abyss_king','cross','ward','pike','anvil','flint','mentor_reaper']);
 const quick=new Set(['gus','felix','skip','jack','sly','dash','mentor_pirate']);
 function hash(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n;}
 function profile(speaker,metadata={}){const id=String(speaker||'narrator'),direction=metadata.direction||metadata.emotion||'';
  const gender=metadata.gender||(/\bfemale\b/i.test(direction)||women.has(id)?'female':id==='sunspire_orb'?'neutral':'male');
  return {id,gender,rate:calm.has(id)?.92:stern.has(id)?.94:quick.has(id)?1.02:.97,pitch:stern.has(id)?.9:calm.has(id)?.97:1+(hash(id)%5-2)*.025};
 }
 // SpeechSynthesisVoice has no gender field; these are known system voice names.
 function voiceGender(v){const n=v.name||'';
  if(/\b(female|zira|hazel|susan|samantha|victoria|karen|moira|tessa|fiona|serena|aria|jenny|sonia|libby|ava|allison|siri female)\b/i.test(n))return 'female';
  if(/\b(male|david|mark|george|daniel|alex|fred|oliver|guy|ryan|eric|christopher|tom|lee|aaron|siri male)\b/i.test(n))return 'male';return 'unknown';
 }
 function choose(voices,p){const english=voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang||''));const pool=english.length?english:voices;
  const matching=pool.filter(v=>voiceGender(v)===p.gender),unknown=pool.filter(v=>voiceGender(v)==='unknown');
  const candidates=(matching.length?matching:unknown.length?unknown:pool).slice().sort((a,b)=>String(a.voiceURI||a.name).localeCompare(String(b.voiceURI||b.name)));
  return candidates.length?candidates[hash(p.id)%candidates.length]:null;
 }
 async function voices(){const synth=root.speechSynthesis;if(!synth)return [];const current=synth.getVoices();if(current.length)return current;
  return new Promise(resolve=>{let timeout;const done=()=>{clearTimeout(timeout);synth.removeEventListener?.('voiceschanged',done);resolve(synth.getVoices());};synth.addEventListener?.('voiceschanged',done);timeout=setTimeout(done,650);});
 }
 async function prepare(text,speaker,metadata,volume){if(!root.speechSynthesis||!root.SpeechSynthesisUtterance)return null;const p=profile(speaker,metadata),available=await voices(),u=new root.SpeechSynthesisUtterance(text),v=choose(available,p);
  if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-US';u.rate=p.rate;u.pitch=p.pitch;u.volume=Math.max(0,Math.min(1,volume??1));return u;
 }
 const api={profile,choose,voiceGender,prepare};root.BFDialogueSpeech=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
