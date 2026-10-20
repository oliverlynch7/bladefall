"""Offline adversarial tests. No account or paid provider requests are made."""
from pathlib import Path
import contextlib, hashlib, importlib.util, io, json, os, sys, tempfile
from unittest.mock import patch
import urllib.error

spec = importlib.util.spec_from_file_location('recorder', Path(__file__).with_name('record-npc-dialogue.py'))
recorder = importlib.util.module_from_spec(spec); spec.loader.exec_module(recorder)

def run_case(case):
    with tempfile.TemporaryDirectory(prefix='bladefall-voice-rotation-') as directory:
        root = Path(directory)
        private = root/'audio-source/voice/npc-dialogue-20261019'
        public = root/'public/3d/npc-voices'
        approval = root/'docs/audio/npc-voice-approved-20261019.json'
        for path in [private, public, approval.parent, root/'public/3d/story']: path.mkdir(parents=True, exist_ok=True)
        def save(path, value): recorder.write(path, value)
        text = 'Keep the road safe.'; raw = b'ID3' + b'x'*1200
        take = dict(status='saved', option='A', sha256=recorder.digest(text), file='thomas.mp3', audio_sha256=recorder.digest_bytes(raw))
        (public/'thomas.mp3').write_bytes(raw)
        nodes = {'thomas.first': {'text':text, 'voice':{'speaker':'thomas'}}, 'grant.first': {'text':'Help the prisoners.', 'voice':{'speaker':'grant'}}}
        if case == 'stale_script': nodes['thomas.first']['text'] = 'A revised line, not recorded yet.'
        save(root/'public/3d/story/test.json', {'nodes':nodes})
        cast = {'revision':'test', 'characters':[dict(id=id, name=id, voice_description='A kind fictional voice with clear delivery.') for id in ['thomas','grant']]}
        save(root/'docs/audio/npc-voice-casting-20261019.json', cast)
        save(approval, {'revision':'test', 'characters':{id:{'selected':'A'} for id in ['thomas','grant']}})
        save(root/'audio-source/voice/npc-auditions-20261019/manifest.json', {'characters':{'grant':{'previews':[{'option':'A','generated_voice_id':'grant-preview'}]}}})
        save(private/'manifest.json', {'schema':1,'voices':{'thomas':{'status':'saved','voice_id':'owned-thomas','option':'A'}},'lines':{'thomas.first':take}})
        voices = [{'voice_id':'narrator','name':'Bladefall Narrator B','category':'generated'}, {'voice_id':'owned-thomas','name':'Bladefall NPC thomas A','category':'generated'}]
        if case == 'wrong_owner': voices[1]['name'] = 'Unrelated account voice'
        if case == 'bad_backup':
            (private/'recording-backups').mkdir();(private/'recording-backups/thomas.mp3').write_bytes(b'tampered')
        deleted=[]; paid=[]; decoded=[]
        class Response:
            headers={}
            def __init__(self,value): self.raw=value if isinstance(value,bytes) else json.dumps(value).encode()
            def __enter__(self): return self
            def __exit__(self,*args): pass
            def read(self): return self.raw
        def api(request,timeout=None):
            url=request.full_url; method=request.get_method()
            if url.endswith('/user/subscription'): return Response(dict(tier='starter',character_count=0,character_limit=10000,voice_limit=2))
            if url.endswith('/voices') and method=='GET': return Response({'voices':voices[:]})
            if method=='DELETE':
                assert url.endswith('/owned-thomas'), 'Only the ledger-owned completed NPC can retire'
                assert decoded and (private/'recording-backups/thomas.mp3').read_bytes()==raw
                assert json.loads((public/'manifest.json').read_text())['lines']['thomas.first']['audio_sha256']==take['audio_sha256']
                voices.pop(1);deleted.append('owned-thomas');return Response({'status':'ok'})
            if url.endswith('/text-to-voice'):
                body=json.loads(request.data);assert body['generated_voice_id']=='grant-preview'
                voices.append(dict(voice_id='new-grant',name=body['voice_name'],category='generated'));return Response({'voice_id':'new-grant'})
            if '/text-to-speech/new-grant?' in url:
                paid.append('grant')
                if case=='paid_failure': raise urllib.error.HTTPError(url,503,'test failure',None,None)
                return Response(raw)
            raise AssertionError('Unexpected request: '+method+' '+url)
        def execute():
            with patch.object(recorder,'ROOT',root),patch.object(recorder,'PRIVATE',private),patch.object(recorder,'PUBLIC',public),patch.object(recorder,'APPROVAL',approval),patch.dict(os.environ,{'ELEVENLABS_API_KEY':'test-only-no-network'}),patch.object(sys,'argv',['test','--generate','--only','all','--rotate-owned']),patch.object(recorder.urllib.request,'urlopen',api),patch.object(recorder.subprocess,'run',side_effect=lambda *a,**kw:decoded.append(True)),contextlib.redirect_stdout(io.StringIO()):
                recorder.main()
        if case in ['wrong_owner','bad_backup']:
            try: execute();raise RuntimeError('Unsafe retirement was not rejected')
            except AssertionError: pass
            assert not deleted and not paid
        elif case=='stale_script':
            # Exclude this incomplete speaker from generation, while keeping it as a
            # retirement candidate: a stale recording cannot free a slot for Grant.
            original=cast['characters'];cast['characters']=[original[1]];save(root/'docs/audio/npc-voice-casting-20261019.json',cast)
            execute();assert not deleted and not paid
        elif case=='paid_failure':
            for attempt in range(2):
                try: execute();raise RuntimeError('Unknown paid outcome should stop')
                except SystemExit: pass
            assert paid==['grant'], 'A failed paid generation must never silently retry'
        else:
            execute();assert deleted==['owned-thomas'] and paid==['grant']
            execute();assert deleted==['owned-thomas'] and paid==['grant'], 'Resume must not pay or delete twice'
            ledger=json.loads((private/'manifest.json').read_text());assert ledger['voices']['thomas']['status']=='retired'
        assert voices[0]['voice_id']=='narrator', 'Narrator untouched'
        return case

if __name__=='__main__':
    print(json.dumps({'passed':[run_case(case) for case in ['normal_resume','wrong_owner','bad_backup','stale_script','paid_failure']], 'network':'mocked; no credits used'}))
