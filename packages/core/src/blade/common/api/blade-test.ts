import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ViewProps} from '../../../common/model/view-props.js';
import {View} from '../../../common/view/view.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {BladeController} from '../controller/blade.js';
import {createBlade} from '../model/blade.js';
import {BladeApi} from './blade.js';

class TestView implements View {
	readonly element: HTMLElement;

	constructor(doc: Document) {
		this.element = doc.createElement('div');
	}
}

describe(BladeApi.name, () => {
	it('should get element', () => {
		const doc = createTestWindow().document;
		const v = new TestView(doc);
		const c = new BladeController({
			blade: createBlade(),
			view: v,
			viewProps: ViewProps.create(),
		});
		const api = new BladeApi(c);
		assert.strictEqual(api.element, v.element);
	});

	function createApi(doc: Document): BladeApi {
		const v = new TestView(doc);
		const c = new BladeController({
			blade: createBlade(),
			view: v,
			viewProps: ViewProps.create(),
		});
		return new BladeApi(c);
	}

	it('should get/set disabled', () => {
		const doc = createTestWindow().document;
		const api = createApi(doc);
		assert.strictEqual(api.disabled, false);
		api.disabled = true;
		assert.strictEqual(api.disabled, true);
	});

	it('should get/set hidden', () => {
		const doc = createTestWindow().document;
		const api = createApi(doc);
		assert.strictEqual(api.hidden, false);
		api.hidden = true;
		assert.strictEqual(api.hidden, true);
	});

	it('should dispose the underlying controller', () => {
		const doc = createTestWindow().document;
		const api = createApi(doc);
		api.dispose();
		assert.strictEqual(api.controller.viewProps.get('disposed'), true);
	});

	it('should import/export state', () => {
		const doc = createTestWindow().document;
		const api = createApi(doc);
		const state = api.exportState();
		assert.strictEqual(api.importState(state), true);
	});
});
