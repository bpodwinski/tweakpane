import * as assert from 'assert';
import {describe, it} from 'mocha';

import {CubicBezier} from '../model/cubic-bezier.js';
import {cubicBezierFromString, cubicBezierToString} from './cubic-bezier.js';

describe('cubicBezierToString', () => {
	it('should format as a CSS cubic-bezier() function', () => {
		const cb = new CubicBezier(0.2, 0.8, 0.6, 0.1);
		assert.strictEqual(
			cubicBezierToString(cb),
			'cubic-bezier(0.20, 0.80, 0.60, 0.10)',
		);
	});
});

describe('cubicBezierFromString', () => {
	it('should parse a well-formed cubic-bezier() string', () => {
		const cb = cubicBezierFromString('cubic-bezier(0.2, 0.8, 0.6, 0.1)');
		assert.deepStrictEqual(cb.toObject(), [0.2, 0.8, 0.6, 0.1]);
	});

	it('should tolerate irregular whitespace', () => {
		const cb = cubicBezierFromString('cubic-bezier( 0.2,0.8 , 0.6,  0.1 )');
		assert.deepStrictEqual(cb.toObject(), [0.2, 0.8, 0.6, 0.1]);
	});

	it('should fall back to the default curve for a malformed string', () => {
		const cb = cubicBezierFromString('not-a-bezier');
		assert.deepStrictEqual(cb.toObject(), [0, 0.5, 0.5, 1]);
	});

	it('should round-trip through toString/fromString', () => {
		const original = new CubicBezier(0.25, 0.1, 0.25, 1);
		const roundTripped = cubicBezierFromString(cubicBezierToString(original));
		assert.deepStrictEqual(roundTripped.toObject(), original.toObject());
	});
});
