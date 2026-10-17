"""Decode/trim/level authorized SFX, retain untouched originals, build runtime manifest."""
from pathlib import Path
import json, subprocess, array, math, hashlib, re, shutil
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'audio-source/sfx/pyromancer-20261017'
OUT=ROOT/'public/sfx/custom/pyromancer-20261017'
OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SOURCE/'manifest.json').read_text())
runtime=[]
for cue in manifest['cues']:
    if cue['status']!='saved':raise SystemExit('Uncertain generation: '+cue['id'])
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(SOURCE/cue['file']),'-f','f32le','-acodec','pcm_f32le','-ar','44100','-ac','2','pipe:1'],capture_output=True,check=True).stdout
    data=array.array('f');data.frombytes(raw)
    assert data and all(math.isfinite(v) for v in data)
    # Find sustained audible onset at a 3ms block size. Leave 5ms of pre-roll.
    block=264;threshold=.0018
    starts=[i for i in range(0,len(data),block) if max(map(abs,data[i:i+block]),default=0)>threshold]
    if not starts:raise SystemExit('Silent source '+cue['id'])
    start=max(0,starts[0]-440);start-=start%2
    data=data[start:]
    peak=max(map(abs,data));rms=math.sqrt(sum(v*v for v in data)/len(data))
    gain=min(.09/max(rms,1e-6),.78/max(peak,1e-6),4)
    # Gentle 2ms start and 12ms end fades prevent edits from producing clicks.
    frames=len(data)//2
    for frame in range(frames):
        fade=min(1,frame/88,(frames-1-frame)/529)
        for ch in range(2):data[frame*2+ch]*=gain*max(0,fade)
    target=OUT/cue['file']
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i','pipe:0','-c:a','libmp3lame','-b:a','128k',str(target)],input=data.tobytes(),capture_output=True,check=True)
    check=subprocess.run(['ffmpeg','-v','error','-i',str(target),'-f','f32le','-acodec','pcm_f32le','pipe:1'],capture_output=True,check=True).stdout
    samples=array.array('f');samples.frombytes(check)
    outpeak=max(map(abs,samples));outrms=math.sqrt(sum(v*v for v in samples)/len(samples))
    assert outpeak<.95 and outrms>.002,(cue['id'],outpeak,outrms)
    runtime.append(dict(id=cue['id'],file='custom/pyromancer-20261017/'+target.stem,duration=round(frames/44100,4),channels=2,source_seconds=cue['duration_seconds'],trimmed_start_seconds=round(start/88200,4),gain=round(gain,4),peak=round(outpeak,5),rms=round(outrms,5),sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
report={'version':'pyromancer-20261017','plan_at_generation':manifest['license_plan_at_generation'],'provider':'ElevenLabs','model':manifest['model'],'subjective_listening':'Human audition pending; signal checks cannot establish taste.','cues':runtime}
(OUT/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'runtime_files':len(runtime),'seconds':round(sum(c['duration'] for c in runtime),2),'max_peak':max(c['peak'] for c in runtime)}))
