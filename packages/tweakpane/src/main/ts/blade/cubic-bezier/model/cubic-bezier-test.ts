import * as assert from 'assert';
import {describe, it} from 'mocha';

import {CubicBezier, CubicBezierAssembly} from './cubic-bezier.js';

describe(CubicBezier.name, () => {
	it('should default to (0, 0, 1, 1)', () => {
		const cb = new CubicBezier();
		assert.deepStrictEqual(cb.toObject(), [0, 0, 1, 1]);
	});

	it('should expose x1/y1/x2/y2 getters', () => {
		const cb = new CubicBezier(0.1, 0.2, 0.3, 0.4);
		assert.strictEqual(cb.x1, 0.1);
		assert.strictEqual(cb.y1, 0.2);
		assert.strictEqual(cb.x2, 0.3);
		assert.strictEqual(cb.y2, 0.4);
	});

	it('should curve from (0,0) to (1,1) at t=0/t=1', () => {
		const cb = new CubicBezier(0.2, 0.8, 0.6, 0.1);
		assert.deepStrictEqual(cb.curve(0), [0, 0]);
		assert.deepStrictEqual(cb.curve(1), [1, 1]);
	});

	it('should compute y(0)=0 and y(1)=1 for the identity-ish curve', () => {
		const cb = new CubicBezier(0.5, 0.5, 0.5, 0.5);
		assert.ok(Math.abs(cb.y(0)) < 0.05);
		assert.ok(Math.abs(cb.y(1) - 1) < 0.05);
	});

	it('should cache the y() lookup table across repeated calls', () => {
		const cb = new CubicBezier(0.25, 0.1, 0.25, 1);
		const first = cb.y(0.5);
		const second = cb.y(0.5);
		assert.strictEqual(first, second);
	});

	describe('isObject', () => {
		it('should accept a 4-number array', () => {
			assert.strictEqual(CubicBezier.isObject([0, 0.5, 0.5, 1]), true);
		});

		it('should reject non-arrays and empty values', () => {
			assert.strictEqual(CubicBezier.isObject(undefined), false);
			assert.strictEqual(CubicBezier.isObject(null), false);
			assert.strictEqual(CubicBezier.isObject('foo'), false);
		});

		it('should reject an array with a non-number component', () => {
			assert.strictEqual(CubicBezier.isObject([0, 0.5, 0.5, '1']), false);
		});
	});

	describe('equals', () => {
		it('should be true for equal components', () => {
			assert.strictEqual(
				CubicBezier.equals(
					new CubicBezier(0.1, 0.2, 0.3, 0.4),
					new CubicBezier(0.1, 0.2, 0.3, 0.4),
				),
				true,
			);
		});

		it('should be false when any component differs', () => {
			assert.strictEqual(
				CubicBezier.equals(
					new CubicBezier(0.1, 0.2, 0.3, 0.4),
					new CubicBezier(0.1, 0.2, 0.3, 0.5),
				),
				false,
			);
		});
	});
});

describe('CubicBezierAssembly', () => {
	it('should convert a CubicBezier to its raw components', () => {
		const cb = new CubicBezier(0.1, 0.2, 0.3, 0.4);
		assert.deepStrictEqual(
			CubicBezierAssembly.toComponents(cb),
			[0.1, 0.2, 0.3, 0.4],
		);
	});

	it('should build a CubicBezier from raw components', () => {
		const cb = CubicBezierAssembly.fromComponents([0.1, 0.2, 0.3, 0.4]);
		assert.deepStrictEqual(cb.toObject(), [0.1, 0.2, 0.3, 0.4]);
	});
});
