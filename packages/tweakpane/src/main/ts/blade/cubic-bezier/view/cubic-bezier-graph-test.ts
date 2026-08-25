import * as assert from 'assert';
import {afterEach, beforeEach, describe, it} from 'mocha';
import {createValue, ViewProps} from 'tweakpane-reborn-core';

import {createTestWindow} from '../../../misc/test-util.js';
import {CubicBezier} from '../model/cubic-bezier.js';
import {CubicBezierGraphView} from './cubic-bezier-graph.js';

describe(CubicBezierGraphView.name, () => {
	// waitToBeAddedToDom() (called by the constructor) relies on the global
	// `MutationObserver`, which only exists in a real browser. jsdom's window
	// provides one; expose it as a global for the duration of these tests.
	let prevMutationObserver: typeof MutationObserver | undefined;

	beforeEach(() => {
		prevMutationObserver = (
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver;
	});

	afterEach(() => {
		(
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver = prevMutationObserver;
	});

	it('should read clientWidth/clientHeight only once per refresh()', () => {
		const win = createTestWindow();
		const doc = win.document;
		(
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver = (
			win as unknown as {MutationObserver: typeof MutationObserver}
		).MutationObserver;

		const view = new CubicBezierGraphView(doc, {
			selection: createValue(0),
			value: createValue(new CubicBezier(0.2, 0.8, 0.6, 0.1)),
			viewProps: ViewProps.create(),
		});

		let widthReads = 0;
		let heightReads = 0;
		Object.defineProperty(view.element, 'clientWidth', {
			configurable: true,
			get: () => {
				widthReads++;
				return 200;
			},
		});
		Object.defineProperty(view.element, 'clientHeight', {
			configurable: true,
			get: () => {
				heightReads++;
				return 100;
			},
		});

		view.refresh();

		assert.strictEqual(
			widthReads,
			1,
			'clientWidth should be read exactly once per refresh()',
		);
		assert.strictEqual(
			heightReads,
			1,
			'clientHeight should be read exactly once per refresh()',
		);
	});

	it('should still compute correct positions after caching size', () => {
		const win = createTestWindow();
		const doc = win.document;
		(
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver = (
			win as unknown as {MutationObserver: typeof MutationObserver}
		).MutationObserver;

		const view = new CubicBezierGraphView(doc, {
			selection: createValue(0),
			value: createValue(new CubicBezier(0.2, 0.8, 0.6, 0.1)),
			viewProps: ViewProps.create(),
		});

		Object.defineProperty(view.element, 'clientWidth', {
			configurable: true,
			get: () => 200,
		});
		Object.defineProperty(view.element, 'clientHeight', {
			configurable: true,
			get: () => 100,
		});

		// valueToPosition() is the public API used by the controller and must keep
		// reading live size on every call (unlike the internal refresh() loop).
		const p = view.valueToPosition(0, 0);
		assert.strictEqual(p.x, 0);
		assert.strictEqual(p.y, 100 * 0.75); // h - getVertMargin_(h) = h - h*0.25

		view.refresh();
	});
});
