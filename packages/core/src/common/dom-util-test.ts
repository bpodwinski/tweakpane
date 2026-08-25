import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../misc/dom-test-util.js';
import {
	createSvgIconElement,
	disableTransitionTemporarily,
	findNextTarget,
	forceReflow,
	getCanvasContext,
	getWindowDocument,
	indexOfChildElement,
	insertElementAt,
	removeChildElements,
	removeChildNodes,
	removeElement,
	supportsTouch,
} from './dom-util.js';

describe('DomUtil', () => {
	it('should get index of child element', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		const child = w.document.createElement('div');
		parent.appendChild(child);

		removeElement(child);
		assert.strictEqual(child.parentElement, null);
	});
	it('should get index of child element', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		parent.appendChild(w.document.createElement('div'));
		parent.appendChild(w.document.createElement('div'));
		const child = w.document.createElement('div');
		parent.appendChild(child);
		parent.appendChild(w.document.createElement('div'));

		assert.strictEqual(indexOfChildElement(child), 2);
	});

	it('should return negative index if not found', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		parent.appendChild(w.document.createElement('div'));
		parent.appendChild(w.document.createElement('div'));

		const elem = w.document.createElement('div');
		assert.strictEqual(indexOfChildElement(elem), -1);
	});

	it('should not throw when reading offsetHeight to force reflow', () => {
		const w = createTestWindow();
		const elem = w.document.createElement('div');
		assert.doesNotThrow(() => forceReflow(elem));
	});

	it('should temporarily disable the transition style during the callback', () => {
		const w = createTestWindow();
		const elem = w.document.createElement('div');
		elem.style.transition = 'all 1s';

		let duringCallback: string | undefined;
		disableTransitionTemporarily(elem, () => {
			duringCallback = elem.style.transition;
		});

		assert.strictEqual(duringCallback, 'none');
		assert.strictEqual(elem.style.transition, 'all 1s');
	});

	it('should detect touch support via ontouchstart', () => {
		const w = createTestWindow();
		assert.strictEqual(supportsTouch(w.document), false);

		(w.document as any).ontouchstart = null;
		assert.strictEqual(supportsTouch(w.document), true);
	});

	it('should return null from getCanvasContext when 2D context creation is unsupported', () => {
		const w = createTestWindow();
		const canvas = w.document.createElement('canvas');
		// Whether jsdom's canvas.getContext('2d') itself returns null depends on
		// whether the optional native `canvas` package happens to be installed
		// (it differs between environments), so stub it directly to deterministically
		// exercise getCanvasContext's pass-through of an unsupported 2D context.
		canvas.getContext = (() => null) as typeof canvas.getContext;
		assert.strictEqual(getCanvasContext(canvas), null);
	});

	it('should return null from getCanvasContext for a document with no window', () => {
		const w = createTestWindow();
		const detachedDoc = w.document.implementation.createHTMLDocument('');
		const canvas = detachedDoc.createElement('canvas');
		assert.strictEqual(getCanvasContext(canvas), null);
	});

	it('should return the global document via getWindowDocument', () => {
		assert.strictEqual(getWindowDocument(), globalThis.document);
	});

	it('should create an SVG icon element with the matching inner markup', () => {
		const w = createTestWindow();
		const icon = createSvgIconElement(w.document, 'check');
		assert.strictEqual(icon.tagName.toLowerCase(), 'svg');
		assert.ok(icon.innerHTML.includes('<path'));
	});

	it('should insert an element at the given child index', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		const a = w.document.createElement('a');
		const b = w.document.createElement('b');
		parent.appendChild(a);
		parent.appendChild(b);

		const inserted = w.document.createElement('i');
		insertElementAt(parent, inserted, 1);

		assert.deepStrictEqual(
			Array.from(parent.children).map((c) => c.tagName.toLowerCase()),
			['a', 'i', 'b'],
		);
	});

	it('should append at the end when the index is past the last child', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		parent.appendChild(w.document.createElement('a'));

		const inserted = w.document.createElement('i');
		insertElementAt(parent, inserted, 10);

		assert.strictEqual(parent.lastElementChild, inserted);
	});

	it('should be a no-op when removing an element with no parent', () => {
		const w = createTestWindow();
		const elem = w.document.createElement('div');
		assert.doesNotThrow(() => removeElement(elem));
	});

	it('should remove all child elements', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		parent.appendChild(w.document.createElement('a'));
		parent.appendChild(w.document.createElement('b'));

		removeChildElements(parent);
		assert.strictEqual(parent.children.length, 0);
	});

	it('should remove all child nodes, including text nodes', () => {
		const w = createTestWindow();
		const parent = w.document.createElement('div');
		parent.appendChild(w.document.createTextNode('hello'));
		parent.appendChild(w.document.createElement('span'));

		removeChildNodes(parent);
		assert.strictEqual(parent.childNodes.length, 0);
	});

	describe('findNextTarget', () => {
		it('should return relatedTarget when present', () => {
			const w = createTestWindow();
			const target = w.document.createElement('div');
			const ev = {relatedTarget: target} as unknown as FocusEvent;
			assert.strictEqual(findNextTarget(ev), target);
		});

		it('should fall back to explicitOriginalTarget (Firefox workaround)', () => {
			const w = createTestWindow();
			const target = w.document.createElement('div');
			const ev = {
				relatedTarget: null,
				explicitOriginalTarget: target,
			} as unknown as FocusEvent;
			assert.strictEqual(findNextTarget(ev), target);
		});

		it('should return null when neither is available', () => {
			const ev = {relatedTarget: null} as unknown as FocusEvent;
			assert.strictEqual(findNextTarget(ev), null);
		});
	});
});
