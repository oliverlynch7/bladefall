from pathlib import Path
r=Path(__file__).resolve().parents[1]
panel=(r/'scripts/briar-district-qa-panel.html').read_text(encoding='utf-8')
s=(r/'public/3d/index.html').read_text(encoding='utf-8').replace('<head>','<head><base href="/3d/">',1)
s=s.replace('</body>',panel+'<script>'+(r/'scripts/qa-briar-district.js').read_text(encoding='utf-8')+'</script></body>')
(r/'public/3d/.qa-briar-district.html').write_text(s,encoding='utf-8')
(r/'public/3d/.qa-briar-district-legacy.json').write_bytes((r/'docs/art-validation/player-readiness-20261020/legacy-storage.json').read_bytes())
print('Local-only staged district QA; must not publish the generated page.')
