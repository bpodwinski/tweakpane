import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {CheckboxController} from './checkbox.js';

describe(CheckboxController.name, () => {
	it('should update the value when the input is checked', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue(false);
		const c = new CheckboxController(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		c.view.inputElement.checked = true;
		c.view.inputElement.dispatchEvent(
			new (win as any).Event('change', {bubbles: true, cancelable: true}),
		);

		assert.strictEqual(value.rawValue, true);
	});
});
