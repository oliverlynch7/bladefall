"""Blender: two affordable, articulated human officer variants of the established enemy kit."""
from pathlib import Path
import json
import bpy
source=Path(__file__).with_name('build_articulated_enemy_art.py')
text=source.read_text(encoding='utf-8').split('args=sys.argv')[0]
text=text.replace("if name in {'brute','warden'}:origins['weapon']", "if name in {'brute','warden','sentinel'}:origins['weapon']")
scope={'__file__':str(source),'__name__':'officer_art'}
exec(compile(text,str(source),'exec'),scope)
out=source.resolve().parents[2]/'public/3d/enemy-assets/officers'
out.mkdir(parents=True,exist_ok=True);scope['OUT']=out
base_ico,base_box=scope['ico'],scope['box']
stats=[]
for role in ['shield','spear']:
 scope['THEME']['sentinel']='ice'
 scope['P']['ice']=['293c46','6c8791','b8c3bf','ac9164' if role=='spear' else '77aabc']
 def ico(pos,scale,col=1,b='body',sub=1):
  if pos==(-.34,-.09,.53):
   if role=='spear':return
   scale=(.20,.055,.27)
  return base_ico(pos,scale,col,b,sub)
 def box(pos,scale,col=1,b='body'):
  if role=='spear' and pos==(-.34,-.146,.53):return
  return base_box(pos,scale,col,b)
 def blade(**kwargs):
  # Both handles meet the palm. A separate wrist child lets the shaft aim independently.
  x,z=.33,.36
  if role=='spear':
   scope['cone']((x,-.09,-.12),(x,-.09,.96),.018,.017,0,'weapon',8)
   scope['cone']((x,-.09,.94),(x,-.09,1.17),.065,0,2,'weapon',4)
   for dz in [-.05,0,.05]:base_box((x,-.09,z+dz),(.045,.047,.018),3,'weapon')
  else:
   base_box((x,-.09,z),(.045,.05,.18),0,'weapon')
   base_box((x,-.09,z+.1),(.17,.065,.035),3,'weapon')
   scope['cone']((x,-.09,z+.12),(x,-.09,z+.45),.06,0,2,'weapon',4)
 scope.update(ico=ico,box=box,blade=blade)
 stat=scope['build']('sentinel');old=out/stat['file'];new=out/(role+'.glb');old.replace(new);stat.update(type='officer-'+role,file=new.name,role=role);stats.append(stat)
(out/'manifest.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print('FROST_OFFICERS',json.dumps(stats))
