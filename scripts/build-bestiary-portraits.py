from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'public/3d/art-previews/enemies'
UP=ROOT/'output/enemy-roster-upgrade-v2141'
OUT=ROOT/'public/3d/bestiary-portraits'
OUT.mkdir(parents=True,exist_ok=True)
names=[r['type'] for r in json.loads((ROOT/'public/3d/enemy-assets/manifest.json').read_text())]
beasts=set('charger dustjackal cragspitter thornboar sporeback frostshell magmaskit prison_hound prison_maw'.split())
flyers=set('flyer shadeling sparkling galewisp voidtether'.split())
rounds=set('slime slimelet mimic bosscrystal embertotem prison_vessel'.split())
def crop_avatar(name,source):
 im=Image.open(source).convert('RGB');w,h=im.size
 if name in beasts:box=(.11,.12,.75,.67)
 elif name in flyers:box=(.12,.10,.88,.74)
 elif name in rounds:box=(.13,.16,.87,.78)
 else:box=(.24,.10,.76,.54)
 x0,y0,x1,y1=(int(box[0]*w),int(box[1]*h),int(box[2]*w),int(box[3]*h))
 side=max(x1-x0,y1-y0);cx=(x0+x1)//2;cy=(y0+y1)//2
 x0=max(0,min(w-side,cx-side//2));y0=max(0,min(h-side,cy-side//2))
 return im.crop((x0,y0,x0+side,y0+side)).resize((256,256),Image.Resampling.LANCZOS)
for name in names:
 source=(UP/f'{name}.png') if (UP/f'{name}.png').exists() else (SRC/f'{name}.png')
 if not source.exists():raise FileNotFoundError(name)
 crop_avatar(name,source).save(OUT/f'{name}.webp','WEBP',quality=88,method=6)
for name in ['officer-shield','officer-spear']:
 source=UP/f'{name}.png'
 if not source.exists():source=ROOT/'public/3d/art-previews/briar-story'/f'officers-{name.split("-")[1]}.png'
 crop_avatar(name,source).save(OUT/f'{name}.webp','WEBP',quality=88,method=6)
hydra=ROOT/'output/playwright/hydra-first.png'
if hydra.exists():
 im=Image.open(hydra).convert('RGB');portrait=im.crop((585,280,845,540)).resize((256,256),Image.Resampling.LANCZOS)
else:
 im=Image.open(ROOT/'public/3d/art-previews/briar-story/hydra-bite.png').convert('RGB');w,h=im.size;side=min(w,h);portrait=im.crop(((w-side)//2,(h-side)//2,(w+side)//2,(h+side)//2)).resize((256,256),Image.Resampling.LANCZOS)
portrait.save(OUT/'hydra.webp','WEBP',quality=88,method=6)
for name in 'prison_pike prison_guard prison_hound prison_vessel prison_bell prison_maw prison_unbound'.split():
 source=UP/f'{name}.png'
 if not source.exists():raise FileNotFoundError(source)
 crop_avatar(name,source).save(OUT/f'{name}.webp','WEBP',quality=88,method=6)
print('Portraits:',len(list(OUT.glob('*.webp'))))
