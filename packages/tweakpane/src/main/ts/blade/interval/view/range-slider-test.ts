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
import {RangeSliderView} from './range-slider.js';

function createView(value: Interval) {
	const doc = createTestWindow().document;
	const sliderProps = ValueMap.fromObject<SliderPropsObject>({
		keyScale: 1,
		max: 100,
		min: 0,
	});
	const v = createValue(value);
	const view = new RangeSliderView(doc, {
		sliderProps,
		value: v,
		viewProps: ViewProps.create(),
	});
	return {view, sliderProps, value: v};
}

describe(RangeSliderView.name, () => {
	it('should add the "zero" modifier class when the interval has zero length', () => {
		const {view} = createView(new Interval(50, 50));

		assert.ok(view.element.classList.contains('tp-rslv-zero'));
	});

	it('should remove the "zero" modifier class once the interval has positive length', () => {
		const {view, value} = createView(new Interval(50, 50));
		assert.ok(view.element.classList.contains('tp-rslv-zero'));

		value.rawValue = new Interval(20, 80);
		assert.ok(!view.element.classList.contains('tp-rslv-zero'));
	});

	it('should re-render the knob/bar positions when sliderProps change', () => {
		const {view, sliderProps} = createView(new Interval(20, 80));

		sliderProps.set('max', 200);

		// With max doubled, the same raw value (20..80) maps to a smaller
		// percentage range, verifying onSliderPropsChange_ triggered update_().
		assert.strictEqual(view.knobElements[0].style.left, '10%');
		assert.strictEqual(view.knobElements[1].style.left, '40%');
	});
});
