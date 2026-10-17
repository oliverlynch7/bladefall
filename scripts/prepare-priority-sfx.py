"""Decode/trim/level authorized SFX, retain untouched originals, build runtime manifest."""
from pathlib import Path
import json, subprocess, array, math, hashlib, re, shutil
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'audio-source/sfx/starter-20261016'
OUT=ROOT/'public/sfx/custom/starter-20261016'
OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SOURCE/'manifest.json').read_text())
runtime=[]
legacy_defs=dict(re.findall(r"([a-zA-Z0-9_]+):\{f:'([^']+)'",(ROOT/'public/3d/index.html').read_text(encoding='utf-8').split('const FXDEF={',1)[1].split('// Paid custom files',1)[0]))
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
    old=legacy_defs.get(cue['id'])
    if old:
        backup=ROOT/'audio-source/sfx/legacy-before-starter-20261016'/(old+'.mp3');backup.parent.mkdir(parents=True,exist_ok=True)
        if not backup.exists():shutil.copyfile(ROOT/'public/sfx'/(old+'.mp3'),backup)
    runtime.append(dict(id=cue['id'],file='custom/starter-20261016/'+target.stem,legacy_file=old,duration=round(frames/44100,4),channels=2,source_seconds=cue['duration_seconds'],trimmed_start_seconds=round(start/88200,4),gain=round(gain,4),peak=round(outpeak,5),rms=round(outrms,5),sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
report={'version':'starter-20261016','plan_at_generation':manifest['license_plan_at_generation'],'provider':'ElevenLabs','model':manifest['model'],'subjective_listening':'Pending human audition; signal/decode checks do not establish aesthetic quality.','cues':runtime}
(OUT/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')
definitions={c['id']:{'f':c['file'],'v':.42 if not c['id'].startswith('custom_') else {'custom_hit':.4,'custom_hurt':.48,'custom_jump':.24,'custom_land':.32,'custom_dodge':.4,'custom_shoot':.36,'custom_classup':.55,'custom_pickup':.3}.get(c['id'],.4)} for c in runtime}
config='''/* Paid ElevenLabs Starter production batch; originals/provenance in audio-source/sfx/starter-20261016.
   This replaces slots, never stacks a second file on the same slot. No account key is shipped. */
(function(root){'use strict';
const definitions=DEFINITIONS;
const methods={hit:'custom_hit',hurt:'custom_hurt',jump:'custom_jump',land:'custom_land',dodge:'custom_dodge',classup:'custom_classup',pickup:'custom_pickup',wand:'wandfire'};
function apply(registry){for(const [id,value] of Object.entries(definitions)){const old=registry[id];registry[id]={...value,...old,f:value.f};if(old)registry[id].legacyF=old.f;}}
function bind(sfx,play){for(const [name,id] of Object.entries(methods)){const old=sfx[name];if(typeof old!=='function')continue;sfx[name]=function(...args){if(play(id))return;return old.apply(this,args);};}}
const api={definitions,methods,apply,bind};root.BFPrioritySfx=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
'''.replace('DEFINITIONS',json.dumps(definitions,separators=(',',':')))
(ROOT/'public/3d/priority-sfx.js').write_text(config)
rows=''.join('<article><h2>'+c['id']+'</h2><p>New</p><audio controls preload="none" src="/sfx/'+c['file']+'.mp3"></audio>'+('<p>Previous</p><audio controls preload="none" src="/sfx/'+c['legacy_file']+'.mp3"></audio>' if c['legacy_file'] else '<p>Previously procedural; compare in game.</p>')+'</article>' for c in runtime)
(OUT/'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bladefall priority SFX</title><style>body{background:#121c28;color:#eef3f8;font:16px system-ui;margin:24px auto;max-width:1100px;padding:16px}h1,a{color:#ffcb7c}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:12px}article{background:#203144;padding:14px;border-radius:12px}h2{font-size:17px}audio{width:100%}</style><h1>Bladefall: priority sound batch</h1><p>Generated on a paid Starter plan. 64 real game sound slots and player cues. Signal/decode checks passed; listen here to judge tone and repetition.</p><p><a href="/3d/">Play the updated preview</a></p><main>'''+rows+'</main></html>')
print(json.dumps({'runtime_files':len(runtime),'seconds':round(sum(c['duration'] for c in runtime),2),'max_peak':max(c['peak'] for c in runtime),'max_onset_trim':max(c['trimmed_start_seconds'] for c in runtime)}))
