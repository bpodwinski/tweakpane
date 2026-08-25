import * as assert from 'assert';
import {describe, it} from 'mocha';
import {createValue, ViewProps} from 'tweakpane-reborn-core';

import {createTestWindow} from '../../misc/test-util.js';
import {Quaternion} from './Quaternion.js';
import {RotationInputSwatchView} from './RotationInputSwatchView.js';
import {Vector3} from './Vector3.js';

describe(RotationInputSwatchView.name, () => {
	it('should render a button containing an svg with 4 arcs', () => {
		const doc = createTestWindow().document;
		const value = createValue(new Quaternion());
		const view = new RotationInputSwatchView(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		const svg = view.buttonElement.querySelector('svg');
		assert.ok(svg);
		assert.strictEqual(svg?.querySelectorAll('path').length, 4);
	});

	it('should update the arc paths when the value changes', () => {
		const doc = createTestWindow().document;
		const value = createValue(new Quaternion());
		const view = new RotationInputSwatchView(doc, {
			value,
			viewProps: ViewProps.create(),
		});

		const arcs = Array.from(
			view.buttonElement.querySelectorAll('svg path.tp-rotationswatchv_arc'),
		);
		const before = arcs.map((el) => el.getAttribute('d'));

		value.rawValue = Quaternion.fromAxisAngle(
			new Vector3(1, 0, 0),
			Math.PI / 2,
		);

		const after = arcs.map((el) => el.getAttribute('d'));
		assert.notDeepStrictEqual(after, before);
	});
});
