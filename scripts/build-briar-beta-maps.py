"""Rebuild the playable Briar beta's concise route diagrams from authored points."""
from html import escape
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public/design/briar-beta"
W, H = 660, 780


def draw(part, title, z_min, z_max, route, stops, branches, required=()):
    def xy(x, z):
        return (330 + x * 0.225, 92 + (z - z_min) / (z_max - z_min) * 596)

    def path(points):
        return " ".join(f"{xy(x,z)[0]:.1f},{xy(x,z)[1]:.1f}" for x, z in points)

    tags = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{escape(title)} route diagram">',
        '<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#142b30"/><stop offset="1" stop-color="#253c30"/></linearGradient></defs>',
        f'<rect width="{W}" height="{H}" fill="url(#bg)"/>',
        '<rect x="16" y="16" width="628" height="748" rx="18" fill="none" stroke="#9c9a70" stroke-width="2"/>',
        f'<text x="35" y="51" font-family="system-ui" font-size="25" font-weight="800" fill="#fff0c8">{escape(title)}</text>',
        '<text x="36" y="72" font-family="system-ui" font-size="13" fill="#c1d6c9">NORTH ↑ · solid: main route · dashed: optional</text>',
        f'<polyline points="{path(route)}" fill="none" stroke="#35482f" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>',
        f'<polyline points="{path(route)}" fill="none" stroke="#d5b67a" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>',
    ]
    for points in required:
        tags.append(f'<polyline points="{path(points)}" fill="none" stroke="#d5b67a" stroke-width="8" stroke-linecap="round"/>')
    for points in branches:
        tags.append(f'<polyline points="{path(points)}" fill="none" stroke="#b9a0df" stroke-width="7" stroke-dasharray="10 10" stroke-linecap="round"/>')
    for name, x, z, kind, align in stops:
        sx, sy = xy(x, z)
        color = {"main": "#f1c56e", "side": "#bd9ce8", "shard": "#d8a5f0"}[kind]
        tags.extend([
            f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="10" fill="{color}" stroke="#182924" stroke-width="4"/>',
            f'<text x="{sx + (17 if align == "right" else -17):.1f}" y="{sy + 5:.1f}" text-anchor="{ "start" if align == "right" else "end" }" font-family="system-ui" font-size="15" font-weight="700" fill="#f9f5e7" stroke="#182b29" stroke-width="5" stroke-linejoin="round" paint-order="stroke">{escape(name)}</text>',
        ])
    tags.extend([
        '<rect x="33" y="708" width="594" height="40" rx="8" fill="#162c2c" stroke="#6a8277"/>',
        '<text x="48" y="733" font-family="system-ui" font-size="13" fill="#d8e5d5">A route guide, not a hidden puzzle answer. Explore for side paths and shards.</text>',
        '</svg>',
    ])
    (OUT / f"{part}-expansion.svg").write_text("".join(tags), encoding="utf-8")


draw(
    "homefields", "HOMEFIELDS · full beta", -4480, 750,
    [(0, 480), (0, -580), (0, -1130), (-170, -1720), (-420, -2200), (30, -2700), (430, -3200), (160, -3770), (0, -4250)],
    [("Thomas / home", 0, 480, "main", "right"), ("Mara", -360, 220, "main", "left"),
     ("Granary loft", 710, -470, "main", "left"), ("Mill crossing", -575, -710, "main", "left"),
     ("Far bank", 0, -1400, "main", "right"), ("Orchard", -680, -2450, "main", "left"),
     ("Farm climb", -475, -3500, "side", "left"), ("Woods gate", 0, -4250, "main", "right"),
     ("Roof shard", 860, -850, "shard", "left"), ("Bank shard", 775, -1680, "shard", "left")],
    [[(710, -470), (860, -850)], [(0, -1250), (775, -1680)], [(430, -3200), (-475, -3500)]],
    [[(0, 480), (-360, 220)], [(0, 100), (710, -470)], [(0, -430), (-575, -710)]],
)

draw(
    "black-woods", "BLACK WOODS · full beta", -4810, 750,
    [(0, 420), (0, -440), (0, -1010), (0, -1850), (0, -2720), (-350, -3050), (40, -3500), (340, -3830), (0, -4220), (0, -4620)],
    [("Lewis / refuge", 0, 420, "main", "right"), ("Stream crossing", 0, -565, "main", "right"),
     ("Captives / patrol", -760, -1030, "side", "right"), ("Dogs", 690, -1450, "side", "left"),
     ("Signal tower", -40, -1850, "main", "left"), ("Ridge guard", 0, -2560, "main", "right"),
     ("Ranger", 670, -3020, "side", "left"), ("Lumber wagon", -650, -3470, "side", "right"),
     ("Old watch shard", 730, -3740, "shard", "left"), ("Warbeast", 0, -4220, "main", "left"),
     ("Transport order", 0, -4620, "main", "right")],
    [[(0, -1010), (-760, -1030)], [(0, -1450), (690, -1450)],
     [(-350, -3050), (670, -3020)], [(40, -3500), (-650, -3470)], [(40, -3500), (730, -3740)]],
)
