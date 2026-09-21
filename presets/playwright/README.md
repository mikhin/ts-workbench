# playwright

`.oxlintrc.playwright.json` is added to the root `.oxlintrc.json` `extends`; put e2e specs under
`tests/`.

Locally run with `CI=1` when a test looks flaky: one worker, two retries, same as the pipeline.
The default four-worker run flakes on its own.

Add an `e2e` CI job that runs after `build`; it is not part of `pnpm check` because it needs the app.
