"""Authored source of truth for onboarding captions and recorded transcripts."""
from pathlib import Path
import hashlib, json
ROOT=Path(__file__).resolve().parents[1]
ROWS=[]
def line(id,text,keyboard=None,**requires): ROWS.append(dict(id=id,text=text,keyboard=keyboard,requires=requires))
line('tutorial.welcome',"Welcome. Let's try moving, jumping, attacking and dodging. The enemies will wait until you've practised these controls.")
line('tutorial.menu-keys','Use the controls shown to select, continue or go back. In conversations, move the yellow selection to choose a reply.',
     'Press E to select or continue. Q takes you back. Tab opens the main menu. In conversations, W and S, or the arrow keys, move the yellow selection.',interact=['KeyE'],pause=['Tab'])
line('tutorial.bag-practice','Open your bag with the control shown. Use it again, or Back, to close the bag.',
     'Press B to open your bag. Press B again, or Q, to close it.',bag=['KeyB'])
line('tutorial.pause-practice','Open the main menu with the control shown. Settings lets you rebind keys and set up an Xbox or PlayStation controller. Choose Resume to return.',
     'Press Tab to open the main menu. Settings lets you rebind keys and set up an Xbox or PlayStation controller. Choose Resume, or press Q, to return.',pause=['Tab'])
line('tutorial.move','Use your movement controls to move in different directions. There is no rush.',
     'Use W, A, S and D to move in different directions. There is no rush.',up=['KeyW'],left=['KeyA'],down=['KeyS'],right=['KeyD'])
line('tutorial.jump','Tap Jump for a short hop. Hold it briefly to jump higher.',
     'Tap Space for a short hop. Hold Space briefly to jump higher.',jump=['Space'])
line('tutorial.attack','Red health bars mark enemies. Face one and use your basic attack.',
     'Red health bars mark enemies. Face one and left-click to attack. You can also press J.',attack=['Mouse0','KeyJ'])
line('tutorial.dodge','Dodge through an attack to avoid the hit. In the air, the same control makes you dash.',
     'Press left Shift, or right-click, to dodge through an attack. In the air, the same control makes you dash.',dodge=['ShiftLeft','Mouse2'])
line('tutorial.charge.available',"This weapon can charge. Hold Attack until it's ready, then release for a stronger hit. Try it if you like, or continue.",
     "This weapon can charge. Hold the left mouse button until it's ready, then release for a stronger hit. Try it if you like, or continue.",attack=['Mouse0'])
line('tutorial.charge.unavailable',"Your current weapon has no charged attack. Other weapons let you hold Attack and release for a stronger hit. You can continue.")
line('tutorial.vitals','Health keeps you alive. Mana fuels your skills. Basic hits restore a little mana. A break from skills helps it recover faster. Enemies are active now, so keep moving.')
line('tutorial.objective',"Defeat six enemies. After the first three, your class ranks up and you'll choose a skill. After six, find the exit portal.")
line('tutorial.progress','Your character level gives you stat points. Use the gold points button to spend them. Your class rank unlocks skills and automatic bonuses.',
     'Your character level gives you stat points. Press C, or use the gold points button, to spend them. Your class rank unlocks skills and automatic bonuses.',stats=['KeyC'])
line('tutorial.skills','Skills give you powerful attacks and other ways to fight. Use Skill One after class rank two. Watch its mana cost and recharge time.',
     'Skills give you powerful attacks and other ways to fight. Press the number one to use your first skill after class rank two. Watch its mana cost and recharge time.',skill1=['Digit1'])
line('tutorial.skill-use','Your first skill is ready. Face an enemy in range and use Skill One. Watch your mana and its recharge time.',
     'Your first skill is ready. Face an enemy in range and press the number one. Watch your mana and its recharge time.',skill1=['Digit1'])
line('tutorial.bag','Chests give equipment. If your bag is full and Auto-sell is off, the chest stays closed. Make space before opening it.')
line('tutorial.autosell','Auto-sell turns new equipment into gold, even when your bag has space. Leave it off to keep your finds.',
     'Press V to switch Auto-sell on or off. When on, new equipment sells for gold, even when your bag has space. Leave it off to keep your finds.',loot=['KeyV'])
line('tutorial.journal','The journal keeps your clues and quest information. Open it whenever you need a reminder.',
     'Press N to open the journal for your clues and quest information.',journal=['KeyN'])
line('tutorial.navigation','Gold marks your next objective. Blue marks friends, cyan marks pings, and red marks enemies.')
line('tutorial.menu',"You're ready to explore. The main menu has Settings and Help. You can change your controls or set up a controller there.",
     "You're ready to explore. Press Tab for the main menu. Settings lets you change your controls or set up a controller. Q goes back, and E selects or continues.",pause=['Tab'],interact=['KeyE'])
line('tutorial.exit','The exit is open. Walk into the portal to continue your journey. Its gold marker shows the way on your map.')
line('lore.protector','For generations, Ian protected Aerth. He was a Bladeborn, able to face dangers that ordinary armies could not.')
line('lore.loss','Ian died of old age, and no new protector appeared. A wealthy lord feared that same end. He hired mages and scholars to find a way to stop aging and death.')
line('lore.promise','Together, they built the Eternal Gate at Castle Duskmoor. The lord promised that anyone who passed through would never grow old. Families came, hoping to save the people they loved.')
line('lore.conquest','The travelers returned ageless, but changed. The lord discovered they could not refuse his orders. He sent them to recruit more families, then turned his growing army against Aerth. He became the Abyss King. His army became the Hollowed Legion.')
line('lore.home','Now the Legion is coming for Briar Town, your home. Your father, Thomas, helps the neighbors build barricades. You choose to help them. First, the Waystation: a safe place to prepare for the journey.')
line('hub.overview','This is the Waystation, your safe home base. Prepare here, then take a portal into the adventure. A portal is a magical doorway.')
line('hub.waystone',"The Waystone is your travel menu. Use it to return to places you've opened along the story.")
line('hub.campaign','Start with Briar Town. This doorway leads to the first part of your adventure. Walk up and use Interact when you are ready.',
     'Start with Briar Town. This doorway leads to the first part of your adventure. Walk up and press E when you are ready.',interact=['KeyE'])
line('hub.campaign-route','Finish each story region to open the next. You can return here between adventures.')
line('hub.quartermaster',"Buy equipment here, or sell what you don't need. Equipment changes how much damage you deal or withstand.")
line('hub.chest','Your bag holds your equipment. Open it to compare items and choose what to wear.',
     'Your bag holds your equipment. Press B to compare items and choose what to wear, wherever you are.',bag=['KeyB'])
line('hub.anvil','The smith combines spare equipment into stronger gear. The forge shows what you can make and use.')
line('hub.keeper',"Visit the stylist to change your name, face and character's look. Outfits, capes and trails change your appearance, not your strength.")
line('hub.drillmaster',"Change your fighting class here, or change the skills and automatic bonuses you've chosen.")
line('hub.beastkeeper','Companions travel and fight beside you. Rescue the dogs in the Black Woods to start buying and training companions here.')
line('hub.mirror','Use the mirror for a closer look at your outfit and equipment.')
line('hub.sparring',"Practise fighting here. Inside, the bestiary is a guide to the enemies you'll meet.")
line('hub.bestiary','The bestiary shows each enemy, where it lives, and how it fights.')
line('hub.abyss','Fight waves of enemies to earn gold, experience and equipment when you want to grow stronger.')
line('hub.delve','Try to escape a prison dungeon. Between attempts, spend earned gold on permanent upgrades. This mode has separate saves from your story adventure.')
line('hub.arena','Set up a practice battle against computer opponents or friends. Your adventure equipment stays safe.')
line('hub.gauntlet','Fight powerful bosses one after another. Come here when you want a harder challenge.')
line('hub.sprint','Race through a jumping course against the clock. This activity rewards fast times, not equipment.')
line('hub.rifthall','Each story region hides five Rift Shards. Find all five to open its challenge here. Beat that challenge to unlock another fighting class.')
line('hub.arcade','Take a break from the adventure with a small arcade game.')
line('hub.thomas','Thomas is your father. Talk to him when you return from your adventures.')
for id,text in [
 ('gearBtn','See what you have equipped and how it changes your stats.'),
 ('bagBtnP','Compare, equip or sell the items you collect.'),
 ('classesBtn','Read your class skills, chosen bonuses and future unlocks. Visit the Drillmaster to change your class.'),
 ('achBtn','See your achievements and records.'),
 ('optBtn','Change sound, graphics and camera settings. Under Controls and camera, rebind keys or set up an Xbox or PlayStation controller.'),
 ('multiplayerBtnP','Host a co-op room or join a friend. You keep using your current character.'),
 ('qmenu','Return to the Waystation. You keep earned gold, experience and completed quest progress.'),
 ('titleBtnP','Save your character and return to the title screen.')]:line('menu.'+id,text)

def build():
    entries={};clips=[]
    for row in ROWS:
        assert row['id'] not in entries
        entry={**row};variants={}
        for variant,text in [('adapted',row['text']),('keyboard',row['keyboard'])] if row['keyboard'] else [('base',row['text'])]:
            digest=hashlib.sha256(text.encode()).hexdigest();key=row['id']+'.'+variant
            variants[variant]={'key':key,'text':text,'text_sha256':digest}
            clips.append({'id':key,'text':text,'text_sha256':digest,'file':key+'.'+digest[:12]+'.mp3'})
        entry['variants']=variants;entries[row['id']]=entry
    catalog={'schema':1,'voice_option':'B','revision':'20261018-v1','entries':entries,'clips':clips}
    (ROOT/'docs/audio/onboarding-script-20261018.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf8')
    js="/* Generated by scripts/build-onboarding-script.py. Edit its authored rows, then rebuild. */\n(function(root){'use strict';\nconst data="+json.dumps({'revision':catalog['revision'],'entries':entries},ensure_ascii=False)+";\nfunction resolve(id,context={}){const e=data.entries[id];if(!e)return null;if(!e.keyboard)return e.variants.base;const defaults=!context.controller&&Object.entries(e.requires).every(([action,codes])=>codes.every(code=>context.bindings?.[action]?.includes(code)));return e.variants[defaults?'keyboard':'adapted'];}\nconst api={resolve,entries:data.entries,revision:data.revision};root.BFOnboardingScript=api;if(typeof module!=='undefined')module.exports=api;\n})(typeof window!=='undefined'?window:globalThis);\n"
    (ROOT/'public/3d/onboarding-script.js').write_text(js,encoding='utf8')
    print(json.dumps({'entries':len(entries),'clips':len(clips),'characters':sum(len(c['text']) for c in clips)}))
if __name__=='__main__':build()
