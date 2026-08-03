/* ─────────────────────────────────────────────────────────────────────────────
   loadModelAnyExt — one model loader, shared by world3d and mob3d (and prop3d, which
   casts world objects through mob3d's export rather than loading them itself).

   The kits are mixed: monsters and the nature/castle/props sets ship .glb, while the village and
   qprops sets ship .gltf. Every layer had independently grown the same "try .glb, fall back to
   .gltf" dance, which works but costs a real 404 for each gltf asset on every load. That is not
   just waste — it buries genuine missing-asset 404s among expected ones, which is precisely how
   the texture problems went unnoticed for days.

   Two things make it quiet:

   1. A per-directory memo of the extension that worked, tried first next time.
   2. That memo is SEEDED for the two .gltf packs — because the memo alone cannot help. Loaders
      fire their models with Promise.all, so every request goes out before any of them has
      recorded an answer, and each gltf asset still pays its 404. Seeding takes it to zero while
      the self-tuning path still covers any pack added later with no code change.

   It lives in its own module rather than being imported from world3d because world3d already
   imports from mob3d, and the reverse import would close a cycle. It also stops this being the
   FOURTH copy of the same logic — duplicated helpers have caused two multi-hour bugs on this
   project already, where a fix landed in one copy and the other kept running the old path.
   ───────────────────────────────────────────────────────────────────────────── */
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

const _loader = new GLTFLoader();
const _load = url => new Promise((res, rej) => _loader.load(url, res, undefined, rej));

/* Keyed on the LAST folder segment ('village/'), not the full path. An earlier attempt seeded
   'village/' while deriving '../slice3d/assets/village/', so the seed never matched a lookup. */
const _extMemo = new Map([['village/', '.gltf'], ['qprops/', '.gltf']]);

export function modelExtFor(base){
  const cut = base.lastIndexOf('/');
  return _extMemo.get(base.slice(base.lastIndexOf('/', cut - 1) + 1, cut + 1)) || '.glb';
}

export async function loadModelAnyExt(base){
  const cut = base.lastIndexOf('/');
  const dir = base.slice(base.lastIndexOf('/', cut - 1) + 1, cut + 1);
  const first = _extMemo.get(dir) || '.glb';
  const second = first === '.glb' ? '.gltf' : '.glb';
  try {
    const g = await _load(base + first);
    _extMemo.set(dir, first);
    return g;
  } catch(e){
    /* Deliberately let a genuine miss throw. A silent fallback is how a missing asset once
       masqueraded as a successful render for days. */
    const g = await _load(base + second);
    _extMemo.set(dir, second);
    return g;
  }
}
