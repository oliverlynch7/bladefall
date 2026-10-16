"""Local-only earned-build journey. Generated pages are never published."""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[1]
source = (root/'public/3d/index.html').read_text(encoding='utf-8')
source = source.replace('if(m && m[1]!==VERSION3D)', 'if(false && m && m[1]!==VERSION3D)')
# Keep unrelated ongoing companion work out of this review.
companion = subprocess.check_output(['git', 'show', 'HEAD:public/3d/companion3d.js'], cwd=root)
(root/'public/3d/.qa-hollow-companion.js').write_bytes(companion)
import re
source = re.sub(r'companion3d\.js\?v=[^"\s]+', '.qa-hollow-companion.js', source)
baseline = json.loads((root/'docs/art-validation/first-session-20261015/return-after-boss.json').read_text(encoding='utf-8'))['save']
payload = 'window.firstBossBaseline='+json.dumps(baseline)+';\n'
earned_path = root/'docs/art-validation/hollow-review-20261015/canyon-arrival-before.json'
if earned_path.exists():
    payload += 'window.hollowEarnedBaseline='+json.dumps(json.loads(earned_path.read_text(encoding='utf-8'))['save'])+';\n'
payload += (root/'scripts/qa-first-boss-review.js').read_text(encoding='utf-8')
payload += '\n'+(root/'scripts/qa-hollow-review.js').read_text(encoding='utf-8')
(root/'public/3d/.qa-hollow-review.html').write_text(source.replace('</body>', '<script>'+payload+'</script></body>'), encoding='utf-8')
print('Built localhost-only Hollow review.')
