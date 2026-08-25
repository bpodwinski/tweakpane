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

## Dev workflow — every code change must be visually verified

Editing controller/view code (`packages/core/src/blade/**`, `packages/core/src/input-binding/**`, `packages/core/src/monitor-binding/**`, or anything under `packages/tweakpane/src/main/ts`) is not done until it has been **exercised in an actual browser**, not just type-checked. Unit tests cover logic, not DOM/pointer/CSS behavior — and several real bugs in this repo (see e.g. issue #658, checkbox `mousedown`/text-selection) only show up when a control is actually clicked/dragged in a live page.

Loop:

1. Rebuild what you touched:
   - `packages/core/src` changed → `npm run build` in `packages/core`
   - `packages/tweakpane/src/main/ts` changed → the dev watcher picks it up automatically (see step 2)
2. Start (or reuse) the dev server: `npm start` in `packages/tweakpane` — serves the doc site on `http://localhost:8080` with live rebuild/watch of both the bundle and the doc pages. Leave it running across iterations instead of restarting it each time.
3. Verify in a real browser using the **chrome-devtools** or **playwright** MCP tools (either is fine — chrome-devtools gives console/network/performance introspection, playwright is the simpler default for basic click/drag checks):
   - Navigate to the relevant doc page (e.g. `http://localhost:8080/#/input-bindings/` for a binding change).
   - Interact with the actual control you changed: click, drag a slider, open a color picker, etc. — reproduce the golden path *and* the specific edge case you fixed.
   - Check the browser console for errors/warnings (`list_console_messages` / `browser_console_messages`) — a silent JS exception is easy to miss otherwise.
   - Take a screenshot or snapshot when the change is visual (layout, styling, new control) so it can be reviewed.
4. Only after the manual/MCP browser check passes, run `npm run lint` and `npm run test --workspaces` (or the scoped per-package equivalents) to confirm nothing else broke.
5. If the change adds or modifies a public-facing feature (a new/changed `view`, param, blade, binding, or built-in vendored component) — update **both** [llms.txt](llms.txt) (the machine-readable API reference — see its own gotchas/built-in-components sections) **and** the doc site (`packages/tweakpane/src/doc/`, see the `tweakpane-doc-page` skill for the exact Nunjucks + route-TS conventions) before considering the change done. A feature that works but isn't documented in both places is unfinished — this has been missed more than once in this repo's history.

Don't claim a UI fix is done from reading the diff alone — reproduce the original bug in the browser first, then confirm the fix resolves it there.

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

Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `build(deps):`, ...), enforced on PRs by `commitlint` (`.github/workflows/commitlint.yml`). This isn't stylistic — `release-please` (`.github/workflows/release-please.yml`) parses commit messages to bump `packages/core`/`packages/tweakpane` versions and generate each package's `CHANGELOG.md`; a non-conforming commit silently drops out of that changelog. Use `!` after the type or a `BREAKING CHANGE:` footer for a breaking change. Workflow is PR + merge commit — publishing to npm stays a manual step after a release PR is merged.

## Things to avoid

- Don't introduce a different package manager, bundler, or test framework than the ones above.
- Don't skip rebuilding `core` after editing it — `tweakpane` will silently use a stale build.
- Don't drop the `.js` extension on relative imports.
- Don't bypass the Blade/API/Controller/View split for new UI features "to save time" — it's load-bearing for the plugin system.
- Don't ship a new/changed public feature without updating `llms.txt` and the doc site in the same change — see Dev workflow step 5.
