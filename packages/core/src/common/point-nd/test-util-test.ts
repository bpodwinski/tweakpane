import * as assert from 'assert';
import {describe, it} from 'mocha';

import {CompositeConstraint} from '../constraint/composite.js';
import {DefiniteRangeConstraint} from '../constraint/definite-range.js';
import {RangeConstraint} from '../constraint/range.js';
import {StepConstraint} from '../constraint/step.js';
import {getDimensionProps} from './test-util.js';

describe('getDimensionProps', () => {
	it('should read min/max/step from a DefiniteRangeConstraint', () => {
		const c = new CompositeConstraint([
			new DefiniteRangeConstraint({min: 0, max: 10}),
			new StepConstraint(2),
		]);
		assert.deepStrictEqual(getDimensionProps(c), {min: 0, max: 10, step: 2});
	});

	it('should fall back to a plain RangeConstraint for min/max', () => {
		const c = new CompositeConstraint([new RangeConstraint({min: 1, max: 5})]);
		assert.deepStrictEqual(getDimensionProps(c), {
			min: 1,
			max: 5,
			step: undefined,
		});
	});

	it('should return undefined min/max/step when no matching constraint exists', () => {
		const c = new CompositeConstraint<number>([]);
		assert.deepStrictEqual(getDimensionProps(c), {
			min: undefined,
			max: undefined,
			step: undefined,
		});
	});
});
