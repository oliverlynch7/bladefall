"""Decode and validate the actual published NPC takes; no provider or transcription calls."""
from pathlib import Path
import concurrent.futures, hashlib, json, re, subprocess
ROOT=Path(__file__).resolve().parents[1]

def main():
    manifest=json.loads((ROOT/'public/3d/npc-voices/manifest.json').read_text(encoding='utf8'))
    def check(line):
        path=ROOT/'public/3d'/line['audio'][2:];raw=path.read_bytes()
        assert hashlib.sha256(raw).hexdigest()==line['audio_sha256'],line['id']
        meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,sample_rate,channels','-of','json',str(path)]))
        duration=float(meta['format']['duration']);assert .2<duration<70,(line['id'],duration)
        decoded=subprocess.run(['ffmpeg','-hide_banner','-nostdin','-i',str(path),'-af','volumedetect','-f','null','-'],capture_output=True,text=True,check=True)
        mean=float(re.search(r'mean_volume: ([\-\d.]+) dB',decoded.stderr)[1]);peak=float(re.search(r'max_volume: ([\-\d.]+) dB',decoded.stderr)[1])
        assert mean>-45 and peak<0,(line['id'],mean,peak)
        assert not re.search(r'error while decoding|invalid data|corrupt',decoded.stderr,re.I),line['id']
        return dict(id=line['id'],duration=round(duration,3),mean_db=mean,peak_db=peak,audio_sha256=line['audio_sha256'],decode='pass')
    by_hash={}
    for line in manifest['lines'].values():
        previous=by_hash.setdefault(line['audio_sha256'],line['text'])
        assert previous==line['text'],('Same recording attached to different words',line['id'])
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(check,manifest['lines'].values()))
    out=dict(clips=len(rows),seconds=round(sum(row['duration'] for row in rows),2),scope='Technical decoding, hash, duration, non-silence and unclipped peak checks. Not a transcription or subjective performance approval.',files=rows)
    dest=ROOT/'docs/art-validation/npc-cast-20261019/audio.json';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(out,indent=2)+'\n',encoding='utf8')
    print(json.dumps({k:out[k] for k in ['clips','seconds','scope']}))

if __name__=='__main__':main()
