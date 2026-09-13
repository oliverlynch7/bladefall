# Campaign layout validation

Run from the repository with Node:

    node tools/layouts/validate-walk.cjs
    node tools/layouts/validate-reach.cjs

An optional output filename writes detailed JSON. The walk validator executes the real inline game and actual movement update for both directions of every authored exploration connection. Hazards, enemies and pickups are disabled only in this collision test; it is not a balance playthrough. No jump or class skill is used. The reach validator checks all exploration and boss exits, placed quests, secrets and chests against the actual surface query, including short hops to the optional phase cache.

Real Chrome/WebGL, save migration, boss phase transitions, trial and secondary-mode regression results are recorded under docs/art-validation/campaign-*.json. The generator is CAMPAIGN_ROUTES / buildCampaignRoute and buildCampaignArena in public/3d/index.html. Class trials keep their existing generators.
