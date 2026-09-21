## NestJS

- Layers: `controllers/`, `modules/`, `dto/`, `services/`, `repositories/`, `lib/`, `types/`; `.oxlintrc.json` names what each may import
- Classes only where the framework needs decorators: controllers, modules, DTOs, entities. Services and repositories export functions; `eslint/no-restricted-syntax` fails the lint elsewhere
- A controller parses the request and calls one service; it never reaches a repository
- A repository stores and loads; a decision on the data belongs in a service
- Contract first: the OpenAPI spec is the source of truth, controllers implement generated method types (`@hey-api/openapi-ts` with the `nestjs` plugin), a contract change goes spec first
- `tsconfig.json` here is for typecheck only; `nest build` keeps its own `tsconfig.build.json`
- Vitest compiles with SWC (`unplugin-swc`) so decorator metadata and DI work in tests; test services as plain functions where you can
