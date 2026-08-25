import {
	createValue,
	SliderPropsObject,
	ValueMap,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {Interval} from '../model/interval.js';
import {RangeSliderController} from './range-slider.js';

function createRect(width: number): DOMRect {
	return {
		width,
		height: 0,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		x: 0,
		y: 0,
		toJSON() {
			return {};
		},
	} as DOMRect;
}

function dispatchMouseEvent(
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

describe(RangeSliderController.name, () => {
	it('should read the knob width only when a grab starts, not on every pointer move', () => {
		const win = createTestWindow();
		const doc = win.document;
		const sliderProps = ValueMap.fromObject<SliderPropsObject>({
			keyScale: 1,
			max: 100,
			min: 0,
		});
		const value = createValue(new Interval(20, 80));
		const c = new RangeSliderController(doc, {
			sliderProps,
			value,
			viewProps: ViewProps.create(),
		});

		c.view.trackElement.getBoundingClientRect = () => createRect(200);

		let knobRectCalls = 0;
		c.view.knobElements[0].getBoundingClientRect = () => {
			knobRectCalls++;
			return createRect(10);
		};
		c.view.knobElements[1].getBoundingClientRect = () => {
			knobRectCalls++;
			return createRect(10);
		};

		// pageX=0 (far left of the 200px track) triggers the `p < pmin` branch,
		// which grabs the 'min' knob and immediately simulates a first move.
		dispatchMouseEvent(c.view.trackElement, win, 'mousedown', 0);

		const callsAfterGrab = knobRectCalls;
		assert.ok(
			callsAfterGrab >= 1,
			'grabbing a knob should have read its width at least once',
		);

		// Subsequent moves during the same grab must not re-read the knob width.
		for (let i = 0; i < 5; i++) {
			dispatchMouseEvent(doc, win, 'mousemove', i);
		}

		assert.strictEqual(
			knobRectCalls,
			callsAfterGrab,
			'should not re-read the knob width on every subsequent pointer move',
		);
	});

	function createController(win: Window) {
		const doc = win.document;
		const sliderProps = ValueMap.fromObject<SliderPropsObject>({
			keyScale: 1,
			max: 100,
			min: 0,
		});
		const value = createValue(new Interval(20, 80));
		const c = new RangeSliderController(doc, {
			sliderProps,
			value,
			viewProps: ViewProps.create(),
		});
		c.view.trackElement.getBoundingClientRect = () => createRect(200);
		c.view.knobElements[0].getBoundingClientRect = () => createRect(10);
		c.view.knobElements[1].getBoundingClientRect = () => createRect(10);
		return {c, value};
	}

	it('should grab the max knob directly and drag it, finalizing on up', () => {
		const win = createTestWindow();
		const {c, value} = createController(win);

		// pmax=0.8 -> screen 160; 158 (p=0.79) is safely within the 0.025 threshold.
		// knobOfs_ = -(knob width 10)/2 = -5, applied to every subsequent move.
		dispatchMouseEvent(c.view.trackElement, win, 'mousedown', 158);
		dispatchMouseEvent(win.document, win, 'mousemove', 180);
		dispatchMouseEvent(win.document, win, 'mouseup', 180);

		assert.strictEqual(value.rawValue.min, 20);
		assert.strictEqual(value.rawValue.max, 87.5);
	});

	it('should grab the min knob directly and drag it, finalizing on up', () => {
		const win = createTestWindow();
		const {c, value} = createController(win);

		// pmin=0.2 -> screen 40; 42 (p=0.21) is safely within the 0.025 threshold.
		dispatchMouseEvent(c.view.trackElement, win, 'mousedown', 42);
		dispatchMouseEvent(win.document, win, 'mousemove', 10);
		dispatchMouseEvent(win.document, win, 'mouseup', 10);

		assert.strictEqual(value.rawValue.max, 80);
		assert.ok(value.rawValue.min < 20);
	});

	it('should grab and move the max knob when clicking past pmax', () => {
		const win = createTestWindow();
		const {c, value} = createController(win);

		// p=0.9 > pmax(0.8): grabs max and immediately applies the position,
		// offset by knobOfs_ = -(knob width 10)/2 = -5.
		dispatchMouseEvent(c.view.trackElement, win, 'mousedown', 180);

		assert.strictEqual(value.rawValue.max, 87.5);
	});

	it('should grab the interval body and drag it, clamped to the slider range', () => {
		const win = createTestWindow();
		const {c, value} = createController(win);

		// p=0.5 is between pmin(0.2) and pmax(0.8): grabs the interval body.
		dispatchMouseEvent(c.view.trackElement, win, 'mousedown', 100);
		assert.strictEqual(value.rawValue.min, 20);
		assert.strictEqual(value.rawValue.max, 80);

		// Drag far left: clamped so min doesn't go below the slider's min (0).
		dispatchMouseEvent(win.document, win, 'mousemove', 0);
		assert.strictEqual(value.rawValue.min, 0);
		assert.strictEqual(value.rawValue.max, 60);

		// Drag far right: clamped so max doesn't exceed the slider's max (100).
		dispatchMouseEvent(win.document, win, 'mousemove', 200);
		dispatchMouseEvent(win.document, win, 'mouseup', 200);
		assert.strictEqual(value.rawValue.min, 40);
		assert.strictEqual(value.rawValue.max, 100);
	});

	it('should ignore a touch event with no matching touch', () => {
		const win = createTestWindow();
		const {c, value} = createController(win);

		const winRef = win as unknown as typeof window;
		const ev = new winRef.TouchEvent('touchstart', {
			bubbles: true,
			cancelable: true,
			targetTouches: [] as unknown as Touch[],
		});
		(ev as any).targetTouches.item = (i: number) =>
			(ev as any).targetTouches[i];
		c.view.trackElement.dispatchEvent(ev);

		assert.strictEqual(value.rawValue.min, 20);
		assert.strictEqual(value.rawValue.max, 80);
	});

	it('should ignore a pointer move/up with no matching touch while a grab is in progress', () => {
		const win = createTestWindow();
		const {c, value} = createController(win);
		const winRef = win as unknown as typeof window;

		// Start a legitimate grab of the interval body via mouse.
		dispatchMouseEvent(c.view.trackElement, win, 'mousedown', 100);
		assert.strictEqual(value.rawValue.min, 20);
		assert.strictEqual(value.rawValue.max, 80);

		// A touchmove with no matching touch entry produces `data.point === null`,
		// exercising valueFromData_'s and applyPointToValue_'s early-return branches
		// without changing the value.
		function noMatchTouchEvent(type: string) {
			const ev = new winRef.TouchEvent(type, {
				bubbles: true,
				cancelable: true,
				targetTouches: [] as unknown as Touch[],
			});
			(ev as any).targetTouches.item = (i: number) =>
				(ev as any).targetTouches[i];
			return ev;
		}
		c.view.trackElement.dispatchEvent(noMatchTouchEvent('touchmove'));
		c.view.trackElement.dispatchEvent(noMatchTouchEvent('touchend'));

		assert.strictEqual(value.rawValue.min, 20);
		assert.strictEqual(value.rawValue.max, 80);
	});
});
