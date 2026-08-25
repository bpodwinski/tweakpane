import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Quaternion} from './Quaternion.js';
import {QuaternionAssembly} from './QuaternionAssembly.js';

describe('QuaternionAssembly', () => {
	it('should convert a quaternion to its [x, y, z, w] components', () => {
		const q = new Quaternion(1, 2, 3, 4);
		assert.deepStrictEqual(QuaternionAssembly.toComponents(q), [1, 2, 3, 4]);
	});

	it('should build a quaternion from [x, y, z, w] components', () => {
		const q = QuaternionAssembly.fromComponents([1, 2, 3, 4]);
		assert.strictEqual(q.x, 1);
		assert.strictEqual(q.y, 2);
		assert.strictEqual(q.z, 3);
		assert.strictEqual(q.w, 4);
	});
});
