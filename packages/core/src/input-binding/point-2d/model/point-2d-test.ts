import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Point2d} from './point-2d.js';

describe(Point2d.name, () => {
	it('should default to (0, 0)', () => {
		assert.deepStrictEqual(new Point2d().getComponents(), [0, 0]);
	});

	describe('isObject', () => {
		it('should accept an object with numeric x/y', () => {
			assert.strictEqual(Point2d.isObject({x: 1, y: 2}), true);
		});

		it('should reject empty values', () => {
			assert.strictEqual(Point2d.isObject(undefined), false);
			assert.strictEqual(Point2d.isObject(null), false);
		});

		it('should reject an object with a non-number component', () => {
			assert.strictEqual(Point2d.isObject({x: 1, y: '2'}), false);
		});
	});

	describe('equals', () => {
		it('should be true for equal points', () => {
			assert.strictEqual(
				Point2d.equals(new Point2d(1, 2), new Point2d(1, 2)),
				true,
			);
		});

		it('should be false for differing points', () => {
			assert.strictEqual(
				Point2d.equals(new Point2d(1, 2), new Point2d(1, 3)),
				false,
			);
		});
	});

	it('should convert to a plain object', () => {
		assert.deepStrictEqual(new Point2d(1, 2).toObject(), {x: 1, y: 2});
	});
});
