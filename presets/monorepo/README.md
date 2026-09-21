# monorepo

```
.
├── .oxlintrc.base.json      shared, unchanged
├── .oxlintrc.json           { "extends": ["./.oxlintrc.base.json"] } for root-level scripts
├── tsconfig.base.json
├── .oxfmtrc.json, .jscpd.json, knip.json, .nano-staged.json, .claude/
├── scripts/                 lint plugin and scans, shared
├── pnpm-workspace.yaml
├── apps/web/                a react preset: .oxlintrc.json extends ../../.oxlintrc.base.json
└── apps/api/                a node preset:  .oxlintrc.json extends ../../.oxlintrc.base.json
```

- Lint from the root with plain `oxlint`, no `-c`: oxlint picks the nearest `.oxlintrc.json` for
  every file, and each package's config extends the base by relative path. The presets already do.
- Each package keeps its own `tsconfig.json` (extends `../../tsconfig.base.json`), `vitest.config.ts`
  and `stryker.config.json`, and its own `typecheck`, `test`, `mutation`, `dead-files`, `dead-mocks`
  and `build` scripts; the root scripts here fan out with `pnpm -r`.
- `scripts/resolve-module.mjs` reads `knip.json` and `src/` relative to the repo root; in a
  package, run the scans with `cwd` in the package and copy `scripts/` there, or point the root
  `knip.json` at workspaces:

```json
{
  "workspaces": {
    "apps/web": { "entry": ["src/main.tsx"], "project": ["src/**/*.{ts,tsx}"] },
    "apps/api": { "entry": ["src/main.ts"], "project": ["src/**/*.ts"] }
  }
}
```

- oxfmt and jscpd run once over the whole tree; `.jscpd.json` pattern becomes
  `{apps,packages}/*/src/**/*.{ts,tsx}`.
- CI: the same jobs as the root `ci.yml`, with `typecheck`, `test`, `build` and `mutation` as a
  matrix over packages (`working-directory: apps/${{ matrix.package }}`), lint and format once.
- The contract sits in `packages/api-docs` (OpenAPI); `apps/web` generates its client and `apps/api`
  its controller types from it. A contract change goes spec first, then both regenerate.
