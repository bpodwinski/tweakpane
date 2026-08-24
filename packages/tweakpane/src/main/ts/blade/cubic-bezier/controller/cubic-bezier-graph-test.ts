import {createValue, forceCast, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {afterEach, beforeEach, describe, it} from 'mocha';

import {CubicBezier} from '../model/cubic-bezier.js';
import {CubicBezierGraphController} from './cubic-bezier-graph.js';

function createVisualTestWindow(): Window {
	return forceCast(new JSDOM('', {pretendToBeVisual: true}).window);
}

function createRect(): DOMRect {
	return {
		x: 0,
		y: 0,
		width: 100,
		height: 100,
		top: 0,
		left: 0,
		right: 100,
		bottom: 100,
		toJSON() {
			return {};
		},
	} as DOMRect;
}

function dispatchMouse(
	target: EventTarget,
	win: Window,
	type: string,
	pageX: number,
	pageY: number,
	init: Partial<MouseEventInit> = {},
): void {
	const ev = new (win as unknown as typeof window).MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		...init,
	});
	Object.defineProperty(ev, 'pageX', {value: pageX, configurable: true});
	Object.defineProperty(ev, 'pageY', {value: pageY, configurable: true});
	target.dispatchEvent(ev);
}

describe(CubicBezierGraphController.name, () => {
	let prevRaf: unknown;
	let prevCaf: unknown;
	let prevMo: unknown;
	let activeViewProps: ViewProps | null;

	beforeEach(() => {
		const g = globalThis as any;
		prevRaf = g.requestAnimationFrame;
		prevCaf = g.cancelAnimationFrame;
		prevMo = g.MutationObserver;
		activeViewProps = null;
	});

	afterEach(() => {
		// The preview view listens to the same `value` and starts an rAF replay
		// loop (play()) on every change; dispose it while the globals are still
		// wired up, otherwise its pending frame throws after this test ends.
		activeViewProps?.set('disposed', true);

		const g = globalThis as any;
		g.requestAnimationFrame = prevRaf;
		g.cancelAnimationFrame = prevCaf;
		g.MutationObserver = prevMo;
	});

	function createController(win: Window) {
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const doc = win.document;
		const value = createValue(new CubicBezier(0.2, 0.8, 0.6, 0.1));
		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const c = new CubicBezierGraphController(doc, {
			keyScale: createValue(0.1),
			value,
			viewProps,
		});
		c.view.element.getBoundingClientRect = createRect;
		Object.defineProperty(c.view.element, 'clientWidth', {
			configurable: true,
			get: () => 100,
		});
		Object.defineProperty(c.view.element, 'clientHeight', {
			configurable: true,
			get: () => 100,
		});
		return {c, value};
	}

	it('should select and drag the closer handle on pointer down', () => {
		const win = createVisualTestWindow();
		const {c, value} = createController(win);

		// This point sits much closer to handle 1 (x1=0.2,y1=0.8 -> screen (20,35))
		// than to handle 2 (x2=0.6,y2=0.1 -> screen (60,70)).
		dispatchMouse(c.view.element, win, 'mousedown', 15, 40);

		const comps = value.rawValue.toObject();
		// Only the first handle (x1, y1) should have moved.
		assert.notStrictEqual(comps[0], 0.2);
		assert.strictEqual(comps[2], 0.6);
		assert.strictEqual(comps[3], 0.1);
	});

	it('should continue updating the same handle on move and finalize on up', () => {
		const win = createVisualTestWindow();
		const {c, value} = createController(win);

		dispatchMouse(c.view.element, win, 'mousedown', 15, 40);
		dispatchMouse(win.document, win, 'mousemove', 25, 30);
		dispatchMouse(win.document, win, 'mouseup', 25, 30);

		const comps = value.rawValue.toObject();
		assert.strictEqual(comps[2], 0.6);
		assert.strictEqual(comps[3], 0.1);
	});

	it('should ignore pointer/keyboard events with no effective step', () => {
		const win = createVisualTestWindow();
		const {c, value} = createController(win);
		const before = value.rawValue.toObject();

		const winRef = win as unknown as typeof window;
		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);
		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);

		assert.deepStrictEqual(value.rawValue.toObject(), before);
	});

	it('should move the selected handle by keyScale on arrow keydown and finalize on keyup', () => {
		const win = createVisualTestWindow();
		const {c, value} = createController(win);

		const winRef = win as unknown as typeof window;
		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);

		let comps = value.rawValue.toObject();
		assert.ok(Math.abs(comps[0] - 0.3) < 1e-9);

		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		comps = value.rawValue.toObject();
		assert.ok(Math.abs(comps[0] - 0.3) < 1e-9);
	});

	it('should refresh the graph and preview views without throwing', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win);
		assert.doesNotThrow(() => c.refresh());
	});
});
