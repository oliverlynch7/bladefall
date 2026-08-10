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
  /* THE GAME MOSTLY DOES NOT WRITE NUMBERS, and the first version of this rule only recognised the
     ones that do. "+35% damage ... for 6s" was caught; "+damage and attack speed for a few
     seconds" - the ACTUAL text of both the Ninja's Blade Fury and the Berserker's Berserk - was
     not, so two working buffs were reported as damage skills that deal none. `[+-]` is followed by
     a named stat rather than by any word, because "damage + heavy knockback all around" is a real
     damage skill and `[+-]\s*\w+` would silently reclassify it. */
  ['buff',    /[+-]\s*(damage|attack speed|speed|armou?r|defen[cs]e|health|hp|crit|dodge)|[+-]\s*\d+\s*%|\bfor (a few|several|\d+(\.\d+)?)\s*(s\b|seconds?)|\bmore (damage|speed|attack)|\bharder\b|\bincreas|\bboost|\bempower/i],
  /* `heals`, not `heal`: `\bheal` matches the first four letters of "health", so the Warlock's
     Shadow Bolt - "powered by a sliver of your health", a skill that SPENDS health - was recorded
     as promising to restore it and then failed for not doing so. */
  ['heal',    /\bheal(s|ed|ing)?\b|\brestore|\blifesteal|\bregen/i],
  ['shield',  /\bshield|\babsorb|\bbarrier|\bward\b/i],
  ['control', /\bstun|\bslow|\broot\b|\bknockback|\bfear\b|\bfreez|\bimmobil|\bsilenc/i],
  /* `risen` and `corpse`, not just `raise`: the Necromancer's own text is "Turn a fresh corpse
     into a stronger risen fighter", which contains neither summon nor raise.
     `companion` is NOT here, and used to be. It is a noun naming a pet the Beastmaster already
     owns, so all four of that class's skills - which command it, and measurably work - were
     reported as summoning nothing. A summon needs a summoning VERB. */
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
   for not hurting anything. A defensive sense with no active verb means no damage claim. */
const DEFENSIVE = /\babsorb|\bresist|\breduce|\bincoming|\btaken?\b|\bmitigat|\bblock/i;

/* "Raise a shield" is not a summon. Only the raising of THINGS THAT FIGHT is.
   Up to two words may stand between the article and the noun: the Paladin's Guard Up is "Raise a
   holy shield that absorbs damage", and one adjective was enough to make this miss and accuse a
   skill that had just shielded for 239. */
const RAISED_OBJECT = /\brais(e|ing)\s+(a\s+|an\s+|the\s+)?(\w+\s+){0,2}(shield|wall|barrier|ward|guard)/i;

/* WHETHER THIS BENCH COULD EVER SEE THE EFFECT - a different question from what is promised.
   test-skills gives its dummy 100000 HP so that nothing dies mid-measurement, which is right, and
   which means a payload that fires when the target DIES is invisible to it by construction. The
   Pirate's Cannonade - "Mark foes to explode on death" - is not a broken skill, it is a skill this
   rig is not equipped to watch. VISION.md: missing data is not a negative finding. Returns the
   reason, so the report can say why rather than just shrug. */
const CONDITIONS = [
  [/\bon death\b|\bwhen (they|it|the target) (dies?|falls?)|\bon kill\b|\bafter .{0,20}\bdies\b/i,
   'the payload fires when the target dies, and the bench keeps its dummy alive on purpose'],
];

export function conditionOf(d){
  const s = String(d || '');
  for(const [re, why] of CONDITIONS) if(re.test(s)) return why;
  return null;
}

export function claimsOf(d){
  const s = String(d || '');
  const isBuff = RULES[0][1].test(s);
  const deals = DEALS.test(s);
  const out = [];
  for(const [name, re] of RULES){
    if(name === 'damage' && !deals && (isBuff || DEFENSIVE.test(s))) continue;
    if(name === 'summon' && RAISED_OBJECT.test(s) && !/\bsummon|\bminion|\bskeleton|\bcorpse/i.test(s)) continue;
    if(re.test(s)) out.push(name);
  }
  return out;
}
