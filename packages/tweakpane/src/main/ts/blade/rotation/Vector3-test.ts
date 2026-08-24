import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Quaternion} from './Quaternion.js';
import {Vector3} from './Vector3.js';

function closeTo(a: number, b: number, eps = 1e-9): boolean {
	return Math.abs(a - b) < eps;
}

describe(Vector3.name, () => {
	it('should default to (0, 0, 0)', () => {
		assert.deepStrictEqual(new Vector3().getComponents(), [0, 0, 0]);
	});

	it('should compute length and lengthSq', () => {
		const v = new Vector3(3, 4, 0);
		assert.strictEqual(v.lengthSq, 25);
		assert.strictEqual(v.length, 5);
	});

	it('should normalize to unit length', () => {
		const v = new Vector3(3, 4, 0).normalized;
		assert.ok(closeTo(v.length, 1));
	});

	it('should normalize a zero vector to itself (no division by zero)', () => {
		const v = new Vector3().normalized;
		assert.deepStrictEqual(v.getComponents(), [0, 0, 0]);
	});

	it('should negate', () => {
		assert.deepStrictEqual(
			new Vector3(1, -2, 3).negated.getComponents(),
			[-1, 2, -3],
		);
	});

	it('should add/sub/scale', () => {
		const a = new Vector3(1, 2, 3);
		const b = new Vector3(4, 5, 6);
		assert.deepStrictEqual(a.add(b).getComponents(), [5, 7, 9]);
		assert.deepStrictEqual(b.sub(a).getComponents(), [3, 3, 3]);
		assert.deepStrictEqual(a.scale(2).getComponents(), [2, 4, 6]);
	});

	it('should compute dot product', () => {
		assert.strictEqual(new Vector3(1, 2, 3).dot(new Vector3(4, 5, 6)), 32);
	});

	it('should compute cross product', () => {
		const x = new Vector3(1, 0, 0);
		const y = new Vector3(0, 1, 0);
		assert.deepStrictEqual(x.cross(y).getComponents(), [0, 0, 1]);
	});

	it('should orthonormalize against a non-parallel tangent', () => {
		const {normal, tangent, binormal} = new Vector3(0, 0, 1).orthoNormalize(
			new Vector3(1, 0, 0),
		);
		assert.ok(closeTo(normal.length, 1));
		assert.ok(closeTo(tangent.length, 1));
		assert.ok(closeTo(binormal.length, 1));
		assert.ok(closeTo(normal.dot(tangent), 0));
	});

	it('should orthonormalize even when the tangent is parallel to the normal', () => {
		const {normal, tangent} = new Vector3(0, 0, 1).orthoNormalize(
			new Vector3(0, 0, 1),
		);
		assert.ok(closeTo(normal.dot(tangent), 0));
	});

	it('should leave a vector unchanged under an identity quaternion', () => {
		const v = new Vector3(1, 2, 3).applyQuaternion(new Quaternion());
		assert.ok(closeTo(v.x, 1));
		assert.ok(closeTo(v.y, 2));
		assert.ok(closeTo(v.z, 3));
	});

	it('should rotate a vector 90deg around Z', () => {
		const q = Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
		const v = new Vector3(1, 0, 0).applyQuaternion(q);
		assert.ok(closeTo(v.x, 0, 1e-6));
		assert.ok(closeTo(v.y, 1, 1e-6));
		assert.ok(closeTo(v.z, 0, 1e-6));
	});
});
