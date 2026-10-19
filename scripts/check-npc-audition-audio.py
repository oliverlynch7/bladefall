"""Technical decoding and signal checks, not a subjective casting approval."""
import concurrent.futures,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def check(p):
    probe=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,sample_rate,channels','-of','json',str(p)],capture_output=True,text=True,check=True)
    meta=json.loads(probe.stdout);duration=float(meta['format']['duration']);assert 2<duration<60,p.name
    decoded=subprocess.run(['ffmpeg','-hide_banner','-nostdin','-i',str(p),'-af','volumedetect','-f','null','-'],capture_output=True,text=True,check=True)
    mean=float(re.search(r'mean_volume: ([\-\d.]+) dB',decoded.stderr)[1]);peak=float(re.search(r'max_volume: ([\-\d.]+) dB',decoded.stderr)[1]);assert mean>-45 and peak<0,(p.name,mean,peak)
    assert not re.search(r'error while decoding|invalid data|corrupt',decoded.stderr,re.I),p.name
    return dict(file=p.name,duration=round(duration,3),mean_db=mean,peak_db=peak,stream=meta['streams'][0],decode='pass')
def main():
    files=sorted((ROOT/'public/3d/npc-voice-preview').glob('*.mp3'));assert len(files)==150
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(check,files))
    out={'clips':len(rows),'total_seconds':round(sum(r['duration'] for r in rows),2),'checks':'All MP3s decode, contain non-silent signal, peak below 0 dBFS and have sensible sample duration. No subjective voice approval or transcript transcription implied.','files':rows}
    dest=ROOT/'docs/art-validation/npc-voices-20261019/audio.json';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(out,indent=2)+'\n',encoding='utf8')
    print(json.dumps({k:out[k] for k in ['clips','total_seconds','checks']}))
if __name__=='__main__':main()
