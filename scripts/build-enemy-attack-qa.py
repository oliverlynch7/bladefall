from pathlib import Path
import runpy
runpy.run_path('scripts/build-player-readiness-qa.py')
s=Path('public/3d/.qa-readiness.html').read_text(encoding='utf8')
payload=Path('scripts/qa-enemy-attack-page.js').read_text(encoding='utf8')
Path('public/3d/.qa-enemy-attacks.html').write_text(s.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf8')
