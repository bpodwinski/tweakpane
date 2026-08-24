import {Foldable} from '@tweakpane/core/dist/blade/common/model/foldable.js';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {RotationInputView} from './RotationInputView.js';

describe(RotationInputView.name, () => {
	it('should create swatch/text elements and no picker element by default (popup layout)', () => {
		const doc = createTestWindow().document;
		const view = new RotationInputView(doc, {
			rotationMode: 'euler',
			foldable: Foldable.create(false),
			pickerLayout: 'popup',
		});

		assert.ok(view.swatchElement);
		assert.ok(view.textElement);
		assert.strictEqual(view.pickerElement, null);
	});

	it('should create a picker element for an inline layout', () => {
		const doc = createTestWindow().document;
		const view = new RotationInputView(doc, {
			rotationMode: 'euler',
			foldable: Foldable.create(false),
			pickerLayout: 'inline',
		});

		assert.ok(view.pickerElement);
	});

	it('should add the "quat" modifier class in quaternion mode', () => {
		const doc = createTestWindow().document;
		const view = new RotationInputView(doc, {
			rotationMode: 'quaternion',
			foldable: Foldable.create(false),
			pickerLayout: 'popup',
		});

		assert.ok(view.element.classList.contains('tp-rotationv_quat'));
	});

	it('should not add the "quat" modifier class in euler mode', () => {
		const doc = createTestWindow().document;
		const view = new RotationInputView(doc, {
			rotationMode: 'euler',
			foldable: Foldable.create(false),
			pickerLayout: 'popup',
		});

		assert.ok(!view.element.classList.contains('tp-rotationv_quat'));
	});
});
