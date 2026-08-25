import * as assert from 'assert';
import {describe, it} from 'mocha';
import {ViewProps} from 'tweakpane-reborn-core';

import {createTestWindow} from '../../../misc/test-util.js';
import {CubicBezierPickerView} from './cubic-bezier-picker.js';

describe(CubicBezierPickerView.name, () => {
	it('should render a graph element and a text element', () => {
		const doc = createTestWindow().document;
		const view = new CubicBezierPickerView(doc, {
			viewProps: ViewProps.create(),
		});

		assert.ok(view.graphElement);
		assert.ok(view.textElement);
		assert.ok(view.element.contains(view.graphElement));
		assert.ok(view.element.contains(view.textElement));
	});
});
