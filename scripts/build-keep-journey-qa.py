"""Build localhost-only Broken Walls before/current verification pages."""
from pathlib import Path
import subprocess,re
root=Path(__file__).resolve().parents[1]
base='b4fbfa47'
payload=(root/'scripts/qa-keep-journey-page.js').read_text(encoding='utf-8')
for kind in ['before','current']:
 source=subprocess.check_output(['git','show',base+':public/3d/index.html'],cwd=root).decode('utf-8') if kind=='before' else (root/'public/3d/index.html').read_text(encoding='utf-8')
 source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
 if kind=='before':
  for name in ['broken-walls','campaign-geography','party-navigation']:
   old=subprocess.check_output(['git','show',base+':public/3d/'+name+'.js'],cwd=root).decode('utf-8')
   source=re.sub(r'<script src="\./'+name+r'\.js\?[^" ]+"></script>',lambda m:'<script>'+old+'</script>',source)
 source=source.replace('</body>','<script>'+payload+'</script></body>')
 (root/'public/3d'/('.qa-keep-'+kind+'.html')).write_text(source,encoding='utf-8')
print('Built local Broken Walls fixtures from '+base+' and working sources.')
(root/'public/3d/.qa-keep-coop.html').write_text((root/'scripts/qa-keep-journey-coop.html').read_text(encoding='utf-8'),encoding='utf-8')
