import {ValueMap, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {RadioController} from '../controller/radio.js';
import {RadioCellApi} from './radio-cell-api.js';
import {TpRadioGridChangeEvent} from './tp-radio-grid-event.js';

describe(TpRadioGridChangeEvent.name, () => {
	it('should carry the target, cell, index, value, and last flag', () => {
		const doc = createTestWindow().document;
		const controller = new RadioController(doc, {
			name: 'group',
			props: ValueMap.fromObject({title: 'A'}),
			viewProps: ViewProps.create(),
		});
		const cell = new RadioCellApi(controller);
		const target = {};

		const ev = new TpRadioGridChangeEvent(target, cell, [0, 1], 'a', false);

		assert.strictEqual(ev.target, target);
		assert.strictEqual(ev.cell, cell);
		assert.deepStrictEqual(ev.index, [0, 1]);
		assert.strictEqual(ev.value, 'a');
		assert.strictEqual(ev.last, false);
	});

	it('should default "last" to true', () => {
		const doc = createTestWindow().document;
		const controller = new RadioController(doc, {
			name: 'group',
			props: ValueMap.fromObject({title: 'A'}),
			viewProps: ViewProps.create(),
		});
		const cell = new RadioCellApi(controller);

		const ev = new TpRadioGridChangeEvent({}, cell, [0, 0], 'x');
		assert.strictEqual(ev.last, true);
	});
});
