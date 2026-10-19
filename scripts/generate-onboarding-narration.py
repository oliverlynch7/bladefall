"""Record current hashed scripts with Oliver's selected B voice. No uncertain retries."""
from pathlib import Path
import argparse, datetime, hashlib, json, os, subprocess, urllib.request, urllib.error
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'audio-source/voice/onboarding-20261018'
PUBLIC=ROOT/'public/3d/narration'
CAP=20000
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--generate',action='store_true');args=ap.parse_args()
    catalog=json.loads((ROOT/'docs/audio/onboarding-script-20261018.json').read_text(encoding='utf8'));clips=catalog['clips']
    if not args.generate:print(json.dumps({'clips':len(clips),'characters':sum(len(c['text']) for c in clips),'credit_cap':CAP}));return
    selected=json.loads((ROOT/'audio-source/voice/narrator-audition-20261018/manifest.json').read_text(encoding='utf8'))['selection'];assert selected['option']=='B'
    key=os.environ.get('ELEVENLABS_API_KEY','')
    if not key:
        for line in (ROOT.parents[1]/'.secrets/elevenlabs.env').read_text(encoding='utf-8-sig').splitlines():
            if line.partition('=')[0].strip()=='ELEVENLABS_API_KEY':key=line.partition('=')[2].strip().strip('\"\'')
    def request(path,body=None):
        headers={'xi-api-key':key,'Accept':'application/json' if body is None else 'audio/mpeg'}
        if body is not None:headers['Content-Type']='application/json'
        return urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io'+path,headers=headers,data=None if body is None else json.dumps(body).encode()),timeout=120)
    def subscription():
        with request('/v1/user/subscription') as r:return json.load(r)
    sub=subscription();assert sub.get('tier')!='free'
    with request('/v1/voices/'+selected['voice_id']) as response:
        v=json.load(response);assert v['voice_id']==selected['voice_id']
    SOURCE.mkdir(parents=True,exist_ok=True);PUBLIC.mkdir(parents=True,exist_ok=True);mp=SOURCE/'manifest.json'
    ledger=json.loads(mp.read_text(encoding='utf8')) if mp.exists() else {'schema':1,'voice_option':'B','voice_id':selected['voice_id'],'plan':sub['tier'],'model_id':'eleven_multilingual_v2','voice_settings':{'stability':.55,'similarity_boost':.8,'style':.1,'use_speaker_boost':True,'speed':.95},'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'used_before':sub['character_count'],'credit_cap':CAP,'takes':[]}
    assert ledger['voice_id']==selected['voice_id']
    def save():mp.write_text(json.dumps(ledger,indent=2)+'\n',encoding='utf8')
    save();print(json.dumps({'plan':sub['tier'],'available':sub['character_limit']-sub['character_count'],'clips':len(clips)}),flush=True)
    for i,c in enumerate(clips):
        assert hashlib.sha256(c['text'].encode()).hexdigest()==c['text_sha256']
        rec=next((r for r in ledger['takes'] if r['id']==c['id'] and r['text_sha256']==c['text_sha256']),None)
        source=SOURCE/c['file'];runtime=PUBLIC/c['file']
        if rec:
            if rec['status'] not in ['raw_saved','saved'] or not source.exists():raise SystemExit('Uncertain or missing prior take: '+c['id'])
            assert hashlib.sha256(source.read_bytes()).hexdigest()==rec['raw_sha256']
        else:
            if i%8==0:sub=subscription()
            reserved=sum(len(r['text']) for r in ledger['takes']);spent=max(sub['character_count']-ledger['used_before'],reserved)
            if spent+len(c['text'])*2+500>CAP or sub['character_limit']-sub['character_count']<len(c['text'])*2+500:raise SystemExit('Budget stop; keep saved takes')
            rec={**c,'status':'requesting','requested_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()};ledger['takes'].append(rec);save()
            try:
                body={'text':c['text'],'model_id':ledger['model_id'],'voice_settings':ledger['voice_settings'],'seed':471820,'apply_text_normalization':'on'}
                with request('/v1/text-to-speech/'+selected['voice_id']+'?output_format=mp3_44100_128',body) as r:
                    raw=r.read();rec.update(request_id=r.headers.get('request-id'),billed_header=r.headers.get('character-cost'))
                    if len(raw)<1000 or 'audio' not in r.headers.get('Content-Type',''):raise ValueError('Invalid speech response')
                source.write_bytes(raw);rec.update(status='raw_saved',raw_sha256=hashlib.sha256(raw).hexdigest(),raw_bytes=len(raw));save()
            except Exception as err:
                rec.update(status='unknown_outcome',error_type=type(err).__name__,http_status=getattr(err,'code',None));save();raise SystemExit('No automatic paid retry: '+c['id'])
        if rec['status']!='saved' or not runtime.exists():
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),'-af','loudnorm=I=-18:TP=-2:LRA=9','-ar','44100','-codec:a','libmp3lame','-b:a','128k',str(runtime)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
            probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(runtime)]))
            rec.update(status='saved',duration_seconds=float(probe['format']['duration']),runtime_sha256=hashlib.sha256(runtime.read_bytes()).hexdigest(),runtime_bytes=runtime.stat().st_size);save()
        print(json.dumps({'saved':c['id'],'seconds':round(rec['duration_seconds'],2)}),flush=True)
    ready={}
    for c in clips:
        r=next(r for r in ledger['takes'] if r['id']==c['id'] and r['text_sha256']==c['text_sha256']);assert r['status']=='saved'
        ready[c['id']]={'text_sha256':r['text_sha256'],'text':r['text'],'file':r['file'],'duration':r['duration_seconds'],'sha256':r['runtime_sha256']}
    (PUBLIC/'manifest.json').write_text(json.dumps({'schema':1,'revision':catalog['revision'],'voice':'B','lines':ready},indent=2)+'\n',encoding='utf8')
    sub=subscription();ledger.update(status='complete',used_after=sub['character_count'],observed_credits=sub['character_count']-ledger['used_before'],credits_remaining=sub['character_limit']-sub['character_count']);save()
    print(json.dumps({'complete':len(ready),'observed_credits':ledger['observed_credits'],'credits_remaining':ledger['credits_remaining']}),flush=True)
if __name__=='__main__':main()
