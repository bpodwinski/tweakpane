import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Euler} from './Euler.js';
import {Quaternion} from './Quaternion.js';

function closeTo(a: number, b: number, eps = 1e-6): boolean {
	return Math.abs(a - b) < eps;
}

describe(Euler.name, () => {
	it('should default to zero, XYZ order, radians', () => {
		const e = new Euler();
		assert.deepStrictEqual(e.getComponents(), [0, 0, 0]);
		assert.strictEqual(e.order, 'XYZ');
		assert.strictEqual(e.unit, 'rad');
	});

	it('should convert radians to degrees and back via reunit', () => {
		const e = new Euler(Math.PI, 0, 0, 'XYZ', 'rad');
		const deg = e.reunit('deg');
		assert.ok(closeTo(deg.x, 180));
		assert.ok(closeTo(deg.reunit('rad').x, Math.PI));
	});

	it('should convert radians to turns via reunit', () => {
		const e = new Euler(Math.PI, 0, 0, 'XYZ', 'rad');
		assert.ok(closeTo(e.reunit('turn').x, 0.5));
	});

	it('should return itself unchanged when reordering to the same order', () => {
		const e = new Euler(1, 2, 3, 'XYZ', 'rad');
		assert.strictEqual(e.reorder('XYZ'), e);
	});

	it('should reorder through a quaternion round trip', () => {
		const e = new Euler(0.3, -0.2, 0.4, 'XYZ', 'rad');
		const reordered = e.reorder('ZYX');
		assert.strictEqual(reordered.order, 'ZYX');
		const back = reordered.reorder('XYZ');
		assert.ok(closeTo(back.x, e.x));
		assert.ok(closeTo(back.y, e.y));
		assert.ok(closeTo(back.z, e.z));
	});

	it('should format another Euler by reordering to its own order', () => {
		const target = new Euler(0, 0, 0, 'ZYX', 'rad');
		const source = new Euler(0.1, 0.2, 0.3, 'XYZ', 'rad');
		const formatted = target.format(source);
		assert.strictEqual(formatted.order, 'ZYX');
	});

	it('should format a Quaternion by converting it to its own order/unit', () => {
		const target = new Euler(0, 0, 0, 'XYZ', 'deg');
		const q = new Quaternion();
		const formatted = target.format(q);
		assert.strictEqual(formatted.order, 'XYZ');
		assert.strictEqual(formatted.unit, 'deg');
	});

	it('should expose a quat getter equivalent to Quaternion.fromEuler', () => {
		const e = new Euler(0.1, 0.2, 0.3, 'XYZ', 'rad');
		const q1 = e.quat;
		const q2 = Quaternion.fromEuler(e);
		assert.deepStrictEqual(q1.getComponents(), q2.getComponents());
	});

	it('should sanitize angles via the "two big revolutions" correction branch', () => {
		// This quaternion was found by scanning random unit quaternions for one
		// whose XYZ Euler decomposition needs the |result[i]| + |result[k]| > PI
		// correction in Euler.fromQuaternion (the "two big revolutions" case).
		const q = new Quaternion(
			0.5370980978275935,
			-0.8273102822389948,
			0.1614567459819909,
			0.03185983974414169,
		);
		const e = Euler.fromQuaternion(q, 'XYZ', 'rad');
		assert.ok(Number.isFinite(e.x));
		assert.ok(Number.isFinite(e.y));
		assert.ok(Number.isFinite(e.z));
		// Round-tripping back to a quaternion should represent the same rotation.
		const back = e.quat;
		const dot = Math.abs(
			back.x * q.x + back.y * q.y + back.z * q.z + back.w * q.w,
		);
		assert.ok(closeTo(dot, 1, 1e-4));
	});

	it('should round-trip a "gimbal lock" rotation (y = 90deg)', () => {
		const e = new Euler(0, Math.PI / 2, 0, 'XYZ', 'rad');
		const back = Euler.fromQuaternion(e.quat, 'XYZ', 'rad');
		// Only the combined effect near gimbal lock is guaranteed, not x/z individually.
		assert.ok(closeTo(back.y, Math.PI / 2));
	});

	it('should expose toEuler() as an alias for reorder().reunit()', () => {
		const e = new Euler(0.1, 0.2, 0.3, 'XYZ', 'rad');
		const converted = e.toEuler('ZYX', 'deg');
		const expected = e.reorder('ZYX').reunit('deg');
		assert.ok(closeTo(converted.x, expected.x));
		assert.ok(closeTo(converted.y, expected.y));
		assert.ok(closeTo(converted.z, expected.z));
		assert.strictEqual(converted.order, 'ZYX');
		assert.strictEqual(converted.unit, 'deg');
	});

	describe('Rotation base-class methods (inherited, not overridden by Euler)', () => {
		it('should multiply with the identity as a no-op via the base multiply()', () => {
			const e = new Euler(0.2, -0.3, 0.1, 'XYZ', 'rad');
			const identity = new Euler(0, 0, 0, 'XYZ', 'rad');
			const result = e.multiply(identity) as Euler;
			assert.ok(closeTo(result.x, e.x));
			assert.ok(closeTo(result.y, e.y));
			assert.ok(closeTo(result.z, e.z));
		});

		it('should premultiply via the base premultiply()', () => {
			const e = new Euler(0.2, -0.3, 0.1, 'XYZ', 'rad');
			const identity = new Euler(0, 0, 0, 'XYZ', 'rad');
			const result = e.premultiply(identity) as Euler;
			assert.ok(closeTo(result.x, e.x));
			assert.ok(closeTo(result.y, e.y));
			assert.ok(closeTo(result.z, e.z));
		});

		it('should slerp to the endpoints at t=0 and t=1 via the base slerp()', () => {
			const a = new Euler(0, 0, 0, 'XYZ', 'rad');
			const b = new Euler(0, Math.PI / 2, 0, 'XYZ', 'rad');
			const at0 = a.slerp(b, 0) as Euler;
			const at1 = a.slerp(b, 1) as Euler;
			assert.ok(closeTo(at0.x, a.x) && closeTo(at0.y, a.y));
			assert.ok(closeTo(at1.y, b.y, 1e-4));
		});
	});
});
