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
  ['buff',    /[+-]\s*\d+\s*%|\bfor \d+(\.\d+)?\s*s\b|\bincreas|\bboost|\bempower/i],
  ['heal',    /\bheal|\brestore|\blifesteal|\bregen/i],
  ['shield',  /\bshield|\babsorb|\bbarrier|\bward\b/i],
  ['control', /\bstun|\bslow|\broot\b|\bknockback|\bfear\b|\bfreez|\bimmobil|\bsilenc/i],
  /* `risen` and `corpse`, not just `raise`: the Necromancer's own text is "Turn a fresh corpse
     into a stronger risen fighter", which contains neither summon nor raise. */
  ['summon',  /\bsummon|\brais(e|ing)|\brisen\b|\bcorpse|\bminion|\bskeleton|\bcompanion\b/i],
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

/* "Raise a shield" is not a summon. Only the raising of THINGS THAT FIGHT is. */
const RAISED_OBJECT = /\brais(e|ing)\s+(a\s+|an\s+|the\s+)?(shield|wall|barrier|ward|guard)/i;

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
