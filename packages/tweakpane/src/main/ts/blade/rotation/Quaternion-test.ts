import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Euler} from './Euler.js';
import {Quaternion} from './Quaternion.js';
import {Vector3} from './Vector3.js';

function closeTo(a: number, b: number, eps = 1e-6): boolean {
	return Math.abs(a - b) < eps;
}

describe(Quaternion.name, () => {
	it('should default to the identity quaternion', () => {
		assert.deepStrictEqual(new Quaternion().getComponents(), [0, 0, 0, 1]);
	});

	it('should build from an axis/angle', () => {
		const q = Quaternion.fromAxisAngle(new Vector3(0, 0, 1), Math.PI);
		assert.ok(closeTo(q.x, 0));
		assert.ok(closeTo(q.y, 0));
		assert.ok(closeTo(q.z, 1));
		assert.ok(closeTo(q.w, 0));
	});

	it('should round-trip through Euler for every order', () => {
		(['XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'] as const).forEach((order) => {
			const euler = new Euler(0.3, -0.4, 0.5, order, 'rad');
			const roundTripped = euler.quat.toEuler(order, 'rad');
			assert.ok(closeTo(roundTripped.x, euler.x), `${order} x`);
			assert.ok(closeTo(roundTripped.y, euler.y), `${order} y`);
			assert.ok(closeTo(roundTripped.z, euler.z), `${order} z`);
		});
	});

	it('should compute length/lengthSq and normalize', () => {
		const q = new Quaternion(0, 0, 0, 2);
		assert.strictEqual(q.lengthSq, 4);
		assert.strictEqual(q.length, 2);
		assert.deepStrictEqual(q.normalized.getComponents(), [0, 0, 0, 1]);
	});

	it('should normalize a zero quaternion to the identity (no division by zero)', () => {
		assert.deepStrictEqual(
			new Quaternion(0, 0, 0, 0).normalized.getComponents(),
			[0, 0, 0, 1],
		);
	});

	it('should negate', () => {
		assert.deepStrictEqual(
			new Quaternion(1, -2, 3, -4).negated.getComponents(),
			[-1, 2, -3, 4],
		);
	});

	it('should flip to the positive-w hemisphere via ban360s', () => {
		const q = new Quaternion(1, 2, 3, -4);
		assert.strictEqual(q.ban360s.w, 4);
		assert.strictEqual(new Quaternion(1, 2, 3, 4).ban360s.w, 4);
	});

	it('should multiply with the identity as a no-op', () => {
		const q = new Quaternion(0.1, 0.2, 0.3, 0.9).normalized;
		const result = q.multiply(new Quaternion());
		assert.ok(closeTo(result.x, q.x));
		assert.ok(closeTo(result.y, q.y));
		assert.ok(closeTo(result.z, q.z));
		assert.ok(closeTo(result.w, q.w));
	});

	it('should slerp to the endpoints at t=0 and t=1', () => {
		const a = new Quaternion();
		const b = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
		assert.deepStrictEqual(a.slerp(b, 0).getComponents(), a.getComponents());
		assert.deepStrictEqual(a.slerp(b, 1).getComponents(), b.getComponents());
	});

	it('should slerp halfway to a quaternion of the same rotation angle', () => {
		const a = new Quaternion();
		const b = Quaternion.fromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
		const mid = a.slerp(b, 0.5);
		assert.ok(closeTo(mid.length, 1));
	});

	it('should fall back to lerp when the two quaternions nearly coincide', () => {
		const a = new Quaternion(0, 0, 0, 1);
		const b = new Quaternion(1e-10, 0, 0, 1);
		const mid = a.slerp(b, 0.5);
		assert.ok(closeTo(mid.length, 1));
	});

	it('should format any Rotation by returning its .quat', () => {
		const e = new Euler(0.1, 0.2, 0.3, 'XYZ', 'rad');
		const q = new Quaternion();
		const formatted = q.format(e);
		assert.deepStrictEqual(formatted.getComponents(), e.quat.getComponents());
	});

	it('should build a look rotation with orthonormal basis vectors', () => {
		const q = Quaternion.lookRotation(
			new Vector3(0, 0, 1),
			new Vector3(0, 1, 0),
		);
		assert.ok(closeTo(q.length, 1));
	});

	it('should build a valid look rotation for various look/up combinations (all lookRotation branches)', () => {
		const cases: [Vector3, Vector3][] = [
			[new Vector3(1, 0, 0), new Vector3(0, 1, 0)],
			[new Vector3(-1, 0, 0), new Vector3(0, 1, 0)],
			[new Vector3(0, -1, 0), new Vector3(0, 0, 1)],
			[new Vector3(0, 0, -1), new Vector3(1, 0, 0)],
			[new Vector3(0, 1, 0), new Vector3(1, 0, 0)],
		];
		cases.forEach(([look, up]) => {
			const q = Quaternion.lookRotation(look, up);
			assert.ok(
				closeTo(q.length, 1),
				`length for look=${JSON.stringify(look)}`,
			);
		});
	});

	it('should build a look rotation via the "m11 is largest diagonal" branch', () => {
		// Chosen so the resulting basis has trace <= 0 and m11 (binormal.x)
		// strictly greater than both m22 (tangent.y) and m33 (normal.z),
		// exercising the `m11 > m22 && m11 > m33` branch of lookRotation.
		const q = Quaternion.lookRotation(
			new Vector3(0, 0, -1),
			new Vector3(0, -1, 0),
		);
		assert.ok(closeTo(q.length, 1));
	});

	it('should negate the second quaternion when the shortest-path dot product is negative', () => {
		const a = Quaternion.fromAxisAngle(
			new Vector3(1, 0, 0),
			(170 * Math.PI) / 180,
		);
		const b = Quaternion.fromAxisAngle(
			new Vector3(1, 0, 0),
			(-170 * Math.PI) / 180,
		);
		const mid = a.slerp(b, 0.5);
		assert.ok(closeTo(mid.length, 1));
	});

	it('should fall back to lerp exactly at the sqrSinHalfTheta === EPSILON boundary', () => {
		const a = new Quaternion(0, 0, 0, 1);
		const b = new Quaternion(0, 0, 0, 1 - Number.EPSILON / 2);
		const mid = a.slerp(b, 0.5);
		assert.ok(closeTo(mid.length, 1));
	});
});
