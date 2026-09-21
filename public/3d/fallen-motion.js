import * as T from './three.module.js';
// Keep the existing weapon contacts intact; the false start and recovery change the torso.
export function fallenClips(bones,clips){
 for(const [name,duration,pitch,yaw]of [['FallenFeint',.55,.16,-.22],['FallenStagger',1,.3,.08]]){
  const base=clips.find(c=>c.name==='Idle');if(!base)continue;const c=base.clone();c.name=name;const ratio=duration/c.duration;for(const track of c.tracks)track.times=track.times.map(v=>v*ratio);c.duration=duration;
  for(const key of ['body','head']){const bone=bones[key];if(!bone)continue;const old=c.tracks.find(t=>t.name===key+'.quaternion'),sample=old?.createInterpolant(),times=[],values=[];for(let i=0;i<=24;i++){const u=i/24,k=name==='FallenFeint'?Math.sin(u*Math.PI):1,q=old?new T.Quaternion().fromArray(sample.evaluate(u*duration)):bone.quaternion.clone();q.multiply(new T.Quaternion().setFromEuler(new T.Euler(pitch*k*(key==='body'?1:-.4),yaw*k,0)));times.push(u*duration);values.push(...q.toArray());}c.tracks=c.tracks.filter(t=>t.name!==key+'.quaternion');c.tracks.push(new T.QuaternionKeyframeTrack(key+'.quaternion',times,values));}clips.push(c);
 }return clips;
}
