# Approved queue browser regression checks

Use an isolated, muted localhost browser session. These scripts deliberately mutate the local QA save; never run against a player's production session.

Serve `public` at http://127.0.0.1:4331, create `output/playwright` in the invocation directory, and run scripts with Playwright CLI `run-code --filename <script>`. The save regression requires a temporary `public/3d/save-before.html` created from `git show 7df0394:public/3d/index.html`; remove that fixture after testing. Do not ship it.

Suggested order: save-qa.js, class-queue.js, queue-gameplay-qa.js, ng-queue.js, queue-loading-qa.js, queue-final-qa.js. Tests use real WebGL and __BF3 gameplay hooks plus the actual bag click handler. Assertions check state, preservation, rendering errors, readiness, and animation coverage; screenshots remain necessary for subjective art quality.
