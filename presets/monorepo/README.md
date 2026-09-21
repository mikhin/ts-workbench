# monorepo

The root keeps the shared setup, each app gets a preset:

```
cp -r presets/react apps/web        # ../../ paths in its configs already point at the root
cp -r presets/node  apps/api
```

Give each app a real `package.json`: take the preset's `scripts`, `dependencies` and
`devDependencies` as they are, add a name and the per-package checks the root fans out to.

```json
{
  "name": "@app/web",
  "private": true,
  "scripts": {
    "typecheck": "tsc",
    "test": "vitest run --coverage --passWithNoTests",
    "mutation": "stryker run",
    "dead-files": "node ../../scripts/find-dead-code.mjs",
    "dead-mocks": "node ../../scripts/find-dead-mocks.mjs"
  }
}
```

Then delete `presets/` and `scripts/preset.mjs`, and drop the `preset` script from the root
`package.json`.

## What changes at the root

- lint with plain `oxlint`, no `-c`: it picks the nearest `.oxlintrc.json` per file, and each app's
  config extends the root base by relative path
- `.jscpd.json` pattern becomes `{apps,packages}/*/src/**/*.{ts,tsx}`
- `knip.json` moves to workspaces:

```json
{
  "workspaces": {
    "apps/web": { "entry": ["src/main.tsx"], "project": ["src/**/*.{ts,tsx}"] },
    "apps/api": { "entry": ["src/main.ts"], "project": ["src/**/*.ts"] }
  }
}
```

- `scripts/find-dead-code.mjs` and `find-dead-mocks.mjs` read `knip.json` and `src/` next to
  themselves, so run them from inside the app (`pnpm -r run dead-files` does that) and give each app
  its own `knip.json`
- CI: lint and format once at the root, `typecheck`, `test`, `build` and `mutation` as a matrix over
  the apps with `working-directory: apps/${{ matrix.app }}`

## The contract

Put the OpenAPI spec in `packages/api-docs`. `apps/web` generates its client from it, `apps/api` its
controller types. A contract change goes spec first, then both regenerate.
