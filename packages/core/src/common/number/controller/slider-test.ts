import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/dom-test-util.js';
import {ValueMap} from '../../model/value-map.js';
import {createValue} from '../../model/values.js';
import {ViewProps} from '../../model/view-props.js';
import {SliderController} from './slider.js';

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

function createController(doc: Document) {
	const value = createValue(0);
	const c = new SliderController(doc, {
		props: ValueMap.fromObject({
			keyScale: 1,
			max: 100,
			min: 0,
		}),
		value,
		viewProps: ViewProps.create(),
	});
	c.view.trackElement.getBoundingClientRect = createRect;
	return {c, value};
}

describe(SliderController.name, () => {
	it('should map a pointer down/move to a value within [min, max]', () => {
		const win = createTestWindow();
		const doc = win.document;
		const {c, value} = createController(doc);

		dispatchMouse(c.view.trackElement, win, 'mousedown', 50);
		assert.strictEqual(value.rawValue, 50);
	});

	it('should constrain out-of-bounds pointer positions to the track', () => {
		const win = createTestWindow();
		const doc = win.document;
		const {c, value} = createController(doc);

		dispatchMouse(c.view.trackElement, win, 'mousedown', -20);
		assert.strictEqual(value.rawValue, 0);

		dispatchMouse(doc, win, 'mousemove', 500);
		dispatchMouse(doc, win, 'mouseup', 500);
		assert.strictEqual(value.rawValue, 100);
	});

	it('should step by keyScale on arrow keydown and finalize on keyup', () => {
		const win = createTestWindow();
		const doc = win.document;
		const {c, value} = createController(doc);

		const winRef = win as unknown as typeof window;
		c.view.trackElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		assert.strictEqual(value.rawValue, 1);

		c.view.trackElement.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);
		assert.strictEqual(value.rawValue, 1);
	});

	it('should ignore keydown/keyup for non-step keys', () => {
		const win = createTestWindow();
		const doc = win.document;
		const {c, value} = createController(doc);

		const winRef = win as unknown as typeof window;
		c.view.trackElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);
		c.view.trackElement.dispatchEvent(
			new winRef.KeyboardEvent('keyup', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);

		assert.strictEqual(value.rawValue, 0);
	});

	it('should ignore a touch event with no matching touch', () => {
		const win = createTestWindow();
		const doc = win.document;
		const {c, value} = createController(doc);

		const winRef = win as unknown as typeof window;
		const ev = new winRef.TouchEvent('touchstart', {
			bubbles: true,
			cancelable: true,
			targetTouches: [] as unknown as Touch[],
		});
		(ev as any).targetTouches.item = (i: number) =>
			(ev as any).targetTouches[i];
		c.view.trackElement.dispatchEvent(ev);

		assert.strictEqual(value.rawValue, 0);
	});
});
