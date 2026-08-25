import * as assert from 'assert';
import {describe, it} from 'mocha';

import {parseEuler} from './parseEuler.js';

describe('parseEuler', () => {
	it('should read x/y/z from a well-formed object', () => {
		const e = parseEuler({x: 1, y: 2, z: 3}, 'XYZ', 'rad');
		assert.strictEqual(e.x, 1);
		assert.strictEqual(e.y, 2);
		assert.strictEqual(e.z, 3);
		assert.strictEqual(e.order, 'XYZ');
		assert.strictEqual(e.unit, 'rad');
	});

	it('should fall back to (0, 0, 0) for a malformed value', () => {
		const e = parseEuler({x: 1, y: 2}, 'XYZ', 'rad');
		assert.strictEqual(e.x, 0);
		assert.strictEqual(e.y, 0);
		assert.strictEqual(e.z, 0);
	});

	it('should fall back to (0, 0, 0) for a non-numeric component', () => {
		const e = parseEuler({x: 1, y: 2, z: 'nope'}, 'XYZ', 'rad');
		assert.strictEqual(e.x, 0);
		assert.strictEqual(e.y, 0);
		assert.strictEqual(e.z, 0);
	});

	it('should use custom key names when provided', () => {
		const e = parseEuler({a: 1, b: 2, c: 3}, 'XYZ', 'rad', {
			x: 'a',
			y: 'b',
			z: 'c',
		});
		assert.strictEqual(e.x, 1);
		assert.strictEqual(e.y, 2);
		assert.strictEqual(e.z, 3);
	});

	it('should fall back to (0, 0, 0) for a nullish value', () => {
		const e = parseEuler(undefined, 'XYZ', 'rad');
		assert.strictEqual(e.x, 0);
		assert.strictEqual(e.y, 0);
		assert.strictEqual(e.z, 0);
	});

	it('should fall back to the default key name for keys left unset in a partial keys object', () => {
		const e = parseEuler({x: 1, y: 2, z: 3}, 'XYZ', 'rad', {x: 'x'});
		assert.strictEqual(e.x, 1);
		assert.strictEqual(e.y, 2);
		assert.strictEqual(e.z, 3);
	});
});
