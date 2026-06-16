"""Generate BLADEFALL PNG icons (apple-touch-icon 180 + 512 maskable)
matching icon.svg: near-black rounded square + amber sword."""
from PIL import Image, ImageDraw

def make(size, pad_ratio):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radius = int(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=(11, 12, 16, 255))

    amber = (232, 163, 61, 255)
    amber_lt = (247, 215, 154, 255)
    steel = (207, 214, 223, 255)
    grey = (139, 143, 154, 255)

    s = size / 256.0  # scale from 256 design space

    # blade (amber diamond-tip sword pointing up-right)
    blade = [(168*s,56*s),(196*s,84*s),(104*s,176*s),(86*s,178*s),(88*s,160*s)]
    d.polygon(blade, fill=amber, outline=amber_lt)
    # crossguard
    d.line([(70*s,150*s),(106*s,186*s)], fill=steel, width=int(12*s))
    # hilt
    d.line([(64*s,176*s),(88*s,200*s)], fill=grey, width=int(12*s))
    # pommel
    r = 9*s
    d.ellipse([60*s-r,200*s-r,60*s+r,200*s+r], fill=amber)
    return img

base = r"C:\Users\Oliver\Documents\PraxisBrain\_automation\bladefall\public"
make(180, 0).save(base + r"\apple-touch-icon.png")
make(512, 0).save(base + r"\icon-512.png")
print("icons saved to", base)
