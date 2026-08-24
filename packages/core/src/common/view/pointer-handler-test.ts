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
});
