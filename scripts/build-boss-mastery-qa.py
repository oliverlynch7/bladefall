from pathlib import Path
import runpy
runpy.run_path('scripts/build-player-readiness-qa.py')
s=Path('public/3d/.qa-readiness.html').read_text(encoding='utf-8');payload=Path('scripts/qa-boss-mastery-page.js').read_text(encoding='utf-8-sig');Path('public/3d/.qa-boss-mastery.html').write_text(s.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
