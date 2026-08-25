import * as assert from 'assert';
import {describe, it} from 'mocha';

import {RangeConstraint} from '../constraint/range.js';
import {ComplexValue} from './complex-value.js';

describe(ComplexValue.name, () => {
	it('should hold the initial value', () => {
		const v = new ComplexValue(1);
		assert.strictEqual(v.rawValue, 1);
	});

	it('should apply the constraint on set', () => {
		const v = new ComplexValue(0, {
			constraint: new RangeConstraint({min: 0, max: 10}),
		});
		v.rawValue = 20;
		assert.strictEqual(v.rawValue, 10);
	});

	it('should use a custom equals to skip no-op changes', () => {
		let changeCount = 0;
		const v = new ComplexValue(
			{x: 1},
			{
				equals: (a, b) => a.x === b.x,
			},
		);
		v.emitter.on('change', () => {
			changeCount++;
		});

		v.rawValue = {x: 1};
		assert.strictEqual(changeCount, 0);

		v.rawValue = {x: 2};
		assert.strictEqual(changeCount, 1);
	});

	it('should emit change even for a no-op value when forceEmit is true', () => {
		let changeCount = 0;
		const v = new ComplexValue(1);
		v.emitter.on('change', () => {
			changeCount++;
		});

		v.setRawValue(1, {forceEmit: true, last: true});
		assert.strictEqual(changeCount, 1);
	});

	it('should not emit change for a no-op value without forceEmit', () => {
		let changeCount = 0;
		const v = new ComplexValue(1);
		v.emitter.on('change', () => {
			changeCount++;
		});

		v.setRawValue(1, {forceEmit: false, last: true});
		assert.strictEqual(changeCount, 0);
	});

	it('should default options when setRawValue is called without them', () => {
		let changeCount = 0;
		const v = new ComplexValue(1);
		v.emitter.on('change', () => {
			changeCount++;
		});

		v.setRawValue(2);
		assert.strictEqual(changeCount, 1);
		assert.strictEqual(v.rawValue, 2);
	});

	it('should expose the constraint via the getter', () => {
		const constraint = new RangeConstraint({min: 0, max: 10});
		const v = new ComplexValue(0, {constraint});
		assert.strictEqual(v.constraint, constraint);
	});
});
