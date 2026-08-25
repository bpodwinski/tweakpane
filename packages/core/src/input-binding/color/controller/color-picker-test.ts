import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {TestUtil} from '../../../misc/test-util.js';
import {IntColor} from '../model/int-color.js';
import {ColorPickerController} from './color-picker.js';

describe(ColorPickerController.name, () => {
	it('should set initial color mode', () => {
		const value = createValue(new IntColor([0, 0, 0], 'hsv'));
		const win = createTestWindow();
		const doc = win.document;
		const c = new ColorPickerController(doc, {
			colorType: value.rawValue.type,
			supportsAlpha: false,
			value: value,
			viewProps: ViewProps.create(),
		});

		assert.strictEqual(c.textsController.view.modeSelectElement.value, 'hsv');
	});

	it('should sync the alpha text input with the value when supportsAlpha is true', () => {
		const value = createValue(new IntColor([0, 0, 0, 0.5], 'hsv'));
		const win = createTestWindow();
		const doc = win.document;
		const c = new ColorPickerController(doc, {
			colorType: value.rawValue.type,
			supportsAlpha: true,
			value: value,
			viewProps: ViewProps.create(),
		});

		const alphaInput = c.view.allFocusableElements[
			c.view.allFocusableElements.length - 1
		] as HTMLInputElement;
		assert.strictEqual(alphaInput.value, '0.50');

		value.rawValue = new IntColor([0, 0, 0, 0.8], 'hsv');
		assert.strictEqual(alphaInput.value, '0.80');

		alphaInput.value = '0.30';
		alphaInput.dispatchEvent(TestUtil.createEvent(win, 'change'));
		assert.ok(Math.abs(value.rawValue.getComponents('hsv')[3] - 0.3) < 1e-6);
	});

	it('should change hue of black in HSL', () => {
		const value = createValue(new IntColor([0, 0, 0], 'rgb'));
		const win = createTestWindow();
		const doc = win.document;
		const c = new ColorPickerController(doc, {
			colorType: value.rawValue.type,
			supportsAlpha: false,
			value: value,
			viewProps: ViewProps.create(),
		});

		// Change color mode to HSL
		const modeSelectElem = c.textsController.view.modeSelectElement;
		modeSelectElem.value = 'hsl';
		modeSelectElem.dispatchEvent(TestUtil.createEvent(win, 'change'));
		assert.strictEqual(c.textsController.colorMode.rawValue, 'hsl');

		// Change hue value
		const hInputElem = c.textsController.view.inputViews[0].inputElement;
		hInputElem.value = '10';
		hInputElem.dispatchEvent(TestUtil.createEvent(win, 'change'));

		assert.strictEqual(c.value.rawValue.getComponents('hsl')[0], 10);
		assert.strictEqual(hInputElem.value, '10');
	});
});
