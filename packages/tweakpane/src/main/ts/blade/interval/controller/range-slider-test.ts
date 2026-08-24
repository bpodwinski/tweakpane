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
});
