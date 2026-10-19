import json,subprocess,sys
from pathlib import Path
checked=0
for p in Path('public/3d/story').glob('*.json'):
 old=json.loads(subprocess.check_output(['git','show',(sys.argv[1] if len(sys.argv)>1 else 'HEAD~1')+':'+p.as_posix()]));new=json.loads(p.read_text(encoding='utf-8'))
 assert old.keys()-{'dialoguePolicy'}==new.keys()-{'dialoguePolicy'},p
 for k,n in new.get('nodes',{}).items():
  a=old['nodes'][k];strip=lambda v:{x:y for x,y in v.items() if x not in ['text','voice','choices','topicMenu']}
  assert strip(a)==strip(n),(p,k,'node logic')
  # A note's prose is copy, even when it sits inside a choice effect. Keep
  # its type, ID, region, gates and every non-prose effect field in the check.
  def clean(rows):
   result=[]
   for row in rows:
    item={k:v for k,v in row.items() if k not in ['text','optional','category','retired','priority']}
    if 'effects' in item:
     item['effects']=[{k:v for k,v in effect.items() if k not in ['text','title']}
                      for effect in item['effects']]
    result.append(item)
   return result
  assert clean(a.get('choices',[]))==clean(n.get('choices',[])),(p,k,'choice logic')
  checked+=1
print('Preserved node/choice IDs, gates, effects and transitions:',checked)
