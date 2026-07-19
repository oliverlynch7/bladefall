# BLADEFALL — Treasure Sprint Parkour Overhaul, Second Pass

**Reason for revision:** The first vertical sprint update technically added a fixed dash gauntlet, one spiral tower, and one drop. Its coordinates vary, but its sequence and obstacle grammar remain effectively identical every run. Oliver wants substantially more verticality, more interesting parkour, and much less copy/paste repetition.

## Locked outcome

Replace the fixed three-section course with a solvable-by-construction modular parkour director. Every sprint should assemble a visibly different route from authored obstacle families, with major elevation changes and varied movement rhythm. Random offsets alone do not count as variety.

## Authored segment library

Implement at least ten genuinely different segment families, then select and order 5–7 per sprint. Include:

1. Spiral tower ascent with alternating outside/inside landings.
2. Switchback wall climb with short lateral precision jumps.
3. Moving-elevator transfer between platforms at different heights.
4. Crumbling staircase chase that fails behind the player.
5. Spring-pad launch chain with clearly readable landing silhouettes.
6. High-to-low cascading descent with controlled drop landings.
7. Zigzag beam-and-pillar crossing with wide recovery shelves below.
8. Phasing-platform sequence using strong on/off visual and audio tells.
9. Forked route: safer longer climb versus faster difficult dash line, rejoining afterward.
10. Vertical shaft traversal using staggered ledges and one moving platform.
11. Broken arch/ring traversal requiring direction changes in midair.
12. Final treasure tower with two possible approach patterns, not a flat chest pad.

Use existing obstacle primitives where suitable, but author distinct silhouettes, elevation profiles, timing patterns, and movement asks. Add small reusable primitives only when needed; do not duplicate large blocks of nearly identical generation code.

## Generation and repetition rules

- Shuffle section order subject to connection/elevation constraints; do not always begin flat, climb a spiral, then drop.
- Do not repeat a segment family within one sprint.
- Track a small recent-family history for the current run and strongly avoid producing the same opening, finale, or majority combination on consecutive visits.
- Randomize clockwise/counterclockwise, ascent/descent variants, branch placement, mover phase/speed within safe bands, and visual theme accents.
- Courses must use at least three distinct elevation bands and reach a peak height materially above the current four-step spiral. Include meaningful descents and lateral crossings so verticality is spatial, not merely a staircase.
- Use broad authored landmarks and sightlines so the player can read the next two or three goals from each checkpoint.

## Fairness

- Completion must remain possible with base movement, one normal jump, and the normal dodge. Never require Magic Socks, speed gear, a class skill, or a skin passive.
- Optional Magic Socks lines may offer time bonuses or small bonus pickups but cannot be the only completion route.
- Derive all connector distances from actual jump/dash physics with safety margin. Dynamic timing windows must allow a first-time player to observe one cycle without automatically losing the attempt.
- Place recovery shelves beneath the hardest precision sections where appropriate. Falling should return to the most recent checkpoint quickly and consistently.
- Camera framing and occlusion must be tested on ascents, descents, vertical shafts, and moving platforms in both camera modes.

## Timer and rewards

- Compute the timer from the selected segment traversal budgets plus observation allowance for dynamic obstacles—not raw Euclidean path length alone.
- Grade completion time into readable reward bands if this can reuse the current reward system safely; never reduce the current baseline completion reward.
- The chest must remain unmistakable and stop the clock immediately.

## Visual identity

- Give sprint platforms a cohesive treasure-vault identity with gold route accents, readable edge trim, depth fog/void below, and distinct telegraphs for crumble, phase, mover, spring, and checkpoint states.
- Avoid identical square slabs wherever a beam, broken arch, pillar, stair, ledge, suspended cage, or vault fragment communicates the same collision cleanly.

## Required QA

- Generate and visually inspect at least 20 deterministic seeds. Record segment order, peak elevation, completion budget, and recent-history rejection behavior.
- Confirm no two consecutive samples share the same opener/finale pair or more than half their segment families in the same order.
- Complete representative easy, median, and hardest generated courses in a real muted browser using base stats and no Magic Socks.
- Test fall recovery from every segment family, moving-platform carry, crumble reset, phasing timing, branch rejoin, chest completion, timeout, return portal, reload, and repeated visits.
- Verify no impossible connectors, blind jumps, camera-blocked landings, floating decorative collision, softlocks, or timer continuing after success.

