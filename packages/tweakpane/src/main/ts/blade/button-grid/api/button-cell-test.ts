import {
	ButtonController,
	ButtonPropsObject,
	ValueMap,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {ButtonCellApi} from './button-cell.js';

function createController(doc: Document): ButtonController {
	return new ButtonController(doc, {
		props: ValueMap.fromObject<ButtonPropsObject>({title: 'Click'}),
		viewProps: ViewProps.create(),
	});
}

describe(ButtonCellApi.name, () => {
	it('should get/set disabled through the controller viewProps', () => {
		const doc = createTestWindow().document;
		const c = createController(doc);
		const api = new ButtonCellApi(c);

		assert.strictEqual(api.disabled, false);
		api.disabled = true;
		assert.strictEqual(api.disabled, true);
		assert.strictEqual(c.viewProps.get('disabled'), true);
	});

	it('should get/set title through the controller props', () => {
		const doc = createTestWindow().document;
		const c = createController(doc);
		const api = new ButtonCellApi(c);

		assert.strictEqual(api.title, 'Click');
		api.title = 'Go';
		assert.strictEqual(api.title, 'Go');
		assert.strictEqual(c.props.get('title'), 'Go');
	});

	it('should fall back to an empty string when title is not set', () => {
		const doc = createTestWindow().document;
		const c = new ButtonController(doc, {
			props: ValueMap.fromObject<ButtonPropsObject>({title: undefined}),
			viewProps: ViewProps.create(),
		});
		const api = new ButtonCellApi(c);

		assert.strictEqual(api.title, '');
	});

	it('should invoke the click handler when the button is clicked', () => {
		const doc = createTestWindow().document;
		const c = createController(doc);
		const api = new ButtonCellApi(c);

		let calls = 0;
		api.on('click', () => {
			calls++;
		});

		c.view.buttonElement.dispatchEvent(
			new (doc.defaultView as any).MouseEvent('click', {bubbles: true}),
		);

		assert.strictEqual(calls, 1);
	});
});
