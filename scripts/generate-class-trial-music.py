"""Generate authorized trial score; ledger prevents ambiguous paid retries. Never logs credentials."""
from pathlib import Path
import argparse,datetime,hashlib,json,os,subprocess,urllib.request,urllib.error
ROOT=Path(__file__).resolve().parents[1]
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--generate',action='store_true');ap.add_argument('--only');a=ap.parse_args()
 cat=json.loads((ROOT/'docs/audio/class-trial-music-20261018.json').read_text(encoding='utf8'))
 if not a.generate:print(json.dumps({'tracks':len(cat['tracks']),'minutes':sum(t['seconds'] for t in cat['tracks'])/60}));return
 key=os.environ.get('ELEVENLABS_API_KEY','')
 if not key:
  key=next(x.partition('=')[2].strip().strip('\"\'') for x in (ROOT.parents[1]/'.secrets/elevenlabs.env').read_text(encoding='utf-8-sig').splitlines() if x.partition('=')[0].strip()=='ELEVENLABS_API_KEY')
 def req(path,body=None):
  return urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io'+path,headers={'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg' if body else 'application/json'},data=json.dumps(body).encode() if body else None),timeout=600)
 def sub():
  with req('/v1/user/subscription') as r:return json.load(r)
 s=sub();assert s['tier']!='free'
 source=ROOT/'audio-source/music/class-trials-20261018';public=ROOT/'public/music/class-trials';source.mkdir(parents=True,exist_ok=True);public.mkdir(parents=True,exist_ok=True)
 lp=source/'manifest.json';ledger=json.loads(lp.read_text(encoding='utf8')) if lp.exists() else {'schema':1,'model':cat['model_id'],'plan':s['tier'],'used_before':s['character_count'],'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'takes':[]}
 def save():lp.write_text(json.dumps(ledger,indent=2)+'\n',encoding='utf8')
 save();print(json.dumps({'remaining':s['character_limit']-s['character_count']}),flush=True)
 for t in cat['tracks']:
  if a.only and t['id']!=a.only:continue
  rec=next((r for r in ledger['takes'] if r['id']==t['id']),None);raw=source/t['file'];out=public/t['file']
  if rec:
   if rec['status'] not in ['raw_saved','saved']:raise SystemExit('Prior uncertain/failed request requires manual review: '+t['id'])
   assert raw.exists() and hashlib.sha256(raw.read_bytes()).hexdigest()==rec['raw_sha256']
  else:
   s=sub();spent=s['character_count']-ledger['used_before'];reserved=sum(r['seconds']*25 for r in ledger['takes'])
   if max(spent,reserved)+t['seconds']*25>cat['credit_cap'] or s['character_limit']-s['character_count']<t['seconds']*25:raise SystemExit('Conservative budget stop')
   rec={**t,'status':'requesting','requested_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()};ledger['takes'].append(rec);save()
   try:
    body={'prompt':t['prompt'],'music_length_ms':t['seconds']*1000,'model_id':cat['model_id'],'force_instrumental':True}
    with req('/v1/music?output_format=mp3_44100_128',body) as r:
     data=r.read();rec.update(request_id=r.headers.get('request-id'),song_id=r.headers.get('song-id'),credit_cost=r.headers.get('character-cost'))
     assert len(data)>10000 and ('audio' in r.headers.get('Content-Type','') or 'octet-stream' in r.headers.get('Content-Type',''))
    raw.write_bytes(data);rec.update(status='raw_saved',raw_sha256=hashlib.sha256(data).hexdigest(),raw_bytes=len(data));save()
   except urllib.error.HTTPError as e:
    rec.update(status='rejected' if e.code in [400,401,402,403,422] else 'unknown_outcome',http_status=e.code,error=e.read().decode('utf8')[:1200]);save();raise SystemExit(json.dumps({'id':t['id'],'http_status':e.code,'detail':rec['error']}))
   except Exception as e:
    rec.update(status='unknown_outcome',error_type=type(e).__name__);save();raise SystemExit('No automatic paid retry: '+t['id'])
  if rec['status']!='saved' or not out.exists():
   # Consistent narration-friendly mix. Preserve the complete composition; only tame codec-edge clicks.
   af=f'loudnorm=I=-21:TP=-2:LRA=10,afade=t=in:d=0.025,afade=t=out:st={t["seconds"]-.08}:d=0.08'
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-af',af,'-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','128k',str(out)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
   probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=channels,sample_rate','-of','json',str(out)]))
   rec.update(status='saved',duration_seconds=float(probe['format']['duration']),runtime_sha256=hashlib.sha256(out.read_bytes()).hexdigest(),runtime_bytes=out.stat().st_size);save()
  print(json.dumps({'saved':t['id'],'seconds':rec['duration_seconds'],'cost_header':rec.get('credit_cost')}),flush=True)
 ready={r['id']:{'title':r['title'],'url':'/music/class-trials/'+r['file'],'seconds':r['duration_seconds'],'sha256':r['runtime_sha256'],'bytes':r['runtime_bytes']} for r in ledger['takes'] if r['status']=='saved'}
 (public/'manifest.json').write_text(json.dumps({'schema':1,'revision':cat['revision'],'tracks':ready},indent=2)+'\n',encoding='utf8')
 s=sub();ledger.update(used_after=s['character_count'],observed_credits=s['character_count']-ledger['used_before'],credits_remaining=s['character_limit']-s['character_count'],status='complete' if len(ready)==len(cat['tracks']) else 'partial');save();print(json.dumps({'status':ledger['status'],'tracks':len(ready),'observed_credits':ledger['observed_credits'],'remaining':ledger['credits_remaining']}),flush=True)
if __name__=='__main__':main()
