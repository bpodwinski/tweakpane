import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {IntColor} from '../model/int-color.js';
import {HPaletteController} from './h-palette.js';

function createRect(): DOMRect {
	return {
		x: 0,
		y: 0,
		width: 100,
		height: 20,
		top: 0,
		left: 0,
		right: 100,
		bottom: 20,
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
): void {
	const ev = new (win as unknown as typeof window).MouseEvent(type, {
		bubbles: true,
		cancelable: true,
	});
	Object.defineProperty(ev, 'pageX', {value: pageX, configurable: true});
	Object.defineProperty(ev, 'pageY', {value: 0, configurable: true});
	target.dispatchEvent(ev);
}

describe(HPaletteController.name, () => {
	it('should update hue from a pointer drag, constrained to the track', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 1], 'hsv'));
		const c = new HPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		dispatchMouse(c.view.element, win, 'mousedown', 50);

		const [h] = value.rawValue.getComponents('hsv');
		assert.strictEqual(h, 180);
	});

	it('should constrain out-of-bounds drag positions to the track', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 1], 'hsv'));
		const c = new HPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		dispatchMouse(c.view.element, win, 'mousedown', -20);
		let [h] = value.rawValue.getComponents('hsv');
		assert.strictEqual(h, 0);

		dispatchMouse(doc, win, 'mousemove', 500);
		dispatchMouse(doc, win, 'mouseup', 500);
		[h] = value.rawValue.getComponents('hsv');
		assert.strictEqual(h, 360);
	});

	it('should update hue via arrow keys and finalize on keyup', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([180, 50, 50, 1], 'hsv'));
		const c = new HPaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		const winRef = win as unknown as typeof window;
		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		let [h] = value.rawValue.getComponents('hsv');
		assert.strictEqual(h, 181);

		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		[h] = value.rawValue.getComponents('hsv');
		assert.strictEqual(h, 181);
	});

	it('should ignore keydown/keyup for non-step keys', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([180, 50, 50, 1], 'hsv'));
		const c = new HPaletteController(doc, {
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

		const [h] = value.rawValue.getComponents('hsv');
		assert.strictEqual(h, 180);
	});
});
