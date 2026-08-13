/* What a skill's own description PROMISES the player.

   Oliver, after a PvP match: "there was a bunch of skills that didn't do what they said. Some of
   them said they would do damage and then didn't, or some of them said they would heal you and
   then didn't." This is the half that reads the promise; test-skills.js is the half that checks
   the game keeps it.

   BUFF IS CHECKED BEFORE DAMAGE ON PURPOSE. "+35% damage and attack speed for 6s" contains the
   word damage but promises a stat change, not a hit. Getting that order wrong reports every buff
   in the game as a broken damage skill - a flood of false failures, and the fastest way to make
   the whole harness something people learn to ignore. A buff only ALSO claims damage when it says
   it deals some. */
const RULES = [
  /* A BUFF DOES NOT HAVE TO CARRY A NUMBER. This rule used to require one - `+35%` or `for 6s` -
     and the game mostly does not write them that way: the Ninja's Blade Fury and the Berserker's
     Berserk both say "+damage and attack speed for a few seconds", and the Monk's Stillness says
     "more damage and speed". No digit anywhere. All three were therefore read as DAMAGE skills,
     measured against a dummy that a stat buff has no reason to hurt, and reported as three broken
     kits. The signed word and the bare comparative are as much a buff promise as the percentage. */
  ['buff',    /[+-]\s*\d+\s*%|\bfor \d+(\.\d+)?\s*s\b|\bincreas|\bboost|\bempower|[+-]\s*(damage|attack|speed|armou?r|defen[cs]e|crit)\b|\bmore\s+(damage|speed|attack)\b|\bfor a few seconds\b/i],
  /* `heal(s|ing|ed)` with a CLOSING boundary, never a bare `\bheal` prefix. "\bheal" also matches
     the first four letters of HEALTH, so the Warlock's Shadow Bolt - "a fast void bolt powered by
     a sliver of your health" - was read as a healing skill. It spends health; it was then failed
     for not restoring any. A skill was accused of the exact opposite of what it does. */
  ['heal',    /\bheal(s|ing|ed)?\b|\brestor|\blifesteal|\bregen/i],
  ['shield',  /\bshield|\babsorb|\bbarrier|\bward\b/i],
  ['control', /\bstun|\bslow|\broot\b|\bknockback|\bfear\b|\bfreez|\bimmobil|\bsilenc/i],
  /* `risen` and `corpse`, not just `raise`: the Necromancer's own text is "Turn a fresh corpse
     into a stronger risen fighter", which contains neither summon nor raise.
     `companion` IS NOT HERE, and that is deliberate. Every one of the Beastmaster's eighteen
     companion lines was checked in the game: they command, buff, restore or unleash a pet that is
     ALREADY out - "Command your companion to lunge", "Unleash your companion at peak strength" -
     and not one of them summons anything. The keyword could only ever produce false failures, and
     it produced four. A Beastmaster skill that does summon still says so; `\bsummon` catches it. */
  ['summon',  /\bsummon|\brais(e|ing)|\brisen\b|\bcorpse|\bminion|\bskeleton/i],
  /* `damag`, not `damage`: the Warrior's Charge says "damaging and stunning", and \bdamage cannot
     match "damaging" - there is no `e` in it. That one letter silently exempted every skill whose
     text uses the participle, which is a large slice of the melee kits. */
  ['damage',  /\bdamag|\bstrike|\bslash|\bhit\b|\bblast|\bburn|\bexplo|\bbolt\b/i],
];

/* A buff that also lands a hit says so with an active verb. Without this, "2.2x damage in a wide
   arc" and "+35% damage for 6s" are indistinguishable to a keyword match. */
const DEALS = /\bdeal|\bdamaging\b|\bstrike|\bslash|\bblast|x\s*damage|\bdamage\s*(\+|in|to|around|all)/i;

/* Damage the skill SOAKS is not damage it DEALS. The Necromancer's Bone Wall is "Raise a shield of
   bone that absorbs damage" - it works perfectly, and the first version of this parser failed it
   for not hurting anything. A defensive sense with no active verb means no damage claim.

   `reduc`, NOT `reduce` - the same one-letter miss as `\bdamag` above, and it produced a real false
   accusation the day the bench started casting the B side of every choice (2026-08-12). The
   Berserker's Bloodguard is "Raise a guard: heavy damage reduction and pull foes in": `\breduce`
   cannot match "reduction", nothing else in DEFENSIVE matches either, the buff rule needs a number
   or a signed word and this card has neither - so the parser read "damage" and the bench failed a
   pure defensive skill for not hurting the dummy. Measured: guard 0 -> 3.18, i.e. the one thing the
   card promises had plainly landed.
   It cannot suppress a real claim: the exemption is only reachable when DEALS is false, so any card
   that says deal / strike / slash / blast / Nx damage keeps its damage claim whatever else it says.
   Checked against the game rather than argued - thirteen card texts in index.html contain "reduc"
   and this is the only one the buff rule does not already take. */
const DEFENSIVE = /\babsorb|\bresist|\breduc|\bincoming|\btaken?\b|\bmitigat|\bblock/i;

/* "Raise a shield" is not a summon. Only the raising of THINGS THAT FIGHT is.
   THE ADJECTIVE SLOT IS THE WHOLE POINT. This read `raise (a|an|the)? (shield|…)` with the noun
   immediately after the article, so it caught the Necromancer's "Raise a shield of bone" and missed
   the Paladin's "Raise a HOLY shield that absorbs damage" - one adjective - which was then reported
   as a summon that summoned nothing. */
const RAISED_OBJECT = /\brais(e|ing)\s+(?:\w+\s+){0,3}?(shield|wall|barrier|ward|guard)\b/i;

/* Damage that is PROMISED TO SOMEONE ELSE, or promised for later.
   The Pirate's Cannonade is "Mark foes to explode on death" and the Warlock's Curse Circle is
   "Mark nearby foes so your spells hit them harder". Neither deals damage when you cast it: one
   waits for the target to die, the other makes a DIFFERENT source hit harder. The bench casts once
   at a dummy with 100000 HP that never dies and never gets hit by anything else, so it cannot
   observe either promise - and it reported both as skills that deal no damage.
   VISION.md: "Missing data is not a negative finding. Report 'inconclusive', never invent a
   failure." So these are routed to UNPROVEN by test-skills.js rather than accused, exactly as the
   level walker's unfinished routes are. */
const INDIRECT = /\bmark(s|ed|ing)?\b|\bon death\b|\byour spells\b/i;
export function isIndirectDamage(d){ return INDIRECT.test(String(d || '')); }

/* A stat line is not an act. "+35% damage/healing" promises a bigger heal LATER, from whatever
   heals you; it does not heal you now. Same shape as the damage gate above, and needed for the
   same reason - "healing" as a noun in a buff would otherwise be measured as a heal that must
   raise your HP this second. The active forms (heal/heals/restore/regenerate) still count. */
const HEALS_ACTIVELY = /\bheals?\b|\bhealed\b|\brestor|\blifesteal|\bregenerat/i;

export function claimsOf(d){
  const s = String(d || '');
  const isBuff = RULES[0][1].test(s);
  const deals = DEALS.test(s);
  const out = [];
  for(const [name, re] of RULES){
    if(name === 'damage' && !deals && (isBuff || DEFENSIVE.test(s))) continue;
    if(name === 'heal' && isBuff && !HEALS_ACTIVELY.test(s)) continue;
    if(name === 'summon' && RAISED_OBJECT.test(s) && !/\bsummon|\bminion|\bskeleton|\bcorpse/i.test(s)) continue;
    if(re.test(s)) out.push(name);
  }
  return out;
}
