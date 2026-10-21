"""Build reviewable level plans from browser-captured geometry plus authored intent.

Usage: python scripts/build-campaign-blueprints.py BEFORE.json CURRENT.json
Capture CURRENT with capture-campaign-blueprints.cjs in a disposable browser profile.
The two inputs are initial puzzle states; the maps are not navigation meshes.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/design/campaign-geography'
OUT.mkdir(parents=True, exist_ok=True)

# Main routes are names exported by the actual builders. Stops are real object/NPC IDs.
# The notes explain the spatial job of each branch, not just its story name.
PLANS = [
dict(title='Briar Town · Homefields',module='index.html',main=['villageMill','lane4To8','millSouth','lane8To10','lane10To12'],
 idea='A village and its working farmland, divided by one real millrace. Home, treatment, mill and escape gate form the northward journey.',
 steps=[('thomas','Start at home','Thomas establishes the danger close to familiar houses.'),('mara','Help the neighbors','Find roots in the garden and dressings through the store’s open front doorway; return to the treatment station.'),('briar.water','Hold the sluice closed','Move the grain crate along the clear working lane west of the mill.'),('briar.mill.plate','Hold the plate down','Body weight stops the feed temporarily; crate weight keeps it closed.'),('briar.jam','Free the wheel','Reach the jam beside the stopped machinery.'),('briar.bridge','Restore the crossing','Cross only after the bridge has moved.'),('briar.depart','Leave through the wagon gate','Clear the bridge guards, then enter the woods.')],
 branches=[('home.farm.supplies','West farm loop','Recover supplies along the farm valley; the lane returns toward the mill.'),('home.grain.hopper','Granary loft','Shallow timber treads reach the loft. The nearby west watchpost uses two separate20-tread stone flights (7 rise /28 run), east approach and south return; no overlapping stair blocks.'),('home.orchard.wheel','Orchard lookout','Two shallow timber stair flights reach the picking deck. The working walkway leads to a lookout coin coffer; a separate stair returns to ground.'),('home.bell.alarm','Watchtower','Use the elevated warning post; keep it visually distinct from the mill.')],
 protect='Keep the millrace open. Broad soil may catch ordinary falls, but must not replace the working bridge. The western ford remains a separate route.',
 review='Homefields district rebuild2342: authored village-to-mill field lane; supply/workshop/orchard and granary/watchtower loops; enclosed planted boundaries; west tower-return stair and varied picking-deck jumps. See briar-district-plan.json for builder-owned route and boundary coordinates. Existing journey pass: joined earth trails and destination boards, a physical crate/plate west of the mill, and a lowering crossing on the main trail at x=180. Normal movement checks cover Thomas to the wagon gate plus the granary and orchard climbs. Large farm loops remain. Human pacing feedback remains outstanding.'),
dict(title='Briar Town · Black Woods',module='index.html',main=['campTrail'],
 idea='Clearings around an occupied camp and a signal tower. The ground approach and a genuine canopy crossing meet at the same objective.',
 steps=[('lewis','Read the situation','Lewis stands at the forest entrance, before the route divides.'),('woods.signal.crank','Stop the signal','Fight through the camp to the ground crank, or use the canopy cable instead.'),('exit','Reach the shelter','Both approaches rejoin the northern trail.')],
 branches=[('woods.signal.cable','Canopy alternative','Climb separated perches and cut the cable from above; missing a jump returns to forest ground.'),('woods.tracks.release','Root hollow','Follow the tracks, climb the roots and open the lower hollow.'),('woods.rescue.release','Rescue ledge','Reach the rope above the stranded survivor and return along the camp trail.'),('rv.tracks.snare','Trapped dog clearing','Follow the west ground trail through the forest boundary opening; free the snared dog.'),('rv.tracks.cage','Hanging dog cage','Climb the short west ledges to lower the cage. Both rescues save the Beastkeeper turn-in immediately.')],
 protect='Preserve the gaps between canopy perches and the tower descent. Trees frame clearings, not invisible barriers across the walking lanes.',
 review='Briar journey pass implemented: signed ground and canopy approaches, ground-storey signal guards and joined forest trails. Physical traversal checks cover both signal routes and the loft shard, followed by the Brute encounter. Existing side rescues and perch gaps remain. This is not a human playtest.'),
dict(title='Hollow Pass · Winding Cliffs',module='hollow-cliffs.js',main=['approach','lookout'],
 idea='An interrupted freight road across a canyon. Transport evidence, loaded cart, bridge and lookout share a believable trade route.',
 steps=[('caleb','Reach the refuge','Get bearings before leaving cover.'),('hp.orders','Follow the transport','The wreck and its papers point deeper into the canyon.'),('hp.cart.push','Load the bridge plate','Move the freight cart onto its plate.'),('hp.brake.right','Release the crossing','The winch controls the visible bridge over the ravine.'),('hp.lift','Descend into the canyon','Pass the lookout by combat or the quiet upper approach.')],
 branches=[('hp.quiet','Quiet approach','An elevated rope route bypasses the lookout fight.'),('hp.rope','Climber loop','Retrieve rope along a side ledge.'),('hp.code.release','Freight cache','Use the high cargo route to reach the release above the cache.')],
 protect='No ground across the freight ravine; the two land masses stay separate. Preserve upper-route gaps and access to the bridge controls.',
 review='Winding Cliffs finishing pass implemented: joined trade road, five destination boards, clear bridge approach, detailed wagon and correctly placed winch. Bridge collision waits for the deck. Tested both lookout approaches and optional climbs, saved states and a local two-client relay; human pacing remains unverified.'),
dict(title='Hollow Pass · Lost Canyon',module='lost-canyon.js',main=['arrival','west','east','northRescue','northEvac','exit'],
 idea='Occupied holding yards connected by service roads. Entry choice leads to two rescue locations, then a controlled escape.',
 steps=[('ward','Choose an entry','Use papers, force the gate, or take the roof and side ladder.'),('lc.cage.south','Free the south cage','This group is near the entry and guard yard.'),('lc.alarm','Cut the alarm','Cut it before a rescue to prevent reinforcements, or reach it under pressure.'),('lc.cage.north','Free the north cage','Protect two prisoners along the east road. Pursuers can hurt them; retry if either falls.'),('lc.escape','Open the way out','The north road leads to the next crossing.')],
 branches=[('lc.side','Roof entry','Climb around the front checkpoint and lower a return ladder.'),('lc.cage.extra','Old cage','A separate rescue off the main holding road.'),('lc.rail.release','High freight brake','Climb above the stored cargo to open the lower cache route.'),('lc.water','Shelter support','Bring water to the refuge near the rescued group.')],
 protect='Preserve the gate, side entry, freight brake and cave approach. Ground the yards without flattening the roof or upper return route.',
 review='Finishing pass implemented: signed service roads avoid cage footprints and return before the escape gate. Fitted cage sides are solid, the escort clears the doorway, and forced-entry guards approach from the accessible ramp. Detailed signal winch, cut cable and lanterns show the alarm state. Three entries, ground routes, both climbs, escort damage/retry, old save and local co-op checked; human pacing remains unverified.'),
dict(title='Ruined Keep · Broken Walls',module='broken-walls.js',main=['arrival','arrow','west','east','exit'],
 idea='A real fortress: outer court, breach court and inner ward inside stepped curtain walls. The optional workshop and battlements have identifiable entrances.',
 steps=[('grant','Find Grant','Meet him in the outer court, below the arrow post.'),('rk.arrow','Silence the arrow post','Use the east climb; the retaining wall stops a ground-level shortcut.'),('rk.gate','Open the side gate','Return to the court and release Grant.'),('rk.breach','Hold the breach','Defend the escaping group across the damaged wall opening.'),('rk.key','Enter the prison','Take the guard key or climb the battlement to its wheel.'),('exit','Descend to the cells','The cell stair sits inside the inner ward.')],
 branches=[('rk.wheel','Battlement alternative','An upper loop rejoins at the dungeon gate.'),('rk.tools','Seized workshop','Enter through the workshop door and recover tools inside a real room.'),('rk.wall','Old wall and sealed chamber','Climb the bell route, follow the old wall and unbar the chamber from the far side.')],
 protect='Side walls must meet the quest gates. The workshop has one purposeful entrance. Preserve the bell climb and upper wheel as real elevation choices.',
 review='Broken Walls finishing pass verified: full-scale courts retain both prison routes and optional climbs. Bell moved beside the escape lane; six towers have collision, with the breach pair moved clear of the battlement stairs. Joined paving, six signs, visible mechanisms and exact latch timing guide the journey. Physical traversal, live prisoner damage/retry, local host/guest progression and a genuine previous-version save passed. Human pacing and new-player comprehension remain untested.'),
dict(title='Ruined Keep · The Dungeons',module='prison-dungeons.js',main=['entry','west','hidden','ringWest','ringEast','exit'],
 idea='A cell block, hidden holding room, lift shaft, upper refuge and lower service works. Floor layers matter more than the overhead silhouette.',
 steps=[('kd.roster','Find the missing group','Use the roster and service marks to identify the hidden holding room.'),('kd.free','Release the prisoners','Reach the holding room from the west cells.'),('kd.papers','Recover the evidence','Confiscated papers belong beside the prison operation.'),('kd.lift.winch','Raise the group','Walk the winch around the drum and use the lift to reach the upper refuge.'),('exit','Leave through the upper hall','Exit above the cell and service floors.')],
 branches=[('kd.press.brake','Lower works','A lower machinery route rewards careful traversal.'),('kd.cache','Drain route','Follow a separate low service passage with deliberate jumps and a dead-end cache.'),('kd.return','Return the keepsake','A personal objective sits off the principal rescue flow.')],
 protect='Keep the shaft open and all lower passages clear. Do not add a shared staircase that makes the prisoner lift pointless; the player can use narrow service routes.',
 review='West service entrance, holding-room lock and return gate, prisoner boarding, full release bulkhead and separate lower works now have matching guidance and visible mechanisms. Main and optional routes were physically traversed; local co-op and old-save checks pass. Pacing and enjoyment still need human playtesting.'),
dict(title='Frostfell · Snowbound Peaks',module='snowbound-peaks.js',main=['climb','liftHouse','sheltered','summit','cave'],
 idea='A mountain ascent with sheltered rests and an exposed final cornice. Rock supports ledges; genuine mountain drops remain.',
 steps=[('ff.trail','Read the ascent','The foot trail leads toward shelter and the abandoned lift house.'),('ff.part','Recover the heater coil','Find the loose coil beside Heath’s shelter at the frozen crossing.'),('ff.heater','Thaw the crossing winch','Fit the coil to the machinery beside the crossing.'),('ff.reflect.3','Secure the cornice','Climb to its high anchor and release the route.'),('ff.cave','Enter the ice caves','The cave is the visible end of the mountain ascent.')],
 branches=[('ff.lift','Return shortcut','Lower steps to shorten later travel.'),('ff.camp.release','Survey-rig climb','Use the high camp rig to expose the explorer cache.'),('ff.cache','Buried camp','A lower side destination linked back to the ascent.')],
 protect='Keep bridge and cornice gaps. Do not spread catch floors across the mountain face; full-height ice walls must match their collision.',
 review='Finishing pass: Signed shelter and supply routes; protect the cornice and camp climbs. The old lift house, shelter and cave should stay legible from changing elevations. Check that snow and ice texture contrast keeps landing edges visible.'),
dict(title='Frostfell · Deep Ice Caves',module='deep-ice-caves.js',main=['entry','laboratory','west','notes','descent','channels','exit'],
 idea='Connected natural chambers with a captured laboratory and a downstream waterworks. Rescue leads to a physical water crossing, then the officers.',
 steps=[('ic.pages','Find the researcher trail','A page leads from the crystal junction toward the hidden lab.'),('ic.free','Rescue Ellis','Reach him before transport and recover his sealed notes nearby.'),('ic.lock.1','Raise the float','Move through the waterworks to its changing water level.'),('ic.lock.2','Freeze from the float','The next control is reached from the new water position.'),('ic.lock.3','Open the far drain','Complete the crossing on the other side.'),('exit','Confront the officers','Rejoin at the northern chamber.')],
 branches=[('ic.hugo.rope','Broken-shelf rescue','Brace the frame and lower a rope for Hugo from the upper shelf.'),('ic.channel.plug','Spill channel','Reach the hanging plug through the lower route.')],
 protect='Do not fill the water basin, broken shelf or float path. Keep low channels separate from high crystal walkways.',
 review='Finishing pass: Signed laboratory/spring/exit routes; preserve separate water and ledge mechanics. Water level, reachable control positions and visible ice must explain the sequence. An overhead plan cannot replace checking the actual changing surfaces.'),
dict(title='Emberdeep · Iron Halls',module='iron-halls.js',main=['entry','floor','machine','exit'],
 idea='A working production line: receiving yard, worker shelter, assembly floor, cart machinery, casting channel and furnace.',
 steps=[('ih.workers','Open the worker shelter','Reach the occupied factory floor.'),('jack','Find Jack','He identifies the live machinery ahead.'),('ih.handles','Recover insulated handles','Use the stores or overhead approach to reach the tools.'),('ih.cart','Release the cart','Operate its brake beside the service track.'),('ih.plate','Read the casting controls','Understand the line before crossing the molten channel.'),('exit','Reach the furnace','The production route continues into the main chamber.')],
 branches=[('ih.blank','Seized work','Recover Flint’s blank from the side production area.'),('ih.mold','Casting mold','Time a visit to the cooled mold, off the main crossing.'),('ih.return','Return stairs','Open a useful shortcut after reaching the far machine floor.')],
 protect='Retain moving machinery clearances, presses and the lava crossing. Enclose the factory without laying a floor over the molten channel.',
 review='Finishing pass: Signed production circulation and clear scrap-track approaches. Stores, tools and tracks need to read as one industrial process. Keep route markings off puzzle gaps.'),
dict(title='Emberdeep · Great Furnace',module='great-furnace.js',main=['entry','main','transport','cooling','exit'],
 idea='A furnace chamber with a worker evacuation route and an overseeing command office. The office records lead the story toward Sunspire.',
 steps=[('pike','Pass the inspection','Investigate the fault for the quiet route or fight through.'),('gf.transport','Stop the transport chain','Work along the safe service route toward the workers.'),('gf.evac.call','Lead the workers out','Stop production and call the group toward the exit.'),('gf.pipes','Cool the crossing','The diagram and visible pipes explain the machinery.'),('gf.writings','Search the command office','Recover the seized Sunspire writings above the work floor.'),('exit','Enter the furnace chamber','Cross after cooling and reach the colossus.')],
 branches=[('gf.pressure','Upper pressure route','Climb the gantry to control pressure from above.'),('gf.pet.release','Heat-cage rescue','Shut the heat feed before opening Cinder’s cage.'),('gf.cache.release','Cooling box','A local machinery reward near the cooling system.')],
 protect='Keep the furnace void and cooling crossing open. Do not bury the worker passage or remove overhead route clearance.',
 review='Finishing pass: Signed worker/transport/office/cooling routes; preserve escort and heat defense. The office must look down onto production, not sit like an unrelated platform. Verify evacuation movement through the furnished route.'),
dict(title='Storm Coast · Shipwreck Shore',module='shipwreck-shore.js',main=['beach','wreck','lookout','cave'],
 idea='A salvage beach organized around Otto’s workbench and three distinct recovery trips. Repairing a real ship is the shared destination.',
 steps=[('otto','Find the stranded boat','The work beach connects all salvage branches.'),('sc.rudder','Recover the rudder','Enter the broken hull and climb to its deck.'),('sc.sail','Take the sailcloth','Reach the occupied lookout.'),('sc.drain','Drain the storage room','Approach the dry cave from outside before opening its latch.'),('sc.rope','Collect dry rope','Return recovered parts to the bench.'),('sc.board','Set sail','The repaired ship begins the playable voyage.')],
 branches=[('sc.memorial','Crew memorial','Captain Rose’s wreck leads to a quiet memorial on the same coast.'),('sc.hull.release','Lower hull','Release cargo to reveal a separate salvage route.'),('sc.ballista','Wreck ballista','Use the mounted weapon to open the bound chest.')],
 protect='Ground the beach but preserve surf, wreck interiors, rigging and cave entrance heights. Ship launch and voyage are not changed by this geography layer.',
 review='Finishing pass: Signed salvage forks and a clear return to the boat. Show the ship from the return approaches so returning parts has a visible purpose. Preserve the three retrieval challenges rather than making three open-ground pickups.'),
dict(title='Storm Coast · Thunder Cliffs',module='thunder-cliffs.js',main=['ascent','upper'],
 idea='A shore landing rises through cargo ledges and wind shelters toward the hydra. Tide caves and racing ledges branch away from the ascent.',
 steps=[('abe','Reach the landing','Take the eastern steps toward the middle ledge.'),('tc.shackle','Inspect the shackle','Evidence of captivity foreshadows the hydra encounter.'),('tc.approach','Open the upper barrier','Follow the high approach to the arena.'),('exit','Reach the hydra ledges','The main ascent works without repairing the cargo lift.')],
 branches=[('tc.lift','Cargo-lift shortcut','Fit the spare brake wheel below, then release the upper catch. Repair is optional.'),('tc.race.finish','Wind-running route','Dash’s flags lead around a separate exposed loop.'),('tc.tide.release','Tide grotto','Reach a low, tide-dependent door and its inland grotto.'),('tc.cave.help','Wreck-cave rescue','Connect lower bracing and upper controls without collapsing their heights.')],
 protect='Keep the ocean drops and tide doorway clear. Foundations may support a ledge, never obstruct a cave below it.',
 review='Finishing pass: Signed eastern ascent and optional lift; preserve tide and cliff routes. The lift and eastern steps share a destination, so the lift is an optional shortcut in the current quest logic. Keep that choice clear instead of implying a mandatory repair.'),
dict(title='Sunspire · Palace Courtyard',module='palace-courtyard.js',main=['entry','water','westGarden','eastGarden','westBalcony','eastBalcony','mirror'],
 idea='A monumental ascent through gardens to the library facade. Waterworks occupy a lower side court; balconies and mirrors converge on the palace door.',
 steps=[('grace','Reach the fountain court','The central axis frames the palace above.'),('pc.clamp','Restore the waterworks','Descend into the west service garden, remove the clamp and run the wheel.'),('pc.west.upper','Raise a balcony route','Use either west or east lock-and-balcony approach.'),('pc.mirror.note','Understand the light path','Read the sun marks on the upper terrace.'),('pc.enter','Open the library door','Aim the mirrors; the facade’s side wings close off bypasses.')],
 branches=[('pc.east.upper','East balcony alternative','A second ascent returns to the same mirror terrace.'),('pc.garden.water','Greenhouse','Restore a small garden channel and recover seeds.'),('pc.memorial','Memorial roof','A separate roof route overlooks the main gardens.')],
 protect='The palace seal spans the full approach. Preserve balcony gates and route alternatives. Lower garden ground catches ordinary falls without removing the required ascent.',
 review='Finishing pass: Signed lower gardens versus upper balconies; preserve the beam and library seal. The entry now follows one clear axis. Verify sightlines to the distant facade and that the two balcony approaches feel meaningfully different.'),
dict(title='Sunspire · Sky Library',module='sky-library.js',main=['main'],
 idea='A connected library building: vestibule, keeper desk, records wing, reading nave and guardian sanctum. Optional galleries open off that spine.',
 steps=[('hugh','Enter at the keeper desk','Speak with Hugh or use the lower maintenance approach.'),('sl.orders','Read the Legion orders','The evidence belongs inside the main reading hall.'),('sl.release','Open the sanctum seal','The gate closes the full guardian approach.'),('exit','Meet the guardian','Proceed into the guardian hall; the sacred orb follows that encounter.')],
 branches=[('sl.records','Damaged-records wing','Rescue the records in a side room that returns directly to the reading nave.'),('sl.maintenance','Lower service entry','A distinct lower passage rejoins the nave.'),('sl.shelf.1','Folding-shelf gallery','Real movable shelves cross an open gallery; the far crank requires traversal.'),('sl.display.grip','Reflector room','Move the light fixture to reveal a hidden room.'),('dr.winch','Exterior nesting terraces','Follow exposed palace ledges for the dragon rescue.')],
 protect='Keep shelf gaps, lower maintenance clearance and exterior terraces. The guardian seal must meet its side walls. Door openings follow the actual records path.',
 review='Finishing pass: Signed reading/maintenance/terrace routes with floor-aware guidance. The records bookshelf was moved after a physical walk found it blocking the route. Use room walls and doorways to check future bookcase placement, then inspect the camera inside.'),
dict(title='Castle Duskmoor · Castle Gates',module='castle-gates.js',main=['landing','yard','supply','bridge','court'],
 idea='An occupied siege yard outside a fortified royal gate. Disguise materials and papers belong to the working camp; the moat is a genuine break in the ground.',
 steps=[('roland','Scout the repair yard','Learn how the guarded entry works.'),('cg.coat','Prepare a disguise','Gather matching coat, helmet and supply papers around the camp.'),('cg.catch.west','Release the bridge brake','Use the drain-side service route.'),('cg.bridge','Lower the drawbridge','Cross the moat into the gate court.'),('cross','Pass the inspection','Use the disguise and papers or fight Cross.'),('cg.release','Raise the inner gate','Enter the tower after resolving the checkpoint.')],
 branches=[('cg.personal','Confiscation room','Recover Roland’s armor in the side store.'),('cg.balcony.note','Supply balcony','A roof and tag trail lead above the camp.')],
 protect='Do not bridge the moat with new ground. Keep the inspection barrier and drain approach. Camp terrain ends before the drawbridge.',
 review='Finishing pass: Signed repair/supply/drain/gatehouse approaches; keep moat and disguise alternatives. The disguise encounter is the signature activity here. New architecture should make the guard lane clear without cluttering its approaches.'),
dict(title='Castle Duskmoor · Long Ascent',module='long-ascent.js',main=['spiral','lowerCatch','upperCatch'],
 idea='Two immense revolutions up a masonry tower, with side service rooms and exposed broken flights. The destination sits high above the entrance.',
 steps=[('la.notice','Read the stair notice','Begin at the foot of the continuous spiral.'),('la.lower','Release the lower catch','A landing interrupts the first revolution.'),('la.upper','Release the upper catch','Cross broken flights and reach the second high landing.'),('la.summit','Open the throne doors','Defeat the summit guards before confronting the King.')],
 branches=[('la.cells','Worker cells','A side landing leads to the locked group.'),('la.vault.brake','High service vault','Jump up the vault steps to the brake.'),('la.memorial.note','Old memorial','A high exterior detour rewards careful traversal.')],
 protect='Keep every deliberate stair gap and exposed detour. Supports must not fill the tower interior or erase lower floors. Inspect one elevation band at a time.',
 review='Finishing pass: Floor-specific spiral landing signs and guide points; keep every broken flight. Overhead overlap is intentional here, not a shortcut. The height profile and sliced map expose the two revolutions; normal-camera checks still decide whether the climb feels epic.'),
]

def clean(v):
    if isinstance(v, str):
        return v.replace('\ufffd', '’')
    return v

def box(o, layer):
    y = o.get('h', 0) if layer == 'floor' else o.get('y0', 0)
    h = (o.get('h', 0) if o.get('courtWall') else o.get('h', 0)-y) if layer != 'floor' else 0
    return [round(o.get(k, 0) or 0, 1) for k in ('x','z','w','d')] + [round(y or 0,1),round(h,1),str(o.get('geography',''))]

def geometry(r):
    floors=[box({**o,'h':0},'floor') for o in r['segments'] if not o.get('nofloor')]
    floors += [box(o,'floor') for o in r['plats'] if not o.get('nocol')]
    walls=[box(o,'wall') for o in r['walls'] if not o.get('nocol')]
    blocks=[box(o,'wall') for o in r['obstacles'] if not o.get('nocol') and o.get('w') and o.get('d')]
    # Identical overlapping route samples are not useful repeated SVG rectangles.
    def unique(rows):
        return list({tuple(v):v for v in rows}.values())
    return dict(floors=unique(floors),walls=unique(walls),blocks=unique(blocks))

def briar_paths(row):
    # Read literal walking lanes from their actual source, not an invented straight line.
    text=(ROOT/'public/3d/index.html').read_text(encoding='utf-8-sig')
    function='buildHomefieldsExploration' if row['area']==0 else 'buildBlackWoods'
    text=text.split('function '+function+'(){',1)[1]
    paths=json.loads(re.search(r'const paths=(\[.*?\]);',text).group(1))
    names=['westFarm','westReturn','eastPasture','eastReturn'] if row['area']==0 else ['campTrail','eastGround','grove','groveReturn','shelterLink']
    result={k:[p+[0] for p in ps] for k,ps in zip(names,paths)}
    if row['area']==0:
        result['granaryStairs']=[[960,345-i*20,i*5] for i in range(21)]
        result['watchEastStairs']=[[100-i*28,-1060,i*7] for i in range(21)]
        result['watchSouthStairs']=[[-800,-1290-i*28,140-i*7] for i in range(21)]
    if row['area']==0:
        plan=json.loads((OUT/'briar-district-plan.json').read_text(encoding='utf-8'))
        result={k:v for k,v in result.items() if k not in names}
        result.update({r['id']:[p+[0] for p in r['points']] for r in plan['roads']})
        result['bellRidgeUp']=[[2350,-1000-i*50,i*12] for i in range(15)]
        result['bellRidgeReturn']=[[2080-i*28,-1810,168-i*7] for i in range(25)]
        result['pickingDecks']=[[p['x'],p['z'],p['y']] for p in plan['jumps']]
    return result

def canyon_paths():
    text=(ROOT/'public/3d/lost-canyon.js').read_text(encoding='utf-8')
    paths={}
    for key,name in [('signalClimb','alarmJumps'),('freightClimb','freightJumps'),('northRescue','NORTH_ROUTE')]:
        points=json.loads(re.search(r'const '+name+r'=(\[\[.*?\]\]);',text).group(1))
        paths[key]=[p+[0] if len(p)==2 else p for p in points]
    return paths

def main():
    before=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    after=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))
    old={(r['zone'],r['area']):r for r in before}
    maps=[]
    for r,plan in zip(after,PLANS):
        z,a=r['zone'],r['area'];assert z*2+a==len(maps)
        assert r['bounds']==old[z,a]['bounds'], 'Map scale changed'
        if z==0:r['paths']={**r['paths'],**briar_paths(r)}
        if (z,a)==(1,1):r['paths']={**r['paths'],**canyon_paths()}
        lookup={str(o.get('key',o.get('id'))):o for o in r['objects']+r['npcs']}
        lookup['exit']=r['portal']
        points=[]
        for group in ('steps','branches'):
            for i,(key,label,note) in enumerate(plan[group]):
                o=lookup[key];assert o, key
                points.append(dict(id=key,label=label,note=note,group=group,number=str(i+1) if group=='steps' else chr(65+i),x=o['x'],z=o['z'],y=o.get('y',0)))
        rooms=[{k:clean(v) for k,v in o.items()} for o in r['rooms']]
        source=ROOT/'public/3d'/plan['module']
        paths=[]
        for key,ps in r['paths'].items():
            if ps:paths.append(dict(id=key,main=key in plan['main'],points=[[round(n,1) for n in p] for p in ps]))
        assert all(k in r['paths'] for k in plan['main'])
        maps.append(dict(id=f'{z}-{a}',title=plan['title'],zone=z,area=a,bounds=r['bounds'],
            idea=plan['idea'],protect=plan['protect'],review=plan['review'],points=points,paths=paths,rooms=rooms,
            before=geometry(old[z,a]),after=geometry(r),hazards=r['geography']['hazards'],
            enemies=r['enemies'],source={'file':plan['module'],'sha256':hashlib.sha256(source.read_bytes().replace(b'\r\n',b'\n')).hexdigest()},
            heightMax=max([o.get('y',0) or 0 for o in rooms]+[0]),
            pathNote='Lines follow authored route centers, including slopes, jumps and initially locked passages. A line is not proof of an open walking route.'))
    data=dict(version='2.197.0-campaign-journeys',date='2026-10-14',beforeCommit='9d143bd1',
              status='Initial-state geometry review with authored design intent. Not a human playtest or a complete quest walkthrough.',maps=maps)
    (OUT/'layout-data.json').write_text(json.dumps(data,separators=(',',':'),ensure_ascii=False),encoding='utf-8')
    print(f'Built {len(maps)} maps; {(OUT/"layout-data.json").stat().st_size:,} bytes; bounds unchanged.')

if __name__=='__main__':main()
