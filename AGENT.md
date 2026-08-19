# AGENT.md

Guidance for AI coding agents working in this repository (Tweakpane — a compact GUI/pane library for tweaking parameters).

## Repo shape

npm-workspaces monorepo (`workspaces: ["packages/*"]`), **npm only** (no pnpm/yarn — `package-lock.json` is authoritative). Two packages:

- `packages/core` (`@tweakpane/core`) — the actual library logic: Blade/API/Controller/View architecture + plugin engine. Built with plain `tsc` (no bundler), consumed as native ESM.
- `packages/tweakpane` (`tweakpane`) — the published package. Depends on `@tweakpane/core` (aliased to `../core` in dev via Rollup). Also contains the doc site source (`src/doc` → built into `docs/`, gitignored).

## Setup

```
npm ci
npm run setup   # builds core, then tweakpane — required before tweakpane will compile/type-check
```
`tweakpane` resolves `@tweakpane/core` through a build alias, so a stale/missing `core` build breaks everything downstream. Rebuild core after touching `packages/core/src`.

## Commands (run per-package or with `--workspaces` from root)

- `npm run lint` — static only (eslint + scss check), no test execution
- `npm run test --workspaces` — full suite: static lint + scss check + mocha dynamic tests + (for `tweakpane`) packaged-module install test
- `npm run format` — prettier + eslint --fix
- `npm run coverage` — nyc, merged lcov report
- `npm run build` — production build (rollup for tweakpane, tsc for core)

CI (`.github/workflows/ci.yml`) runs, in one job: `npm ci` → `npm run setup` → `npm run test --workspaces` → `npm run coverage`. Match this locally before considering work done. Node is pinned to `16.1.0` in CI due to a known npm-workspaces bug — don't rely on newer Node-only APIs without checking.

## Code conventions

- TypeScript, strict mode, ESM only (`module: node16`) — **import paths need explicit `.js` extensions** even though source is `.ts`.
- Prettier via eslint: tabs (not spaces), single quotes, trailing commas, `bracketSpacing: false`. Run `npm run format` rather than hand-formatting.
- Imports auto-sorted (`eslint-plugin-simple-import-sort`) — don't fight the sort order.
- `.editorconfig`: tabs for js/ts/json/scss/html, 2-space for md/yml.

## Architecture pattern (packages/core/src)

Everything UI-facing follows **Blade → API → Controller → View**, wired through a plugin registry:

```
blade/<feature>/
  api/         # public class the user gets (e.g. ButtonApi extends BladeApi)
  controller/  # internal state, connects model + view
  view/        # DOM rendering
  plugin.ts    # createPlugin({ id, type, accept, controller, api })
```
`input-binding/` and `monitor-binding/` mirror this for editable/read-only bound values. Plugins are registered in `plugin/plugins.ts`. **When adding a new blade/binding feature, follow this exact api/controller/view/plugin split** — it's also the pattern third-party plugins use, so deviating breaks consistency with the public plugin API.

`packages/tweakpane/src/main/ts/` is thinner: `pane/Pane.ts` is the main entry point, re-exporting/assembling `@tweakpane/core`.

## Tests

- Mocha + `ts-node/esm`, plain Node `assert` (no Jest/Vitest/Chai).
- **Colocated** with source, suffix `-test.ts` (e.g. `button.ts` next to `button-test.ts`), picked up via `src/**/*-test.ts`.
- DOM simulated with `jsdom` — use `createTestWindow()` from `packages/core/src/misc/dom-test-util.ts` rather than adding a new DOM-mocking approach.
- Structure: `describe(ClassName.name, () => { it('should ...', () => {...}) })`.

## Commits / PRs

No CONTRIBUTING.md, no enforced conventional-commits. Existing style: short imperative or descriptive messages, occasionally referencing an issue (`, #630`). Workflow is PR + merge commit. Don't invent a stricter convention unless asked.

## Things to avoid

- Don't introduce a different package manager, bundler, or test framework than the ones above.
- Don't skip rebuilding `core` after editing it — `tweakpane` will silently use a stale build.
- Don't drop the `.js` extension on relative imports.
- Don't bypass the Blade/API/Controller/View split for new UI features "to save time" — it's load-bearing for the plugin system.
