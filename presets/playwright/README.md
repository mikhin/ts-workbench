# playwright

Copy `playwright.config.ts` and `package.json` entries to the root. Append the `overrides` entry
from `.oxlintrc.json` here to the root `.oxlintrc.json` (`extends` merges `overrides`, so
`"extends": ["./.oxlintrc.base.json", "./presets/playwright/.oxlintrc.json"]` also works while the
folder is still there).

Locally run with `CI=1` when a test looks flaky: one worker, two retries, same as the pipeline.
The default four-worker run flakes on its own.

Add a `e2e` CI job that runs after `build`; it is not part of `pnpm check` because it needs the app.
