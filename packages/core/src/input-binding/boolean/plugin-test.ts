import * as assert from 'assert';
import {describe, it} from 'mocha';

import {BindingTarget} from '../../common/binding/target.js';
import {ListController} from '../../common/controller/list.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {createInputBindingController} from '../plugin.js';
import {CheckboxController} from './controller/checkbox.js';
import {BooleanInputPlugin} from './plugin.js';

describe(BooleanInputPlugin.id, () => {
	it('should reject a non-boolean value', () => {
		const result = BooleanInputPlugin.accept('true', {});
		assert.strictEqual(result, null);
	});

	it('should use a CheckboxController without list options', () => {
		const doc = createTestWindow().document;
		const bc = createInputBindingController(BooleanInputPlugin, {
			document: doc,
			params: {},
			target: new BindingTarget({foo: true}, 'foo'),
		});

		assert.ok(bc);
		assert.ok(bc?.valueController instanceof CheckboxController);
	});

	it('should use a ListController with list options and expose a list api', () => {
		const doc = createTestWindow().document;
		const bc = createInputBindingController(BooleanInputPlugin, {
			document: doc,
			params: {
				options: {yes: true, no: false},
			},
			target: new BindingTarget({foo: true}, 'foo'),
		});

		assert.ok(bc);
		assert.ok(bc?.valueController instanceof ListController);

		const api = BooleanInputPlugin.api?.({
			controller: bc as any,
		});
		assert.ok(api);
	});

	it('should return null from api() for a non-boolean value', () => {
		const doc = createTestWindow().document;
		const bc = createInputBindingController(BooleanInputPlugin, {
			document: doc,
			params: {},
			target: new BindingTarget({foo: true}, 'foo'),
		});
		if (!bc) {
			throw new Error('unexpected null controller');
		}
		(bc.value as any).rawValue = 'not a boolean';

		const api = BooleanInputPlugin.api?.({controller: bc as any});
		assert.strictEqual(api, null);
	});
});
