"""One authorized Voice Design audition, resumable without retrying uncertain charges."""
from pathlib import Path
import argparse, base64, datetime, hashlib, json, os, urllib.request, urllib.error

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'audio-source/voice/narrator-audition-20261018'
PUBLIC = ROOT / 'public/3d/narrator-preview'
TEXT = ("Welcome to Bladefall. Let's get you ready. "
        "Press E to continue. Q takes you back. Tab opens the main menu, and B opens your bag. "
        "Hold Space to jump higher. There's no rush. The enemies can wait. "
        "The lord promised eternal life. Families came, hoping to save the people they loved.")
DESCRIPTION = ("An original male British English narrator in his fifties, with a clear educated southern English accent. "
               "Warm, rounded mid-to-low register, articulate consonants and a relaxed conversational pace. "
               "A quietly amused, dry sense of humour, like a patient and observant storyteller welcoming a new adventurer. "
               "Inviting and reassuring when teaching controls; sincere and gently compelling when explaining history. "
               "Natural human phrasing and small thoughtful pauses. Restrained theatrical confidence, no booming trailer delivery, "
               "no sneering, no breathy whispering. Clean close studio recording without music or sound effects.")

def main():
    p = argparse.ArgumentParser(); p.add_argument('--generate', action='store_true'); p.add_argument('--save-voices', action='store_true'); a = p.parse_args()
    if not a.generate:
        print(json.dumps({'characters': len(TEXT), 'expected_previews': 3, 'max_credit_reservation': 3000, 'script': TEXT})); return
    key = os.environ.get('ELEVENLABS_API_KEY', '')
    if not key:
        for line in (ROOT.parents[1] / '.secrets/elevenlabs.env').read_text(encoding='utf-8-sig').splitlines():
            if line.partition('=')[0].strip() == 'ELEVENLABS_API_KEY': key = line.partition('=')[2].strip().strip('\"\'')
    def call(path, body=None):
        headers = {'xi-api-key': key, 'Accept': 'application/json'}
        if body is not None: headers['Content-Type'] = 'application/json'
        req = urllib.request.Request('https://api.elevenlabs.io' + path, data=None if body is None else json.dumps(body).encode(), headers=headers)
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r), {'request_id': r.headers.get('request-id'), 'character_cost': r.headers.get('character-cost')}
    SOURCE.mkdir(parents=True, exist_ok=True); PUBLIC.mkdir(parents=True, exist_ok=True)
    ledger_file = SOURCE / 'manifest.json'
    ledger = json.loads(ledger_file.read_text(encoding='utf8')) if ledger_file.exists() else {}
    def save(): ledger_file.write_text(json.dumps(ledger, indent=2) + '\n', encoding='utf8')
    sub, _ = call('/v1/user/subscription')
    before = sub['character_count']; available = sub['character_limit'] - before
    if sub.get('tier') == 'free' or available < 3000: raise SystemExit('Paid account with audition reservation required')
    if not ledger:
        ledger.update(status='requesting', provider='ElevenLabs', model='eleven_multilingual_ttv_v2', text=TEXT, voice_description=DESCRIPTION,
                      text_sha256=hashlib.sha256(TEXT.encode()).hexdigest(), plan=sub['tier'], used_before=before,
                      max_credit_reservation=3000, requested_utc=datetime.datetime.now(datetime.timezone.utc).isoformat())
        save()
        try:
            result, receipt = call('/v1/text-to-voice/design?output_format=mp3_44100_128', {
                'voice_description': DESCRIPTION, 'model_id': ledger['model'], 'text': TEXT,
                'auto_generate_text': False, 'seed': 471820, 'guidance_scale': 5, 'loudness': 0,
                'stream_previews': False, 'should_enhance': False})
            # Preserve the raw successful response before any transformation or voice-library call.
            (SOURCE / 'provider-response.json').write_text(json.dumps(result), encoding='utf8')
            ledger.update(status='response_saved', receipt=receipt); save()
        except Exception as err:
            ledger.update(status='unknown_outcome', error_type=type(err).__name__, http_status=getattr(err, 'code', None)); save()
            raise SystemExit('Generation not retried; inspect the saved request status before continuing')
    if ledger['status'] in ['requesting', 'unknown_outcome']: raise SystemExit('Uncertain previous request: no automatic paid retry')
    if ledger.get('status') == 'saved' and all((PUBLIC / r['file']).exists() and (not a.save_voices or r.get('voice_id')) for r in ledger.get('previews', [])):
        print(json.dumps({'status': 'already_saved', 'previews': len(ledger['previews']), 'credits_remaining': available})); return
    result = json.loads((SOURCE / 'provider-response.json').read_text(encoding='utf8'))
    if result.get('text') != TEXT or len(result.get('previews', [])) != 3: raise SystemExit('Unexpected transcript or preview count; preserve response for review')
    records = ledger.setdefault('previews', [])
    for i, item in enumerate(result['previews']):
        label = 'ABC'[i]; name = 'voice-' + label.lower() + '.mp3'; raw = base64.b64decode(item['audio_base_64'], validate=True)
        if len(raw) < 1000: raise SystemExit('Invalid preview audio size')
        (SOURCE / name).write_bytes(raw); (PUBLIC / name).write_bytes(raw)
        rec = next((r for r in records if r['option'] == label), None)
        if rec is None:
            rec = {'option': label, 'file': name, 'generated_voice_id': item['generated_voice_id'], 'provider_duration': item.get('duration_secs'),
                   'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}; records.append(rec); save()
        if a.save_voices and not rec.get('voice_id'):
            if rec.get('library_status') in ['requesting', 'uncertain']: raise SystemExit('Uncertain voice save: inspect library before retrying')
            rec['library_status'] = 'requesting'; save()
            try:
                v, _ = call('/v1/text-to-voice', {'voice_name': 'Bladefall Narrator ' + label,
                            'voice_description': DESCRIPTION, 'generated_voice_id': rec['generated_voice_id'],
                            'labels': {'language': 'en', 'accent': 'british', 'use_case': 'narration'}})
                rec.update(voice_id=v['voice_id'], library_status='saved'); save()
            except Exception as err:
                rec.update(library_status='uncertain', error_type=type(err).__name__, http_status=getattr(err, 'code', None)); save()
                raise SystemExit('Voice save uncertain; no automatic retry')
    after, _ = call('/v1/user/subscription')
    ledger.update(status='saved', used_after=after['character_count'], credits_remaining=after['character_limit']-after['character_count'],
                  observed_credit_delta=after['character_count']-ledger['used_before']); save()
    public = {'title': 'Bladefall narrator audition', 'text': TEXT, 'options': [{'id':r['option'], 'file':r['file'], 'duration':r['provider_duration']} for r in records]}
    (PUBLIC / 'audition.json').write_text(json.dumps(public, indent=2) + '\n', encoding='utf8')
    print(json.dumps({'status': ledger['status'], 'previews': len(records), 'saved_library_voices': sum(bool(r.get('voice_id')) for r in records),
                      'observed_credit_delta': ledger['observed_credit_delta'], 'credits_remaining': ledger['credits_remaining']}))

if __name__ == '__main__': main()
