"""Authored presentation policy. Retain legacy nodes and effects for saved cursors."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SIDE = ('briar.gus.', 'briar.beth.', 'briar.bethBrother.', 'rk.felix.',
        'ic.hugo.', 'hp.skip.', 'kd.sly.', 'sc.rose.', 'tc.dash.',
        'sl.simon.', 'dr.simon.', 'rv.', 'pc.grace.garden', 'cg.roland.personal')
# Deliberately authored exclusions, not a text classifier or first-choice guess.
RETIRED = {
 'briar.thomas.first': 'afraid joke', 'briar.mara.first': 'joke',
 'briar.gus.first': 'mock', 'briar.gus.home': 'mock', 'briar.gus.hurt': 'cruel',
 'cg.roland.hello': 'blunt', 'cg.roland.personal': 'threat',
 'cg.cross.hello': 'royal fight', 'cg.cross.check': 'bluff',
 'cg.cross.order': 'first anytime', 'ic.ellis.press': 'kind',
 'ic.hugo.first': 'tease', 'ic.hugo.thanks': 'kind',
 'gf.martin.first': 'rush', 'gf.martin.plan': 'early',
 'gf.martin.pages': 'thanks', 'hp.caleb.first': 'blame',
 'hp.skip.rope': 'joke', 'ih.flint.first': 'smash',
 'ih.jack.first': 'joke', 'la.miles.menu': 'joke refuse',
 'la.miles.safe': 'back', 'lc.ward.first': 'bluff',
 'lc.ruth.first': 'curt', 'pc.grace.hello': 'orb',
 'pc.grace.water': 'demand', 'pc.grace.curt': 'leave',
 'pc.grace.garden': 'mock', 'pc.grace.garden.curt': 'leave',
 'pc.victor.hello': 'people', 'pc.victor.route': 'doubt',
 'kd.sly.first': 'busy', 'sc.rose.wait': 'kind mock',
 'sc.rose.angry': 'again', 'sl.hugh.hello': 'rules work',
 'sl.hugh.cold': 'work leave', 'sl.hugh.wait': 'work',
 'dr.simon.nest': 'joke back', 'dr.simon.joke': 'back',
 'ff.heath.first': 'blunt', 'ff.heath.camp': 'back',
 'ff.heath.repaired': 'warm', 'mc.orb.hello': 'steady wry',
 'tc.abe.beast': 'danger',
}
LORE = {
 'briar.mara.first': 'why', 'briar.gus.first': 'why',
 'briar.lewis.first': 'prisoners', 'briar.beth.first': 'sheep',
 'rk.grant.first': 'who', 'rk.felix.first': 'chamber', 'rk.felix.plan': 'chamber',
 'cg.roland.menu': 'orders', 'ic.ellis.first': 'press',
 'ic.ellis.wait': 'work', 'ic.ellis.truth': 'judge', 'ic.ellis.lead': 'people',
 'ic.hugo.wait': 'hint', 'ic.hugo.safe': 'clue',
 'hp.caleb.trail': 'help', 'hp.caleb.timing': 'back',
 'hp.skip.first': 'path', 'hp.skip.rope': 'advice', 'hp.skip.ready': 'joke',
 'ih.flint.work': 'prize', 'ih.flint.wait': 'directions',
 'ih.jack.wait': 'route next', 'ih.jack.after': 'controls',
 'la.miles.menu': 'stairs', 'lc.ward.rules': 'moral',
 'lc.ruth.plan': 'crossing', 'pc.victor.wait': 'remind mirror',
 'kd.walter.ellis': 'king', 'rv.keepsake.offer': 'worry',
 'rv.keepsake.thanks': 'home reports',
 'hall.keeper.welcome': 'assemble origin training',
 'hall.keeper.assemble': 'save', 'hall.keeper.origin': 'guard',
 'hall.keeper.training': 'danger', 'sc.otto.work': 'routes',
 'sc.rose.hello': 'ask', 'sc.rose.truth': 'advice', 'sc.rose.kind': 'advice',
 'sl.hugh.open': 'orb', 'sl.simon.hello': 'legion',
 'sl.simon.shelf': 'hint', 'sl.simon.legion': 'rifts',
 'sl.simon.stands': 'reward', 'ff.heath.prepare': 'ellis wind',
 'tc.abe.wait': 'beast path', 'tc.abe.farewell': 'repeat',
}
SIDE_ENTRIES = {
 'cg.roland.menu': 'personal', 'ih.flint.plan': 'work',
 'ih.flint.wait': 'optional blank', 'gf.martin.wait': 'cage',
 'la.miles.menu': 'workers safe vault', 'lc.ruth.plan': 'others repair reward',
 'pc.grace.wait': 'garden', 'pc.grace.restored': 'garden',
 'pc.grace.route': 'garden', 'ff.heath.prepare': 'camp',
 'ff.heath.waiting': 'camp', 'sl.hugh.need': 'records',
 'sl.hugh.wait': 'work', 'sl.hugh.hello': 'work',
}
# Highest priority available continuation. Other main actions remain saved definitions,
# but only one is ever presented. Conditions still decide whether each is available.
PRIORITY = {
 'briar.bethBrother.first': ['safe','ready'], 'rk.grant.plan': ['safe','below'],
 'cg.roland.personal': ['return','keep','look'],
 'cg.cross.hello': ['west','visitor'], 'cg.cross.check': ['evidence','fight'],
 'gf.pike.first': ['fault','look','back'], 'gf.martin.plan': ['quiet'],
 'gf.martin.wait': ['pages','cool','leave'], 'gf.martin.cool': ['office','back'],
 'hp.caleb.trail': ['orders','timing'], 'ih.flint.wait': ['done'],
 'lc.ward.first': ['orders','ask'], 'pc.grace.wait': ['ready'],
 'pc.victor.route': ['mirror','go'], 'pc.victor.wait': ['done'],
 'kd.walter.first': ['help','lift'], 'kd.walter.marks': ['papers','lift'],
 'kd.walter.lift': ['papers','back'], 'kd.walter.ellis': ['hall'],
 'sl.hugh.records': ['done','go'],
}

TOPICS = set(('briar.lewis.first briar.beth.first rk.grant.plan rk.felix.plan cg.roland.menu '
 'ic.ellis.wait ic.ellis.lead ic.hugo.wait gf.martin.wait hp.caleb.trail hp.skip.first hp.skip.rope '
 'ih.flint.wait ih.jack.wait la.miles.menu lc.ruth.plan pc.grace.wait pc.grace.restored pc.victor.wait '
 'kd.walter.marks hall.keeper.welcome sc.otto.work sc.rose.wait sl.hugh.need sl.hugh.wait '
 'sl.simon.hello ff.heath.prepare tc.abe.wait tc.dash.offer '
 '').split())

def run():
    count = retired = 0
    books = list((ROOT/'public/3d/story').glob('*.json'))
    for p in books:
        d = json.loads(p.read_text(encoding='utf-8'))
        d['dialoguePolicy'] = 1
        for key,n in d.get('nodes',{}).items():
            for i,c in enumerate(n.get('choices',[])):
                category = 'side' if key.startswith(SIDE) else 'lore' if c.get('optional') else 'main'
                if key in {'ih.flint.return','ih.flint.work','ih.flint.price','la.miles.workers','la.miles.vault','gf.martin.cage','ff.heath.camp','ff.heath.aftercamp'}: category='side'
                if c['id'] in LORE.get(key,'').split(): category='lore'
                if c['id'] in SIDE_ENTRIES.get(key,'').split(): category='side'
                c['category']=category
                c['retired']=c['id'] in RETIRED.get(key,'').split()
                order=PRIORITY.get(key,[])
                c['priority']=order.index(c['id']) if c['id'] in order else len(order)+i
                count+=1;retired+=c['retired']
            if key in TOPICS: n['topicMenu']=True
            else: n.pop('topicMenu',None)
        # Stable line text/IDs and all effects intentionally remain unchanged.
        p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(books)} books, {count} categorized choices, {retired} retired alternatives')

if __name__=='__main__': run()
