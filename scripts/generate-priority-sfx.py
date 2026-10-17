"""Explicitly authorized, resumable paid ElevenLabs batch. Never prints credentials.
Dry run by default. --generate performs billed requests; never retries an unknown outcome.
"""
from pathlib import Path
import argparse, json, os, math, hashlib, datetime, urllib.request, urllib.error, time
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'audio-source/sfx/starter-20261016'
RUNTIME=ROOT/'public/sfx/custom/starter-20261016'
ROWS='''swordswing|0.8|A single swift steel sword cutting air, crisp short whoosh and faint steel ring, powerful but comfortable in rapid combat
axeswing|1|A single heavy battle axe sweeping through air, thick fast low whoosh, leather grip movement, no contact
spearswing|0.7|A single two-handed spear thrust, tight straight air rush and subtle wooden shaft flex, fast precise onset
m_axe|0.7|A single heavy axe biting a wooden shield over a thick padded body, sharp chop, compact weighty impact
m_gsmetal|0.8|A single massive greatsword striking steel armor, dense metal crack and short low steel resonance
m_gsplate|0.8|A single iron warhammer striking plate armor, deep blunt body and tight bent-metal clank, no ringing tail
m_gspunch|0.7|A single massive hammer striking a padded armored body, weighty low thump and restrained armor rattle
m_scythe|0.7|A single curved scythe blade making a clean slicing contact, sharp dry cut and short low spectral breath
m_knives|0.5|A single light dagger slicing leather, extremely fast tight dry cut, light agile and restrained
rustyhit|0.6|A single worn iron blade hitting a battered shield, gritty iron scrape ending in a short firm knock
heavyhit|0.8|A single heavy armored combat impact, strong rounded low thud and crisp stone grit, immediate attack
stabkill|0.6|A single decisive blade thrust into padded armor, compact dry puncture and restrained body thud, no gore
xbowclick|0.5|A single crossbow trigger releasing a taut string, tight mechanical snap with short wooden resonance
xbowlatch|0.5|A single crossbow bolt latching into place, precise small iron click and tensioned wood creak
wandfire|0.6|A single fast fantasy wand bolt, concentrated crystalline zap with very short fine spark tail, gentle enough for rapid repetition
wandcharge|1.2|Magical energy concentrating into one wand tip, rising fine glass tension ending in a focused soft pulse
cast1|0.9|A single fire spell launching, dry ignition crack followed by compact hot air rush and ember snaps
cast2|0.9|A single frost spell launching, sharp ice crystal formation and cool compressed air burst, no liquid glass clink
cast3|0.9|A single poison spell launching, small viscous bubble pop and pressurized venom hiss, compact organic sound
cast4|0.9|A single arcane spell launching, bright tuned crystal crack and tightly focused magical air pulse
cast5|1|A single void spell opening, inward dark air suction and deep hollow pulse, controlled low frequencies
cast7|1|A single holy spell casting, clear warm bell-like light strike and brief airy golden shimmer, no choir
fireshot|0.7|A single small fire projectile igniting, dry flammable puff and a tight forward rush of hot air
firecharge|1.5|A charged fire spell building to release, rising hot airflow ending in one compact controlled fiery burst
fireball|1|A single heavy fireball launching, forceful hot air punch with brief ember crackle, no explosion on impact
arcaneskill|1.5|A single powerful arcane nova expanding outward, strong glassy opening pulse and a ring of fine crystalline energy
warskill1|1|A single forceful warrior cleave, broad heavy steel air sweep with a short metallic finish, no impact
warcharge|1|A single armored warrior surging forward, quick accelerating cloth rush and compact armor rattle
atk1|0.7|A hostile armored soldier preparing one attack, abrupt boot brace and tight threatening leather and steel movement, clear immediate warning
atk2|0.7|A hostile enemy beginning a heavy attack, a short rough exhalation with sudden weapon tension and armor scrape, immediate readable warning
ma_stomp|0.9|A single enormous armored foot slamming stone, deep compact stone thud, short grit burst and iron rattle
die1|1|One human armored soldier collapsing unconscious, restrained exhausted exhale, equipment clatter and heavy body fall, no monstrous roar
die2|1.1|One large beast defeated, short low final grunt and weighty body hitting earth, no drawn out scream
die3|1.1|One spectral enemy dissolving, falling hollow breath and fine fading glass dust, eerie and compact
die4|1|One animated skeleton collapsing, dry bone clatter with battered iron equipment settling, no human voice
hurt1|0.5|A single small slime body taking a hit, quick elastic wet pop and brief squish, not cartoon comedy
hurt2|0.5|A single small ethereal creature struck, quick airy gasp and delicate cracked crystal texture
shatter|0.9|One living ice creature shattering, sharp initial ice crack and short cascade of icy fragments
v_troll|0.9|One living human armored enemy noticing a threat, short forceful nonverbal battle grunt and armor movement, no troll roar
v_clank|0.8|One animated suit of armor waking, heavy iron joints locking and a short resonant metal creak
v_slime1|0.7|One hostile slime swelling to attack, restrained viscous gurgle ending in a wet tension pop
v_boargrunt|0.8|One aggressive wild boar warning grunt, rough nasal snort and a forceful breath, close and natural
v_jackalbark|0.7|One hostile jackal giving a sharp warning bark, rough short canine voice, no pack or background sounds
quest|1.8|A quest completed, warm brass seal striking then a brief uplifting crystal flourish, satisfying short game reward
levelcheer|2|A character leveling up, heroic rising bronze bell accents over one warm resonant impact, compact triumphant game reward
lootpickup|0.7|A single useful item picked up, soft leather handling and one clear polished metal tick, restrained reward
chestopen|1.2|A heavy wooden treasure chest opening once, iron latch click then hinged wood creak and lid settling, no magical reveal
chestthunk|0.7|A heavy wooden treasure chest lid settling, one solid wooden thunk and a small iron fitting rattle
bookflip|0.6|A single thick parchment page turning in an old leather journal, crisp tactile paper flutter, close and quiet
click|0.5|A small warm wood and brass interface click, crisp tactile onset and soft clean finish, restrained and repeatable
drink|0.9|A healing potion uncorked and swallowed quickly, small cork pop, short liquid sip and subtle warm magical release
secretget|1.6|A hidden treasure discovered, intimate rising glass shimmer over a soft resonant stone note, curious and rewarding
portalopen|1.8|A magical stone travel portal opening, low stone resonance building into an airy crystalline expanding doorway, inviting and clear
equip|0.7|A piece of fantasy equipment fastened, leather strap movement and one precise steel buckle click
sell|0.7|Several gold coins sliding into a small leather purse, short clear metallic clinks, no modern cash register
buy|0.7|A small handful of gold coins placed on a wooden shop counter, brief warm coin clinks and one solid tap
custom_hit|0.5|A single sword hit connecting with padded armor, crisp compact attack and firm low body thud, no vocal sound
custom_hurt|0.6|Player taking one hit, short dry body thud and sharp armor scrape with a restrained breath, clear but not startling
custom_jump|0.5|A person pushing off the ground to jump, brief boot scuff and soft cloth lift, no voice
custom_land|0.5|A person landing on firm earth, two boots compressing soil with a compact body thump and subtle cloth, no heavy explosion
custom_dodge|0.6|A person performing one quick evasive dash, short fast cloth swish and focused air rush, no magic
custom_shoot|0.5|A single longbow releasing an arrow, taut natural bowstring snap and crisp arrow fletching rush
custom_classup|2|A combat class ranking up, deep steel seal opening then three ascending focused crystal pulses, distinct from bronze character level bells
custom_pickup|0.5|A subtle fantasy item acquired, one tiny warm glass tick and quiet leather rustle, pleasant when repeated
'''

def cues():
    out=[]
    for line in ROWS.strip().splitlines():
        key,seconds,prompt=line.split('|',2)
        out.append(dict(id=key,duration_seconds=float(seconds),prompt=prompt+'. One isolated event, immediate onset, clean short tail. Fantasy game SFX. No music, intelligible speech, background ambience or long reverb.'))
    return out

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--generate',action='store_true');ap.add_argument('--limit',type=int,default=999);ap.add_argument('--key-file',default=str(ROOT.parents[1]/'.secrets/elevenlabs.env'));args=ap.parse_args()
    batch=cues()[:args.limit]
    SOURCE.mkdir(parents=True,exist_ok=True)
    manifest=SOURCE/'manifest.json'
    if not args.generate:
        print(json.dumps({'cues':len(batch),'seconds':sum(c['duration_seconds'] for c in batch),'estimated_credits':sum(round(c['duration_seconds']*40) for c in batch),'hard_batch_cap':10000}));return
    key=os.environ.get('ELEVENLABS_API_KEY','')
    if not key:
        for line in Path(args.key_file).read_text(encoding='utf-8-sig').splitlines():
            if line.partition('=')[0].strip()=='ELEVENLABS_API_KEY':key=line.partition('=')[2].strip().strip('\"\'')
    def request(path,payload=None):
        headers={'xi-api-key':key,'Accept':'application/json' if payload is None else 'audio/mpeg'}
        data=None
        if payload is not None:headers['Content-Type']='application/json';data=json.dumps(payload).encode()
        return urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io'+path,data=data,headers=headers),timeout=120)
    def subscription():
        for attempt in range(4):
            try:
                with request('/v1/user/subscription') as r:return json.load(r)
            except urllib.error.HTTPError as err:
                if err.code!=429 or attempt==3:raise
                time.sleep(5*(attempt+1))
    sub=subscription()
    if sub.get('tier')=='free':raise SystemExit('Paid plan required for this production batch')
    ledger=json.loads(manifest.read_text()) if manifest.exists() else {'schema':1,'provider':'ElevenLabs','model':'eleven_text_to_sound_v2','license_plan_at_generation':sub['tier'],'commercial_review':'Paid-plan non-beta SFX; retain provider records. No claim of exclusive ownership.','started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'starting_account_used':sub['character_count'],'hard_credit_cap':10000,'cues':[]}
    ledger.pop('credits_spent',None) # older pilot balance field may lag provider billing
    def save():manifest.write_text(json.dumps(ledger,indent=2)+'\n')
    save()
    for cue in batch:
        previous=next((r for r in ledger['cues'] if r['id']==cue['id']),None)
        if previous:
            if previous['status']=='saved' and (SOURCE/previous['file']).exists():continue
            raise SystemExit('Previous uncertain request requires manual review; no automatic retry: '+cue['id'])
        if len(ledger['cues'])%8==0:sub=subscription()
        account_spent=sub['character_count']-ledger['starting_account_used'];reserved=sum(math.ceil(r['duration_seconds']*40) for r in ledger['cues']);spent=max(account_spent,reserved);expected=math.ceil(cue['duration_seconds']*40)
        if spent+max(expected,200)>10000 or sub['character_limit']-sub['character_count']<max(expected,200):raise SystemExit('Credit budget stop')
        rec={**cue,'status':'requesting','used_before':sub['character_count'],'requested_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()};ledger['cues'].append(rec);save()
        payload={'text':cue['prompt'],'duration_seconds':cue['duration_seconds'],'prompt_influence':.35,'model_id':'eleven_text_to_sound_v2','loop':False}
        try:
            with request('/v1/sound-generation?output_format=mp3_44100_128',payload) as response:
                raw=response.read();rec['billed_header']=response.headers.get('character-cost');rec['request_id']=response.headers.get('request-id')
                if len(raw)<1000 or 'audio' not in response.headers.get('Content-Type',''):raise ValueError('Invalid audio response')
            filename=cue['id']+'_v01.mp3';(SOURCE/filename).write_bytes(raw)
            rec.update(status='saved',file=filename,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
            save();print(json.dumps({'saved':cue['id'],'bytes':len(raw),'billed_header':rec['billed_header'],'spent_before':spent}),flush=True)
            time.sleep(1.5)
        except Exception as err:
            rec.update(status='unknown_outcome',error_type=type(err).__name__);save();raise SystemExit('Stopped after request error; no paid retry: '+cue['id'])
    sub=subscription();ledger['ending_account_used']=sub['character_count'];ledger['account_usage_delta']=sub['character_count']-ledger['starting_account_used'];ledger['billed_response_total']=sum(float(c['billed_header']) for c in ledger['cues'] if c.get('billed_header'));ledger['remaining_credits']=sub['character_limit']-sub['character_count'];save();print(json.dumps({'completed':len(ledger['cues']),'account_usage_delta':ledger['account_usage_delta'],'billed_response_total':ledger['billed_response_total'],'remaining':ledger['remaining_credits']}),flush=True)
if __name__=='__main__':main()
