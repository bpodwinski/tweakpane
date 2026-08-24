import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {IntColor} from '../model/int-color.js';
import {SvPaletteView} from './sv-palette.js';

describe(SvPaletteView.name, () => {
	it('should redraw the canvas only when the hue changes', () => {
		const win = createTestWindow();
		const doc = win.document;

		let putImageDataCalls = 0;
		(
			win as unknown as {HTMLCanvasElement: {prototype: HTMLCanvasElement}}
		).HTMLCanvasElement.prototype.getContext = function () {
			return {
				getImageData: () => ({
					data: new Uint8ClampedArray(4 * 64 * 64),
				}),
				putImageData: () => {
					putImageDataCalls++;
				},
			};
		} as unknown as HTMLCanvasElement['getContext'];

		const value = createValue(new IntColor([0, 255, 0], 'rgb'));
		new SvPaletteView(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		assert.strictEqual(
			putImageDataCalls,
			1,
			'initial construction should draw the gradient once',
		);

		const hue = value.rawValue.getComponents('hsv')[0];

		// Changing saturation/value only (same hue) must NOT redraw the canvas.
		value.rawValue = new IntColor([hue, 50, 50], 'hsv');
		assert.strictEqual(
			putImageDataCalls,
			1,
			'changing s/v with the same hue should not redraw the canvas',
		);
		value.rawValue = new IntColor([hue, 80, 20], 'hsv');
		assert.strictEqual(
			putImageDataCalls,
			1,
			'changing s/v again with the same hue should not redraw the canvas',
		);

		// Changing the hue must redraw.
		value.rawValue = new IntColor([(hue + 90) % 360, 80, 20], 'hsv');
		assert.strictEqual(
			putImageDataCalls,
			2,
			'changing the hue should redraw the canvas',
		);
	});
});
