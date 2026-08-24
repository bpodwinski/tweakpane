import * as assert from 'assert';
import {describe, it} from 'mocha';

import {PointProjector} from './PointProjector.js';
import {Vector3} from './Vector3.js';

function closeTo(a: number, b: number, eps = 1e-6): boolean {
	return Math.abs(a - b) < eps;
}

describe(PointProjector.name, () => {
	it('should default to a centered perspective camera', () => {
		const p = new PointProjector();
		assert.deepStrictEqual(p.offset, [0, 0, -5]);
		assert.strictEqual(p.fov, 30);
		assert.strictEqual(p.aspect, 1);
		assert.deepStrictEqual(p.viewport, [0, 0, 1, 1]);
	});

	it('should project the origin to the viewport center', () => {
		const p = new PointProjector();
		const [sx, sy] = p.project(new Vector3(0, 0, 0));
		assert.ok(closeTo(sx, 0.5));
		assert.ok(closeTo(sy, 0.5));
	});

	it('should project a point off-center proportionally to its x/y offset', () => {
		const p = new PointProjector();
		p.viewport = [0, 0, 100, 100];
		const [cx, cy] = p.project(new Vector3(0, 0, 0));
		const [sx, sy] = p.project(new Vector3(1, 0, 0));
		assert.ok(sx > cx);
		assert.ok(closeTo(sy, cy));
	});

	it('should flip the Y axis (screen-space down is positive)', () => {
		const p = new PointProjector();
		p.viewport = [0, 0, 100, 100];
		const [, cy] = p.project(new Vector3(0, 0, 0));
		const [, sy] = p.project(new Vector3(0, 1, 0));
		assert.ok(sy < cy);
	});
});
