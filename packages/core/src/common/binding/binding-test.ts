import * as assert from 'assert';
import {describe, it} from 'mocha';

import {isBinding} from './binding.js';
import {BindingTarget} from './target.js';

describe('isBinding', () => {
	it('should return true for a value with a target property', () => {
		assert.strictEqual(isBinding({target: new BindingTarget({}, 'foo')}), true);
	});

	it('should return false for a non-object value', () => {
		assert.strictEqual(isBinding(null), false);
		assert.strictEqual(isBinding('foo'), false);
	});

	it('should return false for an object without a target property', () => {
		assert.strictEqual(isBinding({}), false);
	});
});
