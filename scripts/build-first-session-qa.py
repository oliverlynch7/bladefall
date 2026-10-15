from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=(root/'public/3d/index.html').read_text(encoding='utf-8')
payload=(root/'scripts/qa-first-session-observer.js').read_text(encoding='utf-8')
source=source.replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
(root/'public/3d/.qa-first-session.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built observer-only localhost page; never commit the generated public file.')
import json
baseline=root/'docs/art-validation/first-session-20261015/return-after-boss.json'
if baseline.exists():
    payload='window.firstSessionBaseline='+json.dumps(json.loads(baseline.read_text(encoding='utf-8'))['save'])+';\n'+(root/'scripts/qa-first-session-fixes.js').read_text(encoding='utf-8')
    (root/'public/3d/.qa-first-session-fixes.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
    print('Built separate staged regression page. Use a different localhost origin.')
