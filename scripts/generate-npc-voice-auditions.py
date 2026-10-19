"""Authorized sample-only voice designs. Resume saved results, never unknown paid requests."""
from pathlib import Path
import argparse,base64,datetime,hashlib,json,os,urllib.request,urllib.error
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'audio-source/voice/npc-auditions-20261019'
PUBLIC=ROOT/'public/3d/npc-voice-preview'
CAST=ROOT/'docs/audio/npc-voice-casting-20261019.json'
CAP=10000

def write(p,d):
    p.parent.mkdir(parents=True,exist_ok=True)
    tmp=p.with_suffix(p.suffix+'.tmp');tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8');tmp.replace(p)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--generate',action='store_true');ap.add_argument('--limit',type=int,default=50);ap.add_argument('--balance',action='store_true');a=ap.parse_args()
    cast=json.loads(CAST.read_text(encoding='utf8'));rows=cast['characters']
    if not a.generate and not a.balance:
        print(json.dumps({'characters':len(rows),'preview_characters':sum(len(c['text']) for c in rows),'credit_cap':CAP}));return
    key=os.environ.get('ELEVENLABS_API_KEY','')
    if not key:
        for line in (ROOT.parents[1]/'.secrets/elevenlabs.env').read_text(encoding='utf-8-sig').splitlines():
            if line.partition('=')[0].strip()=='ELEVENLABS_API_KEY':key=line.partition('=')[2].strip().strip('\"\'')
    def call(path,body=None):
        headers={'xi-api-key':key,'Accept':'application/json'}
        if body is not None:headers['Content-Type']='application/json'
        req=urllib.request.Request('https://api.elevenlabs.io'+path,headers=headers,data=None if body is None else json.dumps(body).encode())
        with urllib.request.urlopen(req,timeout=150) as r:
            data=json.load(r);return data,{k:r.headers.get(k) for k in ['request-id','character-cost']}
    def balance():return call('/v1/user/subscription')[0]
    sub=balance()
    if a.balance:
        print(json.dumps({'plan':sub['tier'],'remaining':sub['character_limit']-sub['character_count'],'voice_limit':sub.get('voice_limit')}));return
    assert sub['tier']!='free','Paid plan required'
    SOURCE.mkdir(parents=True,exist_ok=True);PUBLIC.mkdir(parents=True,exist_ok=True)
    mp=SOURCE/'manifest.json';ledger=json.loads(mp.read_text(encoding='utf8')) if mp.exists() else {'revision':cast['revision'],'model_id':'eleven_multilingual_ttv_v2','plan':sub['tier'],'used_before':sub['character_count'],'credit_cap':CAP,'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'characters':{}}
    assert ledger['revision']==cast['revision'];write(mp,ledger)
    completed=0
    for c in rows:
        entry=ledger['characters'].get(c['id']);response=SOURCE/(c['id']+'-response.json')
        if entry and entry['status'] in ['requesting','unknown_outcome']:
            raise SystemExit('Uncertain prior request for '+c['id']+'; inspect before any paid retry')
        if not entry:
            if completed>=a.limit:break
            sub=balance();remaining=sub['character_limit']-sub['character_count'];spent=sub['character_count']-ledger['used_before']
            if remaining<len(c['text'])+250 or spent+len(c['text'])>CAP:raise SystemExit('Credit reservation reached; prior previews retained')
            entry={'status':'requesting','text':c['text'],'voice_description':c['voice_description'],'seed':c['seed'],'used_before':sub['character_count'],'requested_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
            ledger['characters'][c['id']]=entry;write(mp,ledger)
            try:
                data,receipt=call('/v1/text-to-voice/design?output_format=mp3_44100_128',{'voice_description':c['voice_description'],'model_id':ledger['model_id'],'text':c['text'],'auto_generate_text':False,'seed':c['seed'],'guidance_scale':5,'loudness':0,'stream_previews':False,'should_enhance':False})
                write(response,data);entry.update(status='response_saved',receipt=receipt);write(mp,ledger)
            except Exception as e:
                # No response body/logging of credentials or account details.
                entry.update(status='unknown_outcome',error_type=type(e).__name__,http_status=getattr(e,'code',None));write(mp,ledger)
                raise SystemExit('Request outcome uncertain for '+c['id']+'; no automatic retry')
            completed+=1
        data=json.loads(response.read_text(encoding='utf8'))
        assert data.get('text')==c['text'] and len(data['previews'])==3,c['id']
        previews=[]
        for i,p in enumerate(data['previews']):
            label='ABC'[i];name=c['id']+'-'+label.lower()+'.mp3';raw=base64.b64decode(p['audio_base_64'],validate=True);assert len(raw)>1000
            (SOURCE/name).write_bytes(raw);(PUBLIC/name).write_bytes(raw)
            previews.append({'option':label,'file':name,'generated_voice_id':p['generated_voice_id'],'duration':p.get('duration_secs'),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
        entry.update(status='saved',previews=previews);write(mp,ledger)
        if completed:print(json.dumps({'character':c['id'],'status':'saved','options':3}),flush=True)
    sub=balance();ledger.update(used_after=sub['character_count'],credits_remaining=sub['character_limit']-sub['character_count'],observed_credit_delta=sub['character_count']-ledger['used_before']);write(mp,ledger)
    public=[]
    for c in rows:
        entry=ledger['characters'].get(c['id'],{})
        if entry.get('status')=='saved':
            public.append({k:c[k] for k in ['id','name','role','group','context','text','direction','sourceLines']}|{'options':[{k:p[k] for k in ['option','file','duration','sha256','bytes']} for p in entry['previews']]})
    write(PUBLIC/'auditions.json',{'schema':1,'revision':cast['revision'],'dialogueQA':cast['dialogueQA'],'characters':public})
    print(json.dumps({'complete_characters':len(public),'clips':len(public)*3,'observed_credits':ledger['observed_credit_delta'],'remaining':ledger['credits_remaining']}),flush=True)

if __name__=='__main__':main()
