import {
	ButtonController,
	ButtonPropsObject,
	ValueMap,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {ButtonCellApi} from './button-cell.js';
import {TpButtonGridEvent} from './tp-button-grid-event.js';

describe(TpButtonGridEvent.name, () => {
	it('should carry the target, cell, and index', () => {
		const doc = createTestWindow().document;
		const controller = new ButtonController(doc, {
			props: ValueMap.fromObject<ButtonPropsObject>({title: 'Click'}),
			viewProps: ViewProps.create(),
		});
		const cell = new ButtonCellApi(controller);
		const target = {};

		const ev = new TpButtonGridEvent(target, cell, [1, 2]);

		assert.strictEqual(ev.target, target);
		assert.strictEqual(ev.cell, cell);
		assert.deepStrictEqual(ev.index, [1, 2]);
	});
});
