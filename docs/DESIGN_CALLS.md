# Design calls Oliver has made — 2026-08-13

These were blocked on him and are now answered. Each was blocked for the same reason: the card and
the code disagree, and **which one is wrong is a design question, not a bug**. The repo's standing
rule is "never fix a skill by editing its description to match broken behaviour", so guessing would
have silently retired a skill he still wanted.

All four are the entire contents of `harness/baseline.json` as of this date. Doing them empties it.

## 1. mage/Attunement — THE CARD IS RIGHT. Make it a storm.

| | |
|---|---|
| card | *"A 4s storm repeatedly damages enemies around you."* |
| code | `SKILL_FX.m_tempest` (index.html:18708) is a pure buff — your element changes on every cast for 10s. No damage at all. |
| **call** | **Implement the storm.** The card describes the skill he wants. |

Note for whoever builds it: the element-cycling behaviour currently there is real and works. Check
whether it is reachable from anywhere else before deleting it — if nothing else grants it, it is
being removed from the game by this change, and that is worth saying out loud in the commit.

## 2, 3, 4. The three skills that promise a hit and do not land one — MAKE THEM DEAL IT

| skill | card | measured |
|---|---|---|
| `ranger/Tumble` | *"Roll back ~5m with brief i-frames + a 0.75x parting shot. A dodged hit keeps Clear Aim."* | rolls 197 units **away**, deals 0 at every bench distance |
| `monk/Roll` | *"Roll aside with brief i-frames and a parting strike."* | deals 0 |
| `berserker/Charge` | *"Rush forward, damaging and stunning in your path."* | travels **684 units**, deals 0 |

**Call: all three deal their hit.**

The mechanism is not in question and nothing needs inventing. `warrior/Charge` — *"Rush through
enemies for 1.6x damage and stun them"* — travels ~315 units and deals **77 at every distance
tested**. So a charge that damages along its path already exists and works; three kits simply never
got wired to it. Copy the working pattern rather than authoring a new one.

**This is a real balance change and he took it knowingly:** ranger, monk and berserker gain damage
they do not have today. Land each as its own commit so any one can be reverted after he plays it.

`berserker/Charge` travelling 684 against `warrior/Charge`'s 315 is worth a second look while in
there — more than double the distance for zero damage suggests the berserker version was built as a
pure gap-closer at some point. That is context, not a reason to hesitate; the call is made.

## How to verify these

`node harness/test-skills.js --classes mage` (and `ranger`, `monk`, `berserker`).

Each of the four is currently a hard FAIL in that suite and each appears in `harness/baseline.json`.
A fix is proven when its class goes from FAIL to pass **and** `node harness/run-all.js` prints
`FIXED: skills:<class>/<skill>:damage` and shrinks the baseline. Watch the failure before the fix and
the pass after; do not trust one direction alone.

When all four are done, `baseline.json` should be empty of `skills:` entries for the first time.
