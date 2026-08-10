/* Shared driver for the verification harness.

   Deliberately shells out to shot.js instead of reimplementing it. shot.js already owns the hard
   parts - finding Chrome, serving public/ over real HTTP because file:// fails CORS on ES modules
   and glTF, the CDP client over Node's built-in WebSocket, and the --scene readiness wait that
   stops a probe photographing the voxel fallback and calling it the 3D world. That last one fails
   SILENTLY when you get it wrong: you get a complete, plausible, wrong picture.

   WHY IT COPIES THE FILE FIRST. `harness/shot.js` cannot be run where it lives. harness/package
   .json declares "type": "module", and shot.js is CommonJS, so `node harness/shot.js` dies on its
   own first require. It only runs from `_shot/`, which carries "type": "commonjs" - which is what
   AUTOPILOT.md means when it says to copy it there. `_shot/` is gitignored, so a fresh checkout
   does not have it and the copy has to be part of the driver rather than a thing you remember. */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'harness', 'shot.js');
const RUNDIR = join(ROOT, '_shot');
const RUN = join(RUNDIR, 'shot.js');

/* Keep the runnable copy in step with the committed source of record. Compared by content rather
   than by mtime: a checkout gives every file the same timestamp, so mtime would say "fresh" for a
   copy that is a different file entirely. */
export function ensureRunner(){
  mkdirSync(RUNDIR, { recursive: true });
  const pkg = join(RUNDIR, 'package.json');
  if(!existsSync(pkg)) writeFileSync(pkg, JSON.stringify({ name: '_shot', private: true, type: 'commonjs' }, null, 2));
  const stale = !existsSync(RUN) || readFileSync(RUN, 'utf8') !== readFileSync(SRC, 'utf8');
  if(stale) copyFileSync(SRC, RUN);
  return RUN;
}

/* shot.js prints:  EVAL -> {\n  "value": ...\n}  (or "error"). Pure, so it is unit-testable
   without a browser - which matters because everything else here needs 45 seconds and a GPU. */
export function parseEval(stdout){
  const i = stdout.indexOf('EVAL → ');
  if(i === -1) throw new Error('no EVAL in harness output:\n' + stdout.slice(-600));
  const tail = stdout.slice(i + 'EVAL → '.length);
  let depth = 0, end = -1;
  for(let k = 0; k < tail.length; k++){
    if(tail[k] === '{') depth++;
    else if(tail[k] === '}'){ depth--; if(depth === 0){ end = k + 1; break; } }
  }
  if(end === -1) throw new Error('unterminated EVAL payload');
  const wrap = JSON.parse(tail.slice(0, end));
  if(wrap.error) throw new Error('page threw: ' + wrap.error);
  const v = wrap.value;
  if(typeof v === 'string'){
    try { return JSON.parse(v); } catch(e){ return v; }
  }
  return v;
}

/* ONE RETRY ON AN EMPTY RUN.

   The first full pass launched sixteen browsers back to back and thirteen of them came back with
   no output at all - not a game error, no EVAL line, nothing. That was recorded as thirteen broken
   CLASSES, which is exactly the kind of confident wrong answer this harness exists to prevent: a
   flaky launch must not be indistinguishable from a real finding. A run that produces no output is
   retried once; a run that produces a real page error is not, because that is a genuine result. */
export async function runScenario(opts){
  try { return await runOnce(opts); }
  catch(e){
    if(!/no EVAL in harness output|scenario timed out/.test(e.message)) throw e;
    await new Promise(r => setTimeout(r, 4000));
    return runOnce(opts);
  }
}

function runOnce(opts){
  const o = opts || {};
  const runner = ensureRunner();
  const args = [runner, '--out', join(RUNDIR, 'out', 'harness.png'),
                '--wait', String(o.waitMs || 9000)];
  if(o.scene != null) args.push('--scene', String(o.scene));
  if(o.pre) args.push('--pre', o.pre);
  args.push('--eval', o.js);

  return new Promise((ok, no) => {
    const ch = spawn(process.execPath, args, { cwd: ROOT });
    let out = '', err = '';
    const timer = setTimeout(() => { ch.kill(); no(new Error('scenario timed out')); },
                             o.timeoutMs || 300000);
    ch.stdout.on('data', d => { out += d; });
    ch.stderr.on('data', d => { err += d; });
    ch.on('close', () => {
      clearTimeout(timer);
      try { ok(parseEval(out)); }
      catch(e){ no(new Error(e.message + (err ? '\nstderr: ' + err.slice(-400) : ''))); }
    });
  });
}
