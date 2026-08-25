import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/dom-test-util.js';
import {TestUtil} from '../../../misc/test-util.js';
import {createNumberFormatter, parseNumber} from '../../converter/number.js';
import {ValueMap} from '../../model/value-map.js';
import {createValue} from '../../model/values.js';
import {ViewProps} from '../../model/view-props.js';
import {NumberTextController} from './number-text.js';

function createRect(): DOMRect {
	return {
		x: 0,
		y: 0,
		width: 100,
		height: 20,
		top: 0,
		left: 0,
		right: 100,
		bottom: 20,
		toJSON() {
			return {};
		},
	} as DOMRect;
}

function dispatchMouse(
	target: EventTarget,
	win: Window,
	type: string,
	pageX: number,
): void {
	const ev = new (win as unknown as typeof window).MouseEvent(type, {
		bubbles: true,
		cancelable: true,
	});
	Object.defineProperty(ev, 'pageX', {value: pageX, configurable: true});
	Object.defineProperty(ev, 'pageY', {value: 0, configurable: true});
	target.dispatchEvent(ev);
}

describe(NumberTextController.name, () => {
	it('should update value with key', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			value: createValue(123),
			viewProps: ViewProps.create(),
		});

		c.view.inputElement.dispatchEvent(
			TestUtil.createKeyboardEvent(win, 'keydown', {
				key: 'ArrowUp',
				shiftKey: true,
			}),
		);
		assert.strictEqual(c.value.rawValue, 123 + 10);
	});

	it('should revert value for invalid input', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			value: createValue(123),
			viewProps: ViewProps.create(),
		});

		const inputElem = c.view.inputElement;
		inputElem.value = 'foobar';
		inputElem.dispatchEvent(TestUtil.createEvent(win, 'change'));
		assert.strictEqual(inputElem.value, '123');
	});

	it('should apply the slider min/max constraint to a valid text input', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			sliderProps: ValueMap.fromObject({keyScale: 1, max: 10, min: 0}),
			value: createValue(5),
			viewProps: ViewProps.create(),
		});

		const inputElem = c.view.inputElement;
		inputElem.value = '999';
		inputElem.dispatchEvent(TestUtil.createEvent(win, 'change'));
		assert.strictEqual(c.value.rawValue, 10);
	});

	it('should ignore keydown/keyup with no effective step', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			value: createValue(5),
			viewProps: ViewProps.create(),
		});

		c.view.inputElement.dispatchEvent(
			TestUtil.createKeyboardEvent(win, 'keydown', {key: 'Enter'}),
		);
		c.view.inputElement.dispatchEvent(
			TestUtil.createKeyboardEvent(win, 'keyup', {key: 'Enter'}),
		);
		assert.strictEqual(c.value.rawValue, 5);
	});

	it('should finalize the value on keyup after a keydown step', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			value: createValue(5),
			viewProps: ViewProps.create(),
		});

		c.view.inputElement.dispatchEvent(
			TestUtil.createKeyboardEvent(win, 'keydown', {key: 'ArrowUp'}),
		);
		c.view.inputElement.dispatchEvent(
			TestUtil.createKeyboardEvent(win, 'keyup', {key: 'ArrowUp'}),
		);
		assert.strictEqual(c.value.rawValue, 6);
	});

	it('should drag the value via the knob, constrained, and reset dragging on up', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			sliderProps: ValueMap.fromObject({keyScale: 1, max: 10, min: 0}),
			value: createValue(5),
			viewProps: ViewProps.create(),
		});
		c.view.knobElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.knobElement, win, 'mousedown', 50);
		assert.strictEqual(c.value.rawValue, 5);

		// bounds width=100 -> center at pageX=50; dragging right by 60px * pointerScale(1)
		dispatchMouse(doc, win, 'mousemove', 110);
		assert.strictEqual(c.value.rawValue, 10); // constrained to max

		dispatchMouse(doc, win, 'mouseup', 110);
		assert.strictEqual(c.value.rawValue, 10);
	});

	it('should ignore a touch event with no matching touch', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = new NumberTextController(doc, {
			parser: parseNumber,
			props: ValueMap.fromObject({
				formatter: createNumberFormatter(0),
				keyScale: 1,
				pointerScale: 1,
			}),
			value: createValue(5),
			viewProps: ViewProps.create(),
		});
		c.view.knobElement.getBoundingClientRect = createRect;

		const winRef = win as unknown as typeof window;
		const ev = new winRef.TouchEvent('touchmove', {
			bubbles: true,
			cancelable: true,
			targetTouches: [] as unknown as Touch[],
		});
		(ev as any).targetTouches.item = (i: number) =>
			(ev as any).targetTouches[i];
		c.view.knobElement.dispatchEvent(ev);

		assert.strictEqual(c.value.rawValue, 5);
	});
});
