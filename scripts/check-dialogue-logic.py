import json,subprocess,sys
from pathlib import Path
checked=0
for p in Path('public/3d/story').glob('*.json'):
 old=json.loads(subprocess.check_output(['git','show',(sys.argv[1] if len(sys.argv)>1 else 'HEAD~1')+':'+p.as_posix()]));new=json.loads(p.read_text(encoding='utf-8'))
 assert old.keys()==new.keys(),p
 for k,n in new.get('nodes',{}).items():
  a=old['nodes'][k];strip=lambda v:{x:y for x,y in v.items() if x not in ['text','voice','choices']}
  assert strip(a)==strip(n),(p,k,'node logic')
  clean=lambda rows:[{k:v for k,v in row.items() if k not in ['text','optional']} for row in rows]
  assert clean(a.get('choices',[]))==clean(n.get('choices',[])),(p,k,'choice logic')
  checked+=1
print('Preserved node/choice IDs, gates, effects and transitions:',checked)
