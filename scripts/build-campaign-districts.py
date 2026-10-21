"""Compile the reviewed spatial plan; runtime never guesses locations or rolls layouts."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'public/design/campaign-geography/restructure-plan.json'
data = json.loads(source.read_text(encoding='utf-8'))
assert len(data['maps']) == 16
plans = {m['id']: {k: m[k] for k in ('id', 'title', 'intent', 'blocks', 'climb', 'search', 'boundaries', 'gardenWalls')}
         for m in data['maps']}
target = ROOT / 'public/3d/campaign-district-data.js'
target.write_text('/* Generated from design/campaign-geography/restructure-plan.json. */\n'
    + '(function(root){const plans=' + json.dumps(plans, ensure_ascii=False, separators=(',', ':'))
    + ';root.BFCampaignDistrictPlans=plans;if(typeof module!=="undefined")module.exports=plans;'
    + '})(typeof window!=="undefined"?window:globalThis);\n', encoding='utf-8')
print(f'Compiled {len(plans)} authored districts, '
      f'{sum(len(m["blocks"]) for m in plans.values())} structures and '
      f'{sum(bool(m["climb"]) for m in plans.values())} shard routes.')
