import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createNumberFormatter} from '../../../common/converter/number.js';
import {
	createPushedBuffer,
	initializeBuffer,
} from '../../../common/model/buffered-value.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {MultiLogView} from './multi-log.js';

describe(MultiLogView.name, () => {
	it('should render initial (empty) buffer as an empty textarea', () => {
		const doc = createTestWindow().document;
		const value = createValue(initializeBuffer<number>(3));
		const view = new MultiLogView(doc, {
			formatter: createNumberFormatter(1),
			rows: 3,
			value,
			viewProps: ViewProps.create(),
		});

		const textarea = view.element.querySelector('textarea');
		assert.strictEqual(textarea?.textContent, '');
	});

	it('should render pushed values formatted, one per line', () => {
		const doc = createTestWindow().document;
		const value = createValue(initializeBuffer<number>(3));
		const view = new MultiLogView(doc, {
			formatter: createNumberFormatter(1),
			rows: 3,
			value,
			viewProps: ViewProps.create(),
		});

		value.rawValue = createPushedBuffer(value.rawValue, 1);
		value.rawValue = createPushedBuffer(value.rawValue, 2.5);

		const textarea = view.element.querySelector('textarea');
		assert.strictEqual(textarea?.textContent, '1.0\n2.5');
	});
});
