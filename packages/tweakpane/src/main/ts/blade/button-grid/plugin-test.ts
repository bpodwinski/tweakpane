import {createBlade, forceCast, PluginPool, ViewProps} from '@tweakpane/core';
import {BladeApiCache} from '@tweakpane/core/dist/plugin/blade-api-cache.js';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {ButtonGridBladeController} from './controller/button-grid-blade.js';
import {ButtonGridBladePlugin} from './plugin.js';

describe('ButtonGridBladePlugin', () => {
	it('should accept well-formed params', () => {
		const result = ButtonGridBladePlugin.accept({
			view: 'buttongrid',
			size: [3, 3],
			cells: () => ({title: 'x'}),
		});
		assert.ok(result);
		assert.deepStrictEqual(result?.params.size, [3, 3]);
	});

	it('should reject params with the wrong view id', () => {
		const result = ButtonGridBladePlugin.accept({
			view: 'slider',
			size: [3, 3],
			cells: () => ({title: 'x'}),
		});
		assert.strictEqual(result, null);
	});

	function createInstance(doc: Document) {
		const accepted = ButtonGridBladePlugin.accept({
			view: 'buttongrid',
			size: [3, 2],
			cells: (x: number, y: number) => ({title: `${x},${y}`}),
			label: 'Directions',
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}

		const controller = ButtonGridBladePlugin.controller({
			blade: createBlade(),
			document: doc,
			params: forceCast(accepted.params),
			viewProps: ViewProps.create(),
		});
		const pool = new PluginPool(new BladeApiCache());
		const api = ButtonGridBladePlugin.api({controller, pool});
		return {controller, api};
	}

	it('should build a ButtonGridBladeController with a 3x2 grid', () => {
		const doc = createTestWindow().document;
		const {controller} = createInstance(doc);

		assert.ok(controller instanceof ButtonGridBladeController);
		assert.strictEqual(
			(controller as ButtonGridBladeController).valueController.cellControllers
				.length,
			6,
		);
	});

	it('should build an api that exposes cells by (x, y) and their title', () => {
		const doc = createTestWindow().document;
		const {api} = createInstance(doc);
		if (!api) {
			throw new Error('unexpected null api');
		}
		const gridApi: any = api;

		assert.strictEqual(gridApi.cell(1, 0)?.title, '1,0');
		assert.strictEqual(gridApi.cell(2, 1)?.title, '2,1');
		assert.strictEqual(gridApi.cell(9, 9), undefined);
	});

	it('should emit a TpButtonGridEvent with the correct (x, y) index on click', () => {
		const doc = createTestWindow().document;
		const {controller, api} = createInstance(doc);
		if (!api) {
			throw new Error('unexpected null api');
		}
		const gridApi: any = api;

		let received: any = null;
		gridApi.on('click', (ev: any) => {
			received = ev;
		});

		const bc = (controller as ButtonGridBladeController).valueController
			.cellControllers[4]; // index 4 -> x=1, y=1 for a 3-wide grid
		bc.view.buttonElement.dispatchEvent(
			new (doc.defaultView as any).MouseEvent('click', {bubbles: true}),
		);

		assert.ok(received);
		assert.deepStrictEqual(received.index, [1, 1]);
		assert.strictEqual(received.cell.title, '1,1');
	});

	it('should return null from api() for a foreign controller', () => {
		const pool = new PluginPool(new BladeApiCache());
		const result = ButtonGridBladePlugin.api({
			controller: forceCast({}),
			pool,
		});
		assert.strictEqual(result, null);
	});
});
