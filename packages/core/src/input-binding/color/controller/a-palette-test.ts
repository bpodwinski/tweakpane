import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {IntColor} from '../model/int-color.js';
import {APaletteController} from './a-palette.js';

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

describe(APaletteController.name, () => {
	it('should update alpha from a pointer drag', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 1], 'hsv'));
		const c = new APaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		dispatchMouse(c.view.element, win, 'mousedown', 25);

		const [, , , a] = value.rawValue.getComponents('hsv');
		assert.strictEqual(a, 0.25);
	});

	it('should update on drag move and finalize on drag up', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 1], 'hsv'));
		const c = new APaletteController(doc, {
			value,
			viewProps: ViewProps.create(),
		});
		c.view.element.getBoundingClientRect = createRect;

		dispatchMouse(c.view.element, win, 'mousedown', 0);
		dispatchMouse(doc, win, 'mousemove', 100);
		dispatchMouse(doc, win, 'mouseup', 100);

		const [, , , a] = value.rawValue.getComponents('hsv');
		assert.strictEqual(a, 1);
	});

	it('should update alpha via arrow keys (scaled by 0.1) and finalize on keyup', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 0.5], 'hsv'));
		const c = new APaletteController(doc, {
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
		let [, , , a] = value.rawValue.getComponents('hsv');
		assert.ok(Math.abs(a - 0.6) < 1e-9);

		c.view.element.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		[, , , a] = value.rawValue.getComponents('hsv');
		assert.ok(Math.abs(a - 0.6) < 1e-9);
	});

	it('should ignore keydown/keyup for non-step keys', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new IntColor([0, 50, 50, 0.5], 'hsv'));
		const c = new APaletteController(doc, {
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

		const [, , , a] = value.rawValue.getComponents('hsv');
		assert.strictEqual(a, 0.5);
	});
});
