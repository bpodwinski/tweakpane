import {createValue, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {Quaternion} from './Quaternion.js';
import {RotationInputGizmoView} from './RotationInputGizmoView.js';

function createView() {
	const doc = createTestWindow().document;
	const value = createValue<Quaternion>(new Quaternion());
	const mode = createValue<
		'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r' | 'auto'
	>('free');
	const view = new RotationInputGizmoView(doc, {
		value,
		mode,
		viewProps: ViewProps.create(),
		pickerLayout: 'popup',
	});
	return {view, value, mode};
}

describe(RotationInputGizmoView.name, () => {
	it('should expose the pad element as the only focusable element', () => {
		const {view} = createView();
		assert.deepStrictEqual(view.allFocusableElements, [view.padElement]);
	});

	it('should toggle the X arc hover class on mouseenter/mouseleave', () => {
		const {view} = createView();
		const winRef = view.element.ownerDocument.defaultView as any;

		const xArcCollision = view.xArcBElement;
		const xArcVisible = view.element.querySelector(
			'.tp-rotationgizmov_arcx',
		) as SVGElement;

		xArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseenter', {bubbles: false}),
		);
		assert.ok(xArcVisible.classList.contains('tp-rotationgizmov_arcx_hover'));

		xArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseleave', {bubbles: false}),
		);
		assert.ok(!xArcVisible.classList.contains('tp-rotationgizmov_arcx_hover'));
	});

	it('should toggle the Y arc hover class on mouseenter/mouseleave', () => {
		const {view} = createView();
		const winRef = view.element.ownerDocument.defaultView as any;

		const yArcCollision = view.yArcBElement;
		const yArcVisible = view.element.querySelector(
			'.tp-rotationgizmov_arcy',
		) as SVGElement;

		yArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseenter', {bubbles: false}),
		);
		assert.ok(yArcVisible.classList.contains('tp-rotationgizmov_arcy_hover'));

		yArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseleave', {bubbles: false}),
		);
		assert.ok(!yArcVisible.classList.contains('tp-rotationgizmov_arcy_hover'));
	});

	it('should toggle the Z arc hover class on mouseenter/mouseleave', () => {
		const {view} = createView();
		const winRef = view.element.ownerDocument.defaultView as any;

		const zArcCollision = view.zArcBElement;
		const zArcVisible = view.element.querySelector(
			'.tp-rotationgizmov_arcz',
		) as SVGElement;

		zArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseenter', {bubbles: false}),
		);
		assert.ok(zArcVisible.classList.contains('tp-rotationgizmov_arcz_hover'));

		zArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseleave', {bubbles: false}),
		);
		assert.ok(!zArcVisible.classList.contains('tp-rotationgizmov_arcz_hover'));
	});

	it('should re-render axes/arcs/labels on a value change', () => {
		const {view, value} = createView();
		const beforeTransform = view.xLabel.getAttribute('transform');

		value.rawValue = Quaternion.fromAxisAngle(
			{x: 0, y: 1, z: 0} as any,
			Math.PI / 2,
		);

		assert.notStrictEqual(
			view.xLabel.getAttribute('transform'),
			beforeTransform,
		);
	});

	it('should toggle active arc classes as the mode changes', () => {
		const {view, mode} = createView();
		const xArcB = view.element.querySelector(
			'.tp-rotationgizmov_arcx',
		) as SVGElement;

		mode.rawValue = 'angle-x';
		assert.ok(xArcB.classList.contains('tp-rotationgizmov_arcx_active'));

		mode.rawValue = 'free';
		assert.ok(!xArcB.classList.contains('tp-rotationgizmov_arcx_active'));
	});
});
