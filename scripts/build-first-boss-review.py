from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
source=(root/'public/3d/index.html').read_text(encoding='utf-8')
source=source.replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
baseline=json.loads((root/'docs/art-validation/first-session-20261015/return-after-boss.json').read_text(encoding='utf-8'))['save']
payload='window.firstBossBaseline='+json.dumps(baseline)+';\n'+(root/'scripts/qa-first-boss-review.js').read_text(encoding='utf-8')
(root/'public/3d/.qa-first-boss.html').write_text(source.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built local staged first-boss review; generated public page must not ship.')
