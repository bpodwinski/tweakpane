import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/dom-test-util.js';
import {PointerHandler} from './pointer-handler.js';

function createRect(): DOMRect {
	return {
		x: 10,
		y: 20,
		width: 100,
		height: 50,
		top: 20,
		left: 10,
		right: 110,
		bottom: 70,
		toJSON() {
			return {};
		},
	} as DOMRect;
}

describe(PointerHandler.name, () => {
	it('should read layout (getBoundingClientRect) only once per mouse event', () => {
		const win = createTestWindow();
		const doc = win.document;
		const elem = doc.createElement('div');
		doc.body.appendChild(elem);

		let callCount = 0;
		const rect = createRect();
		elem.getBoundingClientRect = () => {
			callCount++;
			return rect;
		};

		const handler = new PointerHandler(elem);
		const downData: {bounds: {width: number; height: number}}[] = [];
		const moveData: {bounds: {width: number; height: number}}[] = [];
		const upData: {bounds: {width: number; height: number}}[] = [];
		handler.emitter.on('down', (ev) => downData.push(ev.data));
		handler.emitter.on('move', (ev) => moveData.push(ev.data));
		handler.emitter.on('up', (ev) => upData.push(ev.data));

		const winRef = win as unknown as typeof window;

		callCount = 0;
		elem.dispatchEvent(
			new winRef.MouseEvent('mousedown', {bubbles: true, cancelable: true}),
		);
		assert.strictEqual(callCount, 1, 'mousedown should read layout once');
		assert.strictEqual(downData.length, 1);
		assert.strictEqual(downData[0].bounds.width, 100);
		assert.strictEqual(downData[0].bounds.height, 50);

		callCount = 0;
		doc.dispatchEvent(
			new winRef.MouseEvent('mousemove', {bubbles: true, cancelable: true}),
		);
		assert.strictEqual(callCount, 1, 'mousemove should read layout once');
		assert.strictEqual(moveData.length, 1);

		callCount = 0;
		doc.dispatchEvent(
			new winRef.MouseEvent('mouseup', {bubbles: true, cancelable: true}),
		);
		assert.strictEqual(callCount, 1, 'mouseup should read layout once');
		assert.strictEqual(upData.length, 1);
	});

	function dispatchTouch(
		elem: HTMLElement,
		winRef: typeof window,
		type: string,
		touches: {clientX: number; clientY: number}[],
	): Event {
		const ev = new winRef.TouchEvent(type, {
			bubbles: true,
			cancelable: true,
			targetTouches: touches.map((t, i) => ({
				clientX: t.clientX,
				clientY: t.clientY,
				identifier: i,
				target: elem,
			})) as unknown as Touch[],
		});
		// jsdom's TouchList polyfill lacks `.item()`, which production code calls.
		(ev as any).targetTouches.item = (i: number) =>
			(ev as any).targetTouches[i];
		elem.dispatchEvent(ev);
		return ev;
	}

	it('should emit down/move/up for touch events, reading layout from the element', () => {
		const win = createTestWindow();
		const doc = win.document;
		const elem = doc.createElement('div');
		doc.body.appendChild(elem);
		elem.getBoundingClientRect = () => createRect();

		const handler = new PointerHandler(elem);
		const downData: {point: {x: number; y: number} | null}[] = [];
		const moveData: {point: {x: number; y: number} | null}[] = [];
		const upData: {point: {x: number; y: number} | null}[] = [];
		handler.emitter.on('down', (ev) => downData.push(ev.data));
		handler.emitter.on('move', (ev) => moveData.push(ev.data));
		handler.emitter.on('up', (ev) => upData.push(ev.data));

		const winRef = win as unknown as typeof window;

		dispatchTouch(elem, winRef, 'touchstart', [{clientX: 20, clientY: 30}]);
		assert.strictEqual(downData.length, 1);
		// rect.left/top = 10/20 (see createRect()), so offset = clientX/Y - rect.left/top.
		assert.deepStrictEqual(downData[0].point, {x: 10, y: 10});

		dispatchTouch(elem, winRef, 'touchmove', [{clientX: 30, clientY: 40}]);
		assert.strictEqual(moveData.length, 1);
		assert.deepStrictEqual(moveData[0].point, {x: 20, y: 20});

		dispatchTouch(elem, winRef, 'touchend', []);
		assert.strictEqual(upData.length, 1);
		// touchend has no current touches; it falls back to the last seen touch.
		assert.deepStrictEqual(upData[0].point, {x: 20, y: 20});
	});

	it('should emit a null point when a touch event has no matching touch', () => {
		const win = createTestWindow();
		const doc = win.document;
		const elem = doc.createElement('div');
		doc.body.appendChild(elem);
		elem.getBoundingClientRect = () => createRect();

		const handler = new PointerHandler(elem);
		const downData: {point: {x: number; y: number} | null}[] = [];
		handler.emitter.on('down', (ev) => downData.push(ev.data));

		const winRef = win as unknown as typeof window;
		dispatchTouch(elem, winRef, 'touchstart', []);

		assert.strictEqual(downData.length, 1);
		assert.strictEqual(downData[0].point, null);
	});
});
