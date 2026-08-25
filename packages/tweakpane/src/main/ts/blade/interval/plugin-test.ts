import {
	BindingTarget,
	createValue,
	forceCast,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {IntervalConstraint} from './constraint/interval.js';
import {RangeSliderTextController} from './controller/range-slider-text.js';
import {Interval} from './model/interval.js';
import {IntervalInputPlugin} from './plugin.js';

function accept(exValue: unknown, params: Record<string, unknown>) {
	const result = IntervalInputPlugin.accept(exValue, params);
	if (!result) {
		throw new Error('unexpected null result');
	}
	return result;
}

describe('IntervalInputPlugin', () => {
	it('should accept a value shaped like an interval', () => {
		const result = accept({min: 2, max: 8}, {});
		assert.strictEqual(result.initialValue.min, 2);
		assert.strictEqual(result.initialValue.max, 8);
	});

	it('should reject a value not shaped like an interval', () => {
		const result = IntervalInputPlugin.accept({foo: 1}, {});
		assert.strictEqual(result, null);
	});

	it('should reject a value shaped like an interval with malformed params', () => {
		// `readonly` only accepts the constant `false`; anything else fails
		// parseRecord and takes the `null` branch even though exValue is valid.
		const result = IntervalInputPlugin.accept(
			{min: 2, max: 8},
			{readonly: true},
		);
		assert.strictEqual(result, null);
	});

	it('should build a reader that re-parses the raw exValue', () => {
		const accepted = accept({min: 2, max: 8}, {});
		const reader = IntervalInputPlugin.binding.reader({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'interval'),
		});
		const interval = reader({min: 5, max: 15});
		assert.strictEqual(interval.min, 5);
		assert.strictEqual(interval.max, 15);
	});

	it('should build an IntervalConstraint including a step constraint when step is provided', () => {
		const accepted = accept({min: 2, max: 8}, {min: 0, max: 10, step: 2});
		const constraint = IntervalInputPlugin.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'interval'),
		});
		assert.ok(constraint instanceof IntervalConstraint);
	});

	it('should build an IntervalConstraint from min/max params', () => {
		const accepted = accept({min: 2, max: 8}, {min: 0, max: 10});
		const constraint = IntervalInputPlugin.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'interval'),
		});
		assert.ok(constraint instanceof IntervalConstraint);
	});

	it('should write min/max properties back onto the target', () => {
		const accepted = accept({min: 2, max: 8}, {});
		const writer = IntervalInputPlugin.binding.writer({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'interval'),
		});
		const obj = {min: 0, max: 0};
		writer(new BindingTarget({interval: obj}, 'interval'), new Interval(2, 8));
		assert.deepStrictEqual(obj, {min: 2, max: 8});
	});

	it('should build a RangeSliderTextController when min/max define a bounded range', () => {
		const accepted = accept({min: 2, max: 8}, {min: 0, max: 10});
		const doc = createTestWindow().document;
		const constraint = IntervalInputPlugin.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'interval'),
		});

		const controller = IntervalInputPlugin.controller({
			document: doc,
			initialValue: accepted.initialValue,
			value: createValue(
				new Interval(accepted.initialValue.min, accepted.initialValue.max),
			),
			constraint,
			params: accepted.params,
			viewProps: ViewProps.create(),
		});

		assert.ok(controller instanceof RangeSliderTextController);
	});

	it('should build a PointNdTextController when there is no bounded range', () => {
		const accepted = accept({min: 2, max: 8}, {});
		const doc = createTestWindow().document;
		const constraint = IntervalInputPlugin.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'interval'),
		});

		const controller = IntervalInputPlugin.controller({
			document: doc,
			initialValue: accepted.initialValue,
			value: createValue(
				new Interval(accepted.initialValue.min, accepted.initialValue.max),
			),
			constraint,
			params: accepted.params,
			viewProps: ViewProps.create(),
		});

		assert.ok(!(controller instanceof RangeSliderTextController));
		assert.ok(controller.view.element);
	});

	it('should throw when controller() is given a non-IntervalConstraint constraint', () => {
		const accepted = accept({min: 2, max: 8}, {});
		const doc = createTestWindow().document;

		assert.throws(() => {
			IntervalInputPlugin.controller({
				document: doc,
				initialValue: accepted.initialValue,
				value: createValue(
					new Interval(accepted.initialValue.min, accepted.initialValue.max),
				),
				constraint: forceCast({}),
				params: accepted.params,
				viewProps: ViewProps.create(),
			});
		});
	});
});
