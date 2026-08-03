/* ─────────────────────────────────────────────────────────────────────────────
   _shot/shot.js — headless screenshot + probe harness for the real game.

   Why it is written this way: an unattended run cannot `npm install`, and this machine has
   no playwright/puppeteer module resolvable from anywhere. It DOES have Chrome, and Node 26
   ships a global WebSocket. So this drives Chrome directly over the DevTools Protocol with
   ZERO dependencies — a ~40-line CDP client instead of a 300MB toolchain.

   It also serves public/ over real HTTP, because the 3D layer is ES modules + glTF fetches
   and file:// fails both on CORS.

   Usage:
     node _shot/shot.js                                  # default: hub, 3D on
     node _shot/shot.js --url "/3d/index.html?hero3d=1&world3d=1&nobloom"
     node _shot/shot.js --out _shot/out/hub.png --wait 9000
     node _shot/shot.js --eval "Object.keys(__BF3.G.deco[0]||{})"
     node _shot/shot.js --eval "__BF3.G.chests.push({x:0,z:0,y:0,opened:false,bob:0})"  # MUTATE, then shoot
     node _shot/shot.js --pre  "__BF3.enterZone('woods',1)" --wait 6000
     node _shot/shot.js --size 1280x720
     node _shot/shot.js --scene 0                        # in-game in The Outskirts, world3d built
     node _shot/shot.js --scene hub                      # standing in the Waystation
     node _shot/shot.js --scene side0                    # the zone's HIDDEN side area (The Thornwood)
     node _shot/shot.js --scene 0.1                      # zone 0's SECOND area (Black Woods); 0.b = its boss
     node _shot/shot.js --scene trial                    # the class trial — the only ROOM DUNGEON
     node _shot/shot.js --scene spar                     # the hub's SPARRING ROOM (the boxing hall)
                                                         #   (walls with doorways, doors, plates)
     node _shot/shot.js --scene arena:lava               # THE FOUR ACTIVITIES. arena:flat|parkour|lava
     node _shot/shot.js --scene abyss:13                 #   abyss:<floor> — stage rotates every 2 floors
     node _shot/shot.js --scene sprint                   #   the floating parkour course
     node _shot/shot.js --scene gauntlet                 #   gauntlet:normal|brutal (boss rush)
     node _shot/shot.js --ready "__mob3d().live>0"       # hold the shutter until this is true
     node _shot/shot.js --scene 0 --focus "__BF3.G.waystone"      # POINT THE CAMERA AT A THING
     node _shot/shot.js --focus "0,0,-5600" --dist 260 --side 40  # ...or at a bare x,y,z

   --scene / --ready exist because of a failure mode that WILL fool you otherwise.
   A screenshot of a 3D zone taken too early is not blank and is not an error: the game has
   already fallen back to the voxel renderer, so you get a complete, plausible, WRONG picture —
   flat ground, box trees, no roads — that looks exactly like "the 3D world regressed". On this
   machine (headless SwiftShader) world3d needs ~30-45s to fetch and parse its glTF props, so a
   `--prewait 20000` render is a voxel render every time. --ready polls the page until the world
   reports itself built and says so, and shouts if it gave up instead. Never trust a 3D-world
   screenshot that did not print "ready ✓".

   And "ready ✓" has to mean ready HERE, not ready somewhere. `--scene <n>` passes through the
   class TRIAL and then the hub on the way, and BOTH of them satisfied older versions of the test
   — the trial arena because startTrial() sets G.zone to the zone you asked for, the hub because
   world3d builds it five seconds before enterZone fires. See the long note on sceneReady() below.
   Since 2026-08-02 the default waits for the destination itself, so a `--scene 0` that resolves in
   under a second is the bug, not the fast path — and every run now prints `at → <place>` so a
   shot of the wrong level says so in words instead of only in pixels.

   Exit 0 = screenshot written. Console errors from the page are always printed.
   ───────────────────────────────────────────────────────────────────────────── */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WEBROOT = path.join(ROOT, 'public');

/* ── the two copies must not drift ──────────────────────────────────────────
   This file lives twice on purpose: harness/shot.js is committed and is the source of record,
   _shot/shot.js is the gitignored working copy, and only the second path is on the permission
   allowlist. Both resolve ROOT the same way, so either can be run — but a fix made to one and
   not the other is invisible, and "two copies of the same code, edits landing in the one nobody
   runs" is the single failure that has cost this project the most sessions.

   So: whichever copy you invoke, it checks the other and says if they differ. A warning, never
   a refusal — a verification run failing because of housekeeping would be worse than the drift. */
(() => {
  const mine = path.resolve(__filename);
  const other = path.join(ROOT, path.basename(path.dirname(mine)) === '_shot' ? 'harness' : '_shot', 'shot.js');
  try {
    if (!fs.existsSync(other)) return;
    /* Compare with line endings normalised: git checks harness/shot.js out with CRLF on Windows
       while the copy in _shot/ keeps whatever it was copied with, and a warning that fires on
       every single run is a warning nobody reads. */
    const norm = p => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    if (norm(mine) === norm(other)) return;
    console.log('\n!! shot.js DRIFT: ' + mine + '\n   differs from      ' + other
      + '\n   The committed copy is harness/shot.js. Refresh with:  cp harness/shot.js _shot/shot.js'
      + '\n   (running the older copy is how a "fixed" harness quietly keeps the old bug)\n');
  } catch (e) { /* never let housekeeping stop a render */ }
})();

/* ── args ────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
/* ── --assets <dir>: offline mode. Parse every .glb/.gltf under public/slice3d/assets/<dir>
      and report which texture URIs they reference and whether that file is actually on disk.
      Missing kit textures render as flat white, which looks like "the art is bad" rather than
      "a file 404s", so this needs to be checkable without eyeballing a render. */
const ASSETS = arg('assets', null);
if (ASSETS) {
  const base = path.join(WEBROOT, 'slice3d/assets');
  const dirs = ASSETS === 'all' ? fs.readdirSync(base).filter(d => fs.statSync(path.join(base, d)).isDirectory()) : [ASSETS];
  for (const d of dirs) {
    const dir = path.join(base, d);
    const refs = new Map();          // uri -> [files that reference it]
    let embedded = 0, scanned = 0;
    const walk = (p) => {
      for (const f of fs.readdirSync(p)) {
        const fp = path.join(p, f);
        if (fs.statSync(fp).isDirectory()) { walk(fp); continue; }
        let json = null;
        if (f.endsWith('.gltf')) { json = JSON.parse(fs.readFileSync(fp, 'utf8')); }
        else if (f.endsWith('.glb')) {
          const buf = fs.readFileSync(fp);
          // glb: 12-byte header, then chunks of [len u32][type u32][data]. First chunk is JSON.
          const len = buf.readUInt32LE(12);
          json = JSON.parse(buf.slice(20, 20 + len).toString('utf8'));
        } else continue;
        scanned++;
        for (const img of json.images || []) {
          if (!img.uri) { embedded++; continue; }
          const key = img.uri;
          if (!refs.has(key)) refs.set(key, []);
          refs.get(key).push(path.relative(dir, fp));
        }
      }
    };
    walk(dir);
    console.log('\n=== ' + d + '  (' + scanned + ' models, ' + embedded + ' embedded images) ===');
    if (!refs.size && !embedded) console.log('  no images at all');
    for (const [uri, users] of [...refs].sort()) {
      const on = fs.existsSync(path.join(dir, uri));
      console.log('  ' + (on ? 'ok      ' : 'MISSING ') + uri + '   (' + users.length + ' models, e.g. ' + users[0] + ')');
    }
  }
  process.exit(0);
}

/* Git Bash (MSYS) rewrites any argument that LOOKS like a unix path into a Windows one, so
   `--url "/3d/index.html"` arrives as "C:/Program Files/Git/3d/index.html" and Chrome answers
   "Cannot navigate to invalid URL", which names neither the cause nor the fix. It only bites the
   flagless form: a `?` or `&` in the string suppresses the rewrite, which is why every URL with
   query flags has always worked and this was never noticed.

   Recovering it is unambiguous rather than clever - walk the mangled string's suffixes longest
   first and take the first one that is a real file under public/. Says what it did, because a
   harness silently loading a different page than you asked for is its own trap. */
const unmangle = (u) => {
  if (!/^[A-Za-z]:[\\/]/.test(u)) return u;
  const parts = u.replace(/\\/g, '/').split('/');
  for (let i = 1; i < parts.length; i++) {
    const cand = '/' + parts.slice(i).join('/');
    if (fs.existsSync(path.join(WEBROOT, cand))) {
      console.log('note: Git Bash rewrote --url to "' + u + '"; using "' + cand + '" instead.'
        + '  (add a ?query to the url, or MSYS_NO_PATHCONV=1, to avoid this)');
      return cand;
    }
  }
  console.log('!! --url "' + u + '" looks like Git Bash rewrote a unix path and nothing under '
    + 'public/ matches it. Add a ?query to the url, or set MSYS_NO_PATHCONV=1.');
  return u;
};
const URLPATH = unmangle(arg('url', '/3d/index.html?hero3d=1&world3d=1&nobloom'));
const OUT = path.resolve(ROOT, arg('out', '_shot/out/shot.png'));
const WAIT = parseInt(arg('wait', '9000'), 10);
const EVAL = arg('eval', null);
const PREWAIT = parseInt(arg('prewait', '3500'), 10);
const [W, H] = arg('size', '1280x720').split('x').map(Number);

/* ── --scene: get from the attract screen to somewhere worth photographing ──
   The game does not open in a zone. It opens on the title, then a story cutscene, then class
   select, then a class TRIAL, then the hub — five gates, each of which will happily hand you a
   screenshot of itself. Every session so far has re-derived this sequence by taking pictures of
   menus, so it lives here now.

   Chrome runs on a throwaway profile, so localStorage is empty on every run and the sequence is
   the same every time: the story veil is dismissed by clicking its own Skip button on a timer
   (it fades in over several lines and there is no single moment to click), startTrial picks a
   class, skipTrial grants it and drops you in the hub, then enterZone descends.

   The dismiss list is a WHITELIST of specific ids, not "click the first button in the overlay".
   These cards sit next to menus whose first button is Exit or Title Screen, and a generic
   clicker would eventually walk the run back out to the attract screen and photograph that. */
const SCENE = arg('scene', null);
/* `side<N>` reaches the hidden SIDE area of zone N — the Thornwood, the Oubliette, the Reaper's
   Gate and the other four. They are their own hand-authored scapes (SIDE_SCAPES), not a reskin of
   the zone above them, so nothing a `--scene <n>` render shows says anything about them.
   The unlock step is not optional and is the whole reason this needed a flag rather than a --pre:
   `enterSide(zi)` checks `meta.classUnlocked[S.trial]` FIRST and, if the class is locked, quietly
   runs `startTrial()` instead — a different level entirely. Chrome runs on a throwaway profile, so
   every class is locked on every run and a bare enterSide() would photograph the trial arena while
   reporting the side area's name. cheatUnlockClasses() first makes the door open. */
const sideOf = (dest) => { const m = /^side(\d+)$/.exec(String(dest || '')); return m ? parseInt(m[1], 10) : null; };
/* `<zone>.<area>` reaches a zone's LATER areas — `--scene 0.1` is Black Woods, the second place
   anyone plays. Until this went in, `--scene <n>` could only ever photograph area 0, because
   enterZone() loads the zone's first area and nothing else moved: half the levels in the game
   (every zone has two areas, most of them a different scape) had never been in front of a camera.
   `<zone>.b` is the zone's BOSS room, which is `G.area === -1`.
   nextArea() is the game's own "you reached the exit" step and is synchronous through loadArea(),
   so stepping it N times lands on area N without waiting on anything. */
const areaOf = (dest) => {
  const m = /^(\d+)\.(b|\d+)$/.exec(String(dest || ''));
  return m ? { zone: parseInt(m[1], 10), area: m[2] === 'b' ? -1 : parseInt(m[2], 10) } : null;
};
/* `trial` / `trial:<class>` STAYS in the class trial instead of skipping past it, and it is the
   only way this harness has into a ROOM DUNGEON. Every other destination lands on a hand-authored
   scape: EXPANDED_SCAPES for the eight zones, SIDE_SCAPES for the seven side areas, BOSS_ARENAS
   for the boss rooms. The shared grid-graph maze underneath them — the one generator that emits
   `G.walls` with doorway gaps, `sealDoor()` slabs into `G.doors`, pressure `G.plates` and corner
   `G.torches` — is reached only when every one of those dispatches is skipped, and `G.trial` is
   what skips all four (each guard reads `!G.trial`). So doors existed in the game and could not be
   photographed: the wall/door defer fix shipped 2026-08-02 was verified on walls and INFERRED on
   doors, and the backlog said so in as many words.
   The run-up already calls startTrial('warrior') on its way to the hub — this destination simply
   never calls skipTrial(). `trial:reaper` etc. picks the class, which picks the trial. */
const trialOf = (dest) => { const m = /^trial(?::([a-z]+))?$/i.exec(String(dest || '')); return m ? (m[1] || 'warrior') : null; };
/* THE FOUR REPEATABLE ACTIVITIES — the Abyssal Descent, the Treasure Sprint, the Arena and the
   Boss Gauntlet. Oliver's stage-2 brief is "each of the four is a PLACE, not a menu", and until
   this went in NOT ONE OF THEM HAD EVER BEEN IN FRONT OF A CAMERA. All four take world3d's full
   ZONE branch (they are not hub sub-areas: only the Sparring Room is), so most of stage 2 is
   auditing a conversion that already happens rather than building one — but you cannot audit what
   you cannot photograph.
   Each ready test is keyed to the destination's OWN flag, never to a generic `built && !counts.hub`:
   the run-up passes through the class trial AND the hub, and both satisfy the generic test. That is
   the same race, twice fixed, written up at length above — do not reintroduce it here.
   Two entry notes, both measured off the source:
     - `startBossRush` early-returns with a toast unless `meta.hero` and `meta.classUnlocked` are
       populated (index.html:9625), so it needs cheatUnlockClasses() first exactly as `side<N>` does.
     - The Abyss and Gauntlet NPCs open an overlay CARD (openEndlessGate / openGauntletGate) rather
       than entering. The door is the `start*` call, not the NPC — which is why these are `--pre`
       style entries and `spar` is not.
   `arena:<map>` picks the map (flat | parkour | lava) and `abyss:<floor>` the floor, because both
   change the LEVEL: the three arena maps declare three different grounds, and the Abyss rotates
   stage every two floors, so a single default render says nothing about the other variants. */
const ACTIVITIES = {
  arena:    { arg: 'map',   go: (v) => 'if(' + JSON.stringify(!!v) + ') __BF3.ARENA_LOADOUT.map=' + JSON.stringify(v || 'flat') + '; __BF3.enterArena();',
              at: '__BF3.G.arena === true' },
  abyss:    { arg: 'floor', go: (v) => '__BF3.startEndless({floor:' + (parseInt(v, 10) || 1) + '});',
              at: '!!__BF3.G.endless && __BF3.G.floor > 0' },
  sprint:   { arg: null,    go: () => '__BF3.startHubSprint();',
              at: '!!__BF3.G.sprintFun && !!__BF3.G.bonusActive' },
  gauntlet: { arg: 'tier',  go: (v) => '__BF3.cheatUnlockClasses(); __BF3.startBossRush(' + JSON.stringify(v || 'normal') + ');',
              at: '!!__BF3.G.bossRush && __BF3.G.brIdx != null' },
};
const activityOf = (dest) => {
  const m = /^(arena|abyss|sprint|gauntlet)(?::([a-z0-9]+))?$/i.exec(String(dest || ''));
  if (!m) return null;
  const key = m[1].toLowerCase();
  return { key, spec: ACTIVITIES[key], val: m[2] || null };
};
const sceneJs = (dest) => {
  const sd = sideOf(dest), ar = areaOf(dest), tr = trialOf(dest), ac = activityOf(dest);
  /* The SPARRING ROOM is a hub sub-area — its own hand-authored boxing hall, `G.hub` true and
     `G.sparringRoom` true — and it needed a destination of its own because there is no way in from
     outside: `enterSparringRoom` is a plain top-level function and is NOT on `window.__BF3`, so a
     --pre cannot call it. The way in is the game's own door: the hub NPC list carries the handler
     (`{id:'sparring', open:()=>enterSparringRoom()}`), so this opens it the way a player does. */
  const go = dest === 'hub' ? ''
    : dest === 'spar' ? 'var sp=(__BF3.G.hubNpcs||[]).filter(function(q){return q.id==="sparring"})[0]; if(sp) sp.open();'
    : ac ? ac.spec.go(ac.val)
    : sd != null ? '__BF3.cheatUnlockClasses(); __BF3.enterSide(' + sd + ');'
    : ar ? '__BF3.enterZone(' + ar.zone + '); for(var a=0;a<' + (ar.area < 0 ? 9 : ar.area)
           + ' && __BF3.G.area >= 0; a++) __BF3.nextArea();'
    : '__BF3.enterZone(' + (parseInt(dest, 10) || 0) + ');';
  /* 'tutGo' is on the whitelist HERE and nowhere else, and the distinction is the whole reason the
     dismiss list is a whitelist. The first trial opens behind "The Proving Chamber" tutorial card,
     whose two buttons are `tutGo` (begin) and `tutSkip` (skip tutorial AND trial). A clicker that
     took the first button in the overlay would take the trial with it and photograph the hub. */
  if (tr) return `(function(){
  var ids=['storyskip','tutGo'];
  var t=setInterval(function(){
    for(var i=0;i<ids.length;i++){ var b=document.getElementById(ids[i]); if(b&&b.offsetParent) b.click(); }
  },300);
  __BF3.startTrial(${JSON.stringify(tr)});
  setTimeout(function(){ clearInterval(t); }, 6000);
})()`;
  return `(function(){
  var ids=['storyskip','hubTutGo'];
  var t=setInterval(function(){
    for(var i=0;i<ids.length;i++){ var b=document.getElementById(ids[i]); if(b&&b.offsetParent) b.click(); }
  },300);
  __BF3.startTrial('warrior');
  setTimeout(function(){
    __BF3.skipTrial();
    setTimeout(function(){ clearInterval(t); ${go} }, 5000);
  }, 2500);
})()`;
};
const PRE = arg('pre', SCENE == null ? null : sceneJs(SCENE));

/* Poll until this expression is truthy, THEN screenshot. Defaults with --scene to "world3d has
   finished building THIS destination", which is the thing that is silently slow.

   The default used to be just `__world3d().built`, and that was WRONG for `--scene <n>` in a way
   that produced the exact fake it exists to prevent. Read the sequence above: skipTrial() drops
   you in the HUB, and enterZone() only fires FIVE SECONDS later. world3d builds the hub the
   moment you land in it, so `built` is already truthy long before the zone is entered — the
   shutter fires on the Waystation and the run gets a complete, plausible picture of the wrong
   place. Measured 2026-08-02: `--scene 0` printed "ready ✓ after 0.0s", photographed the hub
   plaza, and reported counts {hub:true, pave:273} with mob live 0 and chests 0 while the run
   believed it was auditing the Outskirts. It is a RACE, which is why it had worked before — if
   the hub build happens to take longer than the 7.5s run-up, `built` flips after enterZone and
   the shot is correct by luck.

   So the destination is part of the test now, and each half is checked against something only
   that destination can produce:
     - the GAME is where it should be   — G.hub / G.stageIndex, set synchronously by enterZone
     - the BUILD is of that place       — counts.hub is set only by the hub build, so a zone
                                          waits for counts to stop being the hub's
   `world3d().on` gates the build half, so `--scene 0 --url "...?world3d=0"` still resolves
   instead of burning the full readymax and reporting READY NEVER CAME. */
const sceneReady = (dest) => {
  /* G.zone, NOT G.stageIndex. --scene <n> hands n to enterZone(), which takes a ZONE index and
     then loads that zone's first AREA, whose stage is a different number: zone 1 area 0 is
     stage 3. They only agree for zone 0, which is why --scene 0 is the example everywhere and
     why testing stageIndex looked right. Caught by this fix's own --scene 1 check, which sat
     out the full readymax waiting for a stageIndex that was never coming. */
  /* A side area is `G.side` on the SAME zone index, so testing the index alone cannot tell one
     from the other. Test the flag too, both ways round.

     `!G.trial` is the other half, and without it the whole test was still a lie — MEASURED
     2026-08-02 (worker B) by running the same `--scene 0` twice and getting two different levels.
     The run-up to a zone is startTrial('warrior') → 2.5s → skipTrial() → 5s → enterZone(n), and
     `startTrial` builds `newG(p,{zone: fromZone||0, …, trial:cid})`. So for those seven and a half
     seconds the game is standing in the TRIAL ARENA with G.zone already 0, G.hub falsy and G.side
     false — every clause of the old test satisfied — and world3d builds the arena, so `built` and
     `!counts.hub` come true there as well. Whether the shutter fires on the arena or the zone is a
     pure race with how warm the asset cache is: one run reported "The Outskirts" with 118 trees,
     the next reported "Trial of the Blade" with 34 deco and 0 trees, from an identical command.
     Same shape as the hub race fixed earlier the same day, one gate further back. */
  const sd = sideOf(dest), ar = areaOf(dest), tr = trialOf(dest), ac = activityOf(dest);
  const inZone = '!__BF3.G.hub && !__BF3.G.trial && !__BF3.G.side && __BF3.G.zone === ';
  /* The trial is the one destination that WANTS G.trial, so it inverts the clause every other
     destination added to keep the trial out. It cannot name a zone: startTrial() reuses whatever
     zone you came from (`fromZone||0`), so the arena's identity is G.trial itself. */
  const at = dest === 'hub'
    ? '!!__BF3.G.hub'
    /* The sparring room sets G.hub AND G.sparringRoom, so `hub` alone would resolve in the
       Waystation on the way and photograph the plaza. Test the room itself. */
    : dest === 'spar' ? '!!__BF3.G.sparringRoom'
    /* Each activity is identified by its own flag, and never by a zone index. Three of the four
       reuse an existing zone number (the Arena builds newG with zone:0, i.e. The Outskirts', and
       the trial on the way there is zone 0 as well), so `inZone` would resolve in the wrong place
       exactly the way it did before `!G.trial` was added. */
    : ac ? '!__BF3.G.hub && ' + ac.spec.at
    : tr
      /* ...and the arena is actually ON SCREEN. showTutorial() sets mode='menu' and covers the
         level with a full-page card, so `G.trial` alone resolved in 0.5s and handed back a
         photograph of the tutorial text. Wait for its Begin button to stop being visible. */
      ? '!__BF3.G.hub && !!__BF3.G.trial && !(document.getElementById("tutGo")||{}).offsetParent'
      : sd != null
        ? '!__BF3.G.hub && !__BF3.G.trial && !!__BF3.G.side && __BF3.G.zone === ' + sd
        : ar
          ? inZone + ar.zone + ' && __BF3.G.area === ' + ar.area
          : inZone + (parseInt(dest, 10) || 0);
  /* The sparring room goes down world3d's HUB branch (`world.hub` is the game's own G.hub), so its
     counts carry `hub:true` even though buildHub lays nothing there. */
  const wb = (dest === 'hub' || dest === 'spar') ? '!!w.counts.hub' : '!w.counts.hub';
  return '(function(){ try{'
       + ' if(!(window.__BF3 && __BF3.G && ' + at + ')) return false;'
       + ' var w = window.__world3d && __world3d(); if(!w) return true;'
       + ' if(!w.on) return true;'
       + ' return !!(w.built && w.counts && ' + wb + ');'
       + ' }catch(e){ return false; } })()';
};
const READY = arg('ready', SCENE == null ? null : sceneReady(SCENE));
const READYMAX = parseInt(arg('readymax', '120000'), 10);

/* ── --focus: point the shot AT something ──────────────────────────────────────
   Every session that photographs one specific object re-invents this, badly, in an --eval, and
   2026-08-01 spent eight renders on it before getting a usable frame. Two things make aiming by
   hand harder than it looks, and both are now handled here once:

   1. G.cam is a SMOOTHED follow-point that lerps 10% per frame toward the hero. Headless
      SwiftShader renders only a handful of frames per second, so after a teleport it is still
      hundreds of units behind - and the shoulder camera is built off G.cam, not off G.p. The
      symptom is not subtle: the subject lands behind the camera, or inside the near plane, and
      the frame looks like the object simply is not being drawn. This snaps G.cam, waits, then
      snaps it AGAIN just before the shutter, because the game keeps lerping in between.
   2. The shoulder camera does not sit at the hero, it sits 180*cos(pitch) BEHIND them, so
      "put the hero D away from the thing" is not the same as "frame it at D". --dist is the
      distance from the CAMERA to the subject, which is the number you actually care about.

   --focus takes either a JS expression evaluated in the page (`__BF3.G.waystone`, anything with
   .x/.z, .y optional) or a bare `x,y,z`. --side shifts the hero sideways so the subject sits off
   to one side of the frame instead of directly behind the HUD, which is where a tall glowing
   object lands every single time.

   WHAT THIS DOES NOT DO, measured rather than assumed, so the next run does not spend renders
   rediscovering it: it will not give you a tight close-up. The eye rides 118+180*sin(pitch) above
   the hero and looks down a fixed angle, so under about 200 units a ground-level subject falls
   out of the bottom of the frame - at --dist 95 the ray is 26 degrees down where it needs 56, and
   the picture comes back as bare ground. Two ways out were tried and both are worse: solving the
   pitch to centre it swings the camera to near top-down (it centres a chest as a grey sliver seen
   from above), and solving the hero's height so the subject lands on the view ray buries the
   camera inside the terrain the subject is standing on. So --dist 200-400 with --side to keep the
   subject clear of the HUD is the working range, and a genuine close-up still means spawning the
   thing near the camera by hand. */
const FOCUS = arg('focus', null);
const FOCUS_DIST = parseFloat(arg('dist', '210'));
const FOCUS_SIDE = parseFloat(arg('side', '0'));
const FOCUS_YAW = parseFloat(arg('yaw', String(Math.PI)));

const FOCUS_PITCH = parseFloat(arg('pitch', '0.16'));
const focusJs = (spec) => `(async function(){
  var G = __BF3.G; if(!G) return 'no G';
  var t = ${/^-?[\d.]+\s*,/.test(spec) ? '(function(){var a=' + JSON.stringify(spec)
    + '.split(",").map(Number); return {x:a[0], y:a.length>2?a[1]:0, z:a.length>2?a[2]:a[1]};})()'
    : '(' + spec + ')'};
  if(!t || t.x == null) return 'focus target has no .x';
  var yaw = ${FOCUS_YAW}, pit = ${FOCUS_PITCH}, D = ${FOCUS_DIST}, side = ${FOCUS_SIDE};
  var fx = Math.sin(yaw), fz = Math.cos(yaw);
  var pc = Math.max(-0.5, Math.min(0.9, pit));            // render() clamps pitch; match it exactly
  /* The camera sits hd behind the hero, so the hero stands (D - hd) in front of the subject and
     the EYE ends up exactly D from it. A subject nearer than the camera's own setback means
     standing the hero past it, which is why this is signed arithmetic and not a clamp. */
  var hd = 180 * Math.cos(pc);
  var back = D - hd;
  var px = -fz, pz = fx;                                  // hero's left/right, in world XZ
  var wantX = t.x - fx * back + px * side, wantZ = t.z - fz * back + pz * side;
  G.p.x = wantX;
  G.p.z = wantZ;
  var heroY = (t.y != null) ? t.y : (G.p.y || 0);         // stand on the subject's own level
  G.p.y = heroY;
  G.camYaw = yaw; G.camPitch = pit;
  /* Re-asserting the HEIGHT, not just the camera, and this is not belt-and-braces. There is
     usually no floor under the spot the hero is teleported to - a subject on a raised mesa (the
     Outskirts waystone sits at y=165) or a lifted hero both hang in mid-air - so gravity drops
     them. Measured: 165 to 55 in under two seconds, and since the camera rides the hero's y the
     whole frame sinks below the subject. Velocity is zeroed too or the fall resumes at speed. */
  var snap = function(){
    G.p.y = heroY; G.p.vy = 0; G.p.onGround = true;
    G.cam.x = G.p.x; G.cam.z = G.p.z; G.cam.y = G.p.y || 0;
    G.camYaw = yaw; G.camPitch = pit;
  };
  snap();
  await new Promise(function(r){ setTimeout(r, 1400); });
  snap();                                      // ...it has been falling and lerping the whole time
  await new Promise(function(r){ setTimeout(r, 250); });
  snap();
  /* Did the teleport actually STICK? It often does not, and until 2026-08-02 the failure was
     silent: the harness printed a target, a hero and an eye and looked like it had worked.
     Teleporting into a spot with no floor under it trips the game's own fell-out-of-the-world
     rescue, which puts the hero back at G.lastSafe - the level's START - so the frame is a
     perfectly good photograph of the entrance while the log says it is pointing at your subject.
     Measured: --focus "{x:0,y:0,z:-900}" in the Ruined Keep reported hero z 290, the start, with
     the target 1200 units away, and nothing said so.
     Reported, never corrected - a target with no floor is the caller's to fix by giving --focus
     the subject's real y, and quietly moving the camera would be the same lie in a new place. */
  var driftX = G.p.x - wantX, driftZ = G.p.z - wantZ;
  var drift = Math.round(Math.sqrt(driftX * driftX + driftZ * driftZ));
  return { lost: drift > 60 ? 'HERO DID NOT STAY PUT - it is ' + drift + ' units from where '
                 + '--focus placed it, so this shot is NOT aimed at your target. Almost always a '
                 + 'target with no floor under it: the game rescued the hero to the level start. '
                 + 'Pass the subject real y.' : undefined,
           drift: drift,
           at:{x:+t.x.toFixed(0), y:+(t.y||0).toFixed(0), z:+t.z.toFixed(0)},
           hero:{x:+G.p.x.toFixed(0), y:+(G.p.y||0).toFixed(0), z:+G.p.z.toFixed(0)},
           eye:G.eye && {x:+G.eye.x.toFixed(0), y:+G.eye.y.toFixed(0), z:+G.eye.z.toFixed(0)} };
})()`;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('No Chrome/Edge binary found.'); process.exit(1); }

/* ── static server (public/) ─────────────────────────────────────────────── */
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.css': 'text/css', '.wasm': 'application/wasm', '.ktx2': 'image/ktx2',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};
const missed = [];
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(WEBROOT, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  if (!file.startsWith(WEBROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    missed.push(rel);
    res.writeHead(404); res.end('nope'); return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(file).pipe(res);
});

/* ── minimal CDP client over the built-in WebSocket ──────────────────────── */
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = []; }
  static async attach(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('ws fail')); });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { ok, no } = c.pending.get(msg.id); c.pending.delete(msg.id);
        msg.error ? no(new Error(msg.error.message)) : ok(msg.result);
      } else if (msg.method) c.handlers.forEach(h => h(msg));
    };
    return c;
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((ok, no) => {
      this.pending.set(id, { ok, no });
      /* Generous: this drives Chrome on SwiftShader, so a captureScreenshot of a busy WebGL frame
         can genuinely take over a minute on a loaded machine. A timeout here is a false alarm. */
      setTimeout(() => { if (this.pending.delete(id)) no(new Error('CDP timeout: ' + method)); }, 180000);
    });
  }
  on(fn) { this.handlers.push(fn); }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const httpPort = server.address().port;
  const url = 'http://127.0.0.1:' + httpPort + URLPATH;

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bf-shot-'));
  const dbgPort = 9200 + Math.floor(httpPort % 300);
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=' + dbgPort,
    '--user-data-dir=' + profile,
    '--window-size=' + W + ',' + H,
    '--hide-scrollbars', '--mute-audio',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--allow-file-access-from-files', '--disable-dev-shm-usage',
    'about:blank',
  ], { stdio: 'ignore' });

  // Wait for the debugging endpoint.
  let wsUrl = null;
  for (let i = 0; i < 100 && !wsUrl; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + dbgPort + '/json/version');
      wsUrl = (await r.json()).webSocketDebuggerUrl;
    } catch (e) { await sleep(200); }
  }
  if (!wsUrl) { chrome.kill(); server.close(); console.error('Chrome never opened its debug port.'); process.exit(1); }

  const cdp = await CDP.attach(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  const logs = [];
  cdp.on(msg => {
    if (msg.method === 'Runtime.consoleAPICalled') {
      const t = msg.params.type;
      const text = msg.params.args.map(a => a.value !== undefined ? a.value : (a.description || a.type)).join(' ');
      logs.push({ t, text });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push({ t: 'exception', text: (d.exception && d.exception.description) || d.text });
    }
  });

  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 1, mobile: false }, sessionId);

  console.log('→ ' + url);
  await cdp.send('Page.navigate', { url }, sessionId);
  await sleep(WAIT);

  const evaluate = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr, returnByValue: true, awaitPromise: true, allowUnsafeEvalBlockedByCSP: true,
    }, sessionId);
    if (r.exceptionDetails) return { error: (r.exceptionDetails.exception || {}).description || r.exceptionDetails.text };
    return { value: r.result.value };
  };

  if (PRE) {
    const r = await evaluate(PRE);
    console.log('PRE  → ' + JSON.stringify(r));
    await sleep(PREWAIT);
  }
  /* Hold the shutter until the page says it is ready. A fixed --prewait cannot do this job:
     too short and you photograph the voxel fallback, which looks like a finished picture and
     reads as a regression. Loud either way — a silent timeout here would be the same trap. */
  if (READY) {
    const t0 = Date.now();
    let ok = false, last = null;
    while (Date.now() - t0 < READYMAX) {
      const r = await evaluate(READY);
      last = r;
      if (r.value) { ok = true; break; }
      await sleep(500);
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (ok) console.log('ready ✓ after ' + secs + 's  (' + READY + ')');
    else console.log('READY NEVER CAME after ' + secs + 's — the shot below is NOT the state you '
      + 'asked for, do not read it as a regression. last=' + JSON.stringify(last) + '  expr=' + READY);
    /* Say WHERE it landed, in the level's own words. Two ready-expression bugs in two days both
       looked identical from the log — "ready ✓" and a plausible picture of somewhere else — and
       both would have been obvious the moment the run printed the name of the place. Costs one
       round-trip and needs no argument from the caller. */
    const where = await evaluate('(function(){ var G=window.__BF3&&__BF3.G; if(!G) return null;'
      /* The sparring room has no areaName, so it printed "? [hub]" — indistinguishable in the log
         from the Waystation, which is the one thing this line exists to prevent. */
      /* Same problem again for the four activities: none of them sets areaName, so all four printed
         "?" and three of them carry a zone index borrowed from somewhere else (the Arena is zone 0,
         The Outskirts'). Name them off their own flags, and let the Arena say WHICH MAP — the three
         maps are three different levels and the whole point of photographing them is telling them
         apart. */
      + ' var act = G.arena ? ("The Arena" + (window.__BF3.ARENA_LOADOUT ? " · " + __BF3.ARENA_LOADOUT.map : ""))'
      + '   : G.endless ? ("Abyssal Descent · floor " + G.floor)'
      + '   : G.bossRush ? ("The Gauntlet · " + (G.brTier||"normal") + " #" + G.brIdx)'
      + '   : G.sprintFun ? "Treasure Sprint" : null;'
      + ' return (act||G.areaName||(G.sparringRoom?"Sparring Room":"?"))'
      + ' + (act?" [ACTIVITY]":G.sparringRoom?" [SPAR]":G.hub?" [hub]":G.trial?" [TRIAL]":G.side?" [side]":"")'
      + ' + "  zone " + G.zone + " stage " + G.stageIndex; })()');
    if (where.value) console.log('at   → ' + where.value);
  }
  /* After READY, not before: the target usually does not exist until the level is built, and the
     camera has nothing to lerp toward until the hero is in the world. Before EVAL, so a probe can
     report on what is actually in shot. */
  if (FOCUS) {
    const r = await evaluate(focusJs(FOCUS));
    console.log('FOCUS → ' + JSON.stringify(r.value !== undefined ? r.value : r));
    if (r.error || typeof r.value === 'string') {
      console.log('  ^ the camera was NOT moved — the frame below is wherever the game left it.');
    } else if (r.value && r.value.lost) {
      console.log('  ^ FOCUS LOST: ' + r.value.lost);
    }
  }
  if (EVAL) {
    const r = await evaluate(EVAL);
    console.log('EVAL → ' + JSON.stringify(r, null, 2));
  }

  /* LET THE GAME DRAW A FRAME BEFORE THE SHUTTER. Without this, an --eval that CHANGES the world
     is not in the picture, and it fails silently: you get a complete, plausible photograph of the
     frame before your change.
     Measured 2026-08-02 (worker B) while trying to answer whether dungeon walls are painted out by
     the 3D ground. The standard technique for that question — push an object in front of the hero
     in --eval and photograph it — reported the object present in G and absent from the image, which
     reads exactly like "the 3D layer paints it out". It was the harness. A known-good CONTROL (a
     chest, which certainly renders) vanished from the same frame, which is the only reason the
     wrong conclusion did not get shipped: put a control in any probe like this.
     Why --focus never hit it: FOCUS is followed by the EVAL round-trip, so a frame lands in the gap
     by luck. EVAL had nothing after it and captureScreenshot returns the last composited frame.
     Two rAF ticks, not one: the game renders on rAF, so the first tick only guarantees the callback
     ran — the second guarantees the frame it drew has been composited. Falls back to a plain sleep
     if rAF never fires (a backgrounded tab throttles it), so a hung page still hands back a shot. */
  await evaluate('new Promise(function(r){var t=setTimeout(r,400);'
    + 'requestAnimationFrame(function(){requestAnimationFrame(function(){clearTimeout(t);r();});});})');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log('shot → ' + OUT + '  (' + fs.statSync(OUT).size + ' bytes)');

  /* Deduped: a missing kit texture throws once per MODEL that references it, so one absent file
     produces 136 identical lines and buries everything else. Count them instead. */
  const bad = logs.filter(l => l.t === 'error' || l.t === 'exception');
  if (bad.length) {
    const byText = new Map();
    for (const l of bad) { const k = l.t + ': ' + l.text.split('\n')[0]; byText.set(k, (byText.get(k) || 0) + 1); }
    console.log('\n-- page errors (' + bad.length + ' total, ' + byText.size + ' distinct) --');
    [...byText].sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([k, n]) => console.log('  x' + n + '  ' + k));
  } else console.log('no page errors');
  const notes = logs.filter(l => l.t !== 'error' && l.t !== 'exception');
  if (notes.length) { console.log('-- console (' + notes.length + ') --'); notes.slice(0, 20).forEach(l => console.log('  ' + l.t + ': ' + l.text.slice(0, 200))); }
  if (missed.length) { console.log('-- 404s (' + missed.length + ') --'); [...new Set(missed)].slice(0, 25).forEach(m => console.log('  ' + m)); }

  try { await cdp.send('Browser.close'); } catch (e) {}
  chrome.kill();
  server.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
