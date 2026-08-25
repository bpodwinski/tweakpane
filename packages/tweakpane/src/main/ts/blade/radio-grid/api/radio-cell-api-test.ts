import {ValueMap, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {RadioController} from '../controller/radio.js';
import {RadioPropsObject} from '../view/radio.js';
import {RadioCellApi} from './radio-cell-api.js';

function createController(doc: Document): RadioController {
	return new RadioController(doc, {
		name: 'group',
		props: ValueMap.fromObject({title: 'A'}),
		viewProps: ViewProps.create(),
	});
}

describe(RadioCellApi.name, () => {
	it('should get/set disabled through the controller viewProps', () => {
		const doc = createTestWindow().document;
		const c = createController(doc);
		const api = new RadioCellApi(c);

		assert.strictEqual(api.disabled, false);
		api.disabled = true;
		assert.strictEqual(api.disabled, true);
		assert.strictEqual(c.viewProps.get('disabled'), true);
	});

	it('should get/set title through the controller props', () => {
		const doc = createTestWindow().document;
		const c = createController(doc);
		const api = new RadioCellApi(c);

		assert.strictEqual(api.title, 'A');
		api.title = 'B';
		assert.strictEqual(api.title, 'B');
		assert.strictEqual(c.props.get('title'), 'B');
	});

	it('should fall back to an empty string when title is not set', () => {
		const doc = createTestWindow().document;
		const c = new RadioController(doc, {
			name: 'group',
			props: ValueMap.fromObject({
				title: undefined,
			} as unknown as RadioPropsObject),
			viewProps: ViewProps.create(),
		});
		const api = new RadioCellApi(c);

		assert.strictEqual(api.title, '');
	});
});
