import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createArcRotation} from './createArcRotation.js';
import {Vector3} from './Vector3.js';

describe('createArcRotation', () => {
	it('should return the front-z-positive shortcut quaternion when axis.z is ~1', () => {
		const q = createArcRotation(new Vector3(0, 0, 1), new Vector3(0, 0, 1));
		assert.deepStrictEqual(q.getComponents(), [0, 0, 0, 1]);
	});

	it('should return the front-z-negative shortcut quaternion when axis.z is ~-1', () => {
		const q = createArcRotation(new Vector3(0, 0, -1), new Vector3(0, 0, -1));
		assert.deepStrictEqual(q.getComponents(), [0, 0, 1, 0]);
	});

	it('should use lookRotation when axis.z is not close to +-1', () => {
		const q = createArcRotation(new Vector3(1, 0, 0), new Vector3(0, 0, 1));
		assert.ok(Math.abs(q.length - 1) < 1e-9);
	});
});
