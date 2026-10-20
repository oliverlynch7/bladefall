from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'public/3d/index.html').read_text(encoding='utf-8')
s=s.replace('<head>','<head><base href="/3d/">',1)
s=s.replace('</body>','<script>'+(r/'scripts/qa-continuous-journey.js').read_text(encoding='utf-8')+'</script></body>')
(r/'public/3d/.qa-continuous-journey.html').write_text(s,encoding='utf-8')
print('Local-only observer build. Use fresh port 4375. No gameplay/input changes; generated HTML must not ship.')
