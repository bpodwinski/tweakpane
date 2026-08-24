import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createAxisQuaternion} from './createAxisQuaternion.js';

describe('createAxisQuaternion', () => {
	it('should set baseStep/keyScale/pointerScale to 0.01', () => {
		const axis = createAxisQuaternion(undefined);
		assert.strictEqual(axis.baseStep, 0.01);
		assert.strictEqual(axis.textProps.get('keyScale'), 0.01);
		assert.strictEqual(axis.textProps.get('pointerScale'), 0.01);
	});

	it('should carry through the given constraint', () => {
		const constraint = {} as any;
		const axis = createAxisQuaternion(constraint);
		assert.strictEqual(axis.constraint, constraint);
	});

	it('should format values close to 1 with 1 decimal', () => {
		const formatter =
			createAxisQuaternion(undefined).textProps.get('formatter');
		assert.strictEqual(formatter(0.999), '1.0');
		assert.strictEqual(formatter(-0.999), '-1.0');
	});

	it('should format smaller values with 2 decimals, stripping the leading 0', () => {
		const formatter =
			createAxisQuaternion(undefined).textProps.get('formatter');
		assert.strictEqual(formatter(0.5), '.50');
		assert.strictEqual(formatter(0), '.00');
	});
});
