# <project> — development guidelines

Replace `<project>` and fill the Domain section. Delete rules you cannot name an incident for.

## Architecture

- Business logic in `/services`, never in components, controllers or stores
- Functional programming, no classes; pure functions over hooks
- Layers in `.oxlintrc.json` (`boundaries/elements`); a wrong import fails the lint with the reason
- Names reveal intent; one responsibility per file; one exported function per file in `/services`
- No re-export barrels; import from the file that defines the thing

## TypeScript

- Ban `any`; `unknown` only where nothing else fits
- No enums, `as const` objects (`erasableSyntaxOnly`)
- Max strictness (`tsconfig.base.json`); explicit return types on exported functions
- `type` over `interface`

## Comments

None. `local/no-comments` fails the lint on any comment that is not a tool directive; `pnpm strip-comments` removes the rest. Both read `scripts/comment-directives.cjs`.

What a comment would have said goes into a name, a test, or the commit message.

## Testing

- Vitest, pure business logic tested as pure functions; 100% coverage on `src/**`
- `pnpm mutation` runs Stryker; a survivor is a missing assertion, not a bug, usually shape asserted instead of content
- No mutation-score gate (`thresholds.break` is `null`); the score is a detector, not a target
- Test names describe behaviour by inputs and outcome, no ticket ids

## Rounding

Services compute, formatters round. No `Math.round`, `toFixed` or truncation in a value a service returns. Compare on exact values. One value must not travel two paths that round differently.

## Lint rules

- A recurring mistake becomes a rule in `scripts/lint-plugin`, with a fixture under `fixtures/` and a case in `lint-plugin.test.ts`
- Two kinds earn a rule: a filter for a default the model brings from outside, and a scar from a shipped bug. If you cannot name the incident, do not write it
- The error message says where the code should go instead, not only what is wrong

## Tooling

- pnpm. oxlint + oxfmt, no ESLint or Prettier; `eslint-plugin-*` run as oxlint `jsPlugins`
- `pnpm check` = format, lint, typecheck, test, knip, dead files, dead mocks, jscpd, build. Each is a separate CI job
- Stop hook in `.claude/settings.json` runs `nano-staged` on unstaged files; pre-commit runs it on staged ones
- Rollout on an existing codebase: baseline first (warnings on changed files), promote rules one at a time, gate CI last

## Domain

<glossary and business rules that no lint can encode>
