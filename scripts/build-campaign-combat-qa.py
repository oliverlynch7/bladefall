from pathlib import Path
import runpy
runpy.run_path('scripts/build-player-readiness-qa.py')
p=Path('public/3d/.qa-readiness.html');s=p.read_text(encoding='utf-8');payload=Path('scripts/qa-campaign-combat-page.js').read_text(encoding='utf-8-sig');Path('public/3d/.qa-campaign-combat.html').write_text(s.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
