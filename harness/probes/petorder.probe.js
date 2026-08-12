/* DOES THE BEASTMASTER'S COMPANION ACTUALLY TAKE THE ORDER?

   `useSkill` (index.html:10544) opens with the class's whole stated identity, in its own words:

     "THE BEASTMASTER'S COMPANION TAKES YOUR SKILL INPUTS. Press a skill and the pet commits too -
      it lunges at whatever you are aiming at and its own attack comes off cooldown at once. You are
      playing two characters, which is the class: every skill is also an order."

   It then does four things and announces a fifth to the player's face:

     G.pet.orderX = tgt.x;  G.pet.orderZ = tgt.z;  G.pet.orderT = 3.5;
     G.pet.atkCd  = 0;
     addText(G.pet.x, ..., 'SIC EM', '#7ec46a');

   A static sweep for fields written and never read (harness/audit-fields.js) says NOTHING in the
   file reads orderX, orderZ or orderT. And `atkCd` is the wrong field: the pet's attack timer is
   `pet.atkT`, decremented in petUpdate at 11672 - `atkCd` belongs to the player (9653) and to PvP
   bots (12708), which is why a receiver-agnostic reader count cannot see that one is dead.

   petUpdate picks its target at 11651-11658 by proximity TO THE PET, leashed to foes within 460 of
   the hero. It has no notion of what you are aiming at. So the order is not obeyed, the attack does
   not come off cooldown, and the game floats SIC EM over a companion that carries on chewing
   whatever was already closest. This is section H/I's shape on a CLASS IDENTITY, which is
   docs/VISION.md priority #2.

   THE BAR IS WHICH FOE THE PET GOES FOR, not whether the fields hold values. This sub-project has
   been burned twice measuring what the code sets instead of what the player is promised (pass 15,
   Burning Light lit exactly the right enemy and burned nothing). So each trial stands TWO foes:

     - `near`  - parked right next to the pet and away from the hero's aim. The shipped selector
                 takes this one, and must keep taking it whenever no order stands.
     - `aimed` - straight down the hero's forward vector, further from the pet than `near` is.
                 The order names this one.

   The pet's melee dart plants it on its target (petAttack, 11688), so "which foe did it go for" is
   readable as a distance and as HP lost, neither of which the pressed skill can fake.

   THE SKILL PRESSED IS SLOT 2, whose rank-6 default is Mend the Pack - a heal that touches no enemy
   and no pet targeting. That matters: Sic 'Em, Coordinated Strike, Pack Step and Stampede all move
   or aim the companion themselves, so pressing one of those would let the SHIPPED game pass this
   bar on the skill's own effect and prove nothing about the order. The cast's name is reported so a
   later run cannot silently drift onto a commanding skill.

   THREE HALVES IN ONE LAUNCH, the third a permanent known-bad carried in the probe rather than
   produced by breaking the repo (the rule level.probe.js's ?breakgap and mp.probe.js's ?heroslot
   follow):
     - `live`  - the game's own hook, its own petUpdate, its own skill press.
     - `live2` - the identical half a second time. Target selection runs every frame against a
                 moving body; a one-shot green could be a lucky frame and this costs nothing.
     - `inert` - identical, except pet.orderT is set straight back to 0 on every tick, which is
                 exactly what the shipped game amounts to. `okAgainstInert` is therefore what this
                 probe would report against the unfixed game and MUST be false while `ok` is true.

   TWO TRIALS PER HALF, and the second is what makes the first mean anything:
     - `order`   - press the skill, then let the game tick. The pet must end up on `aimed`.
     - `noorder` - identical setup, no skill pressed. The pet must end up on `near`, in EVERY half.
                   Without it, a pet that simply walked to whichever foe the bench happened to place
                   second would clear the bar, and the control's verdict would be unfalsifiable. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'beastmaster';
  __BF3.meta.camMode = 'far';                 // world-space aim; camera-relative would spin

  /* Through the game's own classStartWeapon: every basic hook is handed classFamilyOk(p.weapon) and
     a great many gate their defining half on it. The Beastmaster is one of the three classes that
     cannot equip its own starter (triage section D), so a borrowed in-family one is expected. */
  let weaponNote = 'none';
  (function(){
    const tries = ['beastmaster'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){
        p.weapon = w;
        weaponNote = (i === 0) ? 'own starter' : ('in-family starter borrowed from ' + tries[i]);
        return;
      }
    }
  })();

  /* A MELEE ATTACKER COMPANION, because the melee dart is what makes "which foe did it go for"
     readable as a position. A ranged pet shoots from where it stands and the bar would be HP alone. */
  let petNote = 'already out';
  if(!G.pet || G.pet.dead){
    const ids = (__BF3.PETIDS || []).filter(id => {
      const P = (__BF3.PETS || {})[id];
      return P && P.arch === 'attacker' && P.style === 'melee';
    });
    for(const id of ids){
      try { __BF3.spawnPet(id); } catch(e){}
      if(G.pet && !G.pet.dead){ petNote = 'spawned ' + id; break; }
    }
  }
  if(!G.pet) return JSON.stringify({ ok:false, why:'no companion could be put in the field' });
  const PDEF = (__BF3.PETS || {})[G.pet.id] || {};

  /* THE TWO-LIST CHECK, inside the probe rather than in a command nobody re-runs: useSkill(i) casts
     c2CurSkills()[i], which is NOT curSkills()[i] (faf52c3). */
  const casts = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : []).map(s => s && s.n);
  const SLOT = 2;
  const castName = String(casts[SLOT] || '');
  /* Every Beastmaster skill that moves or aims the companion itself. If the slot ever drifts onto
     one of these the measurement is void, because the shipped game would pass on the skill's own
     effect rather than on the order. */
  const commandsPet = /sic|coordinated|pack step|stampede|apex/i.test(castName);

  /* Does aimTarget() survive the call the hook actually makes - no arguments at all? The hook is
     wrapped in try{}catch(err){}, so if this throws then nothing in it runs, not even the SIC EM
     text, and the fault is one gate further back than the dead fields. Measured, not read. */
  let aimNoArgThrew = null, aimNoArgFound = null;
  try {
    const t = __BF3.aimTarget ? __BF3.aimTarget() : undefined;
    aimNoArgFound = t ? (t.type || 'enemy') : null;
  } catch(e){ aimNoArgThrew = String(e && e.message || e); }

  const HOME = { x: p.x, z: p.z };
  const D_AIM = 300;          // the aimed foe, straight down the hero's forward vector
  const OFF_X = 210, OFF_Z = -150;   // the pet and its neighbour, off to one side and behind

  const foeAt = (x, z) => {
    const f = __BF3.spawnEnemy('grunt', x, z);
    if(f){ f.active = true; f.dead = false; f.dummy = false; f.hp = f.maxHp = 100000; f.vx = 0; f.vz = 0; }
    return f;
  };

  const dXZ = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

  const trial = (press, pin) => {
    p.x = HOME.x; p.z = HOME.z; p.y = p.y || 0; p.vx = 0; p.vz = 0; p.yaw = 0;
    p.hp = p.hpm || p.hpMax || p.hp;
    G.enemies.length = 0;

    /* The game's forward vector is (sin yaw, cos yaw), so yaw 0 aims at +z. The slippery probe was
       wrong twice by facing a foe the game puts BEHIND the hero; this is that lesson applied. */
    const aimed = foeAt(HOME.x, HOME.z + D_AIM);
    const near  = foeAt(HOME.x + OFF_X, HOME.z + OFF_Z);
    if(!aimed || !near) return { why: 'targets could not be spawned' };

    const pet = G.pet;
    pet.x = HOME.x + OFF_X; pet.z = HOME.z + OFF_Z; pet.dead = false;
    pet.orderT = 0; pet.orderX = null; pet.orderZ = null;
    pet.atkT = 0.9; pet.atkCd = 0.9;

    const startNear  = dXZ(pet.x, pet.z, near.x, near.z);
    const startAimed = dXZ(pet.x, pet.z, aimed.x, aimed.z);

    let threw = null, order = null, atk = null;
    if(press){
      p.mana = p.manam || p.manaMax || 999;
      if(p.skillCd) p.skillCd[SLOT] = 0;
      try { __BF3.useSkill(SLOT); } catch(e){ threw = String(e && e.message || e); }
      order = { x: pet.orderX == null ? null : Math.round(pet.orderX),
                z: pet.orderZ == null ? null : Math.round(pet.orderZ),
                t: Math.round((pet.orderT || 0) * 100) / 100 };
      atk = { atkT: Math.round((pet.atkT || 0) * 100) / 100,
              atkCd: Math.round((pet.atkCd || 0) * 100) / 100 };
    }

    /* Two seconds of the game's own ticks - the pet engages at 300 u/s and the furthest foe is
       ~370 away, so a pet that means to arrive has time to. Positions are pinned every frame so the
       geometry under test cannot drift; the hero is kept alive for the same reason. */
    for(let k = 0; k < 120; k++){
      aimed.x = HOME.x; aimed.z = HOME.z + D_AIM; aimed.vx = 0; aimed.vz = 0;
      near.x = HOME.x + OFF_X; near.z = HOME.z + OFF_Z; near.vx = 0; near.vz = 0;
      p.x = HOME.x; p.z = HOME.z; p.yaw = 0; p.hp = p.hpm || p.hpMax || p.hp;
      /* THE KNOWN-BAD, and it is the shipped game's behaviour verbatim: with orderT held at 0 no
         order can ever be standing, which is exactly what "nothing reads orderT" amounts to. */
      if(pin) G.pet.orderT = 0;
      try { __BF3.update(1/60); } catch(e){ if(!threw) threw = String(e && e.message || e); }
    }

    const pet2 = G.pet;
    return {
      pressed: !!press,
      castName: press ? castName : null,
      order: order, atk: atk,
      startNear: Math.round(startNear), startAimed: Math.round(startAimed),
      toNear:  Math.round(dXZ(pet2.x, pet2.z, near.x, near.z)),
      toAimed: Math.round(dXZ(pet2.x, pet2.z, aimed.x, aimed.z)),
      nearLost:  Math.round(near.maxHp - near.hp),
      aimedLost: Math.round(aimed.maxHp - aimed.hp),
      threw: threw,
    };
  };

  const half = (pin) => ({ pinned: !!pin, order: trial(true, pin), noorder: trial(false, pin) });

  const live  = half(false);
  const live2 = half(false);
  const inert = half(true);

  /* Clean-checks, so a verdict can only ever mean "the pet chose" and never "the bench could not
     look": nothing threw, the slot really is a non-commanding skill, and the geometry really did
     put `near` closer to the pet than `aimed` at the start of every trial. */
  const geomOk = (h) => [h.order, h.noorder].every(t => t.startNear < t.startAimed);
  const noThrow = (h) => !h.order.threw && !h.noorder.threw;
  const allClean = !commandsPet && [live, live2, inert].every(h => geomOk(h) && noThrow(h));

  /* The control, in EVERY half: with no order pressed the pet stays on the foe beside it. */
  const controlHeld = [live, live2, inert].every(h => h.noorder.toNear < h.noorder.toAimed);

  /* The bar: ordered, the pet goes for what the hero aimed at, and lands on it. */
  const bar = (h) => h.order.toAimed < h.order.toNear && h.order.aimedLost > 0;

  return JSON.stringify({
    ok: !!(allClean && controlHeld && bar(live) && bar(live2)),
    okAgainstInert: !!(allClean && controlHeld && bar(inert)),
    allClean: allClean, controlHeld: controlHeld,
    castName: castName, commandsPet: commandsPet, casts: casts,
    aimNoArgThrew: aimNoArgThrew, aimNoArgFound: aimNoArgFound,
    pet: { id: G.pet.id, arch: PDEF.arch, style: PDEF.style, range: PDEF.range }, petNote: petNote,
    live: live, live2: live2, inert: inert,
    weapon: (p.weapon || {}).name, weaponNote: weaponNote,
  });
})()
