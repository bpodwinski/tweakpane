import * as assert from 'assert';
import {describe, it} from 'mocha';

import {
	createEmptyBladeController,
	createEmptyLabelableController,
	createLabeledValueBladeController,
	createTestWindow,
} from './test-util.js';

describe('test-util', () => {
	it('should build a controller with an empty, labelable, disposable view', () => {
		const doc = createTestWindow().document;
		const c = createEmptyLabelableController(doc);
		assert.ok(c.view.element);
		assert.strictEqual(c.viewProps.get('disposed'), false);
	});

	it('should build an empty BladeController wrapping a PlainView', () => {
		const doc = createTestWindow().document;
		const c = createEmptyBladeController(doc);
		assert.ok(c.view.element);
	});

	it('should build a LabeledValueBladeController wrapping a SliderController', () => {
		const doc = createTestWindow().document;
		const c = createLabeledValueBladeController(doc);
		assert.ok(c.view.element);
	});
});
