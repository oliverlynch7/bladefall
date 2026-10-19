"""Explicitly authorized, resumable paid ElevenLabs batch. Never prints credentials.
Dry run by default. --generate performs billed requests; never retries an unknown outcome.
"""
from pathlib import Path
import argparse, json, os, math, hashlib, datetime, urllib.request, urllib.error, time
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'audio-source/sfx/mechanism-details-20261019'
RUNTIME=ROOT/'public/sfx/custom/mechanism-details-20261019'
def cues():
    return json.loads((ROOT/'docs/audio/mechanism-details-batch-20261019.json').read_text(encoding='utf8'))['cues']

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--generate',action='store_true');ap.add_argument('--status',action='store_true');ap.add_argument('--limit',type=int,default=999);ap.add_argument('--key-file',default=str(ROOT.parents[1]/'.secrets/elevenlabs.env'));args=ap.parse_args()
    batch=cues()[:args.limit]
    SOURCE.mkdir(parents=True,exist_ok=True)
    manifest=SOURCE/'manifest.json'
    if not args.generate and not args.status:
        print(json.dumps({'cues':len(batch),'seconds':sum(c['duration_seconds'] for c in batch),'estimated_credits':sum(round(c['duration_seconds']*40) for c in batch),'hard_batch_cap':1000}));return
    key=os.environ.get('ELEVENLABS_API_KEY','')
    if not key:
        for line in Path(args.key_file).read_text(encoding='utf-8-sig').splitlines():
            if line.partition('=')[0].strip()=='ELEVENLABS_API_KEY':key=line.partition('=')[2].strip().strip('\"\'')
    def request(path,payload=None):
        headers={'xi-api-key':key,'Accept':'application/json' if payload is None else 'audio/mpeg'}
        data=None
        if payload is not None:headers['Content-Type']='application/json';data=json.dumps(payload).encode()
        return urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io'+path,data=data,headers=headers),timeout=120)
    def subscription():
        for attempt in range(4):
            try:
                with request('/v1/user/subscription') as r:return json.load(r)
            except urllib.error.HTTPError as err:
                if err.code!=429 or attempt==3:raise
                time.sleep(5*(attempt+1))
    sub=subscription()
    print(json.dumps({'plan':sub.get('tier'),'available_credits':sub['character_limit']-sub['character_count'],'batch_cues':len(batch)}),flush=True)
    if args.status:return
    if sub.get('tier')=='free':raise SystemExit('Paid plan required for this production batch')
    ledger=json.loads(manifest.read_text()) if manifest.exists() else {'schema':1,'provider':'ElevenLabs','model':'eleven_text_to_sound_v2','license_plan_at_generation':sub['tier'],'commercial_review':'Paid-plan non-beta SFX; retain provider records. No claim of exclusive ownership.','started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'starting_account_used':sub['character_count'],'hard_credit_cap':1000,'cues':[]}
    ledger.pop('credits_spent',None) # older pilot balance field may lag provider billing
    def save():manifest.write_text(json.dumps(ledger,indent=2)+'\n')
    save()
    for cue in batch:
        previous=next((r for r in ledger['cues'] if r['id']==cue['id']),None)
        if previous:
            if previous['status']=='saved' and (SOURCE/previous['file']).exists():continue
            raise SystemExit('Previous uncertain request requires manual review; no automatic retry: '+cue['id'])
        if len(ledger['cues'])%8==0:sub=subscription()
        account_spent=sub['character_count']-ledger['starting_account_used'];reserved=sum(math.ceil(r['duration_seconds']*40) for r in ledger['cues']);spent=max(account_spent,reserved);expected=math.ceil(cue['duration_seconds']*40)
        if spent+max(expected,200)>1000 or sub['character_limit']-sub['character_count']<max(expected,200):raise SystemExit('Credit budget stop')
        rec={**cue,'status':'requesting','used_before':sub['character_count'],'requested_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()};ledger['cues'].append(rec);save()
        payload={'text':cue['prompt'],'duration_seconds':cue['duration_seconds'],'prompt_influence':.35,'model_id':'eleven_text_to_sound_v2','loop':False}
        try:
            with request('/v1/sound-generation?output_format=mp3_44100_128',payload) as response:
                raw=response.read();rec['billed_header']=response.headers.get('character-cost');rec['request_id']=response.headers.get('request-id')
                if len(raw)<1000 or 'audio' not in response.headers.get('Content-Type',''):raise ValueError('Invalid audio response')
            filename=cue['id']+'_v01.mp3';(SOURCE/filename).write_bytes(raw)
            rec.update(status='saved',file=filename,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
            save();print(json.dumps({'saved':cue['id'],'bytes':len(raw),'billed_header':rec['billed_header'],'spent_before':spent}),flush=True)
            time.sleep(1.5)
        except Exception as err:
            rec.update(status='unknown_outcome',error_type=type(err).__name__);save();raise SystemExit('Stopped after request error; no paid retry: '+cue['id'])
    sub=subscription();ledger['ending_account_used']=sub['character_count'];ledger['account_usage_delta']=sub['character_count']-ledger['starting_account_used'];ledger['billed_response_total']=sum(float(c['billed_header']) for c in ledger['cues'] if c.get('billed_header'));ledger['remaining_credits']=sub['character_limit']-sub['character_count'];save();print(json.dumps({'completed':len(ledger['cues']),'account_usage_delta':ledger['account_usage_delta'],'billed_response_total':ledger['billed_response_total'],'remaining':ledger['remaining_credits']}),flush=True)
if __name__=='__main__':main()
