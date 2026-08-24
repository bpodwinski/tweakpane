import * as assert from 'assert';
import {describe, it} from 'mocha';

import {parseEuler} from './parseEuler.js';
import {parseEulerOrder} from './parseEulerOrder.js';
import {parseEulerUnit} from './parseEulerUnit.js';
import {parseQuaternion} from './parseQuaternion.js';
import {parseRotationKeys} from './parseRotationKeys.js';

describe('parseEulerOrder', () => {
	it('should accept all 6 valid orders', () => {
		['XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'].forEach((order) => {
			assert.strictEqual(parseEulerOrder(order), order);
		});
	});

	it('should return undefined for an invalid order', () => {
		assert.strictEqual(parseEulerOrder('XYZW'), undefined);
		assert.strictEqual(parseEulerOrder(undefined), undefined);
	});
});

describe('parseEulerUnit', () => {
	it('should accept rad/deg/turn', () => {
		['rad', 'deg', 'turn'].forEach((unit) => {
			assert.strictEqual(parseEulerUnit(unit), unit);
		});
	});

	it('should return undefined for an invalid unit', () => {
		assert.strictEqual(parseEulerUnit('grad'), undefined);
	});
});

describe('parseRotationKeys', () => {
	it('should return undefined for non-object input', () => {
		assert.strictEqual(parseRotationKeys(undefined), undefined);
		assert.strictEqual(parseRotationKeys(null), undefined);
		assert.strictEqual(parseRotationKeys('foo'), undefined);
	});

	it('should pick only string-valued x/y/z/w keys', () => {
		assert.deepStrictEqual(
			parseRotationKeys({x: 'rx', y: 'ry', z: 42, extra: 'ignored'}),
			{x: 'rx', y: 'ry'},
		);
	});

	it('should return an empty object when nothing matches', () => {
		assert.deepStrictEqual(parseRotationKeys({}), {});
	});
});

describe('parseEuler', () => {
	it('should read x/y/z from the default keys', () => {
		const euler = parseEuler({x: 1, y: 2, z: 3}, 'XYZ', 'rad');
		assert.deepStrictEqual(euler.getComponents(), [1, 2, 3]);
		assert.strictEqual(euler.order, 'XYZ');
		assert.strictEqual(euler.unit, 'rad');
	});

	it('should read x/y/z from custom keys', () => {
		const euler = parseEuler({rx: 1, ry: 2, rz: 3}, 'XYZ', 'rad', {
			x: 'rx',
			y: 'ry',
			z: 'rz',
		});
		assert.deepStrictEqual(euler.getComponents(), [1, 2, 3]);
	});

	it('should fall back to zero when the value is malformed', () => {
		const euler = parseEuler({x: 1, y: 2}, 'XYZ', 'rad');
		assert.deepStrictEqual(euler.getComponents(), [0, 0, 0]);
	});
});

describe('parseQuaternion', () => {
	it('should read x/y/z/w from the default keys', () => {
		const quat = parseQuaternion({x: 1, y: 2, z: 3, w: 4});
		assert.deepStrictEqual(quat.getComponents(), [1, 2, 3, 4]);
	});

	it('should read x/y/z/w from custom keys', () => {
		const quat = parseQuaternion(
			{qx: 1, qy: 2, qz: 3, qw: 4},
			{x: 'qx', y: 'qy', z: 'qz', w: 'qw'},
		);
		assert.deepStrictEqual(quat.getComponents(), [1, 2, 3, 4]);
	});

	it('should fall back to identity when the value is malformed', () => {
		const quat = parseQuaternion({x: 1, y: 2, z: 3});
		assert.deepStrictEqual(quat.getComponents(), [0, 0, 0, 1]);
	});
});
