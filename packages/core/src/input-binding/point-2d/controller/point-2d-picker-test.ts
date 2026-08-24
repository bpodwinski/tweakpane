import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ValueMap} from '../../../common/model/value-map.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {Point2d} from '../model/point-2d.js';
import {Point2dPickerProps} from '../view/point-2d-picker.js';
import {Point2dPickerController} from './point-2d-picker.js';

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
): void {
	const ev = new (win as unknown as typeof window).MouseEvent(type, {
		bubbles: true,
		cancelable: true,
	});
	Object.defineProperty(ev, 'pageX', {value: pageX, configurable: true});
	Object.defineProperty(ev, 'pageY', {value: pageY, configurable: true});
	target.dispatchEvent(ev);
}

function createProps(invertsY = false): Point2dPickerProps {
	return ValueMap.fromObject({
		invertsY,
		max: 100,
		xKeyScale: 1,
		yKeyScale: 1,
	});
}

describe(Point2dPickerController.name, () => {
	it('should map a pointer drag to a Point2d in [-max, +max]', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new Point2d(0, 0));
		const c = new Point2dPickerController(doc, {
			layout: 'inline',
			props: createProps(),
			value,
			viewProps: ViewProps.create(),
		});
		c.view.padElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.padElement, win, 'mousedown', 100, 0);

		assert.strictEqual(value.rawValue.x, 100);
		assert.strictEqual(value.rawValue.y, -100);
	});

	it('should invert Y when invertsY is true', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new Point2d(0, 0));
		const c = new Point2dPickerController(doc, {
			layout: 'inline',
			props: createProps(true),
			value,
			viewProps: ViewProps.create(),
		});
		c.view.padElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.padElement, win, 'mousedown', 0, 0);

		assert.strictEqual(value.rawValue.x, -100);
		assert.strictEqual(value.rawValue.y, 100);
	});

	it('should update on move and finalize on up', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new Point2d(0, 0));
		const c = new Point2dPickerController(doc, {
			layout: 'inline',
			props: createProps(),
			value,
			viewProps: ViewProps.create(),
		});
		c.view.padElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.padElement, win, 'mousedown', 0, 100);
		dispatchMouse(doc, win, 'mousemove', 50, 50);
		dispatchMouse(doc, win, 'mouseup', 50, 50);

		assert.strictEqual(value.rawValue.x, 0);
		assert.strictEqual(value.rawValue.y, 0);
	});

	it('should move by keyScale on arrow keydown and finalize on keyup', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new Point2d(0, 0));
		const c = new Point2dPickerController(doc, {
			layout: 'inline',
			props: createProps(),
			value,
			viewProps: ViewProps.create(),
		});

		const winRef = win as unknown as typeof window;
		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		assert.strictEqual(value.rawValue.x, 1);
		assert.strictEqual(value.rawValue.y, 0);

		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowUp',
			}),
		);
		// invertsY is false, so ArrowUp decreases y (sign inverted by computeOffset).
		assert.strictEqual(value.rawValue.y, -1);

		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowUp',
			}),
		);
		assert.strictEqual(value.rawValue.x, 1);
		assert.strictEqual(value.rawValue.y, -1);
	});

	it('should ignore keydown/keyup for non-arrow keys', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(new Point2d(3, 4));
		const c = new Point2dPickerController(doc, {
			layout: 'inline',
			props: createProps(),
			value,
			viewProps: ViewProps.create(),
		});

		const winRef = win as unknown as typeof window;
		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);
		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);

		assert.strictEqual(value.rawValue.x, 3);
		assert.strictEqual(value.rawValue.y, 4);
	});
});
