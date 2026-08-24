import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createAxisEuler} from './createAxisEuler.js';

describe('createAxisEuler', () => {
	it('should derive baseStep/keyScale/pointerScale from digits', () => {
		const axis = createAxisEuler(2, undefined);
		assert.ok(Math.abs(axis.baseStep - 0.01) < 1e-9);
		assert.ok(Math.abs(axis.textProps.get('keyScale') - 0.01) < 1e-9);
		assert.ok(Math.abs(axis.textProps.get('pointerScale') - 0.01) < 1e-9);
	});

	it('should carry through the given constraint', () => {
		const constraint = {} as any;
		const axis = createAxisEuler(0, constraint);
		assert.strictEqual(axis.constraint, constraint);
	});

	it('should format with the requested number of digits', () => {
		const axis = createAxisEuler(3, undefined);
		const formatter = axis.textProps.get('formatter');
		assert.strictEqual(formatter(1.23456), '1.235');
	});
});
