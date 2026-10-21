"""Build a compact double heartbeat from the generated master; preserve the source."""
from pathlib import Path
import json,subprocess,array,math,hashlib
R=Path(__file__).resolve().parents[1]
source=R/'audio-source/sfx/abyssal-heart-20261021'
out=R/'public/sfx/custom/abyssal-heart-20261021';out.mkdir(parents=True,exist_ok=True)
ledger=json.loads((source/'manifest.json').read_text());cue=ledger['cues'][0]
assert cue['status']=='saved'
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(source/cue['file']),'-af','highpass=f=45,lowpass=f=1800','-f','f32le','-ac','1','-ar','44100','pipe:1'])
a=array.array('f');a.frombytes(raw);assert a and all(map(math.isfinite,a))
rate=44100;length=int(.62*rate);samples=array.array('f',[0])*length
# A clear lub-dub: two rounded copies of the custom void transient, then a short tail.
for delay,level in [(0,1),(.19,.72)]:
 for i in range(min(int(.36*rate),len(a))):
  target=int(delay*rate)+i
  if target>=length:break
  fade=min(1,i/(.003*rate),(.36*rate-i)/(.09*rate))
  samples[target]+=a[i]*level*max(0,fade)
peak=max(map(abs,samples));rms=math.sqrt(sum(v*v for v in samples)/len(samples));gain=min(.10/rms,.78/peak)
for i in range(length):samples[i]*=gain*min(1,(length-1-i)/(.02*rate))
target=out/'abyssal_heart_pulse_v01.mp3'
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(rate),'-ac','1','-i','pipe:0','-c:a','libmp3lame','-b:a','128k',str(target)],input=samples.tobytes(),check=True)
check=subprocess.check_output(['ffmpeg','-v','error','-i',str(target),'-f','f32le','-ac','1','-ar',str(rate),'pipe:1']);b=array.array('f');b.frombytes(check)
peak=max(map(abs,b));rms=math.sqrt(sum(v*v for v in b)/len(b));assert peak<.95 and rms>.01
report={'version':'abyssal-heart-20261021','provider':'ElevenLabs','model':ledger['model'],'plan_at_generation':ledger['license_plan_at_generation'],'billed_credits':float(cue['billed_header']),'source_seconds':cue['duration_seconds'],'runtime_seconds':len(b)/rate,'peak':peak,'rms':rms,'processing':'45Hz highpass /1800Hz lowpass, generated transient doubled at0/190ms,72% second hit, soft edits,620ms total; original master retained','sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'subjective_listening':'Human audition pending; measured signal checks only.'}
(out/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')
(R/'docs/audio/abyssal-heart-provenance-20261021.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
