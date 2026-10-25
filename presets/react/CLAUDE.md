## React

- Function components and hooks; `useState` for local UI state only, business state in `/stores`
- The React Compiler memoizes components (`vite.config.ts`); no hand-written `useMemo`, `useCallback` or `memo`
- Layers: `components/` (with `components/ui` as the design system), `pages/`, `hooks/`, `services/`, `stores/`, `lib/`, `types/`; `.oxlintrc.json` names what each may import
- One component per file; `react/no-multi-comp` fails the lint (off for `components/ui` and specs)
- `components/` holds `.tsx` only; `local/no-ts-in-components` fails the lint on a `.ts` there and names its layer
- A component may call the API client; the logic building the request lives in `/services`
- Forms: one hook per form in `/hooks`; hooks own state, not markup
- No `useEffect` for derived state, prop-to-state sync or event handling; `react-you-might-not-need-an-effect` fails the lint
- Display-order filter and sort stay in the component; extract to `/services` for a second consumer or a domain rule
- Imports through `@/`, never relative across folders
- A `console.error` or `console.warn` fails the spec (`vitest-fail-on-console`): React reports a missing key or an update outside `act` only there
- Component specs query through `screen` and drive with `userEvent`; `testing-library/*` fails the lint on containers, node access and `fireEvent`
- e2e in `tests/` with Playwright, run by its own CI job. Locally run with `CI=1` when a test looks flaky: one worker, two retries, the same as the pipeline. The default four-worker run flakes on its own
