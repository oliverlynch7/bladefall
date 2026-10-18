

## [Codex | 2026-10-17] Companion pad healing and accurate death health - v2.263.0

Healing pads now heal living local player and companion occupants independently of whether the owner is injured/on the pad. Height/radius checks include grounded/hovering companions; finite pads share their existing fractional charge fairly between occupants, infinite/locked/spent rules remain. Dead pets are never revived by a pad. Each client heals its owned companion and uses existing snapshots; peer proxies are not locally healed.

Pet damage/death now updates the HUD immediately; fallen companion identity/max health is retained transiently with a desaturated portrait and Fallen/0 HP instead of stale10 HP. A lightweight health-change check also refreshes passive/other heals without rebuilding the whole HUD each render. Contradictory dead co-op pet packets normalize to0 HP, absent pet snapshots clear the prior peer model/health, and existing Beastmaster1 HP last stand stays alive. Return to the Waystation restores normal companion behavior. No save-format/network-packet changes.

Verified:125/125 regression suites.36 focused health/pad/HUD/peer checks.20 actual-browser old-save checks include all10 companions healing via the engine pad update with a full-health owner outside the pad, simultaneous player/pet healing, immediate10-to6-tofallen0 HUD, owner snapshots through a real reliable WebRTC loopback into shipped mkPeer/applyPos, peer death cleanup and no pad resurrection. No browser errors. Evidence: docs/art-validation/companion-health-20261017/.
