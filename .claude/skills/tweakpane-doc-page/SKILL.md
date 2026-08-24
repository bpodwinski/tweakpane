---
name: tweakpane-doc-page
description: Write or extend a page/section on the Tweakpane doc site (packages/tweakpane/src/doc) following this repo's exact Nunjucks + TS-route conventions — use when asked to document a blade, binding, or plugin (built-in or vendored) on the doc site, or to add a whole new doc page.
---

# Tweakpane doc site: writing pages and sections

Use this skill whenever the task is to add or extend documentation on the Tweakpane doc site (`packages/tweakpane/src/doc/`) — a new `<h2>`/`<h3>` section documenting a feature (e.g. a vendored/built-in blade like `buttongrid`, `cubicbezier`, `fpsgraph`, `radiogrid`, `interval`), or a brand new page.

The site has **no templating helper/macro for code snippets or param tables** — everything is hand-written HTML following a strict, repeated structure. Do not invent a different structure; copy the patterns below exactly.

## Mental model

- **Templates**: `src/doc/template/<page>/index.html`, Nunjucks, compiled 1:1 to `docs/<page>/index.html` by `scripts/doc-build-html.js` (pure filesystem glob over `src/doc/template/**/*.html`, any file starting with `_` is a partial and skipped as a page).
- **Route TS**: `src/doc/ts/route/<page>.ts` — exactly one file per page template, exporting one `initXxx()` that wires every DOM marker on that page to a live `Pane` demo.
- **Entry point**: `src/doc/ts/bundle.ts` — imports every `initXxx` and registers it against a URL pattern via `SimpleRouter`. Only needs editing when adding a **brand new page**, not a new section on an existing page.
- **Nav**: `src/doc/template/partial/_global-nav.html` — static hand-written `<ul>`, not generated. Only top-level `<h2>` sections get a submenu entry; `<h3>` subsections don't.

## Recipe A — add a section to an EXISTING page (the common case)

Example: documenting `buttongrid` inside `blades/index.html` (it's a blade), or `radiogrid`/`interval` inside `input-bindings/index.html` (they're bindings).

1. **Template** (`src/doc/template/<page>/index.html`): append a section using this exact skeleton, inside `{% block content %}`:

```html
<h2 id="mysection"><a href="#mysection">My Section</a></h2>
<p>
	<a href="{{ root }}api/interfaces/MyBladeParams.html">Parameters</a> | <a href="{{ root }}api/classes/MyBladeApi.html">API</a>
</p>
<p>One or two sentences explaining what this does and when to use it.</p>
<div class="main_media">
	<div class="demo">
		<div class="demo_code">
			<div class="codeBlock"><pre><code class="js">const pane = new Pane();
pane.<strong>addBlade</strong>({
  <strong>view</strong>: <strong>'mysection'</strong>,
  label: 'my thing',
});</code></pre></div>
		</div>
		<div class="demo_result">
			<div class="paneContainer" data-pane-mysection></div>
		</div>
	</div>
</div>
```

Rules for this block:
- `id`/marker names are lowercase, no hyphens/underscores (`data-pane-mysection`, not `data-pane-my-section`).
- Manually wrap the 2-4 tokens you want visually highlighted in `<strong>` — there's no auto-highlighting of param names, you choose what's pedagogically relevant (usually the `view` value and the one or two params unique to this example). Actual syntax coloring is `highlight.js` client-side on `<code class="js">`.
- `<h3 id="parent_child">` for subsections under a `<h2>` (see e.g. `input-bindings/index.html`'s `#number_range`, `#number_step` under `#number`) — a `<h2>` can be immediately followed by an `<h3>` with no own text if it's just a grouping header (see `<h2 id="point">` with no `<p>`, straight into `<h3 id="point2d">`).
- Multiple `demo` blocks can follow each other under one heading with explanatory `<p>` between them if you need several examples (see the "Color" section of `input-bindings/index.html` — 6 successive `demo` blocks).
- The `Parameters | API` link line is optional but present on every existing native-blade section — point it at the typedoc-generated pages (`{{ root }}api/interfaces/<Params>.html`, `{{ root }}api/classes/<Api>.html`) even if those pages can't currently be regenerated (see Known issue below) — the links are correct once that's fixed.
- **Console/log variant**: if the example is worth showing the live bound value as JSON next to the pane (common for `options`/list-like bindings), add a second container right after:
```html
<div class="paneContainer" data-pane-mysection></div>
<div class="paneContainer paneContainer-console" data-pane-mysectionconsole></div>
```
Note the marker concatenation: `<marker>console`, not `<marker>-console`.

2. **Route TS** (`src/doc/ts/route/<page>.ts`): add one entry to the existing `markerToFnMap`, key = your marker string (no `data-pane-` prefix):

```ts
mysection: (container) => {
	const pane = new Pane({container: container});
	pane.addBlade({view: 'mysection', label: 'my thing'});
},
```

For a binding with a console/log twin, follow this exact pattern (from `input-bindings.ts`'s `numberlist`):
```ts
mysection: (container) => {
	const PARAMS = {value: 0};
	const consoleElem = selectContainer('mysection', true); // true = the "console" twin
	const log = {json: ''};
	const consolePane = new Pane({container: consoleElem});
	consolePane.addBinding(log, 'json', {
		interval: 0,
		label: 'PARAMS',
		multiline: true,
		readonly: true,
	});
	const updateLog = () => {
		log.json = JSON.stringify(PARAMS, undefined, 2);
		consolePane.refresh();
	};
	const pane = new Pane({container: container});
	pane
		.addBinding(PARAMS, 'value', {/* ... */})
		.on('change', () => updateLog());
	updateLog();
},
```
`selectContainer(marker, console?)` (from `../util.js`) resolves `[data-pane-<marker>(console)]` — you rarely call it directly except for the console-twin case; the outer loop in every route file already calls it for you for the primary container:
```ts
Object.keys(markerToFnMap).forEach((marker) => {
	const initFn = markerToFnMap[marker];
	const container = selectContainer(marker);
	initFn(container);
});
```

3. **Nav** (optional, only for a new top-level `<h2>`): add a `<li class="submenuItem">` under the right page's `<ul class="submenu">` in `src/doc/template/partial/_global-nav.html`. Skip this for `<h3>` subsections — none of those appear in the nav (check any existing page: "Range"/"Step"/"Number list" aren't in the submenu, only "Number" is).

## Recipe B — add a whole NEW page

Do everything in Recipe A, plus:
1. Create `src/doc/template/<page>/index.html` with the required header:
```nunjucks
{% set pageId = '<page>' %}
{% set root = '../' %}
{% set title = 'My Page' %}
{% extends "_template.html" %}

{% block pageHeader %}
<div class="pageHeader">
	<div class="pageHeader_inner">
		<div class="pageHeader_text">
			<h1 class="pageHeader_title">{{ title }}</h1>
		</div>
	</div>
</div>
{% endblock %}

{% block content %}
<!-- sections as in Recipe A -->
{% endblock %}
```
2. Create `src/doc/ts/route/<page>.ts` exporting `export function init<Page>() { ... }` (same `markerToFnMap` + loop pattern as Recipe A).
3. In `src/doc/ts/bundle.ts`: add the import (`import {init<Page>} from './route/<page>.js';`) and register it: `router.add(/\/<page>\/$/, init<Page>);`.
4. Add a top-level `<li class="menuItem">` entry (with its own `<ul class="submenu">` if it has sections) in `_global-nav.html`.

## Also keep `llms.txt` in sync

[`llms.txt`](../../../llms.txt) (repo root) is the machine-readable API reference used by AI agents — it's a **separate, self-contained document**, not generated from the doc site. Whenever you document something here that changes what an integrator/agent can do with the public API (a new built-in blade/binding `view`, a new param, a behavior change like "no longer needs `registerPlugin`"), make the matching edit in `llms.txt` too:
- New built-in component → add it under the relevant section (e.g. "Built-in essentials components") with a minimal verified code snippet, not a copy of the full doc-site prose.
- Changed default/behavior → update the "Gotchas for agents generating Tweakpane code" list.
- Keep "Key source files" current if you added new source directories.

`llms.txt` is published as part of the doc site itself (`docs/llms.txt`, copied by the `doc:build:llms` script from the repo root, watched by `doc:watch:llms`) and linked from the site nav footer (`{{ root }}llms.txt`, in `_global-nav.html` next to GitHub/API reference) — don't remove that link when editing the nav.

## Build & verify

```sh
cd packages/tweakpane
npm run doc:build:scss   # only if you touched site CSS
npm run doc:build:html   # recompiles all Nunjucks templates
npm run doc:build:ts     # recompiles bundle.js (route handlers)
npm run doc:build:llms   # only if you touched llms.txt — copies it into docs/
```
Or just run `npm start` (rebuilds + watches + serves on `http://127.0.0.1:8080` or next free port — check the log for the actual `Available on:` line) and follow this repo's [AGENT.md](../../../AGENT.md) **Dev workflow**: verify the new section in a real browser via the chrome-devtools/playwright MCP tools before considering it done — navigate to the page, confirm the demo pane renders and responds to interaction, check the console for errors.

## Known issue (as of this writing)

`doc:build:refs` (TypeDoc, generates the `/api/*.html` pages that the `Parameters | API` links point to) currently crashes on some generic type shapes — a pre-existing `typedoc@0.23.x` vs `typescript@5.9` incompatibility, unrelated to doc content. It is not part of CI (`npm run test --workspaces` never calls it) and doesn't block `doc:build:html`/`doc:build:ts`/`npm start`. Keep writing `Parameters`/`API` links as normal — they'll resolve once that's fixed separately; don't skip them because the target page can't currently build.
