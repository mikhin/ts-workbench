# ts-workbench

A working environment for a TypeScript repo: strict `tsc`, oxlint with every category on, oxfmt,
Vitest with 100% coverage, Stryker, knip, jscpd, a local lint plugin, comment stripping, dead-file and
dead-mock scans, nano-staged behind a git hook and a Claude Code Stop hook, and a CI with one job
per check.

The root is a plain TypeScript repo: add `src/`, run `pnpm check`. React, NestJS, Playwright and
monorepo layers live in `presets/` as files to copy over.

## Start a repo

```
git clone <this> my-app && cd my-app
rm -rf .git && git init
pnpm install
```

`.oxlintrc.json` extends `.oxlintrc.base.json`; `tsconfig.json` extends `tsconfig.base.json`. Edit
the thin files, leave the base alone so an upgrade is a copy.

## Apply a preset

Each preset is a folder of files that go to the same path in the repo root. Copy, then:

- `.oxlintrc.json` and `tsconfig.json` in a preset extend `../../*.base.json`; after the copy change
  that to `./`
- install the packages listed in the preset's `package.json` (`pnpm add -D` its `devDependencies`,
  merge its `scripts`)
- delete `presets/` when done, or keep it for the next layer

| Preset       | Adds                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react`      | jsx-a11y, react rules, `react-you-might-not-need-an-effect`, layer boundaries for components/pages/hooks/services/stores/lib/types, happy-dom for Vitest, Stryker over services and stores |
| `node`       | NestJS-shaped layers (controllers/services/repositories/lib/types), classes and decorators allowed in controllers, modules and DTOs only, `tsconfig` with decorator metadata               |
| `playwright` | the `eslint-plugin-playwright` rule set as an oxlint override for `tests/**`                                                                                                               |
| `monorepo`   | `pnpm-workspace.yaml`, root scripts that fan out, nested oxlint configs per package                                                                                                        |

## Scripts

| Script                                | What                                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `check`                               | everything below except mutation, in order; the CI runs the same as separate jobs                                                |
| `format`, `lint`, `typecheck`, `test` | oxfmt, oxlint, tsc, vitest with coverage                                                                                         |
| `mutation`                            | Stryker over `src`, report in `reports/mutation/index.html`; `mutation:changed` mutates only files changed against `origin/main` |
| `deadcode`                            | knip: unused files, exports, dependencies                                                                                        |
| `dead-files`                          | files unreachable from the `src` entries in `knip.json`; keep one on purpose with `@dead-code-allow` in its first 200 characters |
| `dead-mocks`                          | `vi.mock()` of a module that does not exist or of exports the module does not have                                               |
| `dup`, `dup:top`                      | jscpd; `dup:top` groups clones by fragment and drops scaffolding, `--pairs`, `--grep`, `--all`                                   |
| `strip-comments`                      | removes every comment that is not a tool directive; `--dry` to preview                                                           |

## Hooks

- pre-commit (`simple-git-hooks`) runs `nano-staged` on staged files: oxfmt writes, oxlint blocks
- `.claude/settings.json` runs the same on unstaged files when Claude Code stops, and exits 2 so the
  agent has to fix what it broke before it is done

## Lint plugin

`scripts/lint-plugin` is an ESLint-API plugin loaded by oxlint as `local/*`. Rules: `no-comments`,
`one-function-export`, `no-branching-exports`. A rule is a fixture in `fixtures/` and a case in
`lint-plugin.test.ts`; the test runs oxlint on the fixtures and asserts the diagnostics.

## Sources

- [10 anti-AI slop moves for frontend projects](https://evilmartians.com/chronicles/ten-anti-ai-slop-moves-for-frontend-projects-going-faster-than-humans-can-review)
- [Stop writing rules in AGENTS.md: use agent hooks and nano-staged instead](https://evilmartians.com/chronicles/stop-writing-rules-in-agents-md-use-agent-hooks-and-nano-staged-instead)
