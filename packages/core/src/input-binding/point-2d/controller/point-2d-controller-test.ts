import * as assert from 'assert';
import {describe, it} from 'mocha';

import {parseNumber} from '../../../common/converter/number.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createPointAxis} from '../../../common/point-nd/point-axis.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {Point2d} from '../model/point-2d.js';
import {Point2dController} from './point-2d.js';

function createAxes() {
	return [
		createPointAxis({constraint: undefined, initialValue: 0, params: {}}),
		createPointAxis({constraint: undefined, initialValue: 0, params: {}}),
	] as [ReturnType<typeof createPointAxis>, ReturnType<typeof createPointAxis>];
}

function createController(
	doc: Document,
	pickerLayout: 'inline' | 'popup',
	expanded = false,
) {
	const value = createValue(new Point2d(0, 0));
	const c = new Point2dController(doc, {
		axes: createAxes(),
		expanded,
		invertsY: false,
		max: 100,
		parser: parseNumber,
		pickerLayout,
		value,
		viewProps: ViewProps.create(),
	});
	return {c, value};
}

describe(Point2dController.name, () => {
	it('should render a text controller with 2 inputs', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		assert.strictEqual(c.textController.view.textViews.length, 2);
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

	it('should expand the popup when the pad button is clicked, and collapse on a second click', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.buttonElement as HTMLButtonElement;
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(!popup.classList.contains('tp-popv-v'));

		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		assert.ok(popup.classList.contains('tp-popv-v'));

		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on Escape from within the pad', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		(c.view.buttonElement as HTMLButtonElement).dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const pad = popup.querySelector('.tp-p2dpv_p') as HTMLElement;
		pad.dispatchEvent(
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

		(c.view.buttonElement as HTMLButtonElement).dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const outside = doc.createElement('div');
		doc.body.appendChild(outside);
		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: outside});
		(c.view.buttonElement as HTMLButtonElement).dispatchEvent(blurEvent);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should keep the popup open when blur moves within the pad', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		(c.view.buttonElement as HTMLButtonElement).dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const pad = popup.querySelector('.tp-p2dpv_p') as HTMLElement;

		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: pad});
		pad.dispatchEvent(blurEvent);

		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should keep the popup open when blur moves to the trigger button', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		const button = c.view.buttonElement as HTMLButtonElement;
		button.dispatchEvent(new winRef.MouseEvent('click', {bubbles: true}));
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const pad = popup.querySelector('.tp-p2dpv_p') as HTMLElement;

		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: button});
		pad.dispatchEvent(blurEvent);

		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on blur to an unrelated element from within the pad', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'popup');
		const winRef = doc.defaultView as any;

		(c.view.buttonElement as HTMLButtonElement).dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const pad = popup.querySelector('.tp-p2dpv_p') as HTMLElement;

		const outside = doc.createElement('div');
		doc.body.appendChild(outside);
		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: outside});
		pad.dispatchEvent(blurEvent);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should focus the trigger button on Escape from the pad in inline layout', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'inline');
		const winRef = doc.defaultView as any;

		const pad = c.view.pickerElement?.querySelector(
			'.tp-p2dpv_p',
		) as HTMLElement;
		let focused = false;
		(c.view.buttonElement as HTMLButtonElement).focus = () => {
			focused = true;
		};

		pad.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Escape',
			}),
		);

		assert.strictEqual(focused, true);
	});

	it('should no-op on button/pad blur in inline layout (no popup to close)', () => {
		const doc = createTestWindow().document;
		const {c} = createController(doc, 'inline');
		const winRef = doc.defaultView as any;

		const pad = c.view.pickerElement?.querySelector(
			'.tp-p2dpv_p',
		) as HTMLElement;

		assert.doesNotThrow(() => {
			(c.view.buttonElement as HTMLButtonElement).dispatchEvent(
				new winRef.FocusEvent('blur', {bubbles: true}),
			);
			pad.dispatchEvent(new winRef.FocusEvent('blur', {bubbles: true}));
		});
	});
});
