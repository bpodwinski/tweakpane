import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createDimensionConstraint} from './createDimensionConstraint.js';

describe('createDimensionConstraint', () => {
	it('should return undefined when no params are given', () => {
		assert.strictEqual(createDimensionConstraint(undefined), undefined);
	});

	it('should constrain to a step', () => {
		const c = createDimensionConstraint({step: 0.5});
		assert.strictEqual(c?.constrain(1.24), 1);
	});

	it('should constrain to a min/max range', () => {
		const c = createDimensionConstraint({min: 0, max: 10});
		assert.strictEqual(c?.constrain(-5), 0);
		assert.strictEqual(c?.constrain(50), 10);
	});

	it('should apply both step and range constraints together', () => {
		const c = createDimensionConstraint({step: 2, min: 0, max: 10});
		assert.strictEqual(c?.constrain(11), 10);
		assert.strictEqual(c?.constrain(3), 4);
	});

	it('should be a no-op when params has neither step nor min/max', () => {
		const c = createDimensionConstraint({});
		assert.strictEqual(c?.constrain(3.7), 3.7);
	});
});
