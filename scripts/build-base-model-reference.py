from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'public'/'reference'
OUT.mkdir(exist_ok=True)
sheet = Image.new('RGB',(2100,1710),'#17222e')
d = ImageDraw.Draw(sheet)
font = lambda n: ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
bold = lambda n: ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',n)
d.text((55,28),'BLADEFALL | SIX BASE CHARACTER MODELS',font=bold(48),fill='#f2d79c')
d.text((55,94),'Original game meshes and textures • Blender reference renders • Full-body front views',font=font(27),fill='#d4e2ec')
rows=[('Warrior','Warrior / Berserker / Pirate'),('Ranger','Ranger / Beastmaster / Skylancer'),('Wizard','Mage / Pyromancer / Stormcaller / Warlock'),('Rogue','Reaper / Ninja / Bladedancer'),('Cleric','Paladin'),('Monk','Monk')]
for i,(name,classes) in enumerate(rows):
    x=(i%3)*700;y=155+(i//3)*745
    im=Image.open(ROOT/'output'/'base-model-reference'/(name+'.png')).convert('RGB')
    # Preserve the full rendered body, trimming only unused studio backdrop.
    sheet.paste(im.crop((0,0,700,680)),(x,y))
    d.text((x+25,y+606),name.upper(),font=bold(31),fill='#ffffff')
    d.text((x+25,y+650),classes,font=font(21),fill='#dce7f0')
    if name=='Wizard':
        d.text((x+25,y+680),'Also Necromancer / Chronomancer',font=font(21),fill='#dce7f0')
d.text((55,1661),'Base assets only: gameplay face overlays, class recolors, equipment and Rank 5/10 additions are not shown.',font=font(23),fill='#b7c9d8')
sheet.save(OUT/'bladefall-six-base-models.png')
