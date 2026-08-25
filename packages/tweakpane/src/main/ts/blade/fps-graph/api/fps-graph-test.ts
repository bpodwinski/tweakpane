import * as assert from 'assert';
import {describe, it} from 'mocha';
import {
	createBlade,
	createValue,
	initializeBuffer,
	LabelPropsObject,
	ManualTicker,
	ValueMap,
	ViewProps,
} from 'tweakpane-reborn-core';

import {createTestWindow} from '../../../misc/test-util.js';
import {FpsGraphController} from '../controller/fps-graph.js';
import {FpsGraphBladeController} from '../controller/fps-graph-blade.js';
import {FpsGraphBladeApi} from './fps-graph.js';

function createApi(doc: Document): {
	api: FpsGraphBladeApi;
	valueController: FpsGraphController;
} {
	const valueController = new FpsGraphController(doc, {
		props: ValueMap.fromObject({max: 90, min: 0}),
		rows: 2,
		ticker: new ManualTicker(),
		value: createValue(initializeBuffer<number>(80)),
		viewProps: ViewProps.create(),
	});
	const bladeController = new FpsGraphBladeController(doc, {
		blade: createBlade(),
		labelProps: ValueMap.fromObject<LabelPropsObject>({label: undefined}),
		valueController,
	});
	return {api: new FpsGraphBladeApi(bladeController), valueController};
}

describe(FpsGraphBladeApi.name, () => {
	it('should report fps as null before any begin/end cycle', () => {
		const doc = createTestWindow().document;
		const {api} = createApi(doc);
		assert.strictEqual(api.fps, null);
	});

	it('should compute fps after a second begin/end cycle', () => {
		const doc = createTestWindow().document;
		const {api} = createApi(doc);

		// The first cycle only records a timestamp; fps needs a second cycle to
		// compute a frame-count delta against.
		api.begin();
		api.end();
		api.begin();
		api.end();

		assert.strictEqual(typeof api.fps, 'number');
	});

	it('should get/set max and min', () => {
		const doc = createTestWindow().document;
		const {api} = createApi(doc);

		assert.strictEqual(api.max, 90);
		assert.strictEqual(api.min, 0);

		api.max = 120;
		api.min = 10;

		assert.strictEqual(api.max, 120);
		assert.strictEqual(api.min, 10);
	});

	it('should invoke the tick handler when the ticker ticks', () => {
		const doc = createTestWindow().document;
		const {api, valueController} = createApi(doc);

		let calls = 0;
		api.on('tick', () => {
			calls++;
		});

		valueController.ticker.emitter.emit('tick', {
			sender: valueController.ticker,
		});

		assert.strictEqual(calls, 1);
	});
});
