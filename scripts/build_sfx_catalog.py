from pathlib import Path
import json,re,hashlib,collections,html
ROOT=Path(__file__).resolve().parents[1]
SRC=json.loads((ROOT/'docs/audio/SFX_GAME_INVENTORY.json').read_text(encoding='utf-8'))
CUES=[]
CURRENT='Current-system production brief'
PLAN='Planned expansion brief'
PROPOSAL='Proposed design - wait'
LEGACY='Legacy - reuse only if retained'
def add(id,cat,name,use,sound,dur=1,variants=3,loop=False,priority='P1',status=CURRENT,source='',notes='',refs=None):
    end=' Seamless steady loop, no opening hit or ending fade.' if loop else ' One isolated event, immediate onset, clean short tail.'
    prompt=sound.rstrip('.')+'.'+end+' Fantasy game SFX. No music or intelligible speech; only the described source.'
    assert len(prompt)<=450,(id,len(prompt))
    CUES.append(dict(id=id,category=cat,name=name,use=use,prompt=prompt,generation_seconds=max(.5,dur),loop=loop,variations=variants,priority=priority,status=status,source=source,notes=notes,related=refs or [],production='Not generated'))
def block(cat,rows,status=CURRENT,priority='P1',prefix=''):
    for row in rows.strip().splitlines():
        id,name,dur,sound=row.split('|',3)
        add(prefix+id,cat,name,name,sound,float(dur),priority=priority,status=status)

block('UI and menus','''ui.focus|Keyboard/controller menu focus|0.5|A tiny warm wooden tap with a soft felt finish, restrained and clear
ui.confirm|Confirm deliberate selection|0.5|A firm wooden click with one bright short brass overtone, confident and tidy
ui.back|Back or close panel|0.5|A soft leather flap closing with a low wooden tick
ui.denied|Unavailable action or incompatible equipment|0.5|Two muted low wooden knocks, gentle refusal, not an alarm
ui.tab|Switch tabs or bag category|0.5|A dry light parchment flick and small wood click
ui.bag.open|Open bag with B|0.8|A worn leather satchel flap lifting and a short buckle rattle
ui.bag.close|Close bag|0.6|A worn leather satchel folding shut with a soft buckle tap
ui.journal.open|Open journal with J|0.9|A small leather book opening, pages settling softly
ui.journal.page|Journal page or clue selection|0.6|A single thick paper page turning with a crisp edge flutter
ui.map|Open campaign map or Waystation travel panel|1|Heavy parchment unfolding over wood, a faint brass clasp
ui.settings|Open settings|0.6|A restrained small brass mechanism turning into place
ui.slider|Audio/settings slider test tick|0.5|A soft rounded wooden tick, neutral and comfortable when repeated
ui.toggle.on|Enable setting|0.5|A tiny brass latch lifting with a brighter final click
ui.toggle.off|Disable setting|0.5|A tiny brass latch lowering with a softer final click
ui.pause|Pause game|0.6|A low soft air fold ending in a small wooden stop
ui.resume|Resume game|0.6|A soft air fold opening with a light wooden release
ui.save|Save or checkpoint confirmation|0.6|One quiet warm glass tap with a rounded low body, reassuring
ui.error|Save/network error notification|0.8|Two separated muted ceramic taps, serious but not startling
ui.prompt|New nearby interaction prompt|0.5|A very quiet dry wooden touch, subtle attention cue
ui.dialogue.open|Enter paused NPC conversation|0.9|Soft cloth and air drawing inward, ending in a gentle warm tap
ui.dialogue.close|Leave conversation and return to action|0.7|Soft cloth and air opening outward, quick and unobtrusive
ui.dialogue.choice|Commit dialogue choice|0.6|A warm wood and parchment press with a clean final tap
ui.dialogue.vote|Co-op vote registered|0.5|A small rounded glass click with no success flourish
ui.dialogue.resolve|Co-op choice resolved|0.8|Two warm wooden clicks resolving into one soft brass chime
ui.text|Optional restrained text reveal tick|0.5|One extremely soft dry parchment tick, no voice or squeak
ui.record.start|Private voice studio recording starts|0.5|A gentle rounded glass tap, precise and unobtrusive
ui.record.stop|Voice studio recording stops|0.5|A low soft wooden tap, distinct from the start cue
ui.take.approve|Approve official voice take|0.8|A warm brass click resolving into a brief glass shimmer''',priority='P0')
block('Progression and rewards','''reward.player_level|Player level up, stat gains|2.5|A triumphant rising bronze bell strike with a warm low impact and bright clean upper sparkle, heroic and compact
reward.class_rank|Class rank up and skill/passive choice|2.5|Three crisp ascending steel-and-crystal pulses opening into a focused magical bloom, distinct from a bronze level-up bell
reward.class_unlock|New class permanently unlocked|4|A sealed crystal opening with a deep resonant impact and upward ribbons of brilliant energy, earned and exciting
reward.skill_unlock|Confirm learned skill|1.5|A fine etched rune clicking into place then a clear concentrated glass flare
reward.passive_unlock|Confirm learned passive|1.2|Two quiet fitted stone clicks followed by a warm steady resonant glow
reward.capstone|Class rank ten capstone|3|A deep struck metal seal opening into layered upward crystal sparks, powerful and complete
reward.gear_tier|New equipment rarity available|1.5|A strong brass clasp unlocking and one ascending polished metal ring
reward.quest_accept|Quest accepted|1|A parchment unfurl and a confident wooden stamp
reward.quest_step|Meaningful quest stage advanced|0.8|A short parchment tick with a clear small bell answer
reward.quest_complete|Quest completed|2|A warm brass seal striking cleanly and opening into a brief hopeful resonance
reward.optional_complete|Optional quest reward|1.8|A bright small silver flourish over a gentle wood impact, satisfying discovery
reward.clue|Relevant clue added to journal|1|A quill scratch ending with a small hollow glass note, curious not triumphant
reward.secret|Hidden room or path discovered|2|A quiet breath of air revealing a delicate cluster of glass tones, intimate surprise
reward.achievement|Achievement earned|2.5|A bronze medal strike, short metallic shimmer and confident warm finish
reward.gold.small|Small gold pickup|0.5|Two small gold coins touching with a soft warm metallic clink
reward.gold.large|Large gold purse reward|1|A handful of heavy coins dropping into a leather purse, rich but brief
reward.xp|Optional grouped XP gain feedback|0.5|A faint upward glass fleck, very short and gentle enough for repeated rewards
reward.loot|Generic item pickup|0.7|A small leather handling sound with one bright polished metal tick
reward.key|Key acquired|0.8|An old iron key turning against a ring with a clear metallic clink
reward.companion|Secret companion unlocked|3|A warm living breath of magic opening into soft earth resonance and a bright welcoming shimmer
reward.cosmetic|Appearance reward unlocked|1.5|Silky cloth unfolding with a light silver clasp opening
reward.hub_upgrade|Visible hub improvement completed|2.5|Three substantial wooden and stone fittings settling into place with a warm bright finish
reward.half_bank|Level half completed, gains banked|2|A deep stone seal locking securely followed by a restrained ascending glass glint
reward.boss_win|Ordinary boss victory cue|3|A heavy defeated iron seal cracking open into a clear hopeful bronze resonance
reward.campaign_win|Aerth restored, campaign completion|5|A vast dark pressure releasing into clear air, warm golden bells and fine sparkling light, uplifting without a melody
reward.ngplus|Begin New Game Plus|2|An old stone wheel turning into a deeper firm lock with a fresh bright spark''',priority='P0')
# Contact material is shared by player, ally and NPC footsteps; scale/mix by actor, not separate duplicate libraries.
for surface,texture in {
'dirt':'packed earth with loose dry grit','grass':'short damp grass over firm soil','leaves':'dry fallen leaves over forest soil','mud':'sticky shallow mud','gravel':'small loose stones on packed ground','sand':'coarse beach sand','wet_sand':'wet compact sand with a little water','stone':'rough stone slabs','marble':'smooth hard marble','wood':'worn wooden boards','metal':'a heavy iron platform','snow':'fresh compressed snow','ice':'hard slightly crunchy ice','water':'ankle-deep water','bone':'scattered brittle bones on stone'}.items():
    add('move.foot.'+surface,'Player movement',surface.replace('_',' ').title()+' footstep','One grounded footfall; material switch; reuse NPC/ally contact',f'One boot step on {texture}, detailed close foley, believable weight',.6,6,priority='P0')
    add('move.land.'+surface,'Player movement',surface.replace('_',' ').title()+' landing','Jump or short fall landing; scale intensity, not cadence',f'Two boots landing firmly on {texture}, a solid short contact with scattered surface detail',1,3)
block('Player movement','''move.jump|Jump launch|0.6|Boots pushing off firmly, brief leather tension and upward clothing rush, no landing
move.doublejump|Magical extra jump if available|0.8|A tight upward air pulse with a clean little magical snap
move.fall|Fast falling air|2|Air rushing past a falling body, controlled broadband air without a whistle
move.dash|Quick phase dash|0.7|A sharp air fold passing forward, tight energetic snap with a very short fading trail
move.dash.end|Dash arrival|0.5|A soft compressed air pop and light foot contact
move.wall.slide|Wall slide contact|2|Leather and boot soles scraping down rough stone at a steady rate
move.wall.kick|Wall jump|0.7|A boot planting hard on stone then pushing off with a short clothing whip
move.ledge.catch|Catch ledge|0.7|Two gloved hands catching rough stone, a tight leather creak
move.climb|Climb or mantle exertion foley|1|Gloves shifting on stone with cloth pulling taut, no voice
move.ladder|Ladder rung contact|0.6|A boot landing on a wooden ladder rung with a small structural creak
move.rope|Rope grip and climb|0.8|A rough rope tightening through gloved hands, fiber creak
move.slide|Ground slide|1|Boots and cloth skidding across loose grit in a short scrape
move.fall.reset|Fall recovery/reset cue|1.2|A low soft air drop folding into a small rising magical return
move.armor.light|Light clothing movement|0.7|A quick rustle of worn leather straps and soft cloth, close and dry
move.armor.chain|Chainmail movement|0.7|A short fine chainmail jingle with leather strap tension
move.armor.plate|Plate armor movement|0.8|Two restrained plate armor contacts with a leather creak, no heavy crash
move.swim|Swim stroke, conditional|1|One controlled human swimming stroke, hands cutting water and a soft wake
move.jetpack|Existing cheat jetpack thrust|2|A compact magical air jet pushing steadily downward, restrained airy force''')
# Human exertions should ultimately be recorded by Oliver/wife to match the selected voices.
for voice in ['male','female']:
 for event,desc,dur in [('effort','short determined physical effort grunt',.7),('hurt_light','brief sharp pain gasp',.7),('hurt_heavy','strained heavy-hit gasp and breath',1.1),('death','short defeated exhale, restrained and human',1.7),('revive','relieved breath as strength returns',1.2),('tired','controlled tired breathing',2),('jump','brief athletic jump effort',.5)]:
  add(f'voice.player.{voice}.{event}','Player reactions',f'{voice.title()} player {event.replace("_"," ")}','Record with chosen player voice; generated prompt is a fallback direction',f'Adult {voice} {desc}, natural unprocessed close recording, no words, no melodrama',dur,4,priority='P0',notes='Prefer human performance for consistent identity. Generate one effort only; do not synthesize dialogue here.')
block('Combat feedback','''combat.hit.flesh|Physical hit on flesh|0.6|A short solid body impact with a little cloth snap, forceful not wet or gory
combat.hit.leather|Hit on leather armor|0.6|A tight leather armor strike with a solid muted body thump
combat.hit.plate|Hit on metal armor|0.8|A hard steel armor impact with a short gritty ring and low weight
combat.hit.bone|Hit on skeleton or bone armor|0.6|A dry sharp bone knock with a small brittle rattle
combat.hit.stone|Hit on stone creature or wall|0.8|A hard strike against stone with a tight crack and a few grit fragments
combat.hit.wood|Hit on wood|0.7|A hard weapon impact into dense timber with short splinters
combat.hit.ice|Hit on ice shell|0.7|A sharp compact ice crack with a few crystalline chips
combat.hit.slime|Hit on slime|0.6|A thick elastic gel impact, short sticky slap and bounce
combat.hit.spirit|Hit on spectral target|0.8|A hollow airy impact with a brief inward spectral ripple, no voice
combat.crit|Critical hit overlay|0.6|A precise bright steel snap with a tight deep accent, short and decisive
combat.block|Shield blocks attack|0.8|A solid metal shield clang with a leather-backed thud
combat.parry|Successful timed parry|0.8|A clean high steel clash snapping into a brief bright ring
combat.guard_break|Guard broken|1|A stressed metal brace breaking with a deep short snap
combat.stagger|Enemy stagger opening|0.8|A heavy off-balance boot scrape and armor jolt
combat.immune|Attack ineffective or invulnerable target|0.5|A dull hollow metal knock with almost no ring, clearly unproductive
combat.shield.hit|Magical shield absorbs hit|0.7|A taut glass membrane struck, flexing with a short rounded pulse
combat.shield.break|Magical shield depleted|1|A glass membrane tearing into fine fading sparks
combat.heal|Health restored|1|Warm liquid light flowing inward with soft clear glass droplets
combat.mana|Mana restored|0.8|A cool smooth glass pulse gathering inward, lighter than healing
combat.lowhp.enter|Enter critical health|1|Two low muffled heartbeats with a restrained breath, immediate readable warning
combat.lowhp.loop|Critical health heartbeat loop|4|Quiet slow heavy heartbeats, steady restrained rhythm, no rising panic
combat.poison|Poison applied|0.8|A small wet acidic hiss with a sickly bubbling finish
combat.burn|Burn applied|0.7|A sharp small ignition catching into a short flame crackle
combat.freeze|Frozen or rooted in ice|1|Ice rapidly sealing around a solid form with a tight crystalline lock
combat.thaw|Freeze ends|0.8|Thin ice shedding in delicate cracks and falling chips
combat.stun|Stunned|0.7|A muted head impact with one short low ringing flutter, no piercing tone
combat.slow|Slowed|0.7|A low sticky dragging magical pulse, brief and restrained
combat.cleanse|Harmful status removed|1|A clear outward breath sweeping grit away with a clean bell touch
combat.lifesteal|Life returned by drain|0.8|A soft dark suction resolving into a warm bodily pulse
combat.buff.end|Temporary buff ends|0.6|A faint soft magical exhale settling down to silence
combat.reflect|Attack reflected|0.7|A crisp rebound crack and reversed short air whip
combat.interrupt|Successful cast interruption|0.7|A tense magical thread snapping abruptly with scattered sparks
combat.respawn|Respawn at half checkpoint|2|A warm rising breath of magic gathering into a firm safe stone chime''',priority='P0')
# True looping sources get an explicit loop flag rather than a baked ending.
for c in CUES:
 if c['id'] in ['move.wall.slide','move.jetpack','combat.lowhp.loop']:
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')

WEAPONS={
'sword':('Sword','medium steel blade','a quick clean slicing air swish','a forceful long steel arc'),
'great':('Greatsword','large heavy steel blade','a deep broad cutting whoosh','two weighty rotating blade sweeps'),
'axe':('Battle axe','heavy iron axe on wood shaft','a rough compact chopping whoosh','a heavy spinning axe leaving the hand'),
'hammer':('Warhammer','dense iron hammer on wood shaft','a blunt low air displacement','a massive hammer slam cracking stone outward'),
'dagger':('Daggers','short narrow steel dagger','a tiny fast precise cutting swish','one dagger flicked sharply forward with a light air whistle'),
'javelin':('Javelin','long wooden shaft and steel spearhead','a forward two-handed thrust with a tight linear air rush','a heavy spear thrown forward with a clear release and tapering air whistle'),
'bow':('Bow','wooden bow and taut natural string','a crisp elastic bowstring release and short wood flex','a powerful bowstring snap with a longer arrow air rush'),
'cross':('Crossbow','compact wood and iron crossbow','a sharp mechanical latch snap and springy string crack','a hard crossbow release with strong compressed string recoil'),
'staff':('Staff','wooden staff focusing a spherical magic projectile','a rounded magical pressure pop with a woody focus click','a deep gathered magic orb expelled in a powerful rounded pulse'),
'wand':('Wand','small focused magical wand','a light needle-like magical flick','a fine concentrated magical lance cracking into motion'),
'spellblade':('Spellblade','steel blade carrying magic','a clean steel swish with a faint resonant edge','a broad enchanted blade sweep sending energy outward'),
'scythe':('Reaper intrinsic scythe','long heavy curved steel scythe','a broad hollow harvesting sweep, dark air without voices','a large spinning scythe thrown outward with a deep cycling blade rush'),
'pirate':('Pirate intrinsic flintlock and saber','old flintlock pistol and curved saber','a punchy black powder pistol boom with a dry flint click, weighty cannonball character','a strong curved saber swing, crisp steel edge over a heavy forward rush'),
'fist':('Monk intrinsic fists','bare trained human fists','a fast sleeve snap and compact fist air punch','a powerful palm thrust with compressed air and a tight body-weight accent')}
for wid,(label,mat,basic,charged) in WEAPONS.items():
 for phase,sound,dur in [('basic',basic,.8),('charge_start',f'{mat} preparing a strong attack, taut material tension gathering',.8),('charge_hold',f'Steady restrained tension from {mat}, sustained readiness with no release',2),('charged',charged,1.4),('equip',f'{mat} lifted into a firm grip, short close handling sounds',.8),('cancel',f'Tension relaxing from {mat}, soft short release without firing',.5)]:
  add(f'weapon.{wid}.{phase}','Weapons',f'{label}: {phase.replace("_"," ")}',f'{label} {phase}; separate weapon core from hit/material/element',sound,dur,4 if phase=='basic' else 2,loop=phase=='charge_hold',priority='P0',source='index.html ARCH / chargeRelease / intrinsicWeapon',notes='Charge loop starts only while held; stop on release, dodge cancel, death, dialogue, menu or weapon switch.')
for wid in ['axe','scythe','dagger','javelin','bow','cross','pirate']:
 add('weapon.'+wid+'.flight','Weapons',WEAPONS[wid][0]+' projectile pass','Nearest projectile only; do not sound every particle',f'A {WEAPONS[wid][1]} projectile cutting past, short directional air rush, no impact',.7,3,priority='P1')
for wid in ['axe','scythe']:
 add('weapon.'+wid+'.catch','Weapons',wid.title()+' returns to hand','Returning thrown weapon successfully caught',f'A returning {wid} stops firmly in a gloved hand, short leather grip and metal vibration',.7,3)
block('Weapons','''weapon.bow.draw|Bow draw movement|1|A wooden bow flexing under rising string tension, controlled fiber strain, no release
weapon.cross.reload|Crossbow reload latch|1|An iron crossbow winding once and locking its bolt into a firm catch
weapon.pirate.reload|Flintlock reset|1|Flintlock mechanism cocking with a crisp old iron double click, no gunshot
weapon.scythe.combo|Scythe third-hit magic accent|1|A broad dark curved blade rush splitting into a tight spectral pulse, no voice
weapon.ians.hum|Earned Ian's Blade holy core|2|A restrained ancient iron resonance with warm ember-like light vibrating inside
weapon.ians.cut|Earned Ian's Blade heavy slash|1.5|A massive ancient blade sweeping with a clean iron edge and deep warm sacred force''')
# Element overlays are reused across weapon sizes; they are not a second complete attack.
ELEMENTS={'fire':'roaring orange flame, dry ember crackle and hot air','ice':'brittle ice, cold breath and clean frozen crystal','poison':'thick bubbling venom and restrained acidic hiss','arcane':'clear resonant glass with complex airy ripples','void':'hollow inward pressure and dark brittle spatial tearing','holy':'warm pure bell overtones and clean radiant air','lightning':'snapping electrical branches and tight thunder cracks','physical':'compressed air and grounded dust'}
for el,texture in ELEMENTS.items():
 for event,gesture,dur in [('release','a tight forward burst',.7),('impact','a sharp contained impact and dispersal',.9),('sustain','a restrained continuous energy texture',3),('expire','a soft dying exhale',.7)]:
  add(f'element.{el}.{event}','Element layers',f'{el.title()} {event}',f'Shared {el} overlay for relevant weapon, enemy or skill; never play all layers by default',f'{gesture.capitalize()} made of {texture}, distinct {el} energy, no weapon handling',dur,3,loop=event=='sustain',priority='P0' if el!='physical' else 'P1')
# Every selectable current skill is explicitly covered. These are authored sound directions,
# not name-based automatic substitutions of one generic magical whoosh.
SKILL_SOUNDS='''w_cleave|A short broad steel cut, fast low air slice with a crisp edge
w_bash|A shield driven forward with leather strain and a compact iron knock
w_charge|Heavy boots surge into a straight rush, armor rattles accelerating once
w_whirl|Two connected broad steel sweeps circling with clear rhythmic separation
w_guard|Thick iron plates settle into a locked defensive brace
w_stomp|One boot stamps hard, driving a low stone crack outward
w_berserk|A deep forceful breath of pressure and a short bronze battle resonance, no vocal
w_execute|A heavy blade rises briefly then cuts down with one decisive dense steel stroke
r_volley|A rapid fan of five light bowstring snaps with spreading arrow air tails
r_pierce|A tightly focused bowstring crack and straight piercing whistle
r_tumble|Light leather folds backward with a quick retreating air swish and small string release
r_shadow|A fast low leather rush slips through a target, sharp narrow steel cut at the end
r_spike|A small iron trap unfolds with several sharp mechanical teeth clicking open
r_smoke|A small clay smoke bomb cracks, releasing a broad soft dry smoke puff
r_mark|One quiet focused wood click and a taut fine string ring, watchful and precise
r_deathmark|A small dark hunting seal snaps shut with a dry inward ticking pulse
m_bolt|A rounded arcane orb pops free with clear glass body and a quick airy spiral
m_beam|A tightly focused glass tone opens into a straight cutting magical beam
m_blink|A glassy air fold implodes then opens cleanly, very brief spatial snap
m_nova|A crystalline ring bursts outward with cold air and fine ice splinters
m_gravity|Dense air compresses inward around a low glass resonance, strong suction
m_barrier|Etched glass runes click together into a clear taut protective shell
m_tempest|Several distinct elemental sparks align into a controlled rotating resonance
m_overload|A compressed cluster of magic ruptures outward with a bright multifaceted crack
x_reap|A heavy curved scythe slices through hollow air, faint inward drain at its edge
x_cleave|One wide spectral blade cut, deeper and slower with a tearing dark edge
x_step|A low shadow folds tightly inward then opens with a dry dark whisper, no voice
x_wraith|Physical weight drains away into a soft hollow spectral breath
x_pull|A deep hollow hook snaps outward and drags dense air inward
x_bind|A thin spectral chain whips forward and locks with a dark glass clasp
x_siphon|Several airy threads pull inward, pulsing into one deep warm heartbeat
x_vortex|A broad hollow spiral begins with a long curved steel sweep and rising dark pressure
pal_bash|A bright brass shield thrust with a solid clean metal knock and warm light accent
pal_smite|A single golden lightning bolt drops from high above, sharp radiant crack followed by a compact warm thunder body
pal_taunt|A broad bronze shield ring projects outward, firm and commanding without a voice
pal_ground|Warm bell-like light touches the ground and spreads into a soft circular glow
pal_guard|Layered golden shield plates lock together with polished brass clicks and clear light
pal_burst|A short blinding burst of clean radiant air and bright warm glass
pal_laststand|A deep bronze foundation strike rises into a steady warm protective resonance
pal_sky|A vast sacred hammer descends through air with a low golden metal roar
necro_summon|Dry bones rapidly assemble above disturbed soil, three crisp skeletal locks
necro_bolt|A thick diseased magical glob ejects with bone click and wet acidic hiss
necro_raise|Earth releases a body as bone joints reset beneath a low necromantic pulse, no soul screams
necro_nova|A corpse shell ruptures into dry bone fragments and a dark outward pressure burst
necro_wall|Long bone stakes rise rapidly and interlock into a dense protective lattice
necro_grip|Skeletal fingers clamp with hard bone clicks and a short dragging earth scrape
necro_army|Several lines of bones assemble in rising waves, earthy cracks and dry coordinated clatter
necro_storm|A circling mass of dry bone fragments gathers around a low grave-like air current
nin_strike|A silent approach broken by one razor-fast steel draw and narrow cut
nin_barrage|Several tiny throwing stars leave the fingers in a tight fast metallic flutter
nin_step|A very short cloth whip vanishes into a tight muted shadow pop
nin_smoke|A tiny hard pellet cracks into a dense abrupt smoke puff, compact and sharp
nin_mark|A precise needle-like steel tick and quiet dark seal, tense and surgical
nin_pierce|One spinning throwing star slices forward with a high clean metallic air streak
nin_fury|A rapid steel draw fans into three tiny precise blade ticks
nin_storm|A compressed smoke snap pulls inward, followed by nearly silent cloth movement
bsk_cleave|A rough heavy chopping arc with raw low air and a ragged steel edge
bsk_bash|A forceful headlong body thrust, leather tension and a blunt close impact
bsk_charge|Heavy rushing footfalls and rough leather surge in a reckless forward burst
bsk_stomp|A violent double-weight ground hit kicks out loose stones and deep pressure
bsk_whirl|A rough heavy blade circles repeatedly, uneven forceful chopping air
bsk_execute|A brutal downward iron stroke with dense crushing force, no gore
bsk_berserk|A strong pulse of hot breath and pounding bodily energy, ferocious without words
bsk_guard|A heavy heartbeat locks beneath a rough metallic brace, tense protective force
pir_pierce|A crisp flint snap and focused heavy black powder shot with a narrow ball whistle
pir_volley|Three chunky ship-cannon-like reports in a short spreading burst, controlled bass
pir_shadow|A boarding hook-like metal snap, leather rush and a sharp curved saber swish
pir_tumble|Boots and coat tumble sideways across timber with a quick flint click
pir_smoke|Dry black powder ignites into a smoky compact thump and short hissing cloud
pir_goldrush|A handful of gold coins spin with a cheeky bright metallic flourish
pir_deathmark|A powder fuse catches inside a low iron cannon chamber with a tense brief hiss
pir_spike|A small wooden keg drops, iron hoops rattle and a short fuse catches
chr_bolt|A clean glass tick fires forward, followed by a tiny reverse-shaped echo
chr_beam|A stretched clocklike glass pulse cuts forward in a long narrow line
chr_nova|Several soft clock ticks decelerate into a low suspended glass pulse
chr_blink|A short sequence of glass ticks runs backward and folds into a clean snap
chr_gravity|A dense clock spring winds inward, pulling air into a slowed low pulse
chr_barrier|Fine glass clock segments lock into a smooth sustained protective tone
chr_tempest|Uneven clock pulses circle with stretched and compressed glass air
chr_overload|Time-like glass tension implodes to a tiny silence then bursts in one deep crack
mon_flurry|A fast measured series of sleeve snaps and compact bare-hand air punches
mon_palm|One palm drives forward with a firm compressed-air thump and cloth snap
mon_deflect|A calm breath-like air motion and soft wrist wrap tightening, held ready
mon_roll|Light cloth rolls quickly sideways with two soft grounded hand contacts
mon_whirl|A sweeping bare-foot kick cuts a full circle with crisp cloth rotation
mon_stun|A flat palm thrust releases one broad tight air shock with a low wooden body
mon_thousand|A precise accelerating pattern of sleeve snaps, disciplined and athletic
mon_dragon|A rising cloth rush turns into a heavy descending kick and compressed air strike
st_bolt|A sharp branching electrical snap jumping through three distinct short cracks
st_lance|One straight concentrated lightning crack with a tight bright electrical edge
st_step|A fast air displacement punctuated by a short thunder snap
st_nova|A circular static discharge cracks outward in many tiny electrical branches
st_orb|A round compressed electrical ball forms with chattering sparks and a smooth charged body
st_barrier|A tightly woven electrical shell closes with a sharp static latch
st_storm|A low storm pressure builds into a clear overhead lightning crack
st_overload|Several connected electric charges trigger in a fast rising chain of clean cracks
war_bolt|A dark narrow pulse erupts from a soft bodily throb, dry and hungry
war_lance|A taut red magical thread draws tight then snaps into a piercing dark lance
war_curse|A rough dark seal is scratched into place with low dissonant wood resonance
war_drain|A thin hungry suction pulls in uneven pulses toward a deep bodily beat
war_step|A rough spatial tear opens with frayed edges and closes in a compressed dark snap
war_orb|A dense unstable dark sphere swells with irregular crackles and heavy inward pressure
war_storm|Ragged dark air tears circulate around a slow harsh throbbing center
war_final|A tight curse knot pulls to breaking point then cracks with a deep dry impact
sky_rise|A spear thrust cuts upward with a strong clean rising wind column
sky_gale|A focused airy bolt launches with a sharp feathered wind snap
sky_dive|A high falling air whistle thickens into a heavy descending spear rush
sky_lift|A broad smooth upward wind column lifts with a warm hollow rush
sky_dash|A fast horizontal cutting gust with a thin spear edge riding the front
sky_rain|Several narrow spear air streaks descend in a clearly separated short volley
sky_crash|A steep descending wind rush breaks into a tight thunder impact
sky_cyclone|A wide vertical air spiral opens, clear and powerful without electrical crackle
bd_counter|A fine steel edge turns into a balanced held position with one delicate ringing tick
bd_twin|Two clean blade cuts in close rhythm, first light then deeper
bd_riposte|A bright steel reversal snaps into one precise forceful answering cut
bd_step|Silky cloth pivots with light crossing footsteps and a delicate steel swish
bd_mirror|Several thin steel reflections ring in a clear symmetric pattern
bd_cross|Two crossing sword arcs cut a crisp X through the air
bd_steel|A graceful rapidly circling sequence of fine steel edges with distinct rhythmic cuts
bd_perfect|A perfectly timed steel contact pauses for a breath then releases a clean ringing response
bst_sic|A short nonverbal breath whistle and a sharp leather command flick
bst_coordinated|A short bowstring-like cue and a matching low animal air surge, coordinated attack
bst_guardian|A warm earth pulse connects with a low protective beast resonance
bst_step|Two separated quick air rushes converge from opposite sides with light paw movement
bst_mend|Warm living light flows between two points with soft leafy air and clear droplets
bst_roar|One commanding deep wolf-like roar, full-bodied and brief, not human speech
bst_stampede|Several heavy spectral hoof and paw impacts build into a forward rushing wave
bst_apex|A powerful animal breath expands into a resonant warm earth pulse and bright living energy'''
SKILL_TEXTURE={x.split('|',1)[0]:x.split('|',1)[1] for x in SKILL_SOUNDS.splitlines()}
SKILLS=[]
for cid,cl in SRC['classes'].items():
 for rank,opt in cl.items():
  if not isinstance(opt,dict) or opt.get('kind')!='skill':continue
  for choice in ['a','b']:
   sk=opt[choice];sid=sk['id'];SKILLS.append(dict(class_id=cid,class_name=cl['disp'],slot=opt['slot']+1,choice=choice,rank=rank,**sk))
   add('skill.'+sid+'.cast','Class skills',cl['disp']+' / '+sk['n'],f"Slot {opt['slot']+1}, choice {choice.upper()} at {rank}. {sk['d']}",SKILL_TEXTURE[sid],1.4,3,priority='P0',source='CLASS2.'+cid+'.'+rank+'.'+choice,notes='Signature activation/release stem. Drive impacts and persistent phases separately. Do not let a clip decide damage timing.')
assert set(SKILL_TEXTURE)=={s['id'] for s in SKILLS}
# Independent ongoing sources and ends for persistent effects. Exact duration follows state, never a baked timer.
SUSTAINS={
'w_whirl':'heavy steel blades circling in repeated broad sweeps','w_guard':'quiet iron shield tension','w_berserk':'restrained bodily battle pulse',
'r_spike':'small loaded metal trap tension','r_smoke':'soft dry smoke dispersing close by',
'm_beam':'focused clear arcane glass energy','m_gravity':'dense air pulling inward','m_barrier':'taut clear rune-glass resonance','m_tempest':'controlled mixed elemental resonance',
'x_wraith':'weightless hollow shadow breath','x_bind':'taut spectral chain resonance','x_siphon':'inward draining spectral threads','x_vortex':'broad hollow scythe wind circling',
'pal_ground':'gentle warm radiant ground shimmer','pal_guard':'quiet golden shield resonance','pal_laststand':'deep warm bronze protective energy',
'necro_wall':'dry interlocked bones vibrating softly','necro_army':'restrained distant bone assembly','necro_storm':'loose bone fragments circling in dark air',
'nin_smoke':'compact close dry smoke','nin_fury':'fine restrained steel readiness','nin_storm':'near-silent soft cloth-like shadow',
'bsk_whirl':'rough heavy blade rotation','bsk_berserk':'deep raw bodily pulse','bsk_guard':'restrained heartbeat and iron tension',
'pir_smoke':'low powder smoke hiss','pir_goldrush':'very sparse quiet gold flecks','pir_spike':'slow burning dry fuse',
'chr_nova':'slow glass clock pulses','chr_barrier':'suspended fine clock-glass hum','chr_tempest':'uneven stretched clock pulses',
'mon_deflect':'quiet controlled breathing air without vocals','mon_thousand':'restrained flowing sleeve air',
'st_orb':'contained round electrical chatter','st_barrier':'fine static mesh','st_storm':'restrained low storm air',
'war_curse':'low rough dark seal vibration','war_drain':'thin uneven inward suction','war_orb':'unstable dark spherical pressure','war_storm':'ragged dark air circling',
'sky_lift':'smooth vertical rising wind','sky_cyclone':'wide rotating upward wind',
'bd_counter':'almost silent fine steel tension','bd_mirror':'quiet thin reflected steel rings','bd_steel':'light rhythmic blade air circling','bd_perfect':'very quiet balanced blade tension',
'bst_guardian':'warm low animal-earth resonance','bst_mend':'soft living energy flowing between two points','bst_apex':'restrained powerful animal breath-like energy'}
for sid,texture in SUSTAINS.items():
 sk=next(s for s in SKILLS if s['id']==sid)
 for phase,loop,dur,sound in [('sustain',True,3,'Steady '+texture+', no attack impacts'),('end',False,.8,texture.capitalize()+' releases gently and settles completely')]:
  add(f'skill.{sid}.{phase}','Skill sustained phases',sk['class_name']+' / '+sk['n']+' / '+phase,sk['n']+' active state '+phase,sound,dur,2,loop,source='CLASS2 / SKILL_FX.'+sid,notes='End on actual state exit, cancel, death or scene change. Never stack one sustain per affected enemy.')
# Delayed impacts and gameplay-specific follow-through.
block('Skill follow-through','''skill.pal_smite.impact|Smite lightning strikes target|1.2|A concentrated golden thunder hit, bright clean crack over warm low pressure, no dark magic
skill.pal_sky.impact|Sky Hammer lands|1.6|A huge sacred metal hammer strikes stone with warm bronze force and a short radiant shock
skill.r_deathmark.detonate|Ranger death mark triggers|1|A tight dry trap-like crack bursting into sharp hunting energy
skill.nin_mark.trigger|Ninja marked-target strike accent|0.6|A tiny precise steel puncture and dark seal snapping inward
skill.pir_deathmark.detonate|Cannonade marked death explosion|1.3|A compact black powder cannon explosion with a dry wooden fragment rattle
skill.pir_spike.trigger|Powder keg explodes|1.4|A small wooden powder keg bursts with a chesty boom and brief splinter rattle
skill.necro_raise.finish|Risen enemy ally stands|1.4|Bone joints settle inside a newly raised body with a soft obedient grave pulse, no voices
skill.m_overload.impact|Elemental Overload detonation|1.4|A compact multifaceted magical explosion with clear crystal fracture and strong pressure
skill.chr_overload.impact|Singularity collapses|1.5|A deep compressed air implosion, tiny vacuum pause and sharp stretched-glass collapse
skill.mon_deflect.success|Monk deflects a blow|0.6|A quick cloth-and-palm redirection with a tight wooden crack, no metal shield
skill.bd_counter.success|Bladedancer counter opening|0.7|A fine pure steel parry ring with a short reverse cut accent
skill.sky_dive.land|Dive Strike lands|1|A spear point drives into ground with a compact stone shock and falling wind tail
skill.sky_crash.land|Thunder Dive lands|1.5|A deep spear-driven ground impact with one sharp thunder crack and outward air
skill.bst_guardian.intercept|Companion intercepts incoming hit|0.9|A protective low beast breath and solid shield-like earth impact
skill.bst_mend.pulse|Mend the Pack healing pulse|0.8|A warm leafy magical droplet pulsing outward softly
skill.w_execute.finish|Warrior execution confirmed|0.8|A decisive dense steel stop and short low impact, no gore
skill.bsk_execute.finish|Berserker execution confirmed|0.9|A rough iron chop landing with raw heavy body weight and brief rubble
skill.x_siphon.return|Reaper drained life returns|0.8|Several fine hollow threads snap inward into a warm dark pulse''')
# Pyromancer is approved as a class, but its exact kit is intentionally not invented here.
for role,sound in {'ignite':'a compact bright fire ignition','projectile':'a fast dense fire orb launch with a dry snapping edge','stream':'a controlled sustained jet of hot flame','defense':'fire curling into a close protective ring','burst':'a contained powerful fire bloom with crisp ember sparks','mobility':'a quick forward rush of hot air and cinders'}.items():
 add('pyromancer.palette.'+role,'Future Pyromancer',f'Pyromancer {role} audition',f'Texture audition only; assign to actual skills after kit approval',sound.capitalize(),2,2,loop=role=='stream',priority='P2',status=PROPOSAL,notes='No new skill name, slot or mechanic is approved by this cue.')
# Give meaningful procs feedback without an extra sound for every always-on stat.
block('Passive and class feedback','''proc.ready|Important proc becomes ready|0.6|A tiny clean focused glass click, subtle readiness cue
proc.consume|Proc spent successfully|0.5|A tight small energy snap with a firm center
proc.second_wind|Second Wind emergency heal|1.2|A deep recovering breath of warm magic and a short reassuring pulse
proc.momentum|Momentum reaches useful threshold|0.7|A brief heavy boot and iron resonance tightening into rhythm
proc.clear_aim|Ranger Clear Aim activates|0.6|A delicate bowstring harmonic settling into a precise clear point
proc.focus|Monk maximum Focus stacks|0.8|A quiet centered air pulse with a single dry wrist-wrap snap
proc.echo|Chronomancer delayed skill echo|0.7|A fine reverse glass tick resolving forward, no full spell explosion
proc.companion_bond|Beastmaster bond re-established|0.9|Two warm living pulses joining into one soft earth resonance
proc.reflect|Reflect passive activates|0.6|A compact mirrored energy rebound with a clean short edge
proc.execute|Generic conditional execute threshold confirmed|0.6|A short low final metal tick, decisive without a flourish''',priority='P1')
ENEMIES={
'grunt':('Grunt','living humanoid soldier with worn leather and iron','a short flat human combat breath','a restrained human pain grunt','a tired human exhale and body falling onto cloth'),
'flyer':('Flyer','small leathery winged beast','a sharp small airborne screech','a clipped winged-animal yelp','a thin fading animal cry and soft wing collapse'),
'emberling':('Emberling','small living fire creature','a dry crackling chitter','a brief smoky squeal','an ember cough extinguishing into dry ash'),
'frostling':('Frostling','small frost-coated beast','a cold breathy animal chirp','a brittle strained animal cry','a short cold exhale and crystalline shedding'),
 'toxling':('Toxling','small venomous living creature','a wet throaty warning croak','a tight gurgling pain croak','a wet deflating croak, no explosion'),
'shadeling':('Shadeling','small shadow creature','a hollow breath-like rasp without words','a thin torn-air flinch','a small dark air collapse'),
'sparkling':('Sparkling','floating arcane star creature','a tiny glassy electrical chatter','a bright unstable glass chirp','a cluster of tiny magical sparks breaking apart'),
'goblin':('Treasure Goblin','small lively fleeing goblin with coin purse','a startled comic goblin squeak','a short indignant goblin yelp','a brief deflated goblin exhale and purse clatter'),
'bones':('Skeleton','dry walking skeleton','a jaw and rib rattle','a sharp hollow bone knock','a loose skeleton collapsing into a dry scattered pile'),
'slime':('Slime','large soft gelatinous creature','a low elastic wet bubble','a short sticky squelch','a thick jelly body collapsing with a soft wet slap'),
'slimelet':('Slimelet','tiny soft gelatinous creature','a tiny elastic wet pop','a small sticky squeak','a tiny jelly body flattening softly'),
'caster':('Caster','robed hostile magic user','a low controlled human breath','a restrained human magical-effort gasp','a short human exhale and cloth fall, no spectral choir'),
'charger':('Charger','muscular charging beast','a coarse low snort','a rough animal grunt','a low beast exhale and heavy body collapse'),
'mimic':('Mimic','living wooden treasure chest with teeth','a sudden wooden-jaw snarl','a creaking pained wood groan','a collapsing wooden chest with a brief dying throat rasp'),
'dustjackal':('Dust Jackal','lean desert jackal','a sharp dry jackal bark','a quick canine yelp','a low breathy canine whine trailing off'),
'cragspitter':('Crag Spitter','heavy stone-armored spitting creature','a gravelly throat rumble','a gritty deep croak','a deep croak fading under falling loose stones'),
'galewisp':('Gale Wisp','living wind spirit','a short rising breath of wind','a fluttering air break','a fine wind ribbon unraveling'),
 'thornboar':('Thorn Boar','large bristled tusked boar','a forceful boar snort','a harsh short boar squeal','a low boar grunt and heavy grassy collapse'),
'sporeback':('Sporeback','slow mushroom-backed living beast','a damp hollow fungal croak','a muffled spongy grunt','a wet hollow sigh as a fungal body slumps, no spore detonation'),
'sentinel':('Animated Sentinel','empty animated metal armor','a hollow iron helmet turn','a dented metallic grunt without voice','armor pieces dropping in a heavy disconnected clatter'),
'frostshell':('Frostshell','heavy living ice-shelled creature','a low cold breath with ice creak','a deep grunt through brittle ice','a low animal exhale under shattered shell fragments'),
'frostlobber':('Frost Lobber','small cold magical lobber','a hollow cold throat pulse','a short brittle cold gasp','an airy cold breath and loose ice chips'),
'magmaskit':('Magma Skitter','fast small hot chitinous creature','a hot dry skittering click','a sharp crackling squeal','a quick cinder hiss and brittle legs settling'),
'embertotem':('Ember Totem','stationary stone fire vent','a low internal furnace intake','a hollow cracked stone knock','a stone vent splitting as the internal fire dies'),
'blinkstalker':('Blink Stalker','lean stalking void creature','a short tense torn-air breath','a clipped hollow strain','a ragged spatial fold snapping shut'),
'voidtether':('Void Tether','mobile dark magical support creature','a fine hollow tether hum','a strained taut-energy pulse','several dark tension threads snapping loose'),
'sunpriest':('Sun Priest','living Hollowed priest in ceremonial robes','a flat controlled human breath with a quiet brass token','a restrained human gasp, emotionally muted','a human exhale with cloth settling and a small brass token falling'),
'marblestatue':('Marble Statue','massive animated stone guardian','a heavy stone joint turning','a tight marble crack','a heavy marble form breaking into broad stone pieces'),
'siegeknight':('Siege Knight','heavily armored Hollowed human knight','a flat breath behind an iron visor','a restrained human grunt inside armor','a human exhale followed by heavy plate armor falling'),
'royalarcanist':('Royal Arcanist','Hollowed human court spellcaster','a controlled empty human inhale with fine rune chatter','a short restrained human gasp','a human exhale as glass runes extinguish'),
'revenant':('Revenant','independent undead lunging fighter','a dry ragged dead throat rasp','a clipped bone-dry rasp','a short dry rasp and loose body collapse')}
for eid,(name,body,alert,hurt,death) in ENEMIES.items():
 for event,detail,dur,var in [('alert',alert,1,3),('hurt',hurt,.7,4),('death',death,1.6,3)]:
  add(f'enemy.{eid}.{event}','Enemy bodies and voices',name+' '+event,f'{name} {event}; position at actor, throttle repeated pain reactions',f'{detail.capitalize()}, {body}, no words',dur,var,source='ENEMY.'+eid,notes='Use death once, not both generic and species death. Hollowed humans remain human; do not give all enemies zombie voices.')
# Warning and actual action are independently triggered; the impact may miss the player.
ATTACKS={
'grunt':[('melee','iron and leather gather for a deliberate strike','a short rough iron weapon swish')],
'flyer':[('swoop','leathery wings tense with a brief rising screech','wings slice low through air in a fast swoop')],
'emberling':[('claw','hot claws scrape together with a dry intake','small fiery claws rake forward'),('ignite','a short hot ember rattle gathers','a tight ignition pops close to the target')],
'frostling':[('claw','ice-covered claws creak under tension','a brittle cold claw swipe'),('chill','thin ice crackles outward softly','a short spreading ring of cold air')],
 'toxling':[('melee','a tight wet throat pressure gathers','a compact venomous body swipe'),('volatile','wet internal pressure rises with sharp spaced bubbles','a small contained venom sack bursts outward')],
'shadeling':[('melee','hollow air draws tightly inward','a thin dark claw sweep'),('fade','a tense hollow breath pinches inward','a soft dark displacement snaps away')],
'sparkling':[('contact','fine magical points buzz briefly before movement','a short star-like arcane crackle lunge')],
'bones':[('strike','dry skeletal joints click into a raised pose','a sharp bony weapon stroke'),('rise','loose buried bones rattle with rising pressure','bones assemble into an upright skeleton')],
'slime':[('hop','thick jelly compresses with a low elastic squeak','a wet heavy jelly leap'),('split','a thick elastic body tears under pressure','two soft jelly masses separate with a sticky pop')],
'slimelet':[('hop','a tiny jelly body squeaks as it compresses','a small wet jelly flick forward')],
'caster':[('orb','a rough unstable arcane tone gathers','a coarse hollow magical orb launches')],
'charger':[('ram','a beast scrapes its front feet and snorts sharply','a heavy animal rush with a short burst of air')],
'mimic':[('reveal','a chest latch chatters unnaturally under tension','a wooden chest jaw tears open with a toothy growl'),('bite','wooden jaws strain apart with a sharp creak','wooden jaws snap hard with blunt teeth'),('lunge','iron chest corners drag backward briefly','a heavy wooden chest lunges forward with a creaking rush')],
'dustjackal':[('pounce','a jackal growls low and shifts its paws','a quick low canine pounce through dry air')],
'cragspitter':[('rock','stones grind inside a throaty intake','one heavy rock ejects with a coarse stony cough')],
'galewisp':[('dive','wind gathers into a short rising whistle','a sharp spiraling gust dives down')],
'thornboar':[('charge','a boar stamps once and sucks in a forceful snort','a heavy tusked boar rush with pounding air')],
'sporeback':[('swipe','a soft fungal body creaks under a slow inhale','a damp heavy limb swings forward'),('death_burst','a fallen fungal sack builds pressure with urgent spaced wet pops','a spore sack releases a broad soft dusty puff')],
'sentinel':[('strike','heavy hollow iron joints cock into a striking pose','a slow heavy iron arm sweeps forward')],
'frostshell':[('strike','a heavy ice shell creaks over tightening limbs','a weighty frozen limb swings with brittle air')],
'frostlobber':[('shard','a crystalline shard scrapes into position','one heavy ice shard launches with a cold glass crack')],
'magmaskit':[('rush','small hot feet scrape and click rapidly','a quick chitinous creature rush with cinder crackle'),('trail','a thin line of embers catches with spaced warning ticks','a narrow fire trail flares briefly')],
'embertotem':[('eruption','a stone furnace vent inhales and rattles under pressure','a circular fire blast erupts from a stone vent')],
'blinkstalker':[('blink','a directional thin spatial strain gathers at the destination','a dark air snap as a creature reappears'),('claw','dry claws tighten with a short hollow rasp','a swift tearing dark claw stroke')],
'voidtether':[('link','a taut hollow string tone rises briefly','a thin dark energy tether attaches with a tight latch')],
'sunpriest':[('bolt','warm but unnervingly rigid brass light gathers','a straight sharp radiant bolt fires'),('heal','three controlled hollow bell taps gather','a restrained outward wash of pale restorative light')],
'marblestatue':[('strike','massive marble joints grind into a raised position','a heavy stone arm swings through air')],
'siegeknight':[('strike','iron armor shifts with a deliberate boot plant','a forceful iron weapon sweep'),('crush','a great iron weapon scrapes upward with a tense breath','a heavy iron weapon crashes downward with dense air')],
'royalarcanist':[('volley','three dissonant glass runes charge in measured sequence','three sharp court-magic orbs launch in a fan')],
'revenant':[('lunge','dry joints tense and a dead breath catches','a fast low ragged-body lunge')]
}
for eid,moves in ATTACKS.items():
 for action,warn,release in moves:
  for phase,sound,dur in [('warn',warn,.7),('release',release,1)]:
   add(f'enemy.{eid}.{action}.{phase}','Enemy attacks',ENEMIES[eid][0]+' / '+action.replace('_',' ')+' / '+phase,f'{eid}.{action}: trigger on '+('visible wind-up start; never after damage' if phase=='warn' else 'actual action release, even on miss'),sound.capitalize(),dur,3,priority='P0',source='ENEMY / specBehavior / enemy update',notes='Warning length is an editing target, not new attack timing. Use combat.hit.* or element.* on confirmed collision. For spore death: death -> warning -> delayed puff; never bake all three into one file.',refs=['combat.hit.flesh'])
block('Enemy state effects','''enemy.goblin.escape|Treasure Goblin escape|1.2|A frantic small creature scamper with coins rattling away, no words
 enemy.sporeback.cloud|Active spore cloud|3|A very quiet dry fungal dust hiss, steady and local
 enemy.sentinel.block|Sentinel armored front blocks|0.8|A thick hollow iron shield impact with a short hard ring
 enemy.frostshell.crack|Frostshell armor cracks open|1|A dense ice shell breaking in two stages, brittle chips falling
 enemy.marblestatue.crack|Marble shell cracks|1.2|A heavy marble shell splitting with short rock debris
 enemy.voidtether.loop|Tether actively buffs allies|3|A thin taut dark magical vibration, quiet and stable
 enemy.voidtether.break|Tether broken|0.8|A tight dark energy string snaps and unravels
 enemy.shadeling.return|Shadeling becomes visible|0.7|A soft hollow air fold opens abruptly
 enemy.elite.spawn|Elite enemy arrival|1.2|A heavier iron step and short low magical pressure pulse
 enemy.elite.shield|Elite shield activation|1|A dense rough magical shell clicks closed
 enemy.elite.enrage|Elite enrage|1|A coarse forceful breath of energy with a low iron jolt
 enemy.spawn|Generic authored reinforcement arrival|1|Boots land with a compact gear rattle, no portal effect
 enemy.dummy.hit|Training dummy contact|0.5|A firm strike into packed straw and wood, dry and punchy
 enemy.bosscrystal.hit|Boss crystal struck|0.6|A dense magical crystal rings with a rough unstable edge
 enemy.bosscrystal.break|Boss crystal destroyed|1|A magical crystal shatters outward then cuts its hum sharply''')
for c in CUES:
 c['id']=c['id'].strip()
 if c['id'] in ['enemy.sporeback.cloud','enemy.voidtether.loop']:
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')
# Boss designs: source-backed current attacks plus approved encounter direction. No old early King story.
BOSSES={
'brute':('The Brute','enormous living brute, raw breath, rough hide and heavy earth',CURRENT),
'marksman':('Hollow Marksman','Hollowed human marksman, tense bow fiber, dry leather and restrained breath',CURRENT),
'fallen':('The Fallen','human-sized Hollowed champion, disciplined heavy steel and worn armor',CURRENT),
'frost_caster':('Frost officer: Sorcerer','Hollowed human caster, cold crystal and controlled breath',CURRENT),
'frost_shield':('Frost officer: shield','Hollowed human officer, iron shield and cold leather',PLAN),
'frost_spear':('Frost officer: spear','Hollowed human officer, long steel spear and cold air',PLAN),
'ember_colossus':('Ember Colossus','towering forge-powered body, iron, molten pressure and grinding stone',CURRENT),
'hydra':('Chained Sea Hydra','enormous living sea reptile, deep throat, scales, water and iron restraints',PLAN),
'marble_colossus':('Marble Colossus','towering marble guardian, heavy stone joints and focused radiant energy',CURRENT),
'legion_commander':('Legion Commander replacement','Hollowed human commander, imposing iron armor and controlled human breath',PROPOSAL),
'king_half':('Abyss King: half Void-infused','human tyrant in heavy armor with one half carrying immense dark spatial pressure',PLAN),
'king_full':('Abyss King: fully Void-infused','vast dark spatial force around a powerful humanoid form, layered soul energy but no words',PLAN)}
for bid,(name,identity,status) in BOSSES.items():
 for event,desc,dur,var in [('entrance',f'{identity}, one imposing arrival with a deep physical weight',3,2),('hurt',f'{identity}, a short restrained damaged reaction, no triumphant element',1,4),('stagger',f'{identity}, a heavy loss of balance and brief exposed resonant weakness',1.5,2),('phase',f'{identity}, power gathers into a clear new-state impact',2.5,2),('defeat',f'{identity}, power and bodily weight collapse and settle',3,2)]:
  if bid=='hydra' and event=='defeat':desc='An enormous sea reptile gives a relieved deep breath and slides gently into open water, alive and freed'
  if bid=='king_half' and event=='defeat':continue
  add(f'boss.{bid}.{event}','Boss presence',name+' '+event,name+' '+event,desc,dur,var,status=status,source='boss registry / CAMPAIGN_EXPANSION_PLAN.md',notes='Separate performance from music and dialogue; human Hollowed bosses are not zombie growls. Final King defeat is NOT the restoration sound.')
BOSS_MOVES={
'brute':[('charge','a huge beast plants its feet and snorts with rising tension','a massive body charges with a deep rushing breath'),('slam','two great arms rise with a tight low throat strain','massive fists smash earth and drive a deep outward shock'),('barrier_stagger','heavy hoof-like scraping as a charge locks forward','an enormous body slams a reinforced timber barrier with a stunned grunt')],
'marksman':[('volley','three bowstring fibers creak under controlled tension','three heavy arrows fire in a crisp fan'),('pin','a thin rising bow harmonic and one distinct target-lock tick','one extremely taut string cracks, a piercing arrow tears forward'),('relocate','a leather harness tightens with a short cloth snap','a short wind glide and firm boot landing')],
'fallen':[('cleave','a great steel blade scrapes into a deliberate raised stance','a clean disciplined heavy sword cuts a wide low arc'),('lunge','one armored boot plants with a tense human inhale','a heavy sword and armored body thrust forward'),('feint_recover','a restrained blade turn and foot shift without an attack crack','a deliberate steel redirect settles into an exposed recovery')],
'frost_caster':[('volley','three hollow ice tones gather together','three cold crystal bolts crack forward'),('nova','ice stress grows in a tight circular creak','a broad cold ring fractures outward'),('blink','a fine ice tension rises briefly','a cold glass snap marks relocation')],
'frost_shield':[('bash','iron shield edge scrapes ice with a hard boot plant','a heavy shield drives forward in a short compact rush'),('guard','cold iron plates tighten into a firm brace','a heavy shield locks with a solid metallic stop')],
'frost_spear':[('thrust','a long spear shaft creaks behind a measured breath','a precise long steel spear cuts straight forward'),('sweep','a spear tip traces a slow tense metal arc','a long shaft sweeps horizontally with a broad cold air cut')],
'ember_colossus':[('pound','massive hot iron joints climb with a deep pressure build','a colossal iron fist pounds stone with furnace weight'),('quake','stone beneath the floor groans in a clear rising line','a row of heavy stone cracks moves forward'),('fireball','a furnace chamber compresses hot air and sparks','a heavy molten orb launches with a deep fire cough'),('sweep','huge hot metal joints grind sideways under tension','an immense hot iron arm cuts a broad sweep'),('vent','a pressure valve rattles with urgent spaced knocks','a short violent furnace vent blast')],
'hydra':[('bite','one enormous reptile neck inhales, iron chain draws taut','a giant wet-scaled head lunges and jaws slam once'),('sweep','a long heavy scaled body drags water with rising chain tension','an enormous neck sweeps sideways with water spray'),('water_blast','a deep throat fills with churning water','one powerful jet of water blasts forward'),('chain_expose','a neck restraint creaks under extreme tension','an iron shackle lands hard against stone, briefly reachable')],
'marble_colossus':[('pound','great marble joints grind upward with a deep stress tone','a massive marble fist strikes the floor'),('light_beam','a focused pure glass tone charges to a clear point','a powerful radiant beam opens with a sharp bright edge'),('armor_open','a carved stone seal strains and grinds','several marble armor seals break open with clear stone cracks'),('sweep','an immense stone arm winds sideways with dust movement','a broad stone arm sweeps through heavy air')],
'legion_commander':[('melee','a commander plants an iron boot and raises a heavy weapon','one disciplined heavy steel command cut'),('reinforce','an iron signal horn draws a short tense breath','one short low nonmelodic horn blast summons reinforcements')],
'king_half':[('melee','heavy black iron turns while one side distorts the nearby air','a powerful iron blade tears through compressed dark space'),('soul_bolt','dense dark energy gathers with strained glass undertones','one heavy soul-energy bolt launches with a sharp hollow crack'),('shockwave','the floor vibrates under a tightening low pressure','a deep dark pressure wave breaks outward'),('gate_draw','a black opening pulls air into an impossible depth','a huge stream of dark energy locks into an armored body')],
'king_full':[('void_sweep','space tightens into a thin rising dark edge','an immense dark blade tears a wide arc through air'),('barrage','five uneven hollow points of energy gather with clear ticking tension','five compressed dark orbs burst outward in a controlled spread'),('collapse','stone seams tick rapidly under rising structural stress','a large stone floor section breaks away into deep air'),('rift_strike','a thin tearing line forms with a sharp inward breath','a spatial tear snaps open and slashes outward')]
}
for bid,moves in BOSS_MOVES.items():
 name,identity,status=BOSSES[bid]
 for action,warn,release in moves:
  for phase,sound,dur in [('warn',warn,1),('release',release,1.7)]:
   add(f'boss.{bid}.{action}.{phase}','Boss attacks',name+' / '+action.replace('_',' ')+' / '+phase,f'{name}: {action}, '+('wind-up' if phase=='warn' else 'actual attack'),sound.capitalize(),dur,3,priority='P0',status=status,source='bossTick / bossSignature / campaign boss outline',notes='Sync warning to visible tell; trim to actual wind-up. Material collision uses shared impact plus this boss signature. Never make louder mean more damage. Approved-outline moves remain planned until runtime replacement.')
# Audit which mechanics are still legacy rather than pay to cement obsolete story content.
block('Legacy boss mechanics','''boss.legacy.ward|Current generic boss ward activation|1.5|Three unstable magical crystal tones lock into a hard shell
boss.legacy.ward_break|Current generic boss ward interrupted|1.5|A brittle magical shell breaks with a short inward collapse
boss.legacy.mirror|Current Frost Sorcerer duplicate forms|1.5|An ice reflection splits with a clear glass crack and cold air
boss.legacy.summon|Current King/shade reinforcement arrival|1.5|A dark shadow form condenses from a low hollow air knot
boss.legacy.rim|Current final arena rim collapse|2|Large stone edges tear loose and fall into deep rushing air
boss.legacy.final_stand|Current shared low-health nova|1.5|A short urgent magical pressure burst with a hard central crack''',status=LEGACY,priority='P2')
block('World interactions','''world.door.wood.open|Wooden door opens|1.5|A heavy wooden door creaks open on old iron hinges
world.door.wood.close|Wooden door closes|1|A heavy wooden door closes into a solid timber latch
world.door.iron.open|Iron door opens|1.5|An old iron door swings with dense hinge friction and metal weight
world.door.iron.close|Iron door closes|1|An iron door closes with a heavy contained metallic stop
world.door.locked|Locked door attempt|0.7|A firm iron latch rattles against a locked wooden door
world.key.turn|Unlock with key|1|An old iron key turns, several tumblers click and a bolt retracts
world.gate.raise|Portcullis raised|3|Heavy iron bars rise with short chain movement and stone track friction
world.gate.stop|Portcullis reaches stop|1|A heavy iron gate reaches its end stop with a deep metal clunk
world.cage.open|Prison cage opened|1.5|A small rusty iron cage door swings open with restrained hinge squeal
world.chain.move|Chain or winch moving|3|A heavy iron chain passing steadily through a mechanical wheel
world.chain.snap|Chain broken|1.5|A highly tensioned iron chain snaps, links recoil and clatter down
world.lever|Pull mechanical lever|1|A weighted iron lever moves through a ratchet and locks firmly
world.switch|Small switch pressed|0.6|A stone button presses inward with a small firm mechanical click
world.pressureplate|Pressure plate activates|0.8|A stone plate sinks under weight, hidden mechanism clicks below
world.wheel|Turn valve wheel|1.5|An old iron handwheel turns with restrained grit and a mechanical catch
world.gear.engage|Gears engage|1|Two heavy wooden and iron gears catch into steady alignment
world.bridge.move|Bridge lowers or rotates|3|Large timber beams and iron chains move under controlled heavy strain
world.bridge.settle|Bridge locks into place|1.2|A wooden bridge settles onto stone supports with a deep safe clunk
world.lift.loop|Lift travels|4|A slow heavy chain lift moving steadily, wood creak and restrained gear grinding
world.lift.stop|Lift arrives|1.2|A chain lift slows into a solid iron catch, a short platform tremor
world.platform.crack|Unstable platform warning|1|Old wood bends and splits slowly with several clear stress cracks
world.platform.fall|Platform breaks|1.5|A timber platform breaks away with large dry splinters and falling boards
world.wall.move|Secret stone wall moves|2|A heavy fitted stone slab slides sideways with a low grinding scrape
world.falsewall|Pass through magical false wall|0.8|A thin magical curtain ripples quietly around a passing body
world.break.crate|Break supply crate|0.8|A small wooden crate cracks into dry boards and short splinters
world.break.barrel|Break barrel|1|A wood barrel splits and iron hoops spring loose
world.break.pot|Break clay pot|0.8|A hollow clay pot breaks into several ceramic fragments
world.break.crystal|Break mineral crystal|1|A solid mineral cluster fractures with a clear brittle ring
world.pick.herb|Gather Tangle Roots or herbs|0.8|Roots pull free of soft earth with a little leaf movement
world.pick.supply|Collect quest supplies|0.7|A small bundle of timber and cloth lifted off the ground
world.pick.document|Collect letter or writings|0.7|A thick folded paper lifted and unfolded once
world.pick.heavy|Lift puzzle weight|0.8|A heavy stone block lifts with a short gritty scrape
world.place.weight|Place puzzle weight|0.9|A heavy stone weight seats into a fitted recess with a low clunk
world.rope.cut|Cut rope|0.6|A taut coarse rope cut cleanly, fibers snap and recoil
world.fire.light|Light brazier or signal fire|1.2|Dry tinder catches rapidly into a compact warm flame
world.fire.extinguish|Fire extinguished|1.2|A controlled flame dies under water with a short soft steam hiss
world.ice.break|Break thin ice barrier|1.3|A thin ice wall cracks and falls in clear brittle sheets
world.mine.cart|Mine cart movement|4|Small iron wheels roll steadily along worn tracks, restrained mechanical rhythm
world.bell|World bell signal|3|One weathered bronze outdoor bell strike with natural short ringing decay
world.horn|World alarm horn|2|One rough low nonmelodic horn blast, urgent and earthy
world.shrine|Activate shrine|1.8|An old carved stone seal resonates awake with a low warm pulse
world.pad.start|Begin small healing pad|1.2|A small warm fountain of light opens with gentle liquid glass sounds
world.pad.loop|Healing pad active|4|Soft warm flowing magical water and sparse clear droplets, steady quiet healing
world.pad.empty|Small healing pad depleted|1|A small magical fountain sputters gently and settles into silence
world.pad.full|Player fully healed|1|A warm clear glass droplet resolves into one soft reassuring ring
world.pad.grand|Mara's rare unlimited pad restored|3|A large warm healing fountain rises through stone with clear water-like light and a welcoming bronze resonance
world.safe_area|Safe rest discovered|1.4|A gentle warm air release and a low reassuring wooden resonance
world.waystone|Waystone travel activation|2|A solid ancient stone tone opens into a neutral bright travel shimmer
world.portal.side|Optional side portal travel|1.5|A quick friendly spatial fold with fine clear glass edges, curious and light''')
for c in CUES:
 if c['id'] in ['world.chain.move','world.lift.loop','world.mine.cart','world.pad.loop']:
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')
block('Loot, shops and crafting','''chest.wood.open|Ordinary wooden chest mechanism|1.3|An old wooden chest latch releases and lid creaks open with a solid hollow body
chest.metal.open|Reinforced chest mechanism|1.6|A heavy ornate metal chest unlocks and opens with several firm mechanical clicks
chest.locked|Locked chest attempt|0.7|A chest latch rattles against a resistant lock, no lid opening
chest.code.tick|Turn code digit|0.5|One small carved stone number wheel clicks into a detent
chest.code.wrong|Incorrect chest code|0.7|A soft low mechanical double knock, restrained refusal
chest.code.correct|Correct code unlocks|1.2|Three small mechanical pins align and a solid lock retracts
chest.empty|Previously claimed chest or shard cash conversion handling|0.6|A hollow wooden tap and tiny cloth movement, no treasure flourish
shop.buy|Purchase confirmed|0.8|A few coins set onto wood followed by an item wrapped in cloth
shop.sell|Sale confirmed|0.8|Several coins slide across a wooden counter into a small purse
shop.poor|Insufficient gold|0.6|A single dull coin drops into an almost empty leather purse
shop.equip.weapon|Equip weapon|0.8|A steel weapon grip settles firmly into a leather-gloved hand
shop.equip.armor|Equip armor|1|Leather buckles tighten with a small chain and plate clink
shop.unequip|Unequip item|0.7|A leather buckle releases and equipment settles softly into cloth
shop.stash|Move item to or from stash|0.7|A wrapped item set into a wooden storage box
shop.sort|Bag group expands/collapses|0.5|A quiet cloth pocket unfolding and small wooden tick
shop.forge.start|Forge work begins|1.2|One heavy hammer strikes hot iron on an anvil with short bright ring
shop.forge.loop|Forge work steady loop|4|Slow deliberate hammering on hot iron with controlled short anvil rings
shop.forge.quench|Forge quench|1.5|Hot steel lowered into water with a strong compact steam hiss
shop.forge.finish|Upgrade or fuse completed|2|A polished blade rings clearly as a final hammer tap resolves, warm and satisfying
shop.salvage|Salvage item|1|Metal fittings taken apart with a short brittle crack and small parts settling
shop.dye|Apply color or appearance|1|Soft cloth turns through a smooth magical color shimmer
shop.mirror|Mirror inspection opens|1.2|A smooth clear glass ripple blooms softly across a polished surface
shop.train|Training purchase confirmed|1.2|A firm practice staff knock and a short disciplined air pulse
shop.gamble|Gamble roll|1.5|A few wooden dice tumble across a worn wooden tray
shop.pet.train|Companion training complete|1.4|A leather collar clasp and a warm living-energy pulse''')
for rarity,texture,dur in [('common','a modest wood tick and small warm metal glint',.7),('uncommon','two clear copper-like taps and a short green-glass shimmer',1),('rare','a bright silver bell body with a cool crystal sparkle',1.5),('epic','a deep polished metal impact opening into rich violet glass harmonics',2),('legendary','a powerful ancient gold resonance with a bright upward spray of light',3)]:
 add('chest.reward.'+rarity,'Loot, shops and crafting',rarity.title()+' loot reveal',f'Reveal {rarity} chest contents or highest rarity in grouped drop; mechanism is separate',texture.capitalize(),dur,2,priority='P0',status=PLAN,notes='Use one highest-tier reveal per reward burst, never one per item.')

# Regional ambience is separate from authored music; no monsters or attacks baked into beds.
REGIONS={
'hub':('Waystation hub','sheltered stone refuge, soft hearth air and gentle outdoor breeze'),
'rift_hall':('Rift Hall','quiet stone chamber with fine crystalline air resonance, welcoming and strange'),
'briar_1':('Briar Town - Homefields','open farm fields, light leaf movement, distant wood creaks and mild breeze'),
'briar_2':('Briar Town - Black Woods','dense woods, canopy rustle and restrained close woodland air'),
'pass_1':('Hollow Pass - Winding Cliffs','dry open canyon, broad wind past stone edges, sparse grit'),
'pass_2':('Hollow Pass - Lost Canyon','sheltered narrow canyon, lower wind and tiny loose gravel movement'),
'keep_1':('Ruined Keep - Broken Walls','exposed ruined stone walls, thin wind and settling grit'),
'keep_2':('Ruined Keep - The Dungeons','enclosed old stone dungeon, low room air and sparse distant water drops'),
'frost_1':('Frostfell - Snowbound Peaks','high snowy mountain, cold broad wind and fine snow movement'),
'frost_2':('Frostfell - Deep Ice Caves','deep ice cave, restrained ice tension and still cold air'),
'ember_1':('Emberdeep - Iron Halls','large working forge hall, distant low furnace air and restrained machinery'),
'ember_2':('Emberdeep - Great Furnace','vast furnace chamber, deep hot air, far molten bubbling and heavy structural vibration'),
'coast_1':('Storm Coast - Shipwreck Shore','rocky shore, distant soft surf, salt wind and occasional timber movement'),
'coast_2':('Storm Coast - Thunder Cliffs','high sea cliffs, strong open wind and distant water far below, no thunder strikes'),
'sunspire_1':('Sunspire - Palace Courtyard','open high marble gardens, clean elevated breeze and sparse foliage'),
'sunspire_2':('Sunspire - Sky Library','vast quiet marble library, soft elevated air and very faint glass-like room resonance'),
'castle_1':('Castle Duskmoor - Castle Gates','distant fortress approach, low cold wind around black iron and stone'),
'castle_2':('Castle Duskmoor - Long Ascent','immense stone tower shaft, vertical air movement and faint distant structural creak'),
'king_arena':('Abyss King summit arena','vast heavy stone throne chamber with faint unstable low air, no Gate baked in'),
'void':('Abyssal Void ending','impossible open darkness, slowly shifting hollow air pressure with no melody or intelligible voices'),
'ending':('Restored Aerth','calm outdoor breeze, gentle leaves and clear open-air warmth')}
for rid,(name,sound) in REGIONS.items():
 add('ambience.'+rid,'Region ambience',name+' bed','Quiet bed under gameplay/music/dialogue; blend at region transition',sound.capitalize(),24,2,True,'P1',PLAN,source='CAMPAIGN_EXPANSION_PLAN.md / latest canon',notes='Stereo bed. No footsteps, combat, music or sharp surprise calls. Proposed half names are working labels, not new canon.')
SPOTS='''env.hearth|Hearth fire|Warm modest hearth crackling gently
 env.brazier|Large brazier|A contained outdoor brazier burns steadily with occasional small ember pops
 env.forge.bellows|Forge bellows|Large leather bellows feeding steady air into a furnace
 env.forge.molten|Molten metal|Thick molten metal moving slowly with low hot bubbles
 env.forge.chain|Distant production line|Distant slow iron chains and heavy gearing, steady and restrained
 env.mill|Briar mill|A wooden mill turns slowly with soft creaks and a faint stream
 env.water.stream|Stream|A narrow clear stream flowing over small stones
 env.water.drip|Single cave drip|One water droplet falls into a shallow pool with a short clean plink
 env.water.surge|Large water surge|A strong short surge of seawater rolls across stone
 env.wind.gust|Exposed ledge gust|A single broad gust of wind sweeps across an open stone ledge
 env.snow.gust|Mountain snow gust|A cold gust carries fine snow past nearby rock
 env.ice.groan|Distant safe ice movement|Deep ice flexes slowly with a low rounded groan, no attack-like crack
 env.ice.drip|Melting ice drip|A clear water droplet falls from ice onto hard cold stone
 env.surf|Coastal surf|Moderate waves wash repeatedly over a rocky beach
 env.gulls|Distant sea bird call|One distant seabird gives a short natural call over otherwise silent air
 env.rigging|Ship rigging|Ropes and small wooden mast fittings strain gently in steady wind
 env.hull|Ship hull|A wooden ship hull creaks slowly under mild wave movement
 env.thunder.far|Nonhazardous distant thunder|A distant low rolling thunder rumble, soft onset and no lightning crack
 env.rain|Rain|Steady light rain falling on mixed stone and earth, no thunder
 env.banner|Banner or hanging clue cloth|A single heavy cloth banner flaps in a light gust
 env.leaves|Local foliage|A small cluster of leaves rustles softly in one breeze
 env.rubble|Safe settling rubble|A few tiny pebbles tumble briefly over old stone
 env.books|Library book movement|One old heavy book shifts on a shelf with paper and leather friction
 env.orb|Sunspire knowledge orb presence|A smooth clear glass resonance turns slowly around a warm inner pulse
 env.laboratory|Ellis laboratory|Small glass vessels tick gently beside a quiet measured magical device
 env.crowd|Safe settlement nonverbal presence|Distant soft footsteps, cloth and small tool handling, no intelligible voices
 env.cage|Prison cage movement|A small iron chain shifts gently against a cage bar
 env.souls|Void soul presence texture|Many very soft human breath-like wisps moving in distant open space, no words or screams'''
LOOP_SPOTS={'hearth','brazier','forge.bellows','forge.molten','forge.chain','mill','water.stream','surf','rigging','hull','rain','orb','laboratory','crowd','souls'}
for row in SPOTS.splitlines():
 id,name,sound=row.strip().split('|',2);loop=id.removeprefix('env.') in LOOP_SPOTS
 add(id,'Environmental sources',name,'Spatial environmental source; distance-cull and separate from ambience bed',sound,8 if loop else 2,2 if loop else 4,loop,'P1',PLAN)
# Hazard tells must stand out from harmless ambience.
HAZARDS={
'fire_vent':('Fire vent','a hot pipe rattles in three short pressure knocks','a forceful narrow hot-air flame jet'),
'lava':('Molten ground edge','a close hot surface spits with a sharp warning sizzle','a thick bubbling hot surface'),
'ice_floor':('Breaking ice floor','thin ice cracks in several urgent short ticks','a sheet of ice drops into cold water'),
'falling_rock':('Falling rock','loose grit falls under a sharp overhead stone stress','a heavy rock crashes into stone'),
'spikes':('Mechanical spike trap','small iron catches release in a tense short sequence','iron spikes thrust rapidly upward'),
'swing_blade':('Swinging trap blade','a loaded iron pivot tightens with a brief squeak','a heavy blade swings through air'),
'poison_pool':('Authored poison hazard','small poisonous bubbles rise in a sharp short pattern','quiet acidic bubbling and close vapor hiss'),
'lightning':('Cliff lightning strike','a rising close static hiss with distinct spaced snaps','one sharp nearby lightning crack with compact thunder'),
'wind_push':('Hazardous cliff gust','wind gathers into a clear short rising whistle','a powerful directional gust pushes across a ledge'),
'water_surge':('Tidal surge','water draws back with a tense rushing inhale','a large wave pounds across stone'),
'floor_collapse':('Collapsing stone floor','structural stone seams crack in a quick escalating pattern','a stone floor section tears away and drops'),
'beam':('Dangerous rotating beam','a hard focused magical tone rises with a clear sharp edge','a steady tightly focused searing energy beam')}
for hid,(name,warn,action) in HAZARDS.items():
 add('hazard.'+hid+'.warn','Hazards',name+' warning',name+' visible warning begins',warn.capitalize(),.9,2,priority='P0',status=PLAN,notes='Only place in authored thematic locations. Pair with visible tell, never audio-only puzzle/attack. Warning must precede hitbox.')
 add('hazard.'+hid+'.active','Hazards',name+' active',name+' actually becomes dangerous',action.capitalize(),2,3,loop=hid in ['lava','poison_pool','beam'],priority='P0',status=PLAN)
block('Boss arena mechanisms','''arena.brute.barrier|Brute stagger barrier cracks|1.5|A reinforced timber cart splinters under enormous weight, heavy beams remain
arena.marksman.cover|Marksman arrow hits cover|0.8|A heavy arrow strikes stone cover, sharp crack and short shaft rattle
arena.frost.role_change|Frost trio survivor role shift|1.3|Two distinct cold iron signals answer each other with a short glass pulse
arena.frost.officer_down|One Frost officer defeated|1.5|One cold metal resonance stops while two quieter different tones remain
arena.ember.coolant|Cooling channel opens|3|A heavy valve releases a strong controlled stream of cooling water
arena.ember.cool|Colossus armor cools|2|Very hot iron cools rapidly with dense steam and tightening metal clicks
arena.ember.joint|Exposed Colossus joint hit|1|A dense hot mechanical joint struck with a clear vulnerable metallic crack
arena.ember.repair|Repair crew works|1.5|Quick small iron hammer taps and gear handling, no voices
arena.hydra.chain.hit|Hydra neck restraint struck|0.8|A thick loaded iron chain struck hard, tight rattling metal ring
arena.hydra.chain.break|Hydra restraint freed|2|A huge iron neck shackle snaps open, tension releases and heavy links splash down
arena.hydra.neck.recover|Hydra head rests after bite|1.5|A huge wet scaled neck settles on stone, slow breath and dripping water
arena.hydra.depart|Freed hydra retreats|4|An enormous sea creature slips into deep water, relieved breath and broad receding waves
arena.marble.screen|Move protective screen|2|A tall marble-and-metal screen rolls heavily into a new aligned position
arena.marble.reflect|Boss attack redirected into armor seal|1.3|A massive stone strike redirects with a clean glass flash and cracking carved seal
arena.castle.stair|Tower stair structural stress|2|A huge stone staircase groans under distant force, short debris rattles
arena.king.pillar|King attack breaks pillar|2|A large stone pillar shears under impossible dark pressure and breaks into heavy pieces
arena.king.gate.surge|Central Hollow Gate surges during battle|3|A vast black opening pulls air inward with immense hollow pressure and fine tearing edges''',status=PLAN,priority='P0')
block('Quests, puzzles and NPC interactions','''quest.turnin|Hand supplies to NPC|1.2|A cloth bundle passes between hands and rests on a wooden surface
quest.npc.reward|NPC hands reward to player|1.2|A wrapped object passes into waiting hands with a small warm metal clink
quest.clue.discover|World clue noticed|0.8|A quiet clear hollow glass touch with a small curious upward breath
quest.objective.reveal|Next main objective revealed|1.3|A parchment unfolds with a short focused bronze accent
quest.route.open|New route physically unlocked|1.7|An old stone latch releases and air flows through a newly opened passage
quest.npc.new|NPC has meaningful new dialogue|0.8|A small warm wooden bell tap, inviting and understated
quest.relationship.warm|NPC trust improves, optional feedback|0.8|A soft warm cloth-and-wood touch, subtle friendly resolution
quest.relationship.cold|NPC closes optional dialogue branch|0.8|A short dry wooden stop, restrained and cool without a failure alarm
quest.relationship.repair|Trust repair acknowledged|1|A gentle previously tense wooden latch releases with a warm breath
quest.field.complete|Field objective done without return|1.5|A firm wood stamp and clean compact brass resonance
quest.self.start|Player discovers task worth doing|1|A low curious glass pulse opens into a small warm tick
quest.breach.start|Hold-the-breach encounter begins|1.2|A firm distant defense horn pulse with a short timber brace impact
quest.breach.last|Final seconds of timed defense|0.6|A short clear low wooden pulse, urgent but not a panic siren
quest.breach.success|Breach held and escape safe|2|A strained timber brace settles securely and a warm bronze bell rings briefly
puzzle.rotate|Turn carved puzzle piece|0.8|A carved stone block rotates with a gritty scrape and firm detent
puzzle.align|One puzzle component correctly seated|0.6|A fitted stone pin clicks neatly into place
puzzle.reset|Puzzle safely resets|1|Small stone latches retract in a soft descending sequence
puzzle.success|Complete environmental puzzle|1.8|Several old stone locks align, a large hidden bolt releases and clear air opens
puzzle.fail|Incorrect but recoverable puzzle input|0.7|A dull short stone double knock without a harsh buzzer
puzzle.water|Water route changes|2|A wooden water barrier lifts and water redirects strongly into a new channel
puzzle.mirror|Light reflector rotates|1|A polished mirror turns in a brass frame with a clear small mechanical click
puzzle.beam.link|Light beam connects puzzle targets|1|A fine clear light tone snaps into a stable connection
puzzle.weight.balance|Balanced weight mechanism|1.2|Two heavy stone weights settle into balance and a central latch clicks
puzzle.secret.panel|Hidden puzzle panel revealed|1.5|A small fitted stone panel slides open with dust and a hollow air release
npc.first_intro|First meeting introduction cue|1|A warm subtle parchment-and-brass welcome, small and personal
npc.shop.direct|Skip story and open services|0.6|A wooden counter tap and small cloth movement
npc.speech.start|Optional speech-start cue|0.5|A very soft cloth movement before a conversation, no vocal syllable''',status=PLAN)
# Unique NPC prop/occupation cues, not a paid generated voice for every dialogue line.
NPCS='''Thomas|Briar Town|dad reluctantly prepares you|a worn leather belt tightening around a simple tool sheath
Mara|Briar Town|medic treats villagers|clean cloth bandages unroll beside a small glass medicine bottle
Gus|Briar Town|mill worker supplies|a wooden mill handle turns and a sack of grain settles
Lewis|Briar Town|injured scout|a paper route note unfolds beside a light leather strap
Beth|Briar Town|shepherd and animal rescue|a wooden shepherd staff touches earth beside a small collar bell
Caleb|Hollow Pass|escaped prisoner|a broken iron restraint shifts against worn cloth
Skip|Hollow Pass|climber|a climbing rope pulls through a metal anchor with a dry fiber creak
Captain Ward|Hollow Pass|Hollowed officer|a disciplined iron gauntlet taps a rigid armor plate
Ruth|Hollow Pass|prisoner organizer|a bundle of small iron keys shifts quietly in cloth
Grant|Ruined Keep|guard|a worn shield rests against stone with a quiet metal knock
Felix|Ruined Keep|locksmith|small lock picks probe an old iron lock with precise tiny clicks
Walter|Ruined Keep|stoneworker|a small mason hammer taps stone and a few grains fall
Sly|Ruined Keep|prisoner and optional restitution|a concealed small coin rolls over knuckles and stops
Heath|Frostfell|mountain guide|a wooden walking pole plants into hard snow
Professor Ellis|Frostfell|rescued researcher|a glass instrument clicks beside turning paper notes
Hugo|Frostfell|explorer|a metal climbing hook is checked against a rope
Flint|Emberdeep|smith|a small controlled hammer strike rings on an anvil
Jack|Emberdeep|furnace worker|a heavy iron work tool rests beside a leather glove
Foreman Pike|Emberdeep|Hollowed overseer|an iron-tipped command staff knocks once against a metal floor
Martin|Emberdeep|worker organizer|a rolled work plan opens over a rough wooden table
Otto|Storm Coast|boatbuilder|a wooden mallet seats a ship plank with a tight rope creak
Captain Rose|Storm Coast|male sailor|a small brass compass closes and a heavy coat shifts
Abe|Storm Coast|fisher and hydra clue|a coil of fishing rope settles beside a small wooden float
Dash|Storm Coast|scavenger|a mixed bundle of salvage metal and wood shifts in a cloth sack
Sister Grace|Sunspire|caretaker|garden shears close gently beside a small water vessel
Sergeant Victor|Sunspire|defender|a polished shield strap tightens with a restrained brass clink
Master Hugh|Sunspire|senior keeper|a large old leather book opens with careful heavy pages
Simon|Sunspire|junior keeper|a small stack of loose papers is quickly straightened on wood
Roland|Duskmoor|armor maker and disguise|a shaped armor plate settles on padded cloth with a buckle click
Gate Captain Cross|Duskmoor|Hollowed gate guard|a heavy spear butt plants once on stone with a visor click
Miles|Duskmoor|living servant and captive release|a quiet heavy key turns in a service-door lock
Quartermaster|Waystation|shopkeeper|a quill scratches a short entry beside a small coin purse
The Smith|Waystation|forge services|a file strokes a steel edge once with a clear short rasp
Beastkeeper|Waystation|companions|a leather harness buckle closes beside a quiet feeding bowl
Keeper|Waystation|appearance services|soft cloth folds beside a polished handheld mirror
Drillmaster|Waystation|training|a wooden practice weapon taps a padded target
Rift guide|Rift Hall|repurposed Shade, final name unresolved|a fine crystalline staff-like resonance turns softly in quiet air'''
NPC_ROSTER=[]
for row in NPCS.splitlines():
 name,where,role,sound=row.split('|');nid=re.sub('[^a-z0-9]+','_',name.lower()).strip('_')
 NPC_ROSTER.append(dict(name=name,region=where,role=role,voice_work='Human-recorded introduction, repeat greeting, quest stages, branch responses and changed-world reactions; stable line IDs; no generated dialogue in this SFX bank.'))
 add('npc.'+nid+'.prop','NPC signature foley',name+' signature action',where+'; '+role,sound.capitalize(),1.3,3,status=PLAN,notes='Only trigger with visible matching prop action. No idle repetition while reading. Prop is a sound-design proposal, not a new quest or mandatory animation.')
for reaction,sound in [('agree','one warm human nonverbal affirmative breath'),('doubt','one thoughtful restrained human hum without words'),('annoyed','one short irritated human exhale'),('amused','one brief natural amused chuckle'),('surprised','one small surprised inhale'),('relieved','one soft relieved breath')]:
 for voice in ['male','female']:
  add(f'npc.reaction.{voice}.{reaction}','NPC performance references',f'{voice.title()} NPC {reaction}',f'Performance brief for Oliver/wife; use only where a line calls for {reaction}',f'Adult {voice}, {sound}, intimate natural acting',1.2,3,status=PLAN,priority='P2',notes='Optional human recording preferred. No automatic approval/disapproval UI that gives away dialogue outcomes.')

PETS={'emberpup':('Ember Pup','small warm dog, light cinder breath','a quick puppy bite snap'), 'stonewhelp':('Stone Whelp','small stone-bodied loyal creature','a dense stony headbutt'), 'wisp':('Pale Wisp','small floating pale light creature','a fine clear light bolt'), 'mender':('Mending Sprite','small leafy healing sprite','a warm living light pulse'), 'coinsprite':('Coin Sprite','small bright coin-gathering sprite','a tiny gold coin pulled through air'), 'gravewraith':('Grave Wraith','small spectral dark companion','a thin hollow spectral bolt'), 'spiritwolf':('Spirit Wolf','large spectral wolf with soft blue air','a strong spectral wolf bite lunge')}
for pid,(name,body,attack) in PETS.items():
 for phase,sound,dur in [('summon',body+' gathers into a warm friendly arrival',1.6),('action',attack,.8),('hurt',body+' gives a brief restrained hurt reaction',.7),('down',body+' loses energy and settles softly',1.3),('recover',body+' returns with a small warm living breath',1.1)]:
  add('pet.'+pid+'.'+phase,'Companions and summons',name+' '+phase,name+' '+phase,sound.capitalize(),dur,3,source='PETS.'+pid,notes='Friendly cues softer than hostile tells; prioritize nearby meaningful attacks/heals, not every summoned unit.')
block('Companions and summons','''summon.skeleton.step|Skeleton ally locomotion|0.6|Light dry bone joints and one small bony footfall, friendly restrained weight
summon.skeleton.attack|Skeleton ally attack|0.7|A quick dry bone-and-steel swipe, small and clear
summon.skeleton.expire|Skeleton summon expires|1|A small skeleton gently collapses into dry loose bones
summon.risen.tint|Raised enemy undead identity overlay|0.8|A soft bone-dry magical pulse, low and restrained, no voice
summon.command|Minion command acknowledged|0.6|A short dry bone click resolves into a quiet obedient pulse
summon.dismiss|Companion dismissed|1|A friendly magical body gently unravels into warm thin air
mount.on|Mount companion|1|Leather saddle shifts under body weight, straps tighten and cloth settles
mount.off|Dismount companion|1|Leather saddle releases weight and two boots touch down softly
mount.ground.walk|Ground mount footfall|0.7|One large padded animal paw step with solid ground contact
mount.ground.run|Ground mount running footfall|0.7|One forceful large padded animal paw landing, athletic and heavy
mount.ground.jump|Ground mount jump|1|A strong animal body pushes off with leather strap tension and air rush
mount.ground.land|Ground mount landing|1.2|Four large padded paws land with a heavy controlled ground thump
mount.dragon.wing|Small dragon wingbeat|1.2|One strong leathery dragon wingbeat, rich flexible membrane and clean air push
mount.dragon.launch|Dragon takeoff|2|A small powerful dragon leaps and drives two heavy wingbeats downward
mount.dragon.glide|Dragon glide air|5|Smooth air moving past broad leathery wings, steady gentle flutter
mount.dragon.land|Dragon landing|1.5|A small dragon touches down on strong clawed feet and folds heavy wings
mount.dragon.tired|Flight limit nearing|1|A restrained strained dragon breath and slowing wing effort, not an alarm
mount.dragon.call|Friendly dragon call|1.5|A small dragon gives a warm throaty chirr with a little chest resonance''',status=PLAN)
block('Rift Shards and class trials','''rift.shard.near|Very close shard resonance|3|A delicate irregular purple crystal shimmer with clear airy gaps, curious and inviting
rift.shard.pickup|Physical Rift Shard collected|1.8|A fine purple crystal breaks into light and gathers inward with a crisp bright chime
rift.shard.reward|Rift Shard awarded by quest|1.8|A small crystalline seal opens in the hand with clear violet light and a warm bright pulse
rift.shard.first|First shard tutorial reveal|3|A curious crystal tick opens into an airy expanding magical reveal, clear and welcoming
rift.shard.bank|Shard progress becomes permanent at half completion|1.5|A delicate crystal fragment locks firmly into a resonant fitted socket
rift.shard.five|All five distinct shards banked|3|Five clear crystal pieces join in order into one rich stable glowing resonance
rift.shard.duplicate|Previously banked shard becomes gold|0.8|A tiny crystal tick resolves into a modest gold coin clink, not a new discovery flourish
rift.assemble|Hub guide combines five shards|4|Five crystalline frame pieces turn and click together, building a stable open airy resonance
rift.frame.idle|Restored Secret Rift idle|8|A stable inviting crystalline frame hum with delicate violet glass flecks, bright and safe
rift.open|Class trial Secret Rift opens|2.5|A bright crystalline doorway unfolds with fine glass locks and an open airy shimmer
rift.enter|Enter Secret Rift|1.8|A clean crystal curtain ripples around a passing body then releases into open air
rift.return|Return from class trial|1.5|A familiar crystalline ripple settles warmly back into place
rift.trial.start|Mentor begins trial|1.5|A firm clean practice bell and a short focused magical air pulse
rift.trial.objective|Trial task completed|1|A small clear metal practice bell with a short focused finish
rift.trial.fail|Trial retry offered|1|A gentle low glass pulse folds inward, encouraging rather than punishing
rift.trial.pass|Mentor accepts successful trial|3|A clear practiced steel resonance joins an inviting crystalline bloom, mastery earned
rift.necro.lock|Five shards ready but ending required|0.8|A crystal frame briefly resonates against a soft closed stone seal''',status=PLAN,priority='P0')
for c in CUES:
 if c['id'] in ['rift.shard.near','rift.frame.idle','mount.dragon.glide']:
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')
# Layer with each class signature, not sixteen almost-identical portal files.
TRIAL_MAP={'briar':'berserker','pass':'ninja','keep':'reaper','frost':'chronomancer','ember':'pyromancer','coast':'pirate','sunspire':'paladin','castle':'necromancer'}
block('Ship crossing','''ship.build.plank|Seat repair plank|1|A wooden mallet firmly seats a thick ship plank
ship.build.rope|Tie rigging|1|A thick rope knot pulls tight with a clear fiber creak
ship.build.sail|Hoist repaired sail|2|Heavy canvas unfurls upward as ropes slide over wooden pulleys
ship.launch|Boat launches from shore|3|A wooden boat slides over wet sand into water with a broad gentle splash
ship.steer|Steering wheel movement|0.8|An old wooden ship wheel turns through a creaking quarter rotation
ship.turn|Hull leans into turn|2|A wooden hull strains gently as water shears along one side
ship.water.loop|Travel wake|8|A steady wooden boat wake cuts through moderate open water
ship.row|Oar stroke if used|1.3|One long wooden oar dips and pulls strongly through water
ship.impact.light|Brush floating obstacle|1|Wet timber knocks against a ship hull with a short scrape
ship.impact.heavy|Boat collision|1.5|A heavy floating log strikes a wooden hull with splinters and water spray
ship.damage.warn|Hull badly damaged|1|A clear close wood stress crack and brief water seep
ship.repair|Repair during crossing if implemented|1.5|Two quick wooden mallet hits tighten a damaged boat plank
ship.boarding.warn|Enemy boarding warning|1.2|A grappling hook catches the ship rail with rope tightening
ship.boarding.land|Enemy boards deck|1|Two heavy boots land on hollow ship decking with armor clatter
ship.cannon.fire|Ship cannon fires if fitted|1.8|A compact old naval cannon fires with heavy dry powder boom and restrained wood recoil
ship.cannon.splash|Cannonball water impact|1.8|A heavy cannonball punches deep water, tall compact splash
ship.rocks.warn|Dangerous rocks approach cue|0.8|One clear wooden hull lookout clack, urgent and nonverbal
ship.roles.offer|Co-op role exchange offered|0.7|Two distinct light wooden taps facing each other
ship.roles.swap|Steering and fighting roles swap|1|Two small brass clicks exchange positions then settle
ship.arrive|Boat reaches safe landing|3|A wooden hull slows into a sheltered dock, rope tightens and water settles
ship.fail|Crossing failed and retry|2|A short low timber groan and muted water rush settling down''',status=PLAN)
block('Finale and story scenes','''gate.hollow.idle|The single central Hollow Gate|12|An immense black doorway with impossible depth, low inward air pressure, fine light-like particles pulled inward, unsettling and nonmusical
 gate.hollow.approach|Approach Hollow Gate threshold|3|A vast dark opening draws nearby air inward with a restrained deep pressure pull
 gate.hollow.cross|Ordinary person walks through Hollow Gate|2|One subtle door-like spatial ripple followed by a quiet inward soul-thread separation, bodily footsteps continue normally
 gate.hollow.bind|King's controlling connection establishes|1.8|A thin deep dark thread tightens into a firm inward lock, emotionally cold
 story.orb.awaken|Sunspire orb becomes attentive|3|A clear ancient glass sphere resonates awake, warm intelligent airy light gathering
 story.orb.question|One question committed|1.5|A single clear crystalline pulse locks gently into a listening silence
 story.orb.vision|Orb shows trapped souls|4|Smooth clear glass opens into immense hollow distant air and soft scattered breath-like presence, no words
 story.orb.close|Orb answer ends|2|A vast glass resonance closes softly into one quiet stable light
 story.king.recognition|King realizes player is Bladeborn|2|A confident dark pressure falters into a brief thin glass crack and suspended breath
 story.king.plunge|King fully enters Void|3|A huge dark pressure surge forces through a narrow spatial tear with strained iron undertones
 story.king.struggle|King fights the Void to escape|5|Enormous opposing air forces strain against a dense dark center, harsh spatial tearing without soul destruction
 story.king.return|Fully infused King emerges|4|A vast dark membrane tears outward as immense compressed energy steps into reality
 story.king.anchor_break|King defeated, control anchor fails|3|A deep binding thread snaps through several dark resonant layers, unstable not victorious
 story.void.overload|Overloaded Gate consumes battlefield|6|Huge conflicting pressures pull stone and air into an expanding black tear, intense rising spatial strain
 story.void.arrive|Player enters Abyssal Void|4|Violent air collapses into immense open hollow stillness with scattered distant breath-like wisps
 story.ian.appear|Ian's spirit appears|4|A warm ancient iron resonance lights softly inside empty space, calm and deeply reassuring
 story.ians_blade|Ian's Blade revealed in cutscene|4|Massive black iron resonates with a warm ember core and a fine tarnished-gold sacred ring
 story.cut.charge_start|Final Void cut charging begins|2|A legendary iron blade gathers warm deep sacred energy with a clear rising core
 story.cut.charge_loop|Interactive Space charge held|5|Steady strong sacred blade energy under dark resisting pressure, sustained tension without final impact
 story.cut.press|Space press progress feedback|0.5|A short low warm energy pulse feeding a larger force, soft enough for rapid repeated input
 story.cut.danger|Charge timer approaching failure|1|Three short spaced deep tension knocks, readable urgency without harsh alarm
 story.cut.fail|Charge attempt fails, retry only|2|Gathered warm energy buckles and exhales softly, unresolved rather than fatal
 story.cut.skip|Skip unlocked after five failures|0.8|A small neutral clear glass tap, no punishment or victory fanfare
 story.cut.release|Blade cuts binding at source|5|One enormous clean sacred blade stroke splits dense dark pressure, vast tearing threads followed by open clear air
 story.souls.free|Souls released, bodies restored|6|Countless fine airy threads stream outward into warm living light, relieved human breaths without words
 story.restoration|Aerth becomes whole|5|Dark pressure dissolves into clear natural air, warm bells and soft life-like breaths, hopeful without a melody
 story.escape|Player returns from Void|3|A bright clean spatial tear opens and settles into grounded outdoor air
 story.ending.handoff|Ian's legacy settles, optional scene transition|2.5|A calm ancient iron tone fades into a warm clear breath, intimate and complete''',status=PLAN,priority='P1')
for c in CUES:
 c['id']=c['id'].strip()
 if c['id'] in ['gate.hollow.idle','story.cut.charge_loop','ship.water.loop']:
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')
block('Co-op, modes and system events','''coop.join|Friend joins session|1|Two friendly wooden taps resolve into a warm small bell
coop.leave|Friend leaves session|0.8|A soft lower wooden tap and gentle short air release
coop.disconnect|Connection lost|1|Two muted separated low ceramic knocks, clear without panic
coop.reconnect|Connection restored|1|A small firm latch reconnects with a warm clear click
coop.ping.here|Teammate location ping|0.7|One short clear hollow wood ping, neutral and directional
coop.ping.danger|Teammate danger ping|0.7|Two urgent tight metal taps, distinct from attacks
coop.ping.loot|Teammate loot or shard ping|0.8|A small curious crystal tick, not a collection sound
coop.down|Teammate downed|1.3|A low firm two-part warning pulse with a restrained human-weight thump
coop.revive.start|Start reviving teammate|1|Warm energy gathers softly with cloth movement
coop.revive.loop|Revive progress loop|3|A quiet warm rising-and-settling energy pulse, steady without a completion flourish
coop.revive.success|Teammate revived|1.5|A warm clear energy release and relieved breath-like air
coop.revive.cancel|Revive interrupted|0.7|Warm gathered energy gently breaks apart, no harsh failure alarm
coop.ready|Player ready at shared transition|0.7|A small firm wooden latch clicks ready
coop.wait|Waiting for party|0.7|A quiet neutral double wooden tap, only once on state entry
mode.start|Challenge or arena begins|1.5|A strong clear bronze practice bell, compact and decisive
mode.count|Countdown tick|0.5|A single clear low wooden strike
mode.go|Countdown go|0.8|A bright firm bronze strike with a short energetic air accent
mode.wave|New enemy wave|1.2|A short low battle horn pulse with a tight drum-like body
mode.clear|Wave cleared|1.2|A compact warm brass resolution, restrained enough for repeated rounds
mode.bossrush|Next Boss Rush encounter|1.6|A heavy iron gate latch releases with one clear challenge bell
mode.descent.floor|Abyssal Descent floor reached|1.5|A descending stone lock settles into a dark restrained resonance
mode.descent.choice|Descent boon chosen|1.2|An ancient carved seal clicks into place with a curious magical pulse
mode.descent.risk|Descent curse or risk accepted|1.2|A rough dark stone seal locks with a tense low scrape
mode.descent.cashout|Descent rewards banked|2|A heavy coin purse and stable warm stone seal lock together
mode.sprint.coin|Treasure sprint pickup|0.5|One bright tiny coin tick, short and clean for fast repeats
mode.sprint.extend|Treasure sprint time gained|0.8|A clear rising glass tick, energetic but brief
mode.sprint.finish|Treasure sprint finish|2|A bright small bronze burst and a compact coin shower
mode.arena.kill|Arena elimination confirmed|0.8|A short decisive steel tick and low solid impact
mode.arena.teamwin|Team wins match|2.5|A proud compact bronze victory ring with warm layered air
mode.arena.loss|Match lost|1.5|A soft low bronze ring settles gently, no mocking buzzer
mode.arena.draw|Match drawn|1.5|Two equal soft bronze taps settle into a neutral held resonance
mode.arena.powerup|Arena power-up pickup|1|A sharp compact energy capsule opens with a bright glass snap
mode.record|Personal best achieved|2|A bright polished medal strike with a quick upward crystal sparkle
mode.hardcore.death|Permadeath confirmed|3|A heavy old iron seal closes with a solemn low resonance, restrained
system.new_save|New save created|1.5|A new parchment opens and a warm wooden seal stamps once
system.load|Save successfully loaded|0.8|A quiet secure latch opens with a soft warm click
system.cheat|Cheat accepted|1|A playful tiny magical lock opens, concise and unobtrusive
system.update|Update ready notification|0.8|A soft neutral glass-and-wood double tick
system.rebind|Control binding confirmed|0.6|A small firm wooden click with a short bright finish''',priority='P2')
for c in CUES:
 if c['id']=='coop.revive.loop':
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')
block('Action failures and consumables','''action.cooldown|Skill still on cooldown|0.5|A tiny dry low wooden tick, restrained refusal without an alarm
action.mana.empty|Not enough mana|0.6|A small hollow glass pulse that fails to build, clear and gentle
action.target.invalid|No valid target or line of sight|0.5|A short dull focused click without an impact
action.corpse.none|Raise the Dead has no eligible corpse|0.6|Two dry quiet bone clicks with no magical activation
action.pet.none|Companion command cannot execute|0.6|A soft leather command flick with no answering animal response
action.charge.ready|Charge reaches full strength|0.6|A tight gathered-energy tick locks into readiness, short and clear
action.interact.busy|Interaction temporarily unavailable|0.5|One muted wooden stop, subtle and neutral
consumable.cork|Potion uncorked|0.6|A small cork pops from a narrow glass bottle
consumable.drink|Drink potion|1|One short human sip from a small glass bottle and a quiet swallow, no voice
consumable.vial|Empty vial placed down|0.6|A small empty glass bottle touches a wooden surface softly
world.water.enter|Player enters shallow water|0.8|Two boots enter shallow water with one clear small splash
world.water.exit|Player leaves shallow water|0.8|Wet boots leave shallow water with droplets falling
world.cloth.flag|Quest signal cloth raised|1.5|A heavy cloth flag rises along a wooden pole, rope friction and one flap
world.break.vine|Cut vine obstruction|0.8|Several taut green vines cut with a fibrous snap and falling leaves
world.statue.turn|Large statue puzzle rotates|2|A large carved stone statue rotates on a fitted base with deep controlled friction''')
for eid,texture in {'flyer':'one leathery wingbeat from a small flying beast','thornboar':'one heavy cloven hoof landing with coarse hide movement','dustjackal':'one light canine paw step and brief claw contact','slime':'one soft wet gelatinous body hop landing','slimelet':'one tiny sticky jelly landing','magmaskit':'a short burst of quick chitinous feet tapping stone','revenant':'one ragged dragging foot contact with dry cloth','bones':'one bony foot contact and dry joint click','sentinel':'one hollow armored footfall and loose metal joint','marblestatue':'one dense stone footfall and coarse joint grind','goblin':'one quick small footstep with a light coin purse jingle'}.items():
 add('enemy.'+eid+'.move','Enemy movement',ENEMIES[eid][0]+' movement','Actor movement contact; replace humanoid boot core, then add surface detail',texture.capitalize(),.7,4,priority='P1',source='ENEMY.'+eid)
for bid,texture in {'brute':'one enormous living footfall with heavy earth weight','ember_colossus':'one massive hot iron footfall with a low stone impact and furnace creak','marble_colossus':'one immense marble footfall with deep stone joint grinding','king_full':'one powerful step that compresses dark space with a heavy armored contact'}.items():
 add('boss.'+bid+'.step','Boss arena mechanisms',BOSSES[bid][0]+' footfall','Actual grounded foot contact; never camera-distance-independent rumble',texture.capitalize(),1.5,4,status=BOSSES[bid][2])
block('Boss arena mechanisms','''arena.hydra.surface|Hydra head rises from sea|2.5|An enormous scaled neck lifts from deep seawater, cascading sheets of water and a low living breath
arena.hydra.submerge|Hydra head dives beneath sea|2|A huge scaled neck slides under water with a broad deep splash and receding bubbles''',status=PLAN)

# Corrections to scope: these actual mechanics belong to approved future encounter outlines.
planned_moves={'brute.barrier_stagger','marksman.relocate','fallen.feint_recover','ember_colossus.sweep','ember_colossus.vent','marble_colossus.armor_open','marble_colossus.sweep'}
for c in CUES:
 if any(c['id'].startswith('boss.'+m+'.') for m in planned_moves):c['status']=PLAN
 if c['id']=='weapon.ians.hum':
  c['loop']=True;c['prompt']=c['prompt'].replace(' One isolated event, immediate onset, clean short tail.',' Seamless steady loop, no opening hit or ending fade.')
# These belong to approved expansion systems rather than already-shipped interactions.
for c in CUES:
 if c['id'].startswith(('ui.journal.','ui.dialogue.','ui.record.','ui.take.','reward.clue','reward.half_bank','chest.code.')) or c['id']=='ui.text':c['status']=PLAN
 if c['id'] in ['move.swim','move.rope','move.ladder','move.ledge.catch','ship.repair','ship.cannon.fire','ship.cannon.splash','npc.speech.start']:
  c['status']=PROPOSAL;c['priority']='P2';c['notes']+=' Conditional only: do not generate until the action is actually retained.'
 if c['category']=='NPC signature foley':c['priority']='P2'

# These weapon families currently have no charged attack. Do not invent paid work for it.
CUES=[c for c in CUES if not (any(c['id'].startswith('weapon.'+w+'.') for w in ['sword','cross','wand','fist']) and c['id'].rsplit('.',1)[-1] in ['charge_start','charge_hold','charged','cancel'])]
# Cross-references are explicit reuse, rather than buying another near-identical generation.
for c in CUES:
 if c['category'] in ['Enemy attacks','Boss attacks'] and c['id'].endswith('.release'):
  c['related']=['combat.hit.flesh','combat.hit.plate','combat.hit.stone','combat.hit.wood']
 if c['category']=='Class skills':c['related']=['combat.interrupt','combat.buff.end','combat.shield.hit','combat.shield.break']
# Starter batch is small enough to establish an audible style before spending on the full bank.
FIRST=['ui.confirm','ui.back','ui.denied','move.foot.dirt','move.foot.stone','move.jump','move.dash','combat.hit.flesh','combat.hit.plate','combat.parry','combat.heal','weapon.sword.basic','weapon.javelin.basic','weapon.javelin.charged','weapon.pirate.basic','weapon.pirate.charged','weapon.scythe.basic','element.fire.impact','element.arcane.release','skill.pal_smite.cast','skill.chr_blink.cast','skill.necro_summon.cast','enemy.sporeback.death_burst.warn','enemy.sporeback.death_burst.release','boss.brute.slam.warn','boss.brute.slam.release','reward.player_level','reward.class_rank','rift.shard.pickup','gate.hollow.idle']
ids=[c['id'] for c in CUES];assert len(ids)==len(set(ids)),[x for x,n in collections.Counter(ids).items() if n>1]
assert set(FIRST)<=set(ids)
for c in CUES:
 c['starter_batch']=c['id'] in FIRST
 c['filename']=c['id'].replace('.','_')+'_v01'
 c['channel']='stereo' if c['category']=='Region ambience' else 'mono preferred; audition in stereo if needed'
 c['influence']=.3
 assert len(c['prompt'])<=450,(c['id'],len(c['prompt']))
 assert .5<=c['generation_seconds']<=30
 assert all(r in ids for r in c['related'])
DATA=dict(title='Bladefall custom SFX production catalog',date='2026-09-20',source_revision='64da686',source_game_version='1.986.0-anatomical-weapon-grips',status='Planning and prompts only. No audio generated or game playback changed.',cues=CUES,skills=SKILLS,npcs=NPC_ROSTER,trial_mapping=TRIAL_MAP,starter_batch=FIRST)
(ROOT/'docs/audio/SFX_CATALOG.json').write_text(json.dumps(DATA,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'cue_briefs':len(CUES),'suggested_variants_if_every_brief_is_used':sum(c['variations'] for c in CUES),'skills':len(SKILLS),'categories':dict(collections.Counter(c['category'] for c in CUES)),'status':dict(collections.Counter(c['status'] for c in CUES)),'longest_prompt':max(map(lambda c:len(c['prompt']),CUES))},indent=2))
# Coverage and reusable event map, generated alongside the prompts.
coverage=['# Bladefall SFX coverage audit','', 'Game snapshot: 64da686 / 1.986. Registry coverage, not proof that new sound events are implemented.','', '## All current skill choices','', '| Class | Slot | Choice A | Choice B |','|---|---|---|---|']
for cid,cl in SRC['classes'].items():
 for k,v in cl.items():
  if isinstance(v,dict) and v.get('kind')=='skill':
   coverage.append(f"| {cl['disp']} | {v['slot']+1} | {v['a']['n']} (`{v['a']['id']}`) | {v['b']['n']} (`{v['b']['id']}`) |")
coverage+=['','Each ID has a dedicated `skill.<id>.cast` brief. Persistent phases and delayed outcomes have additional rows. No selectable skill is omitted.','', '## Ordinary enemies and interactive combat targets','','| Code type | Identity | Cue count | Attack actions |','|---|---|---|---|']
for eid,e in SRC['enemies'].items():
 prefix='enemy.'+eid+'.';found=[c for c in CUES if c['id'].startswith(prefix)]
 assert found,('uncovered enemy',eid)
 coverage.append(f"| {eid} | {ENEMIES[eid][0] if eid in ENEMIES else eid} | {len(found)} | {', '.join(a[0] for a in ATTACKS.get(eid,[])) or 'Interactive target / non-attacker'} |")
coverage+=['','Treasure Goblin flees rather than attacks. Dummy and boss crystal are impact/break targets. Corpses raised by Necromancer reuse the source creature action plus a restrained undead accent. Normal enemies use shared material impacts rather than a new body-hit file per weapon/species pairing.','', '## Current boss registry and planned replacements','','| Runtime type | Catalog target | Treatment |','|---|---|---|']
for row in [('brute','brute','Current plus new barrier-stagger arena'),('archer','marksman','Current plus planned nest relocation'),('warden','fallen','Human-sized Hollowed champion; old Bladeborn identity rejected'),('sorcerer','frost_caster','Current caster joins planned three-officer encounter'),('colossus','ember_colossus / marble_colossus','Separate material identity by region; shared code type does not mean shared sound'),('king','king_half / legion_commander','Do not preserve old early King story; replacement design pending'),('tyrant','king_full','Final full-Void form, not separate villain')]:coverage.append('| '+' | '.join(row)+' |')
coverage+=['','Hydra, Frost shield/spear officers, new arena devices and revised King narrative have planned rows. Legacy generic raid mechanics are tagged separately.','', '## Weapon archetype routing','','| Runtime archetype | Core cue family | Element layer | Charge |','|---|---|---|']
for wid,w in SRC['weapons'].items():
 core='pirate' if w['art']=='flintlock' else w['art'];core='sword' if wid=='iansblade' else core
 coverage.append(f"| {wid} | weapon.{core} | {w.get('el','none')} | {w.get('chg','none in registry')} |")
coverage+=['','Pirate intrinsic weapon overrides charge to `sabersweep`; Monk fists do not currently have a charge. Retired saber/dagger IDs are aliases, and Reaper scythes are intrinsic, not loot. Do not generate unsupported sword/crossbow/wand/fist charge sounds. Ian\'s Blade gets an additional sacred signature; its ending use is a separate cutscene cue, never a free equipment award.','', '## Passives, innate traits and capstones','','These are all inspected. Always-on numeric effects are deliberately silent. A discrete proc may use the listed small shared accent only when it communicates a real state change; do not add a sound per stat tick.','', '| Class | Choice/trait | Description | Audio policy |','|---|---|---|']
for cid,cl in SRC['classes'].items():
 for k,v in cl.items():
  if not isinstance(v,dict):continue
  items=[v] if k in ['innate','cap'] else [v['a'],v['b']] if v.get('kind')=='passive' else []
  for v2 in items:
   name=v2.get('n',v2.get('name',''));desc=v2.get('d','').replace('|','/')
   policy='Silent numeric effect; unlock uses reward.passive_unlock or reward.capstone.'
   if any(x in desc.lower() for x in ['dropping below','every fourth','once every','rewind','after dodg','echo','parry']):policy='Actual discrete proc may use proc.ready / proc.consume / relevant class accent; throttle.'
   coverage.append(f'| {cl["disp"]} | {name} | {desc} | {policy} |')
coverage+=['','## Existing file samples: replacement routing','','The old registry is a migration checklist. Do not rename new files to misleading old filenames. Route context to new semantic events, and remove old/procedural layers one family at a time after testing.','', '| Existing key | Existing filename | Replacement direction |','|---|---|---|']
FXMAP={'quest':'reward.quest_complete','levelcheer':'reward.player_level','footstep':'move.foot.* surface one-shots; remove old generic loop','forgeopen':'shop.forge.start','bookflip':'ui.journal.page','chestopen':'chest.wood.open','wallbreak':'world.break.*','click':'ui.confirm','equip':'shop.equip.*','shopopen':'npc.shop.direct','wallslide':'move.wall.slide','bigreveal':'quest.route.open or specific story cue','forgespin':'shop.forge.loop','dice':'shop.gamble','doorslam':'world.door.iron.close','dooropen':'world.door.wood.open','drink':'combat.heal + appropriate vessel action','electric':'element.lightning.sustain','fireshot':'element.fire.release','firecharge':'element.fire.release + weapon charge core','fireball':'element.fire.release','heartbeat':'combat.lowhp.loop','frostclink':'combat.hit.ice','bigland':'move.land.*','train':'shop.train','bag':'ui.bag.open','rain':'env.rain','bonesdie':'enemy.bones.death','frostdie':'enemy.frostling.death','lever':'world.lever','axeswing':'weapon.axe.basic','swordswing':'weapon.sword.basic','spearswing':'weapon.javelin.basic','gruntdie':'enemy.grunt.death','forgedone':'shop.forge.finish','warskill1':'skill.w_cleave.cast','warcharge':'skill.w_charge.cast','rustyhit':'combat.hit.plate','portalopen':'rift.open / world.waystone / gate.hollow.* by portal kind','stabkill':'combat.hit.flesh + death once','heavyhit':'combat.hit.* by material','arcaneskill':'specific skill.*.cast','secretget':'rift.shard.pickup','wandcharge':'only weapon with a real charge + element layer','wandfire':'weapon.wand.basic + element layer','sell':'shop.sell','lootpickup':'reward.loot','buy':'shop.buy','m_axe':'combat.hit.* + weapon.axe.basic','m_gsmetal':'combat.hit.plate','m_gsplate':'combat.hit.plate','m_gspunch':'combat.hit.flesh','m_scythe':'combat.hit.* + weapon.scythe.basic','m_knives':'combat.hit.* + weapon.dagger.basic','xbowclick':'weapon.cross.basic','xbowlatch':'weapon.cross.reload','shatter':'combat.hit.ice or enemy.frostshell.crack','mimicroar':'enemy.mimic.reveal.release','chestthunk':'enemy.mimic.bite.release','gamblecoins':'shop.gamble','ma_stomp':'specific enemy/boss warning, never generic for every species','mobknock':'combat.hit.wood'}
for key,v in SRC['fx'].items():
 dest=FXMAP.get(key)
 if not dest:
  if key.startswith(('boss','v_boss')):dest='boss.<identity>.entrance / defeat; named humanoids use human performance'
  elif key.startswith(('die','hurt','v_','mobvoice')):dest='enemy.<identity>.alert / hurt / death, not shared zombie voice'
  elif key.startswith(('cast','atk')):dest='specific skill / enemy action warn + release'
  else:dest='Context routing audit required before deletion; inspect actual call site'
 coverage.append(f"| {key} | {v['f']}.mp3 | {dest} |")
missing=[x for x in SRC['literalFileCalls'] if x not in SRC['fx']]
coverage+=['','Literal `playFx` keys absent from FXDEF in this snapshot: **'+', '.join(missing)+'**. These are coverage risks to resolve in the integration pass, not newly introduced bugs. They may currently fall through silently.','', 'Procedural call families also needing contextual routing: '+', '.join(SRC['proceduralCalls'])+'.','', '## NPC roster','','| NPC / role | Region | Purpose |','|---|---|---|']
for n in NPC_ROSTER:coverage.append(f"| {n['name']} | {n['region']} | {n['role']} |")
coverage+=['','All speech remains a separate line-by-line human/TTS recording workflow. The Rift guide name and individual trial mentor names remain unresolved.','', '## Deliberately silent or shared cases','','- Repeated proximity prompt refreshes: no sound until meaningful target change, with cooldown.','- HP/XP numbers changing every frame: no tick spam.','- Always-on passive stat multipliers: silent.','- Continuous compass rotation: silent.','- Every corpse fading or red damage flash: no extra death layer unless it adds useful feedback.','- Every particle and every projectile in a dense volley: group/throttle source sounds.','- Paused enemy/hazard loops: suspend; NPC speech continues on its own bus.','- Secret shard sonar across the entire map: not allowed; near-field optional shimmer only.','- Armor rarity does not need a different footstep bank; add a restrained armor layer.','- Enemy skin/color variants can reuse the same biological family; meaningful elemental differences use overlays.']
(ROOT/'docs/audio/SFX_COVERAGE.md').write_text('\n'.join(coverage)+'\n',encoding='utf-8')
md=['# Bladefall — complete ElevenLabs SFX prompts','',f'{len(CUES)} cue briefs. Planning only; no audio generated. See SFX_PRODUCTION_GUIDE.md before bulk generation.','',f'Suggested variants if every brief is retained: {sum(c["variations"] for c in CUES)}. This is NOT a required order or purchase count. Start with one good take for each of the 30 starter cues.','', '## Categories','']
for cat,count in collections.Counter(c['category'] for c in CUES).items():md.append(f'- {cat}: {count}')
for cat in dict.fromkeys(c['category'] for c in CUES):
 md+=['','## '+cat,'']
 for c in [c for c in CUES if c['category']==cat]:
  md+=['### '+c['name'],'',f"ID: `{c['id']}` · {c['priority']} · {c['status']}" ,f"Use: {c['use']}",f"Generate: {c['generation_seconds']} seconds · Loop {'ON' if c['loop'] else 'OFF'} · Start influence 30% · Keep {c['variations']} approved variations eventually",f"Filename stem: `{c['filename']}` · {c['channel']}",'','> '+c['prompt'],'']
  if c['notes']:md.append('Implementation: '+c['notes'])
  if c['related']:md.append('Reusable layers: '+', '.join(c['related']))
(ROOT/'docs/audio/ELEVENLABS_SFX_ALL_PROMPTS.md').write_text('\n'.join(md).rstrip()+'\n',encoding='utf-8')
# Render the static mobile-friendly production desk and provide downloadable source files.
def inline(text):
 text=html.escape(text)
 text=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:'<a href="'+m[2]+'">'+m[1]+'</a>',text)
 text=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',text)
 text=re.sub(r'`([^`]+)`',r'<code>\1</code>',text)
 return text

def render_md(text):
 lines=text.splitlines();out=[];i=0
 while i<len(lines):
  l=lines[i]
  if not l.strip():i+=1;continue
  if l.startswith('|'):
   group=[]
   while i<len(lines) and lines[i].startswith('|'):
    if not re.fullmatch(r'[| :\-]+',lines[i]):group.append([x.strip() for x in lines[i].strip('|').split('|')])
    i+=1
   out.append('<table>'+''.join('<tr>'+''.join(('<th>' if j==0 else '<td>')+inline(v)+('</th>' if j==0 else '</td>') for v in row)+'</tr>' for j,row in enumerate(group))+'</table>');continue
  if l.startswith('#'):
   n=min(4,len(l)-len(l.lstrip('#')));out.append(f'<h{n}>'+inline(l.lstrip('# '))+f'</h{n}>')
  elif l.startswith('> '):out.append('<blockquote>'+inline(l[2:])+'</blockquote>')
  elif l.startswith('- '):out.append('<p>• '+inline(l[2:])+'</p>')
  else:out.append('<p>'+inline(l)+'</p>')
  i+=1
 return '\n'.join(out)
site=ROOT/'public/3d/audio-planning';site.mkdir(exist_ok=True,parents=True)
guide=(ROOT/'docs/audio/SFX_PRODUCTION_GUIDE.md').read_text(encoding='utf-8-sig')
guide=guide.replace('../../public/3d/audio-planning/index.html','./')
template=(ROOT/'docs/audio/sfx-catalog-template.html').read_text(encoding='utf-8-sig')
page=template.replace('@@GUIDE@@',render_md(guide)).replace('@@DATA@@',json.dumps(DATA,ensure_ascii=False).replace('</','<\\/'))
(site/'index.html').write_text(page,encoding='utf-8')
for src,dst in [('SFX_CATALOG.json','catalog.json'),('ELEVENLABS_SFX_ALL_PROMPTS.md','all-prompts.md'),('SFX_COVERAGE.md','coverage.md'),('SFX_PRODUCTION_GUIDE.md','guide.md')]:
 (site/dst).write_bytes((ROOT/'docs/audio'/src).read_bytes())
