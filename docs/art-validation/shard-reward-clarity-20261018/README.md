# Shard and reward clarity · v2.312.0

Independent purple0–5 counter beneath minimap, normalized combined saved/newly carried regional count. No split count in quest rows or journal summary. Banking and portal unlock rules unchanged. Notice top measured below map caption to prevent overlap.

Chest:2800ms rolling,1000ms actual winning slot spotlight,6000ms larger summary. No input skip or gameplay pause. Visibility-change clock reset protects reading time while hidden; low-FPS frames use visible wall milliseconds instead of an artificial100ms-per-frame cap. Queue and scene cleanup retained. Reduced Motion shows the same6s static result.

13 suites in tests.json, including125 reel and20 shard-counter checks, old saves, co-op reward claims, pause, notices and economy regressions. Isolated muted Chrome loaded legacy level100/gold1145. Inspected3/5 and5/5 combined counts with duplicate IDs excluded,0/5, clean quest list, immediate pause hiding and resume. Measured counter bottom367.59 and journal top379.59 (12px gap). Actual normal reel in reveal-timing.json: winning name at3116ms, summary4122ms; root later removed with one item awarded. Result screenshot captured via normal production Reduced Motion path (no extended timer); normal-motion timing tested independently. No console warnings/errors observed, real saves untouched.
