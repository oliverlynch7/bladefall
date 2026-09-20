"""Archive available local session bytes privately; validate requirements references.

Usage: python scripts/archive_decisions.py SESSION_JSONL PRIVATE_OUTPUT_DIRECTORY
The destination must not already exist. Never commit a raw session snapshot.
"""
import hashlib
import json
from pathlib import Path
import re
import sys
from datetime import datetime, timezone


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    source = Path(sys.argv[1]).resolve()
    destination = Path(sys.argv[2]).resolve()
    repo = Path(__file__).resolve().parents[1]
    if destination == repo or repo in destination.parents:
        raise SystemExit('Raw archives must be outside the repository.')
    raw = source.read_bytes()
    records = []
    incomplete = 0
    for line in raw.splitlines():
        try:
            row = json.loads(line)
        except (ValueError, UnicodeDecodeError):
            incomplete += 1
            continue
        payload = row.get('payload', {})
        if row.get('type') == 'response_item' and payload.get('role') == 'user':
            records.append({'id': f'U{len(records)+1:03}',
                            'timestamp': row.get('timestamp'),
                            'content': payload.get('content', [])})
    destination.mkdir(parents=True, exist_ok=False)
    (destination / 'session-snapshot.jsonl').write_bytes(raw)
    (destination / 'user-messages.json').write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
    hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
              for p in destination.iterdir() if p.is_file()}
    manifest = {'source': str(source), 'snapshot_utc': datetime.now(timezone.utc).isoformat(),
                'user_message_count': len(records), 'unparsed_lines': incomplete,
                'files': hashes}
    (destination / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    register = (repo / 'docs/REQUIREMENTS_REGISTER.md').read_text(encoding='utf-8')
    originals = (repo / 'docs/requirements/USER_SOURCE_2026-09-19.md').read_text(encoding='utf-8')
    refs = set(re.findall(r'\bU\d{3}\b', register))
    known = set(re.findall(r'^## (U\d{3})', originals, re.M))
    missing = sorted(refs - known)
    if missing:
        raise SystemExit('Archived, but register references missing sources: ' + ', '.join(missing))
    print(json.dumps({'archive': str(destination), 'messages': len(records),
                      'unparsed_lines': incomplete, 'source_references_valid': True}))


if __name__ == '__main__':
    main()
