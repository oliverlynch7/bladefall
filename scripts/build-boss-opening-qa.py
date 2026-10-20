from pathlib import Path
import runpy
r=Path(__file__).resolve().parents[1]
runpy.run_path(str(r/'scripts/build-boss-mastery-qa.py'))
s=(r/'public/3d/.qa-boss-mastery.html').read_text(encoding='utf-8')
s=s.replace('window.__BF3={','window.firstHourPaintBoss=updateBossBar;window.__BF3={',1)
s=s.replace('function regrabCam(){','function regrabCam(){return;',1)
payload=(r/'scripts/qa-boss-opening-page.js').read_text(encoding='utf-8')
(r/'public/3d/.qa-boss-opening.html').write_text(s.replace('</body>','<script>'+payload+'</script></body>'),encoding='utf-8')
print('Built isolated /3d/.qa-boss-opening.html.')
