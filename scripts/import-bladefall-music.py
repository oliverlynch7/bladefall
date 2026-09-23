from pathlib import Path
import json,hashlib,shutil,subprocess,numpy as np
source=Path('C:/Users/Oliver/Desktop/BladeFall Music');dest=Path('public/music/bladefall');dest.mkdir(parents=True,exist_ok=True)
uses={
'Village_Vigil':'Briar Town part 1; title screen',
'Midnight_Field':'Briar Town part 2 / Black Woods',
'Canyon_Updrafts':'Hollow Pass part 1 / Winding Cliffs',
'Crosshairs_over_Open_Ground':'Hollow Pass part 2 / Lost Canyon',
'Iron_Gavel_Descent':'Castle Duskmoor part 2 / Long Ascent; arena and sparring',
'Sentence_of_the_Shield_Warden':'Ruined Keep part 2 / The Dungeons',
'Hearthfire_in_the_Frost':'Frostfell part 1 / Snowbound Peaks',
'The_Sorcerers_Hall_of_Mirrors':'Frostfell part 2 / Deep Ice Caves',
'The_Eternal_Furnace':'Emberdeep part 1 / Iron Halls',
'The_Obsidian_Foundry':'Emberdeep part 2 / current Cinder Vents, future Great Furnace',
'The_Black_Procession':'Current Abyss part 1; future Legion procession cue',
'The_Iron_Causeway':'Ruined Keep part 1 / Broken Walls; current Abyss part 2; Abyssal Descent',
'The_Shore_of_Broken_Ships':'Reserved: Storm Coast part 1 / Shipwreck Shore',
'Towering_Sea_Cliffs':'Reserved: Storm Coast part 2 / Thunder Cliffs',
'White_Marble_Palace_above_the_Clouds':'Sunspire Palace part 1',
'Archives_of_the_Archmage':'Sunspire Palace part 2',
'Chamber_of_Inverted_Gravity':'Castle Duskmoor part 1',
'Crosshairs_in_the_Dark':'Hollow Marksman boss',
'Iron_Juggernaut':'Brute boss; Marble Colossus boss',
'The_Fallen_Champion_Duel':'The Fallen boss',
'Paradox_Void_Assault':'Hollowed Officers boss; legacy Abyss boss',
'Forge_of_the_Molten_Colossus':'Ember Colossus boss',
'A_Crown_of_Ashes':'Castle Duskmoor final boss phase 1',
'Iron_Oath_of_the_Night_Attack':'Castle Duskmoor final boss phases 2+',
'The_Wayfarers_Hearth':'Original source preserved; derived trimmed loop is the main hub theme',
'The_Waystation_Refuge':'Alternate hub take preserved, not automatic rotation',
'The_Archive_of_Violet_Portals':'Rift Hall',
'Hall_of_the_Violet_Discipline':'Class mentor conversations; secret chamber exploration',
'Crystalline_Trials':'Class trial combat',
'Glaciated_Court_of_Glass':'Ellis rescue conversation / positive story cue',
'Stony_Whispers_of_the_Keep':'Ellis knowledge conversation; future confiscated writings cue',
'Watchful_Greenwood':'Current campaign victory ending/results; future restoration montage',
'Chains_of_the_Deep':'Reserved: chained hydra boss',
'Unburdening_the_Colossus':'Reserved: hydra release, despite generated filename',
'Navigating_the_Red_Wake':'Reserved: ship crossing',
'Safe_Harbor':'Reserved: successful ship arrival',
'Through_the_Void_Breach':'Reserved: final Void arrival',
'Passing_the_Flame':'Reserved: Ian spirit scene',
'The_Last_Spark_of_Darrow':'Reserved: final charge; filename does not establish a new lore name',
'The_Breaking_of_the_Keeps':'Reserved: successful final cut'}
tracks={}
for p in sorted(source.rglob('*.mp3')):
 assert p.stem in uses,p.name
 out=dest/p.name;shutil.copy2(p,out)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,channels,sample_rate','-of','json',str(p)]))
 key=p.stem.lower();tracks[key]={'title':p.stem.replace('_',' '),'url':'/music/bladefall/'+p.name,'seconds':round(float(probe['format']['duration']),3),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'placement':uses[p.stem],'channels':probe['streams'][0]['channels']}
 assert hashlib.sha256(out.read_bytes()).hexdigest()==tracks[key]['sha256']
notes=Path('docs/audio/music-source-notes');notes.mkdir(exist_ok=True)
for i,p in enumerate(sorted(source.rglob('*.txt')),1):shutil.copy2(p,notes/('round-'+('1' if 'lbas' in p.parent.name else '2')+'-original-notes.txt'))
# The measured pulse is 136 BPM; the original brief requested a relaxed 60-80 BPM meter.
# Interpret as 68 BPM. 32 quarter-notes = 8 bars = 28.235 seconds before ~1:10.23.
start=41.997006803;end=186.703764172;fade=32*60/136/4 # one 4/4 bar at 68 BPM
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(source/'11 labs round 2/The_Wayfarers_Hearth.mp3'),'-f','f32le','-ar','48000','-ac','2','pipe:1'])
x=np.frombuffer(raw,dtype='<f4').reshape(-1,2);clip=x[round(start*48000):round(end*48000)].copy();n=round(fade*48000)
w=np.linspace(0,1,n,dtype=np.float32)[:,None];blend=clip[-n:]*np.cos(w*np.pi/2)+clip[:n]*np.sin(w*np.pi/2)
y=np.concatenate([blend,clip[n:-n]])
peak=float(np.max(np.abs(y)));gain=min(1,10**(-1/20)/max(peak,1e-9));y*=gain
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','48000','-ac','2','-i','pipe:0','-c:a','libopus','-b:a','160k',str(dest/'wayfarers-hearth-loop.ogg')],input=y.astype('<f4').tobytes(),check=True)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','48000','-ac','2','-i','pipe:0','-c:a','libmp3lame','-b:a','192k',str(dest/'wayfarers-hearth-loop.mp3')],input=y.astype('<f4').tobytes(),check=True)
loop=dest/'wayfarers-hearth-loop.mp3';tracks['wayfarers_hearth_loop']={'title':'The Wayfarer’s Hearth — hub loop','url':'/music/bladefall/'+loop.name,'seconds':len(y)/48000,'bytes':loop.stat().st_size,'sha256':hashlib.sha256(loop.read_bytes()).hexdigest(),'placement':'Main hub / Waystation','alternateOpus':'/music/bladefall/wayfarers-hearth-loop.ogg','channels':2,'edit':{'source':'The_Wayfarers_Hearth.mp3','start':start,'end':end,'bpm':68,'wrapCrossfadeSeconds':fade,'gain':gain,'boundarySampleJump':float(np.max(np.abs(y[0]-y[-1])))}}
manifest={'version':1,'originalCount':len(tracks)-1,'originalBytes':sum(t['bytes'] for k,t in tracks.items() if k!='wayfarers_hearth_loop'),'tracks':tracks}
Path('public/music/bladefall/manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(json.dumps({'originals':len(tracks)-1,'sourceMB':manifest['originalBytes']/1e6,'loop':tracks['wayfarers_hearth_loop']}))
