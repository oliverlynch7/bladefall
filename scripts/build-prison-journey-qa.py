"""Build local-only Dungeons fixtures, including a genuine old save producer."""
from pathlib import Path
import subprocess,re
root=Path(__file__).resolve().parents[1]
base='6360c7df'
payload=(root/'scripts/qa-prison-journey-page.js').read_text(encoding='utf-8')
for kind in ['before','current']:
 source=subprocess.check_output(['git','show',base+':public/3d/index.html'],cwd=root).decode('utf-8') if kind=='before' else (root/'public/3d/index.html').read_text(encoding='utf-8')
 source=source.replace('<head>','<head><base href="/3d/">',1).replace('if(m && m[1]!==VERSION3D)','if(false && m && m[1]!==VERSION3D)')
 if kind=='before':
  for name in ['prison-dungeons','campaign-geography','party-navigation']:
   old=subprocess.check_output(['git','show',base+':public/3d/'+name+'.js'],cwd=root).decode('utf-8')
   source=re.sub(r'<script src="\./'+name+r'\.js\?[^" ]+"></script>',lambda m:'<script>'+old+'</script>',source)
 # Old game logic produces the save; current art gets an empty optional sign list.
 # This does not patch old gameplay or persistence, and is not an old-art comparison.
 compat='window.BFPrison.SIGNS=[];' if kind=='before' else ''
 source=source.replace('</body>','<script>'+compat+payload+'</script></body>')
 (root/'public/3d'/('.qa-prison-'+kind+'.html')).write_text(source,encoding='utf-8')
co=root/'scripts/qa-prison-journey-coop.html'
if co.exists():(root/'public/3d/.qa-prison-coop.html').write_text(co.read_text(encoding='utf-8'),encoding='utf-8')
print('Built Dungeons fixtures from '+base+' and current sources.')
