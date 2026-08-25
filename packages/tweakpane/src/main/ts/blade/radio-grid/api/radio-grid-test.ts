import {
	createBlade,
	createValue,
	forceCast,
	LabeledValueBladeController,
	LabelPropsObject,
	ValueMap,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {RadioGridController} from '../controller/radio-grid.js';
import {RadioGridApi} from './radio-grid.js';

function createInstance(doc: Document) {
	const value = createValue('0,0');
	const gc = new RadioGridController(doc, {
		groupName: 'g',
		size: [2, 2],
		cellConfig: (x, y) => ({title: `${x},${y}`, value: `${x},${y}`}),
		value,
	});
	const controller = new LabeledValueBladeController(doc, {
		blade: createBlade(),
		props: ValueMap.fromObject({label: undefined} as LabelPropsObject),
		value: gc.value,
		valueController: gc,
	});
	const api = new RadioGridApi<string>(forceCast(controller));
	return {api, gc, value};
}

describe(RadioGridApi.name, () => {
	it('should expose the underlying value', () => {
		const doc = createTestWindow().document;
		const {api, value} = createInstance(doc);

		assert.strictEqual(api.value, value);
	});

	it('should map cell(x, y) to the corresponding RadioCellApi', () => {
		const doc = createTestWindow().document;
		const {api} = createInstance(doc);

		assert.strictEqual(api.cell(1, 0)?.title, '1,0');
		assert.strictEqual(api.cell(9, 9), undefined);
	});

	it('should ignore a change event whose value has no matching cell', () => {
		const doc = createTestWindow().document;
		const {api, value} = createInstance(doc);

		let calls = 0;
		api.on('change', () => {
			calls++;
		});

		// Set a value with no corresponding cell so findCellByValue returns null
		// inside the emitter handler, exercising its early-return branch.
		value.rawValue = 'no-such-cell';

		assert.strictEqual(calls, 0);
	});

	it('should emit change with the cell index when the value changes to a known cell', () => {
		const doc = createTestWindow().document;
		const {api, value} = createInstance(doc);

		let received: any = null;
		api.on('change', (ev) => {
			received = ev;
		});

		value.rawValue = '1,1';

		assert.ok(received);
		assert.deepStrictEqual(received.index, [1, 1]);
		assert.strictEqual(received.value, '1,1');
	});
});
