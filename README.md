# ts-workbench

A working environment for a TypeScript repo: strict `tsc`, oxlint with every category on, oxfmt,
Vitest with 100% coverage, Stryker, knip, jscpd, a local lint plugin, comment stripping, dead-file and
dead-mock scans, nano-staged behind a git hook and a Claude Code Stop hook, and a CI with one job
per check.

The root is a plain TypeScript repo: add `src/`, run `pnpm check`. React, NestJS, Playwright and
monorepo layers live in `presets/` as files to copy over.

## Start a repo

Use this repo as a GitHub template (or clone it and drop `.git`), then:

```
pnpm install
pnpm preset react            # or: node | monorepo
```

`pnpm preset` copies the preset's files over the root, points their `extends` at the root base
files, merges the preset's `scripts` and dependencies into `package.json`, appends its section to
`CLAUDE.md`, installs, and deletes `presets/` and itself. `monorepo` keeps `presets/` so each app
can start from one (`cp -r presets/react apps/web`, the `../../` paths already fit).

`.oxlintrc.json` extends `.oxlintrc.base.json`; `tsconfig.json` extends `tsconfig.base.json`. Edit
the thin files, leave the base alone so an upgrade is a copy.

## Presets

| Preset     | Adds                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react`    | React 19 and Vite, jsx-a11y, `react-you-might-not-need-an-effect`, layer boundaries over components/pages/hooks/services/stores/lib/types, happy-dom for Vitest, Playwright with its own CI job, a component, a service and a smoke spec |
| `node`     | NestJS on Fastify, layer boundaries over controllers/modules/dto/services/repositories, classes only where a decorator needs one, SWC for Vitest, a controller and a service with their specs                                            |
| `monorepo` | `pnpm-workspace.yaml` and root scripts that fan out with `pnpm -r`; keeps `presets/` so each app starts from one                                                                                                                         |

Every preset leaves `pnpm check` green, so the first commit already passes CI.

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
`one-function-export`, `no-branching-exports`, `no-classes`. A rule is a fixture in `fixtures/` and a
case in `lint-plugin.test.ts`; the test runs oxlint on the fixtures and asserts the diagnostics.

## Known version pins

- Stryker runs `inPlace` because TypeScript 7 no longer ships the programmatic compiler API; comment
  stripping parses with `oxc-parser` for the same reason
- the `node` preset pins TypeScript 6, because the Nest CLI needs that API to build

## Sources

- [10 anti-AI slop moves for frontend projects](https://evilmartians.com/chronicles/ten-anti-ai-slop-moves-for-frontend-projects-going-faster-than-humans-can-review)
- [Stop writing rules in AGENTS.md: use agent hooks and nano-staged instead](https://evilmartians.com/chronicles/stop-writing-rules-in-agents-md-use-agent-hooks-and-nano-staged-instead)
