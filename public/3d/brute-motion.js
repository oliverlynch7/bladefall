import * as T from './three.module.js';
// Preserve the tested weapon/hand poses and leg animation; change only the torso and head.
export function orchardClips(bones,clips){
 for(const [name,baseName,duration]of [['BruteBrace','Idle',1.15],['BruteRush','Move',.45],['BruteStagger','Idle',1]]){
  const base=clips.find(c=>c.name===baseName);if(!base)continue;
  const c=base.clone();c.name=name;const scale=duration/c.duration;for(const t of c.tracks)t.times=t.times.map(v=>v*scale);c.duration=duration;
  for(const key of ['body','head']){const bone=bones[key];if(!bone)continue;const old=c.tracks.find(t=>t.name===key+'.quaternion'),sample=old?.createInterpolant(),times=[],values=[];
   for(let i=0;i<=24;i++){const u=i/24,brace=name==='BruteBrace'?Math.min(1,u*3):1,wobble=name==='BruteStagger'?Math.sin(u*Math.PI*2)*.055:0;
    const q=old?new T.Quaternion().fromArray(sample.evaluate(u*duration)):bone.quaternion.clone();
    const pitch=key==='body'?(name==='BruteRush'?.38:.3):(name==='BruteRush'?-.08:.15);
    q.multiply(new T.Quaternion().setFromEuler(new T.Euler(pitch*brace,0,wobble)));times.push(u*duration);values.push(...q.toArray());
   }
   c.tracks=c.tracks.filter(t=>t.name!==key+'.quaternion');c.tracks.push(new T.QuaternionKeyframeTrack(key+'.quaternion',times,values));
  }clips.push(c);
 }return clips;
}
