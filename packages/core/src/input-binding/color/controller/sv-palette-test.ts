import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {IntColor} from '../model/int-color.js';
import {SvPaletteController} from './sv-palette.js';

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

describe(SvPaletteController.name, () => {
	it('should update saturation/value from a pointer drag', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 0, 0, 1], 'hsv'));
		const c = new SvPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		dispatchMouse(c.view.element, win, 'mousedown', 25, 75);

		const [, s, v] = value.rawValue.getComponents('hsv');
		assert.strictEqual(s, 25);
		assert.strictEqual(v, 25);
	});

	it('should update on drag move and finalize on drag up', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 0, 0, 1], 'hsv'));
		const c = new SvPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		dispatchMouse(c.view.element, win, 'mousedown', 0, 100);
		dispatchMouse(doc, win, 'mousemove', 100, 0);
		dispatchMouse(doc, win, 'mouseup', 100, 0);
		// pageX=100/pageY=0 maps to the top-right corner: saturation=100, value=100.

		const [, s, v] = value.rawValue.getComponents('hsv');
		assert.strictEqual(s, 100);
		assert.strictEqual(v, 100);
	});

	it('should ignore pointer events with no point (no bounds/document listener attached yet)', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 0, 0, 1], 'hsv'));
		const c = new SvPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		// A mousemove on the document before any mousedown should not be wired
		// up yet, so the value must remain untouched.
		dispatchMouse(doc, win, 'mousemove', 50, 50);

		const [, s, v] = value.rawValue.getComponents('hsv');
		assert.strictEqual(s, 0);
		assert.strictEqual(v, 0);
	});

	it('should update hue-saturation via arrow keys and finalize on keyup', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 1], 'hsv'));
		const c = new SvPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		const winRef = win as unknown as typeof window;
		const keydown = new winRef.KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'ArrowRight',
		});
		c.view.element.dispatchEvent(keydown);

		let [, s, v] = value.rawValue.getComponents('hsv');
		assert.strictEqual(s, 51);
		assert.strictEqual(v, 50);

		const keyup = new winRef.KeyboardEvent('keyup', {
			bubbles: true,
			cancelable: true,
			key: 'ArrowRight',
		});
		c.view.element.dispatchEvent(keyup);

		[, s, v] = value.rawValue.getComponents('hsv');
		assert.strictEqual(s, 51);
		assert.strictEqual(v, 50);
	});

	it('should ignore keydown/keyup for non-step keys', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 1], 'hsv'));
		const c = new SvPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});

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

		const [, s, v] = value.rawValue.getComponents('hsv');
		assert.strictEqual(s, 50);
		assert.strictEqual(v, 50);
	});
});
