import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ButtonBladePlugin} from '../blade/button/plugin.js';
import {BindingTarget} from '../common/binding/target.js';
import {TpError} from '../common/tp-error.js';
import {NumberInputPlugin} from '../input-binding/number/plugin.js';
import {createTestWindow} from '../misc/dom-test-util.js';
import {NumberMonitorPlugin} from '../monitor-binding/number/plugin.js';
import {BladeApiCache} from './blade-api-cache.js';
import {PluginPool} from './pool.js';

describe(PluginPool.name, () => {
	it('should throw notCompatible when registering a plugin with a mismatched core version', () => {
		const pool = new PluginPool(new BladeApiCache());
		assert.throws(() => {
			pool.register('test-bundle', {
				...ButtonBladePlugin,
				core: {major: 99, minor: 0, patch: 0} as any,
			});
		}, TpError);
	});

	it('should list all registered plugins via getAll()', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', ButtonBladePlugin);
		pool.register('test-bundle', NumberInputPlugin);
		pool.register('test-bundle', NumberMonitorPlugin);

		const all = pool.getAll();
		assert.strictEqual(all.length, 3);
	});

	it('should throw nomatchingcontroller when the target has no value', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', NumberInputPlugin);

		const doc = createTestWindow().document;
		assert.throws(() => {
			pool.createBinding(doc, new BindingTarget({}, 'missing'), {});
		}, TpError);
	});

	it('should create an input binding controller and its api', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', NumberInputPlugin);

		const doc = createTestWindow().document;
		const obj = {foo: 1};
		const bc = pool.createBinding(doc, new BindingTarget(obj, 'foo'), {});

		const api = pool.createBindingApi(bc);
		assert.ok(api);
		// A second call should hit the api cache instead of building a new one.
		assert.strictEqual(pool.createBindingApi(bc), api);
	});

	it('should fall back to a monitor binding when no input plugin matches', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', NumberMonitorPlugin);

		const doc = createTestWindow().document;
		const obj = {foo: 1};
		const bc = pool.createBinding(doc, new BindingTarget(obj, 'foo'), {
			readonly: true,
			interval: 0,
		});

		const api = pool.createBindingApi(bc);
		assert.ok(api);
	});

	it('should throw nomatchingcontroller when no input or monitor plugin matches', () => {
		const pool = new PluginPool(new BladeApiCache());
		const doc = createTestWindow().document;
		const obj = {foo: 1};
		assert.throws(() => {
			pool.createBinding(doc, new BindingTarget(obj, 'foo'), {});
		}, TpError);
	});

	it('should create a blade controller and its api', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', ButtonBladePlugin);

		const doc = createTestWindow().document;
		const bc = pool.createBlade(doc, {view: 'button', title: 'Click'});
		const api = pool.createApi(bc);
		assert.ok(api);
		assert.strictEqual(pool.createApi(bc), api);
	});

	it('should throw nomatchingview when no blade plugin matches', () => {
		const pool = new PluginPool(new BladeApiCache());
		const doc = createTestWindow().document;
		assert.throws(() => {
			pool.createBlade(doc, {view: 'nonexistent'});
		}, TpError);
	});

	it('should use the first matching input api when multiple plugins could build one', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', NumberInputPlugin);
		pool.register('test-bundle', NumberInputPlugin);

		const doc = createTestWindow().document;
		const bc = pool.createBinding(doc, new BindingTarget({foo: 1}, 'foo'), {});
		const api = pool.createBindingApi(bc);
		assert.ok(api);
	});

	it('should use the first matching monitor api when multiple plugins could build one', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', NumberMonitorPlugin);
		pool.register('test-bundle', NumberMonitorPlugin);

		const doc = createTestWindow().document;
		const bc = pool.createBinding(doc, new BindingTarget({foo: 1}, 'foo'), {
			readonly: true,
			interval: 0,
		});
		const api = pool.createBindingApi(bc);
		assert.ok(api);
	});

	it('should delegate to createBindingApi from createApi for a binding controller', () => {
		const pool = new PluginPool(new BladeApiCache());
		pool.register('test-bundle', NumberInputPlugin);

		const doc = createTestWindow().document;
		const bc = pool.createBinding(doc, new BindingTarget({foo: 1}, 'foo'), {});
		const api = pool.createApi(bc);
		assert.ok(api);
	});
});
