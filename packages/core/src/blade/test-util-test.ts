import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../misc/dom-test-util.js';
import {
	createAppropriateBladeApi,
	createAppropriateBladeController,
	createEmptyBladeController,
	createEmptyLabelableController,
	TestKeyBladeController,
	TestValueBladeApi,
} from './test-util.js';

describe('blade test-util helpers', () => {
	it('should create an empty labelable controller', () => {
		const doc = createTestWindow().document;
		const c = createEmptyLabelableController(doc);
		assert.ok(c.view.element);
	});

	it('should create an empty blade controller', () => {
		const doc = createTestWindow().document;
		const c = createEmptyBladeController(doc);
		assert.ok(c.view.element);
	});

	it('should create an appropriate blade controller and api', () => {
		const doc = createTestWindow().document;
		const controller = createAppropriateBladeController(doc);
		assert.ok(controller.view.element);

		const api = createAppropriateBladeApi(doc) as TestValueBladeApi;
		assert.strictEqual(api.value, false);
		api.value = true;
		assert.strictEqual(api.value, true);
	});

	it('should import/export state for TestKeyBladeController', () => {
		const doc = createTestWindow().document;
		const c = new TestKeyBladeController(doc, 'foo');

		const state = c.exportState();
		assert.strictEqual((state as any).key, 'foo');

		const imported = c.importState({...state, key: 'bar'});
		assert.strictEqual(imported, true);
		assert.strictEqual(c.key, 'bar');
	});
});
