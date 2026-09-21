## React

- Function components and hooks; `useState` for local UI state only, business state in `/stores`
- Layers: `components/` (with `components/ui` as the design system), `pages/`, `hooks/`, `services/`, `stores/`, `lib/`, `types/`; `.oxlintrc.json` names what each may import
- One component per file; `react/no-multi-comp` fails the lint (off for `components/ui` and specs)
- A component may call the API client; the logic building the request lives in `/services`
- Forms: one hook per form in `/hooks`; hooks own state, not markup
- No `useEffect` for derived state, prop-to-state sync or event handling; `react-you-might-not-need-an-effect` fails the lint
- Display-order filter and sort stay in the component; extract to `/services` for a second consumer or a domain rule
- Imports through `@/`, never relative across folders
- e2e in `tests/` with Playwright, run by its own CI job. Locally run with `CI=1` when a test looks flaky: one worker, two retries, the same as the pipeline. The default four-worker run flakes on its own
