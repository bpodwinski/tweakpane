import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createArcVerticesArray} from './createArcVerticesArray.js';

function closeTo(a: number, b: number, eps = 1e-9): boolean {
	return Math.abs(a - b) < eps;
}

describe('createArcVerticesArray', () => {
	it('should create the requested number of vertices', () => {
		const vertices = createArcVerticesArray(0, Math.PI, 5, 'x', 'y');
		assert.strictEqual(vertices.length, 5);
	});

	it('should place the first and last vertex at thetaStart/thetaStart+thetaLength', () => {
		const vertices = createArcVerticesArray(0, Math.PI, 3, 'x', 'y');
		assert.ok(closeTo(vertices[0].x, 1));
		assert.ok(closeTo(vertices[0].y, 0));
		assert.ok(closeTo(vertices[2].x, -1));
		assert.ok(closeTo(vertices[2].y, 0, 1e-6));
	});

	it('should scale by the given radius', () => {
		const vertices = createArcVerticesArray(0, Math.PI, 3, 'x', 'y', 2);
		assert.ok(closeTo(vertices[0].x, 2));
	});

	it('should write to the requested cos/sin axes', () => {
		const vertices = createArcVerticesArray(0, Math.PI / 2, 2, 'y', 'z');
		assert.ok(closeTo(vertices[0].y, 1));
		assert.ok(closeTo(vertices[0].z, 0));
		assert.ok(closeTo(vertices[0].x, 0));
	});
});
