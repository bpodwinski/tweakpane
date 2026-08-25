import {createValue, forceCast, ViewProps} from '@tweakpane/core';
import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {Quaternion} from './Quaternion.js';
import {RotationInputGizmoController} from './RotationInputGizmoController.js';
import {Vector3} from './Vector3.js';

function createVisualTestWindow(): Window {
	return forceCast(new JSDOM('', {pretendToBeVisual: true}).window);
}

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

	it('should ignore a touch event with no matching touch', () => {
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

		const winRef = win as unknown as typeof window;
		const ev = new winRef.TouchEvent('touchstart', {
			bubbles: true,
			cancelable: true,
			targetTouches: [] as unknown as Touch[],
		});
		(ev as any).targetTouches.item = (i: number) =>
			(ev as any).targetTouches[i];
		c.view.padElement.dispatchEvent(ev);

		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);
	});

	it('should not change rotation on a zero-distance move in free mode', () => {
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
		// Same coordinates as the down: dx = dy = 0, exercising the l === 0
		// early-return branch in handlePointerEvent_'s free-mode drag.
		dispatchMouse(doc, win, 'mousemove', 50, 50);

		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);
	});

	it('should rotate around a fixed axis while in an angle-x/y/z mode, both on the first and subsequent moves', () => {
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

		// Force angle-x mode directly, bypassing the tiny arc hit-regions, to
		// exercise handlePointerEvent_'s angle-x/y/z branch (both the
		// angleState_-initializing first move and the angleState_-reusing
		// subsequent move).
		(c as any).mode_.rawValue = 'angle-x';

		// The first pointer event (down) only seeds angleState_ from the
		// current angle; it doesn't change the value yet.
		dispatchMouse(c.view.padElement, win, 'mousedown', 80, 50);
		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);

		// The first move computes an angle diff against that seed, taking the
		// angleState_-initializing branch's else-path for the first time.
		dispatchMouse(doc, win, 'mousemove', 50, 80);
		const afterFirst = value.rawValue.getComponents();
		assert.notDeepStrictEqual(afterFirst, [0, 0, 0, 1]);

		// A second move reuses the same angleState_, exercising the
		// angleState_-already-set branch a second time.
		dispatchMouse(doc, win, 'mousemove', 20, 50);
		const afterSecond = value.rawValue.getComponents();
		assert.notDeepStrictEqual(afterSecond, afterFirst);
		assert.ok(Math.abs(value.rawValue.length - 1) < 1e-9);
	});

	it('should select the Y axis in angle-y mode and reverse the angle when applicable', () => {
		const win = createTestWindow();
		const doc = win.document;
		// Rotated -90deg about Y so that VEC3_YP.applyQuaternion(...).z > 0,
		// exercising the reverseAngle = true branch (mode is angle-y here, so
		// this also exercises the `mode === 'angle-y' ? VEC3_YP` branch).
		const value = createValue<Quaternion>(
			Quaternion.fromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2),
		);
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});
		c.view.padElement.getBoundingClientRect = createRect;

		(c as any).mode_.rawValue = 'angle-y';

		const before = value.rawValue.getComponents();
		dispatchMouse(c.view.padElement, win, 'mousedown', 80, 50);
		assert.deepStrictEqual(value.rawValue.getComponents(), before);

		dispatchMouse(doc, win, 'mousemove', 50, 80);
		assert.notDeepStrictEqual(value.rawValue.getComponents(), before);
		assert.ok(Math.abs(value.rawValue.length - 1) < 1e-9);
	});

	it('should select the Z axis in angle-z mode', () => {
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

		(c as any).mode_.rawValue = 'angle-z';

		dispatchMouse(c.view.padElement, win, 'mousedown', 80, 50);
		dispatchMouse(doc, win, 'mousemove', 50, 80);

		assert.notDeepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);
		assert.ok(Math.abs(value.rawValue.length - 1) < 1e-9);
	});

	it('should rotate around Z while in angle-r mode, both on the first and subsequent moves', () => {
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

		(c as any).mode_.rawValue = 'angle-r';

		dispatchMouse(c.view.padElement, win, 'mousedown', 80, 50);
		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);

		dispatchMouse(doc, win, 'mousemove', 50, 80);
		const afterFirst = value.rawValue.getComponents();
		assert.notDeepStrictEqual(afterFirst, [0, 0, 0, 1]);

		dispatchMouse(doc, win, 'mousemove', 20, 50);
		const afterSecond = value.rawValue.getComponents();
		assert.notDeepStrictEqual(afterSecond, afterFirst);
		assert.ok(Math.abs(value.rawValue.length - 1) < 1e-9);
	});

	it('should do nothing on pointer events while in auto mode', () => {
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

		(c as any).mode_.rawValue = 'auto';

		dispatchMouse(c.view.padElement, win, 'mousedown', 50, 50);
		dispatchMouse(doc, win, 'mousemove', 80, 80);

		assert.deepStrictEqual(value.rawValue.getComponents(), [0, 0, 0, 1]);
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

	it('should rotate around Z while dragging the r-arc, and reset to free mode on up', () => {
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
		(c.view.rArcElement as unknown as HTMLElement).getBoundingClientRect =
			createRect;

		dispatchMouse(
			c.view.rArcElement as unknown as HTMLElement,
			win,
			'mousedown',
			50,
			50,
		);
		dispatchMouse(
			c.view.rArcElement as unknown as HTMLElement,
			win,
			'mouseup',
			50,
			50,
		);

		dispatchMouse(c.view.padElement, win, 'mousedown', 60, 50);
		dispatchMouse(doc, win, 'mousemove', 50, 60);

		const q = value.rawValue;
		assert.ok(Math.abs(q.length - 1) < 1e-9);
		assert.notDeepStrictEqual(q.getComponents(), [0, 0, 0, 1]);
	});

	it('should auto-rotate to a preset orientation when a label is clicked', function (done) {
		this.timeout(2000);
		const win = createVisualTestWindow();
		const doc = win.document;
		const g = globalThis as any;
		const prevRaf = g.requestAnimationFrame;
		const prevCaf = g.cancelAnimationFrame;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		const value = createValue<Quaternion>(new Quaternion());
		const c = new RotationInputGizmoController(doc, {
			value,
			viewProps: ViewProps.create(),
			pickerLayout: 'popup',
			pointerScale: 1,
		});

		(c.view.xLabel as unknown as HTMLElement).getBoundingClientRect =
			createRect;
		dispatchMouse(
			c.view.xLabel as unknown as HTMLElement,
			win,
			'mousedown',
			0,
			0,
		);

		const before = value.rawValue.getComponents();

		setTimeout(() => {
			// After the animation completes, the value should have moved toward
			// the label's target orientation and settled (no longer 'auto').
			assert.notDeepStrictEqual(value.rawValue.getComponents(), before);
			assert.ok(Math.abs(value.rawValue.length - 1) < 1e-6);
			// Restore to a harmless no-op rather than the (likely undefined)
			// previous value: a straggling rAF callback from this animation
			// firing just after cleanup must not crash a later, unrelated test.
			g.requestAnimationFrame = prevRaf ?? (() => 0);
			g.cancelAnimationFrame = prevCaf ?? (() => {});
			done();
		}, 800);
	});

	it('should toggle the r-arc hover class on mouseenter/mouseleave', () => {
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
		// rArcElement is the invisible collision layer that owns the hover
		// listeners; the hover class is toggled on the separate visible arc.
		const rArcCollision = c.view.rArcElement;
		const rArcVisible = c.view.element.querySelector(
			'.tp-rotationgizmov_arcr',
		) as SVGElement;

		rArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseenter', {bubbles: false}),
		);
		assert.ok(rArcVisible.classList.contains('tp-rotationgizmov_arcr_hover'));

		rArcCollision.dispatchEvent(
			new winRef.MouseEvent('mouseleave', {bubbles: false}),
		);
		assert.ok(!rArcVisible.classList.contains('tp-rotationgizmov_arcr_hover'));
	});
});
