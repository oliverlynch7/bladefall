"""Arrange Blender review renders without altering game assets."""
import json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[2]
records=json.loads((ROOT/'public/3d/enemy-assets/upgraded/manifest-v2141.json').read_text())
folder=ROOT/'output/enemy-roster-upgrade-v2141'
width,height=290,350
sheet=Image.new('RGB',(width*7,height*((len(records)+6)//7)),(20,25,31))
draw=ImageDraw.Draw(sheet)
for i,rec in enumerate(records):
 src=folder/(rec['type']+'.png')
 if not src.exists():continue
 im=Image.open(src).convert('RGB');im.thumbnail((width-8,height-35))
 x=(i%7)*width+(width-im.width)//2;y=(i//7)*height
 sheet.paste(im,(x,y))
 draw.text(((i%7)*width+12,y+height-26),rec['type'],fill='#f0e9dd')
sheet.save(folder/'contact.jpg',quality=90)
