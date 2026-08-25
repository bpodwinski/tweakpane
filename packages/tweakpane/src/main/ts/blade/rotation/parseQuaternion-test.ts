import * as assert from 'assert';
import {describe, it} from 'mocha';

import {parseQuaternion} from './parseQuaternion.js';

describe('parseQuaternion', () => {
	it('should read x/y/z/w from a well-formed object', () => {
		const q = parseQuaternion({x: 1, y: 2, z: 3, w: 4});
		assert.strictEqual(q.x, 1);
		assert.strictEqual(q.y, 2);
		assert.strictEqual(q.z, 3);
		assert.strictEqual(q.w, 4);
	});

	it('should fall back to the identity quaternion for a malformed value', () => {
		const q = parseQuaternion({x: 1, y: 2, z: 3});
		assert.strictEqual(q.x, 0);
		assert.strictEqual(q.y, 0);
		assert.strictEqual(q.z, 0);
		assert.strictEqual(q.w, 1);
	});

	it('should fall back to the identity quaternion for a non-numeric component', () => {
		const q = parseQuaternion({x: 1, y: 2, z: 3, w: 'nope'});
		assert.strictEqual(q.x, 0);
		assert.strictEqual(q.y, 0);
		assert.strictEqual(q.z, 0);
		assert.strictEqual(q.w, 1);
	});

	it('should use custom key names when provided', () => {
		const q = parseQuaternion(
			{a: 1, b: 2, c: 3, d: 4},
			{x: 'a', y: 'b', z: 'c', w: 'd'},
		);
		assert.strictEqual(q.x, 1);
		assert.strictEqual(q.y, 2);
		assert.strictEqual(q.z, 3);
		assert.strictEqual(q.w, 4);
	});

	it('should fall back to the identity quaternion for a nullish value', () => {
		const q = parseQuaternion(undefined);
		assert.strictEqual(q.x, 0);
		assert.strictEqual(q.y, 0);
		assert.strictEqual(q.z, 0);
		assert.strictEqual(q.w, 1);
	});

	it('should fall back to the default key name for keys left unset in a partial keys object', () => {
		const q = parseQuaternion({x: 1, y: 2, z: 3, w: 4}, {x: 'x'});
		assert.strictEqual(q.x, 1);
		assert.strictEqual(q.y, 2);
		assert.strictEqual(q.z, 3);
		assert.strictEqual(q.w, 4);
	});
});
