"""Record the approved cast. User-authorized rotation retires only fully backed-up NPC voices."""
from pathlib import Path
import argparse, datetime, hashlib, json, os, re, time, subprocess, urllib.request, urllib.error

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / 'audio-source/voice/npc-dialogue-20261019'
PUBLIC = ROOT / 'public/3d/npc-voices'
APPROVAL = ROOT / 'docs/audio/npc-voice-approved-20261019.json'

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    temp.replace(path)

def digest(text):
    return hashlib.sha256(text.encode('utf8')).hexdigest()

def inventory():
    approved = json.loads(APPROVAL.read_text(encoding='utf8'))
    cast = json.loads((ROOT / 'docs/audio/npc-voice-casting-20261019.json').read_text(encoding='utf8'))
    lines = []
    for path in sorted((ROOT / 'public/3d/story').glob('*.json')):
        book = json.loads(path.read_text(encoding='utf8'))
        for line_id, node in book.get('nodes', {}).items():
            speaker = node['voice']['speaker']
            assert speaker in approved['characters'], (line_id, speaker)
            text = node['text'].strip()
            assert text and not re.search(r'<[^>]+>|\{\{', text), line_id
            lines.append(dict(id=line_id, speaker=speaker, text=text, sha256=digest(text),
                              file=path.relative_to(ROOT).as_posix()))
    assert len({line['id'] for line in lines}) == len(lines), 'Duplicate stable line ID'
    return approved, cast, lines

def publish(ledger):
    approved, cast, lines = inventory()
    recorded = {}
    for line in lines:
        entry = ledger.get('lines', {}).get(line['id'], {})
        if entry.get('status') != 'saved' or entry.get('sha256') != line['sha256']:
            continue
        assert entry['option'] == approved['characters'][line['speaker']]['selected']
        path = PUBLIC / entry['file']
        assert path.is_file() and digest_bytes(path.read_bytes()) == entry['audio_sha256']
        recorded[line['id']] = {**line, 'audio': './npc-voices/' + entry['file'],
                                'option': entry['option'], 'audio_sha256': entry['audio_sha256']}
    characters = []
    for character in cast['characters']:
        own = [line for line in lines if line['speaker'] == character['id']]
        characters.append(dict(id=character['id'], name=character['name'],
                               option=approved['characters'][character['id']]['selected'],
                               total=len(own), recorded=sum(line['id'] in recorded for line in own)))
    write(PUBLIC / 'manifest.json', dict(schema=1, revision='npc-dialogue-20261019',
          auditionRevision=approved['revision'], lines=recorded, characters=characters,
          totalLines=len(lines), recordedLines=len(recorded),
          legacyShade='Current-canon regional guidance; original safe Briar audition reused exactly.' if any(line['speaker']=='warden_shade' for line in lines) else 'Pending canon-safe migration.'))
    write(ROOT / 'docs/audio/npc-dialogue-script-20261019.json', dict(schema=1, lines=lines))
    return {'total': len(lines), 'recorded': len(recorded), 'characters_complete': sum(c['total'] > 0 and c['recorded'] == c['total'] for c in characters)}

def digest_bytes(raw):
    return hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--generate', action='store_true')
    parser.add_argument('--only', default='thomas,mara,gus,lewis,beth,bethBrother,beastkeeper')
    parser.add_argument('--rotate-owned', action='store_true', help='Authorized 2026-10-19: retire only complete, backed-up ledger-owned NPC voices')
    parser.add_argument('--credit-reserve', type=int, default=100)
    args = parser.parse_args()
    assert args.credit_reserve >= 0
    approved, cast, lines = inventory()
    ledger_path = PRIVATE / 'manifest.json'
    ledger = json.loads(ledger_path.read_text(encoding='utf8')) if ledger_path.exists() else dict(schema=1, revision=approved['revision'], voices={}, lines={})
    if not args.generate:
        print(json.dumps(publish(ledger))); return
    key = os.environ.get('ELEVENLABS_API_KEY', '')
    if not key:
        for line in (ROOT.parents[1] / '.secrets/elevenlabs.env').read_text(encoding='utf-8-sig').splitlines():
            if line.partition('=')[0].strip() == 'ELEVENLABS_API_KEY':
                key = line.partition('=')[2].strip().strip('\"\'')
    def call(path, body=None, audio=False, method=None):
        headers = {'xi-api-key': key, 'Accept': 'audio/mpeg' if audio else 'application/json'}
        if body is not None: headers['Content-Type'] = 'application/json'
        req = urllib.request.Request('https://api.elevenlabs.io' + path, headers=headers,
                                     data=None if body is None else json.dumps(body).encode(), method=method)
        for attempt in range(5):
            try:
                with urllib.request.urlopen(req, timeout=150) as response:
                    raw = response.read()
                    return (raw if audio else json.loads(raw) if raw else {}), {name: response.headers.get(name) for name in ['request-id', 'character-cost', 'history-item-id']}
            except urllib.error.HTTPError as error:
                # Only read-only requests may retry. A paid request never retries here.
                if body is not None or method == 'DELETE' or error.code != 429 or attempt == 4: raise
                time.sleep(min(10, 2 ** (attempt + 1)))
    subscription, _ = call('/v1/user/subscription')
    assert subscription['tier'] != 'free', 'Paid commercial plan required'
    ledger.setdefault('used_before', subscription['character_count'])
    if args.rotate_owned:
        ledger['rotation_authorization'] = 'User 2026-10-19: batch out the rest and delete old character voices; downloaded recordings preserved.'
        write(ledger_path, ledger)
    def complete(speaker):
        own = [line for line in lines if line['speaker'] == speaker]
        return bool(own) and all(ledger['lines'].get(line['id'], {}).get('status') == 'saved' and ledger['lines'][line['id']].get('sha256') == line['sha256'] and ledger['lines'][line['id']].get('option') == approved['characters'][speaker]['selected'] for line in own)
    def retire(available):
        assert args.rotate_owned
        by_id = {voice['voice_id']: voice for voice in available}
        for speaker, saved in ledger['voices'].items():
            if saved['status'] not in ['saved', 'deleting'] or not complete(speaker): continue
            voice = by_id.get(saved['voice_id'])
            if not voice:
                if saved['status'] == 'deleting':
                    saved['status'] = 'retired'; write(ledger_path, ledger)
                continue
            assert voice['name'] == 'Bladefall NPC ' + speaker + ' ' + saved['option']
            # Two independently hashed copies before irreversible provider deletion.
            for line in [line for line in lines if line['speaker'] == speaker]:
                take = ledger['lines'][line['id']]; path = PUBLIC / take['file']; raw = path.read_bytes()
                assert digest_bytes(raw) == take['audio_sha256']
                backup = PRIVATE / 'recording-backups' / take['file']; backup.parent.mkdir(parents=True, exist_ok=True)
                if not backup.exists(): backup.write_bytes(raw)
                assert digest_bytes(backup.read_bytes()) == take['audio_sha256']
                subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', str(backup), '-f', 'null', '-'], check=True, capture_output=True)
            publish(ledger)
            saved.update(status='deleting', backups_verified=True); write(ledger_path, ledger)
            try:
                response, _ = call('/v1/voices/' + saved['voice_id'], method='DELETE')
                assert response.get('status', 'ok') == 'ok'
            except Exception as error:
                saved['delete_http_status'] = getattr(error, 'code', None); write(ledger_path, ledger)
                raise SystemExit('Retirement outcome needs inventory reconciliation: ' + speaker)
            saved.update(status='retired', retired_utc=datetime.datetime.now(datetime.timezone.utc).isoformat()); write(ledger_path, ledger)
            print(json.dumps({'character': speaker, 'voice': 'retired', 'recordings': 'backed_up'}), flush=True)
            return True
        return False
    audition = json.loads((ROOT / 'audio-source/voice/npc-auditions-20261019/manifest.json').read_text(encoding='utf8'))
    selected = args.only.split(',') if args.only != 'all' else [c['id'] for c in cast['characters']]
    for c in cast['characters']:
        if c['id'] not in selected: continue
        own = [line for line in lines if line['speaker'] == c['id']]
        if not own: continue
        if complete(c['id']): continue
        option = approved['characters'][c['id']]['selected']
        entry = ledger['voices'].get(c['id'])
        if entry and entry['status'] != 'saved': raise SystemExit('Uncertain voice promotion: ' + c['id'])
        if not entry:
            available, _ = call('/v1/voices')
            custom = [v for v in available['voices'] if v.get('category') != 'premade']
            if len(custom) >= subscription['voice_limit']:
                if not args.rotate_owned or not retire(custom):
                    print('Voice slots exhausted; no complete authorized voice can retire.', flush=True); break
            name = 'Bladefall NPC ' + c['id'] + ' ' + option
            # Reconcile an interrupted successful creation by its unique owned name.
            existing = [v for v in custom if v['name'] == name]
            if existing:
                assert len(existing) == 1
                entry = dict(status='saved', voice_id=existing[0]['voice_id'], option=option)
            else:
                preview = next(p for p in audition['characters'][c['id']]['previews'] if p['option'] == option)
                ledger['voices'][c['id']] = dict(status='requesting', option=option); write(ledger_path, ledger)
                try:
                    response, _ = call('/v1/text-to-voice', dict(voice_name=name, voice_description=c['voice_description'], generated_voice_id=preview['generated_voice_id']))
                except Exception as error:
                    ledger['voices'][c['id']].update(status='unknown_outcome', http_status=getattr(error, 'code', None))
                    write(ledger_path, ledger); raise SystemExit('Voice promotion stopped safely: ' + c['id'])
                entry = dict(status='saved', voice_id=response['voice_id'], option=option)
            ledger['voices'][c['id']] = entry; write(ledger_path, ledger)
        assert entry['option'] == option
        for i, line in enumerate(own):
            old = ledger['lines'].get(line['id'])
            if old:
                if old['status'] != 'saved': raise SystemExit('Uncertain recording; reconcile before retry: ' + line['id'])
                if old['sha256'] == line['sha256'] and old['option'] == option: continue
                raise SystemExit('Script changed; preserve old take and explicitly revise: ' + line['id'])
            sub, _ = call('/v1/user/subscription')
            if sub['character_limit'] - sub['character_count'] < len(line['text']) + args.credit_reserve:
                print('Credit reservation reached; recordings retained.', flush=True); print(json.dumps(publish(ledger))); return
            take = dict(status='requesting', sha256=line['sha256'], option=option, used_before=sub['character_count'])
            ledger['lines'][line['id']] = take; write(ledger_path, ledger)
            body = dict(text=line['text'], model_id='eleven_multilingual_v2',
                        voice_settings=dict(stability=.5, similarity_boost=.8, style=.15, use_speaker_boost=True))
            if i: body['previous_text'] = own[i-1]['text']
            try:
                raw, receipt = call('/v1/text-to-speech/' + entry['voice_id'] + '?output_format=mp3_44100_128', body, audio=True)
                assert len(raw) > 500 and not raw.startswith(b'{')
                filename = line['id'] + '-' + line['sha256'][:12] + '.mp3'
                PUBLIC.mkdir(parents=True, exist_ok=True)
                (PUBLIC / filename).write_bytes(raw)
                take.update(status='saved', file=filename, audio_sha256=digest_bytes(raw), bytes=len(raw), receipt=receipt)
                write(ledger_path, ledger)
            except Exception as error:
                take.update(status='unknown_outcome', http_status=getattr(error, 'code', None))
                write(ledger_path, ledger); raise SystemExit('Recording stopped safely: ' + line['id'])
            print(json.dumps({'line': line['id'], 'status': 'saved', 'bytes': len(raw)}), flush=True)
        print(json.dumps(publish(ledger)), flush=True)
    sub, _ = call('/v1/user/subscription')
    ledger.update(remaining=sub['character_limit']-sub['character_count'], used_after=sub['character_count'])
    write(ledger_path, ledger)
    print(json.dumps({**publish(ledger), 'remaining': ledger['remaining']}))

if __name__ == '__main__': main()
