# BLADEFALL — Vision & Operating Contract

Read this FIRST in any autonomous session, before touching code.
Written 2026-07-31 from Oliver's own words. Where this conflicts with a guess, this wins.

## What Bladefall is

A **social action-RPG**, browser-based, phone-first. Multiplayer is not a feature bolted on;
it is the point. Co-op and PvP have to be fun on their own merits.

Two reference points Oliver named, both load-bearing:

- **League of Legends** — for CLASS IDENTITY. The goal is not 16 classes that work, it is 16
  classes that feel genuinely different to play. Distinct kits, distinct playstyles, distinct
  reasons to main one. A class that is a stat-reskin of another has failed.
- **AdventureQuest Worlds** — for SHAPE. Browser, hub-centred, social, RPG-coded. The hub is
  where the game happens socially, not a menu you pass through.

Long term he wants it MMO-ish, with a much richer hub world and hub system.

## Priorities, in order

1. Multiplayer that is actually fun — co-op and PvP both
2. Class distinctiveness — every class uniquely fun
3. Bigger zones, more intricate bosses, more intricate combat (breadth AND depth)
4. A hub worth spending time in

## The money constraint, and what it rules out

Oliver: "i dont want to spend money on this gaem to be honest."

A TRUE MMORPG needs always-on authoritative servers: monthly cost plus ops. Current
multiplayer is peer-to-peer WebRTC, host-authoritative — free, fine for small groups, and
fundamentally unable to do a persistent world with many strangers (no server authority, no
persistence, no anti-cheat, degrades past a handful of peers).

**Target the middle path: instanced hubs.** Many players sharing a rich Waystation, with runs
as private instances. That delivers most of the AQW feeling on the current architecture. True
persistence is a much later decision that costs real money — do not drift toward it silently.

## What "showing people" requires

He has shown it to a few people and wants to show more, but says the graphics need fixing
first. Working bar: hub and Outskirts fully converted (characters, ground, buildings, mobs),
3D on by default rather than behind a URL flag, holding 60fps on his phone.

## Autonomy — decide alone vs ask

**Ship without asking:** bug fixes, visual conversion, performance, asset integration,
tooling, refactors, anything reversible. Commit and deploy these.

**Ask first:** balance numbers, class identity changes, story/lore, anything touching existing
saves, anything that costs money, anything irreversible.

## Verification — what I can and cannot check myself

CAN self-verify, and must, every time:
- syntax gate before any commit (both the classic script blocks and the ES modules)
- renders correctly — screenshot it via _shot/ and LOOK at the image, do not assume
- performance — public/stress/ measures real device capability
- class balance — _balance/ and _duel/ harnesses give win-matrices and DPS profiles

CANNOT self-verify — queue these for Oliver instead of guessing:
- whether something is FUN
- whether it feels like Bladefall tonally
- art direction calls

## Hard-won rules (violating these has cost real sessions)

- Verify a change LANDED before believing it. Two repaint functions with identical bodies meant
  three "fixes" went into the one class skins never call.
- Reading source is not proof. Render it, probe it, measure it. Every significant bug this
  session was found by measuring, not reading.
- Missing data is not a negative finding. Report "inconclusive", never invent a failure.
- Never claim something is live before polling the deployed URL for a marker string.
- Never re-measure a frame/placement that tuned values depend on without converting them in
  the same commit.
