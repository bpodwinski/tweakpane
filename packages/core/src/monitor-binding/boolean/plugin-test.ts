import * as assert from 'assert';
import {describe, it} from 'mocha';

import {MonitorBindingController} from '../../blade/binding/controller/monitor-binding.js';
import {BindingTarget} from '../../common/binding/target.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {MultiLogController} from '../common/controller/multi-log.js';
import {SingleLogController} from '../common/controller/single-log.js';
import {createMonitorBindingController} from '../plugin.js';
import {BooleanMonitorPlugin} from './plugin.js';

describe(BooleanMonitorPlugin.id, () => {
	it('should accept a boolean value', () => {
		const result = BooleanMonitorPlugin.accept(true, {readonly: true});
		assert.strictEqual(result?.initialValue, true);
		assert.strictEqual(result?.params.readonly, true);
	});

	it('should reject a non-boolean value', () => {
		assert.strictEqual(BooleanMonitorPlugin.accept('true', {}), null);
	});

	it('should use a SingleLogController for a single-value buffer (rows=1)', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(BooleanMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true},
			target: new BindingTarget({foo: true}, 'foo'),
		}) as MonitorBindingController<boolean>;

		assert.ok(bc.valueController instanceof SingleLogController);
	});

	it('should use a MultiLogController when the buffer holds more than 1 value', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(BooleanMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true, bufferSize: 3, rows: 3},
			target: new BindingTarget({foo: true}, 'foo'),
		}) as MonitorBindingController<boolean>;

		assert.ok(bc.valueController instanceof MultiLogController);
	});
});
