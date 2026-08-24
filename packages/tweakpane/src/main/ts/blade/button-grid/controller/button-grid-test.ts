import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {ButtonGridController} from './button-grid.js';

describe(ButtonGridController.name, () => {
	it('should create one ButtonController per cell', () => {
		const doc = createTestWindow().document;
		const c = new ButtonGridController(doc, {
			size: [3, 2],
			cellConfig: (x, y) => ({title: `${x},${y}`}),
		});

		assert.strictEqual(c.cellControllers.length, 6);
		assert.strictEqual(c.cellControllers[0].props.get('title'), '0,0');
		assert.strictEqual(c.cellControllers[5].props.get('title'), '2,1');
	});

	it('should append all cell elements into the grid view, column-major order', () => {
		const doc = createTestWindow().document;
		const c = new ButtonGridController(doc, {
			size: [2, 2],
			cellConfig: (x, y) => ({title: `${x},${y}`}),
		});

		const buttons = c.view.element.querySelectorAll('button');
		assert.strictEqual(buttons.length, 4);
		assert.strictEqual(
			c.view.element.style.gridTemplateColumns,
			'repeat(2, 1fr)',
		);
	});

	it('should dispose all cell controllers when the grid is disposed', () => {
		const doc = createTestWindow().document;
		const c = new ButtonGridController(doc, {
			size: [2, 1],
			cellConfig: () => ({title: 'x'}),
		});

		c.viewProps.set('disposed', true);

		c.cellControllers.forEach((cell) => {
			assert.strictEqual(cell.viewProps.get('disposed'), true);
		});
	});
});
