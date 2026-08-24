import {RangeConstraint} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Interval} from '../model/interval.js';
import {IntervalConstraint} from './interval.js';

describe(IntervalConstraint.name, () => {
	it('should pass through min/max unchanged when there is no edge constraint', () => {
		const c = new IntervalConstraint();
		const result = c.constrain(new Interval(2, 8));
		assert.strictEqual(result.min, 2);
		assert.strictEqual(result.max, 8);
	});

	it('should collapse to the midpoint when min > max', () => {
		const c = new IntervalConstraint();
		const result = c.constrain(new Interval(8, 2));
		assert.strictEqual(result.min, 5);
		assert.strictEqual(result.max, 5);
	});

	it('should apply the edge constraint to min and max independently', () => {
		const c = new IntervalConstraint(new RangeConstraint({min: 0, max: 10}));
		const result = c.constrain(new Interval(-5, 15));
		assert.strictEqual(result.min, 0);
		assert.strictEqual(result.max, 10);
	});

	it('should apply the edge constraint to the collapsed midpoint', () => {
		const c = new IntervalConstraint(new RangeConstraint({min: 0, max: 10}));
		const result = c.constrain(new Interval(20, 16));
		assert.strictEqual(result.min, 10);
		assert.strictEqual(result.max, 10);
	});
});
