import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createNumberFormatter} from '../../../common/converter/number.js';
import {initializeBuffer} from '../../../common/model/buffered-value.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {MultiLogController} from './multi-log.js';

describe(MultiLogController.name, () => {
	it('should create a view bound to the given value', () => {
		const doc = createTestWindow().document;
		const value = createValue(initializeBuffer<number>(2));
		const c = new MultiLogController(doc, {
			formatter: createNumberFormatter(0),
			rows: 2,
			value,
			viewProps: ViewProps.create(),
		});

		assert.strictEqual(c.value, value);
		assert.strictEqual(c.view.value, value);
	});
});
