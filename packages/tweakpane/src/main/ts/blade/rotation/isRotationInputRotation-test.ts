import * as assert from 'assert';
import {describe, it} from 'mocha';

import {isRotationInputRotation} from './isRotationInputRotation.js';

describe('isRotationInputRotation', () => {
	it('should accept an object with numeric x/y/z/w', () => {
		assert.strictEqual(isRotationInputRotation({x: 0, y: 0, z: 0, w: 1}), true);
	});

	it('should reject non-objects', () => {
		assert.strictEqual(isRotationInputRotation(undefined), false);
		assert.strictEqual(isRotationInputRotation(null), false);
		assert.strictEqual(isRotationInputRotation(42), false);
		assert.strictEqual(isRotationInputRotation('foo'), false);
	});

	it('should reject an object missing a component', () => {
		assert.strictEqual(isRotationInputRotation({x: 0, y: 0, z: 0}), false);
	});

	it('should reject an object with a non-numeric component', () => {
		assert.strictEqual(
			isRotationInputRotation({x: 0, y: 0, z: 0, w: '1'}),
			false,
		);
	});
});
