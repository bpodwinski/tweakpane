import * as assert from 'assert';
import {describe, it} from 'mocha';

import {MonitorBindingController} from '../../blade/binding/controller/monitor-binding.js';
import {BindingTarget} from '../../common/binding/target.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {MultiLogController} from '../common/controller/multi-log.js';
import {SingleLogController} from '../common/controller/single-log.js';
import {createMonitorBindingController} from '../plugin.js';
import {GraphLogController} from './controller/graph-log.js';
import {NumberMonitorPlugin} from './plugin.js';

describe(NumberMonitorPlugin.id, () => {
	it('should apply `format`', () => {
		const doc = createTestWindow().document;
		const obj = {
			foo: 1,
		};
		const bc = createMonitorBindingController(NumberMonitorPlugin, {
			document: doc,
			params: {
				format: () => 'formatted',
				interval: 0,
				readonly: true,
			},
			target: new BindingTarget(obj, 'foo'),
		}) as MonitorBindingController<number>;

		const c = bc.valueController as SingleLogController<number>;
		assert.strictEqual(c.view.inputElement.value, 'formatted');
	});

	it('should reject a non-number value', () => {
		assert.strictEqual(
			NumberMonitorPlugin.accept('42', {readonly: true}),
			null,
		);
	});

	it('should use a MultiLogController when bufferSize is greater than 1', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(NumberMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true, bufferSize: 3},
			target: new BindingTarget({foo: 1}, 'foo'),
		}) as MonitorBindingController<number>;

		assert.ok(bc.valueController instanceof MultiLogController);
	});

	it('should use a GraphLogController and expose a graph api for view="graph"', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(NumberMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true, view: 'graph', min: 0, max: 10},
			target: new BindingTarget({foo: 1}, 'foo'),
		}) as MonitorBindingController<number>;

		assert.ok(bc.valueController instanceof GraphLogController);

		const api = NumberMonitorPlugin.api?.({controller: bc as any});
		assert.ok(api);
	});

	it('should return null from api() for a non-graph controller', () => {
		const doc = createTestWindow().document;
		const bc = createMonitorBindingController(NumberMonitorPlugin, {
			document: doc,
			params: {interval: 0, readonly: true},
			target: new BindingTarget({foo: 1}, 'foo'),
		}) as MonitorBindingController<number>;

		const api = NumberMonitorPlugin.api?.({controller: bc as any});
		assert.strictEqual(api, null);
	});
});
