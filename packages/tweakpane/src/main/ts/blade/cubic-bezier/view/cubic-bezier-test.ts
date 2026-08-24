import {Foldable, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {CubicBezierView} from './cubic-bezier.js';

describe(CubicBezierView.name, () => {
	it('should render a button and a text element, no picker for a popup layout', () => {
		const doc = createTestWindow().document;
		const view = new CubicBezierView(doc, {
			foldable: Foldable.create(false),
			pickerLayout: 'popup',
			viewProps: ViewProps.create(),
		});

		assert.ok(view.buttonElement);
		assert.ok(view.textElement);
		assert.strictEqual(view.pickerElement, null);
	});

	it('should render a picker element for an inline layout', () => {
		const doc = createTestWindow().document;
		const view = new CubicBezierView(doc, {
			foldable: Foldable.create(false),
			pickerLayout: 'inline',
			viewProps: ViewProps.create(),
		});

		assert.ok(view.pickerElement);
	});

	it('should reflect the foldable expanded state as a class', () => {
		const doc = createTestWindow().document;
		const foldable = Foldable.create(false);
		const view = new CubicBezierView(doc, {
			foldable,
			pickerLayout: 'inline',
			viewProps: ViewProps.create(),
		});

		assert.ok(!view.element.classList.contains('tp-cbzv-expanded'));
		foldable.set('expanded', true);
		assert.ok(view.element.classList.contains('tp-cbzv-expanded'));
	});
});
