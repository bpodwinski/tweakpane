import {
	createBlade,
	forceCast,
	LabeledValueBladeController,
	PluginPool,
	ViewProps,
} from '@tweakpane/core';
import {BladeApiCache} from '@tweakpane/core/dist/plugin/blade-api-cache.js';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {RadioGridBladePlugin} from './blade-plugin.js';
import {RadioGridController} from './controller/radio-grid.js';

describe('RadioGridBladePlugin', () => {
	it('should accept well-formed params', () => {
		const result = RadioGridBladePlugin.accept({
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			value: 'a',
			cells: () => ({title: 'x', value: 'a'}),
		});
		assert.ok(result);
		assert.deepStrictEqual(result?.params.size, [2, 2]);
	});

	it('should reject params with the wrong view id', () => {
		const result = RadioGridBladePlugin.accept({
			view: 'slider',
			groupName: 'g',
			size: [2, 2],
			value: 'a',
			cells: () => ({title: 'x', value: 'a'}),
		});
		assert.strictEqual(result, null);
	});

	function createInstance(doc: Document) {
		const accepted = RadioGridBladePlugin.accept({
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			value: '0,0',
			cells: (x: number, y: number) => ({
				title: `${x},${y}`,
				value: `${x},${y}`,
			}),
			label: 'Options',
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}

		const controller = RadioGridBladePlugin.controller({
			blade: createBlade(),
			document: doc,
			params: forceCast(accepted.params),
			viewProps: ViewProps.create(),
		});
		const pool = new PluginPool(new BladeApiCache());
		const api = RadioGridBladePlugin.api({controller, pool});
		return {controller, api};
	}

	it('should build a LabeledValueBladeController wrapping a RadioGridController', () => {
		const doc = createTestWindow().document;
		const {controller} = createInstance(doc);

		assert.ok(controller instanceof LabeledValueBladeController);
		assert.ok(
			(controller as LabeledValueBladeController<any, any>)
				.valueController instanceof RadioGridController,
		);
	});

	it('should build an api that exposes cells by (x, y) and reads the value', () => {
		const doc = createTestWindow().document;
		const {api} = createInstance(doc);
		if (!api) {
			throw new Error('unexpected null api');
		}
		const gridApi: any = api;

		assert.strictEqual(gridApi.value.rawValue, '0,0');
		assert.strictEqual(gridApi.cell(1, 0)?.title, '1,0');
		assert.strictEqual(gridApi.cell(9, 9), undefined);
	});

	it('should emit a TpRadioGridChangeEvent with the cell index on change', () => {
		const doc = createTestWindow().document;
		const {controller, api} = createInstance(doc);
		if (!api) {
			throw new Error('unexpected null api');
		}
		const gridApi: any = api;

		let received: any = null;
		gridApi.on('change', (ev: any) => {
			received = ev;
		});

		const gc = (controller as LabeledValueBladeController<any, any>)
			.valueController as RadioGridController<string>;
		gc.value.rawValue = '1,1';

		assert.ok(received);
		assert.deepStrictEqual(received.index, [1, 1]);
		assert.strictEqual(received.value, '1,1');
	});

	it('should return null from api() for a foreign controller', () => {
		const pool = new PluginPool(new BladeApiCache());
		const result = RadioGridBladePlugin.api({
			controller: forceCast({}),
			pool,
		});
		assert.strictEqual(result, null);
	});
});
