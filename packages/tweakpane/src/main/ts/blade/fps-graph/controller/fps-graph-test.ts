import * as assert from 'assert';
import {describe, it} from 'mocha';
import {
	createValue,
	initializeBuffer,
	ManualTicker,
	ValueMap,
	ViewProps,
} from 'tweakpane-reborn-core';

import {createTestWindow} from '../../../misc/test-util.js';
import {FpsGraphController} from './fps-graph.js';

function createController(doc: Document, ticker: ManualTicker) {
	return new FpsGraphController(doc, {
		props: ValueMap.fromObject({max: 90, min: 0}),
		rows: 2,
		ticker,
		value: createValue(initializeBuffer<number>(4)),
		viewProps: ViewProps.create(),
	});
}

describe(FpsGraphController.name, () => {
	it('should push a computed fps value and update the view on tick', () => {
		const doc = createTestWindow().document;
		const ticker = new ManualTicker();
		const c = createController(doc, ticker);

		// A single begin/end cycle leaves fps null (no prior frame to diff
		// against), so run two cycles before ticking.
		c.begin();
		c.end();
		c.begin();
		c.end();

		ticker.tick();

		assert.strictEqual(typeof c.fps, 'number');
		assert.notStrictEqual(c.view.valueElement.textContent, '');
	});

	it('should not push a value on tick while fps is still null', () => {
		const doc = createTestWindow().document;
		const ticker = new ManualTicker();
		const c = createController(doc, ticker);

		ticker.tick();

		assert.strictEqual(c.fps, null);
	});

	it('should dispose the graph controller and the ticker when disposed', () => {
		const doc = createTestWindow().document;
		const ticker = new ManualTicker();
		const c = createController(doc, ticker);

		let disposed = false;
		const originalDispose = ticker.dispose.bind(ticker);
		ticker.dispose = () => {
			disposed = true;
			originalDispose();
		};

		c.viewProps.set('disposed', true);

		assert.strictEqual(disposed, true);
	});
});
