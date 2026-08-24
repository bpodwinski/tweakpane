import {createValue} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {RadioGridController} from './radio-grid.js';

function createController(doc: Document, groupName = 'g') {
	const value = createValue('a');
	const c = new RadioGridController(doc, {
		groupName,
		size: [2, 2],
		cellConfig: (x, y) => ({title: `${x},${y}`, value: `${x},${y}`}),
		value,
	});
	return {c, value};
}

describe(RadioGridController.name, () => {
	it('should create one RadioController per cell', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc);
		assert.strictEqual(c.cellControllers.length, 4);
	});

	it('should check the cell matching the initial value', () => {
		const doc = createTestWindow().document;
		const value = createValue('1,0');
		const c = new RadioGridController(doc, {
			groupName: 'g',
			size: [2, 2],
			cellConfig: (x, y) => ({title: `${x},${y}`, value: `${x},${y}`}),
			value,
		});

		const checked = c.cellControllers.filter(
			(cc) => cc.view.inputElement.checked,
		);
		assert.strictEqual(checked.length, 1);
		assert.strictEqual(checked[0].props.get('title'), '1,0');
	});

	it('should update the checked cell when the value changes externally', () => {
		const doc = createTestWindow().document;
		const {c, value} = createController(doc);

		value.rawValue = '1,1';

		const cell = c.findCellByValue('1,1');
		assert.ok(cell);
		assert.strictEqual(cell?.view.inputElement.checked, true);
	});

	it('should update the value when a cell input changes', () => {
		const doc = createTestWindow().document;
		const {c, value} = createController(doc);
		const winRef = doc.defaultView as any;

		const cell = c.findCellByValue('0,1');
		if (!cell) {
			throw new Error('cell not found');
		}
		cell.view.inputElement.checked = true;
		cell.view.inputElement.dispatchEvent(
			new winRef.Event('change', {bubbles: true}),
		);

		assert.strictEqual(value.rawValue, '0,1');
	});

	it('should namespace the native radio "name" per instance to avoid cross-instance collisions', () => {
		const doc = createTestWindow().document;
		const {c: c1} = createController(doc, 'shared');
		const {c: c2} = createController(doc, 'shared');

		const name1 = c1.cellControllers[0].view.inputElement.name;
		const name2 = c2.cellControllers[0].view.inputElement.name;
		assert.notStrictEqual(name1, name2);
	});
});
