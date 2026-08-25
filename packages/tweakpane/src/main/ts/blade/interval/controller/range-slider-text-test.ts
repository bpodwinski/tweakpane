import * as assert from 'assert';
import {describe, it} from 'mocha';
import {
	createNumberFormatter,
	createValue,
	NumberTextPropsObject,
	parseNumber,
	SliderPropsObject,
	ValueMap,
	ViewProps,
} from 'tweakpane-reborn-core';

import {createTestWindow} from '../../../misc/test-util.js';
import {Interval} from '../model/interval.js';
import {RangeSliderTextController} from './range-slider-text.js';

function createController(doc: Document) {
	const value = createValue(new Interval(20, 80));
	const c = new RangeSliderTextController(doc, {
		constraint: undefined,
		parser: parseNumber,
		sliderProps: ValueMap.fromObject<SliderPropsObject>({
			keyScale: 1,
			max: 100,
			min: 0,
		}),
		textProps: ValueMap.fromObject<NumberTextPropsObject>({
			formatter: createNumberFormatter(0),
			keyScale: 1,
			pointerScale: 1,
		}),
		value,
		viewProps: ViewProps.create(),
	});
	return {c, value};
}

describe(RangeSliderTextController.name, () => {
	it('should render a slider element and 2 text inputs', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc);

		assert.ok(c.view.element.querySelector('.tp-rslv'));
		assert.strictEqual(c.view.element.querySelectorAll('input').length, 2);
	});

	it('should expose the text controller for the min/max inputs', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc);

		assert.strictEqual(c.textController.view.textViews.length, 2);
	});

	it('should update the value when a text input changes', () => {
		const doc = createTestWindow().document;
		const {c, value} = createController(doc);
		const winRef = doc.defaultView as any;

		const input = c.textController.view.textViews[0].inputElement;
		input.value = '30';
		input.dispatchEvent(new winRef.Event('change', {bubbles: true}));

		assert.strictEqual(value.rawValue.min, 30);
	});
});
