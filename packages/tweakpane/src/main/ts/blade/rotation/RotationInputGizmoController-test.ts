import {createValue, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {Quaternion} from './Quaternion.js';
import {RotationInputGizmoController} from './RotationInputGizmoController.js';

function createRect(): DOMRect {
	return {
		x: 0,
		y: 0,
		width: 100,
		height: 100,
		top: 0,
		left: 0,
		right: 100,
		bottom: 100,
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
	pageY: number,
): void {
	const ev = new (win as unknown as typeof window).MouseEvent(type, {
		bubbles: true,
		cancelable: true,
	});
	Object.defineProperty(ev, 'pageX', {value: pageX, configurable: true});
	Object.defineProperty(ev, 'pageY', {value: pageY, configurable: true});
	target.dispatchEvent(ev);
}

describe(RotationInputGizmoController.name, () => {
	it('should not change rotation on the initial pointer down (needs 2 points to derive an axis)', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue<Quaternion>(new Quaternion());
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});
		c.view.padElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.padElement, win, 'mousedown', 50, 50);

		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);
	});

	it('should rotate on drag move in free mode', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue<Quaternion>(new Quaternion());
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});
		c.view.padElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.padElement, win, 'mousedown', 50, 50);
		dispatchMouse(doc, win, 'mousemove', 60, 50);

		const q = value.rawValue;
		assert.ok(Math.abs(q.length - 1) < 1e-9);
		assert.notDeepStrictEqual(q.getComponents(), [0, 0, 0, 1]);
	});

	it('should reset the drag anchor on pointer up', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue<Quaternion>(new Quaternion());
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});
		c.view.padElement.getBoundingClientRect = createRect;

		dispatchMouse(c.view.padElement, win, 'mousedown', 50, 50);
		dispatchMouse(doc, win, 'mousemove', 60, 50);
		dispatchMouse(doc, win, 'mouseup', 60, 50);

		const afterUp = value.rawValue.getComponents();

		// A move right after 'up' (without a new mousedown) has no prior anchor,
		// so it must not change the rotation.
		dispatchMouse(doc, win, 'mousemove', 70, 50);
		assert.deepStrictEqual(value.rawValue.getComponents(), afterUp);
	});

	it('should rotate a fixed step on arrow keydown', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue<Quaternion>(new Quaternion());
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});

		const winRef = win as unknown as typeof window;
		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'ArrowRight',
			}),
		);

		const q = value.rawValue;
		assert.ok(Math.abs(q.length - 1) < 1e-9);
		assert.notDeepStrictEqual(q.getComponents(), [0, 0, 0, 1]);
	});

	it('should ignore non-arrow keydown', () => {
		const win = createTestWindow();
		const doc = win.document;
		const value = createValue<Quaternion>(new Quaternion());
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});

		const winRef = win as unknown as typeof window;
		c.view.padElement.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
			}),
		);

		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);
	});
});
