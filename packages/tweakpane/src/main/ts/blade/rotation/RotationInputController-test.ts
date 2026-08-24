import {createValue, parseNumber, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {createAxisEuler} from './createAxisEuler.js';
import {createEulerAssembly} from './createEulerAssembly.js';
import {Euler} from './Euler.js';
import {RotationInputController} from './RotationInputController.js';

function createController(
	doc: Document,
	pickerLayout: 'inline' | 'popup',
	expanded = false,
) {
	const value = createValue(new Euler(0, 0, 0, 'XYZ', 'rad'));
	const c = new RotationInputController(doc, {
		axes: [
			createAxisEuler(2, undefined),
			createAxisEuler(2, undefined),
			createAxisEuler(2, undefined),
		],
		assembly: createEulerAssembly('XYZ', 'rad'),
		expanded,
		parser: parseNumber,
		pickerLayout,
		rotationMode: 'euler',
		value,
		viewProps: ViewProps.create(),
		pointerScale: 1,
	});
	return {c, value};
}

describe(RotationInputController.name, () => {
	it('should render a swatch button and a text input', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');

		assert.ok(c.view.swatchElement.querySelector('button'));
		assert.ok(c.view.textElement.querySelector('input'));
	});

	it('should append the gizmo into a popup for the "popup" layout', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');

		assert.strictEqual(c.view.pickerElement, null);
		assert.ok(c.view.element.querySelector('.tp-popv'));
	});

	it('should append the gizmo inline for the "inline" layout', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'inline');

		assert.ok(c.view.pickerElement);
		assert.strictEqual(c.view.element.querySelector('.tp-popv'), null);
	});

	it('should expand the popup when the swatch button is clicked', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(!popup.classList.contains('tp-popv-v'));

		button.dispatchEvent(
			new (doc.defaultView as any).MouseEvent('click', {
				bubbles: true,
			}),
		);

		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should collapse the popup again on a second button click', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const winRef = doc.defaultView as any;

		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		assert.ok(popup.classList.contains('tp-popv-v'));

		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on Escape from within it', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));

		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const gizmoPad = popup.querySelector('.tp-rotationgizmov_p') as HTMLElement;
		gizmoPad.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Escape',
			}),
		);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});
});
