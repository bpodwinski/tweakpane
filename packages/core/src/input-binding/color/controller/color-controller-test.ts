import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {
	colorToHexRgbString,
	createColorStringParser,
} from '../converter/color-string.js';
import {IntColor} from '../model/int-color.js';
import {ColorController} from './color.js';

function createController(
	doc: Document,
	pickerLayout: 'inline' | 'popup',
	expanded = false,
) {
	const value = createValue(new IntColor([255, 0, 0], 'rgb'));
	const c = new ColorController(doc, {
		colorType: 'int',
		expanded,
		formatter: colorToHexRgbString,
		parser: createColorStringParser('int'),
		pickerLayout,
		supportsAlpha: false,
		value,
		viewProps: ViewProps.create(),
	});
	return {c, value};
}

describe(ColorController.name, () => {
	it('should render a swatch button and a text input', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		assert.ok(c.view.swatchElement.querySelector('button'));
		assert.ok(c.textController.view.element);
	});

	it('should append the picker into a popup for the "popup" layout', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		assert.ok(c.view.element.querySelector('.tp-popv'));
	});

	it('should append the picker inline for the "inline" layout', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'inline');
		assert.strictEqual(c.view.element.querySelector('.tp-popv'), null);
		assert.ok(c.view.pickerElement);
	});

	it('should expand the popup on button click, and collapse on a second click', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(!popup.classList.contains('tp-popv-v'));

		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		assert.ok(popup.classList.contains('tp-popv-v'));

		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on Escape from within the picker', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));

		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const picker = popup.querySelector('select') as HTMLElement;
		picker.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Escape',
			}),
		);
		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on blur to an element outside it', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const outside = doc.createElement('div');
		doc.body.appendChild(outside);
		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: outside});
		button.dispatchEvent(blurEvent);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should keep the popup open when blur moves within the picker', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const select = popup.querySelector('select') as HTMLElement;

		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: select});
		select.dispatchEvent(blurEvent);

		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should keep the popup open when blur moves to the trigger button', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const select = popup.querySelector('select') as HTMLElement;

		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: button});
		select.dispatchEvent(blurEvent);

		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on blur to an unrelated element from within the picker', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const select = popup.querySelector('select') as HTMLElement;

		const outside = doc.createElement('div');
		doc.body.appendChild(outside);
		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: outside});
		select.dispatchEvent(blurEvent);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should focus the swatch button on Escape from the picker in inline layout', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'inline');
		const winRef = doc.defaultView as any;

		const select = c.view.pickerElement?.querySelector('select') as HTMLElement;
		let focused = false;
		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;
		button.focus = () => {
			focused = true;
		};

		select.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Escape',
			}),
		);

		assert.strictEqual(focused, true);
	});

	it('should no-op on button/picker blur in inline layout (no popup to close)', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'inline');
		const winRef = doc.defaultView as any;

		const select = c.view.pickerElement?.querySelector('select') as HTMLElement;
		const button = c.view.swatchElement.querySelector(
			'button',
		) as HTMLButtonElement;

		assert.doesNotThrow(() => {
			button.dispatchEvent(new winRef.FocusEvent('blur', {bubbles: true}));
			select.dispatchEvent(new winRef.FocusEvent('blur', {bubbles: true}));
		});
	});
});
