import * as assert from 'assert';
import {describe, it} from 'mocha';
import {
	createBlade,
	forceCast,
	IntervalTicker,
	ManualTicker,
	PluginPool,
	ViewProps,
} from 'tweakpane-reborn-core';
import {BladeApiCache} from 'tweakpane-reborn-core/dist/plugin/blade-api-cache.js';

import {createTestWindow} from '../../misc/test-util.js';
import {FpsGraphBladeApi} from './api/fps-graph.js';
import {FpsGraphBladeController} from './controller/fps-graph-blade.js';
import {FpsGraphBladePlugin} from './plugin.js';

describe('FpsGraphBladePlugin', () => {
	it('should accept well-formed params', () => {
		const result = FpsGraphBladePlugin.accept({
			view: 'fpsgraph',
			max: 120,
			min: 10,
		});
		assert.ok(result);
		assert.strictEqual(result?.params.max, 120);
		assert.strictEqual(result?.params.min, 10);
	});

	it('should reject params with the wrong view id', () => {
		const result = FpsGraphBladePlugin.accept({view: 'slider'});
		assert.strictEqual(result, null);
	});

	function createInstance(doc: Document) {
		const accepted = FpsGraphBladePlugin.accept({
			view: 'fpsgraph',
			interval: 0, // use a ManualTicker instead of a real interval timer
			label: 'FPS',
			max: 120,
			min: 10,
			rows: 3,
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}

		const controller = FpsGraphBladePlugin.controller({
			blade: createBlade(),
			document: doc,
			params: forceCast(accepted.params),
			viewProps: ViewProps.create(),
		});
		const pool = new PluginPool(new BladeApiCache());
		const api = FpsGraphBladePlugin.api({controller, pool});
		return {controller, api};
	}

	it('should build a FpsGraphBladeController with the configured min/max and a ManualTicker for interval=0', () => {
		const doc = createTestWindow().document;
		const {controller} = createInstance(doc);

		assert.ok(controller instanceof FpsGraphBladeController);
		const vc = (controller as FpsGraphBladeController).valueController;
		assert.strictEqual(vc.props.get('max'), 120);
		assert.strictEqual(vc.props.get('min'), 10);
		assert.ok(vc.ticker instanceof ManualTicker);
	});

	it('should build an api wired to begin()/end() and min/max', () => {
		const doc = createTestWindow().document;
		const {api} = createInstance(doc);
		if (!api) {
			throw new Error('unexpected null api');
		}

		assert.ok(api instanceof FpsGraphBladeApi);
		assert.strictEqual(api.max, 120);
		assert.strictEqual(api.min, 10);

		api.begin();
		api.end();
		api.begin();
		api.end();
		assert.strictEqual(typeof api.fps, 'number');
	});

	it('should build an IntervalTicker with the default interval when interval is omitted', () => {
		const doc = createTestWindow().document;
		const accepted = FpsGraphBladePlugin.accept({
			view: 'fpsgraph',
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}
		const viewProps = ViewProps.create();
		const controller = FpsGraphBladePlugin.controller({
			blade: createBlade(),
			document: doc,
			params: forceCast(accepted.params),
			viewProps,
		});
		assert.ok(controller instanceof FpsGraphBladeController);
		const vc = (controller as FpsGraphBladeController).valueController;
		assert.ok(vc.ticker instanceof IntervalTicker);
		viewProps.set('disposed', true);
	});

	it('should build an IntervalTicker with the given interval when provided', () => {
		const doc = createTestWindow().document;
		const accepted = FpsGraphBladePlugin.accept({
			view: 'fpsgraph',
			interval: 250,
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}
		const viewProps = ViewProps.create();
		const controller = FpsGraphBladePlugin.controller({
			blade: createBlade(),
			document: doc,
			params: forceCast(accepted.params),
			viewProps,
		});
		assert.ok(controller instanceof FpsGraphBladeController);
		const vc = (controller as FpsGraphBladeController).valueController;
		assert.ok(vc.ticker instanceof IntervalTicker);
		viewProps.set('disposed', true);
	});

	it('should return null from api() for a foreign controller', () => {
		const pool = new PluginPool(new BladeApiCache());
		const result = FpsGraphBladePlugin.api({
			controller: forceCast({}),
			pool,
		});
		assert.strictEqual(result, null);
	});
});
