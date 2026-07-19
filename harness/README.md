# BLADEFALL automated playtest harness

External, read-only automation for the real `public/3d/index.html`. It produces a weapon matrix, sampled class/zone combat profile, multi-floor Descent telemetry, accelerated completability sweep, and baseline regression diff.

## Run

From this directory:

```powershell
npm install
npx playwright install chromium
npm run quick
npm run run
```

`quick` is a smoke/baseline pass (one Descent trial, three floors, short zone samples). The full run uses three Descent trials and up to twelve floors. Results are written to `out/<VERSION>-<runid>.json` and `out/REPORT.md`. Each run automatically compares weapon metrics with the most recent prior JSON and flags changes over 15%.

The reviewed v1.126.0 baseline, harness corrections, limits, and subjective tuning docket are summarized in [`AUDIT_1.126.0.md`](AUDIT_1.126.0.md).

## Console fallback

In the live game's DevTools, paste `core-driver.js`, then paste `console-run.js`. It performs a quick suite and downloads JSON. This fallback does not write Markdown or perform baseline discovery.

## Interpretation caveats

- Weapon `theoreticalDps` is the clean single-target balance number. `onHit` verifies the actual attack path, but projectile travel, charge release, crits, and status ticks make one-hit readings noisy.
- Zone profiles sample opening-area combat; they are not claims of full navigation clears.
- The completability sweep accelerates quest counters through the game's exported quest API, then uses real combat for bosses. It catches broken objective wiring/spawns and combat failures, but does not prove geometric reachability.
- Randomness is uncontrolled until the game exposes an RNG hook; compare distributions and repeated full runs rather than one sample.
