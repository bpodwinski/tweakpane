import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createDimensionConstraint, parsePointDimensionParams} from './util.js';

describe('parsePointDimensionParams', () => {
	it('should parse a record value', () => {
		const result = parsePointDimensionParams({min: 0, max: 10});
		assert.strictEqual(result?.min, 0);
		assert.strictEqual(result?.max, 10);
	});

	it('should return undefined for a non-record value', () => {
		assert.strictEqual(parsePointDimensionParams('foo'), undefined);
		assert.strictEqual(parsePointDimensionParams(42), undefined);
	});
});

describe('createDimensionConstraint', () => {
	it('should return undefined when params is undefined', () => {
		assert.strictEqual(createDimensionConstraint(undefined, 0), undefined);
	});

	it('should build a constraint from step/range params', () => {
		const c = createDimensionConstraint({step: 2, min: 0, max: 10}, 0);
		assert.ok(c);
		assert.strictEqual(c?.constrain(11), 10);
	});
});
