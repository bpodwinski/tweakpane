import {createValue, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {Quaternion} from './Quaternion.js';
import {RotationInputSwatchController} from './RotationInputSwatchController.js';

describe(RotationInputSwatchController.name, () => {
	it('should create a view bound to the given value', () => {
		const doc = createTestWindow().document;
		const value = createValue(new Quaternion());
		const c = new RotationInputSwatchController(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		assert.strictEqual(c.value, value);
		assert.strictEqual(c.view.value, value);
	});
});
