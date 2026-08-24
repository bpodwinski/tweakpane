import * as assert from 'assert';
import {describe, it} from 'mocha';

import {MonitorBindingController} from '../../blade/binding/controller/monitor-binding.js';
import {BindingTarget} from '../../common/binding/target.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {MultiLogController} from '../common/controller/multi-log.js';
import {SingleLogController} from '../common/controller/single-log.js';
import {createMonitorBindingController} from '../plugin.js';
import {StringMonitorPlugin} from './plugin.js';

describe(StringMonitorPlugin.id, () => {
	it('should accept a string value', () => {
		const result = StringMonitorPlugin.accept('foo', {readonly: true});
		assert.strictEqual(result?.initialValue, 'foo');
		assert.strictEqual(result?.params.readonly, true);
	});

	it('should reject a non-string value', () => {
		assert.strictEqual(StringMonitorPlugin.accept(42, {}), null);
	});

	it('should use a SingleLogController by default', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(StringMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true},
			target: new BindingTarget({foo: 'bar'}, 'foo'),
		}) as MonitorBindingController<string>;

		assert.ok(bc.valueController instanceof SingleLogController);
	});

	it('should use a MultiLogController when `multiline` is set', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(StringMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true, multiline: true},
			target: new BindingTarget({foo: 'bar'}, 'foo'),
		}) as MonitorBindingController<string>;

		assert.ok(bc.valueController instanceof MultiLogController);
	});

	it('should use a MultiLogController when the buffer holds more than 1 value', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(StringMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true, bufferSize: 3},
			target: new BindingTarget({foo: 'bar'}, 'foo'),
		}) as MonitorBindingController<string>;

		assert.ok(bc.valueController instanceof MultiLogController);
	});
});
