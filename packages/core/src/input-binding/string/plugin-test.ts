import * as assert from 'assert';
import {describe, it} from 'mocha';

import {BindingTarget} from '../../common/binding/target.js';
import {ListController} from '../../common/controller/list.js';
import {TextController} from '../../common/controller/text.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {createInputBindingController} from '../plugin.js';
import {StringInputPlugin} from './plugin.js';

describe(StringInputPlugin.id, () => {
	it('should reject a non-string value', () => {
		assert.strictEqual(StringInputPlugin.accept(42, {}), null);
	});

	it('should use a TextController without list options', () => {
		const doc = createTestWindow().document;
		const bc = createInputBindingController(StringInputPlugin, {
			document: doc,
			params: {},
			target: new BindingTarget({foo: 'bar'}, 'foo'),
		});

		assert.ok(bc);
		assert.ok(bc?.valueController instanceof TextController);
	});

	it('should use a ListController with list options and expose a list api', () => {
		const doc = createTestWindow().document;
		const bc = createInputBindingController(StringInputPlugin, {
			document: doc,
			params: {options: {a: 'a', b: 'b'}},
			target: new BindingTarget({foo: 'a'}, 'foo'),
		});

		assert.ok(bc);
		assert.ok(bc?.valueController instanceof ListController);

		const api = StringInputPlugin.api?.({controller: bc as any});
		assert.ok(api);
	});

	it('should return null from api() for a non-string value', () => {
		const doc = createTestWindow().document;
		const bc = createInputBindingController(StringInputPlugin, {
			document: doc,
			params: {},
			target: new BindingTarget({foo: 'bar'}, 'foo'),
		});
		if (!bc) {
			throw new Error('unexpected null controller');
		}
		(bc.value as any).rawValue = 42;

		const api = StringInputPlugin.api?.({controller: bc as any});
		assert.strictEqual(api, null);
	});
});
