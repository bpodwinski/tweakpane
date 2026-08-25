import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createNumberFormatter} from '../../../common/converter/number.js';
import {
	createPushedBuffer,
	initializeBuffer,
} from '../../../common/model/buffered-value.js';
import {ValueMap} from '../../../common/model/value-map.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {GraphLogController} from './graph-log.js';

function createController(doc: Document) {
	let buffer = initializeBuffer<number>(4);
	buffer = createPushedBuffer(buffer, 1);
	buffer = createPushedBuffer(buffer, 2);
	buffer = createPushedBuffer(buffer, 3);
	buffer = createPushedBuffer(buffer, 4);

	return new GraphLogController(doc, {
		formatter: createNumberFormatter(0),
		props: ValueMap.fromObject({max: 10, min: 0}),
		rows: 1,
		value: createValue(buffer),
		viewProps: ViewProps.create(),
	});
}

describe(`${GraphLogController.name} cursor`, () => {
	it('should move the cursor on mousemove (non-touch environment)', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = createController(doc);
		Object.defineProperty(c.view.element, 'clientWidth', {
			configurable: true,
			get: () => 100,
		});

		const ev = new (win as any).MouseEvent('mousemove', {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(ev, 'offsetX', {value: 50, configurable: true});
		c.view.element.dispatchEvent(ev);

		// mapRange(50, 0, 100, 0, 4) -> 2
		assert.strictEqual((c as any).cursor_.rawValue, 2);
	});

	it('should reset the cursor on mouseleave', () => {
		const win = createTestWindow();
		const doc = win.document;
		const c = createController(doc);

		c.view.element.dispatchEvent(
			new (win as any).Event('mouseleave', {bubbles: true}),
		);
		assert.strictEqual((c as any).cursor_.rawValue, -1);
	});

	it('should move the cursor on touch pointer down/move and reset on up', () => {
		const win = createTestWindow();
		const doc = win.document;
		(doc as any).ontouchstart = null; // makes supportsTouch() report true

		const c = createController(doc);
		c.view.element.getBoundingClientRect = () =>
			({
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
			} as DOMRect);

		const dispatchMouse = (
			target: EventTarget,
			type: string,
			pageX: number,
		) => {
			const ev = new (win as any).MouseEvent(type, {
				bubbles: true,
				cancelable: true,
			});
			Object.defineProperty(ev, 'pageX', {value: pageX, configurable: true});
			Object.defineProperty(ev, 'pageY', {value: 0, configurable: true});
			target.dispatchEvent(ev);
		};

		dispatchMouse(c.view.element, 'mousedown', 25);
		// mapRange(25, 0, 100, 0, 4) -> 1
		assert.strictEqual((c as any).cursor_.rawValue, 1);

		// PointerHandler attaches mouseup on the document, not the element itself.
		dispatchMouse(doc, 'mouseup', 25);
		assert.strictEqual((c as any).cursor_.rawValue, -1);
	});

	it('should reset the cursor on a touch move with no matching touch', () => {
		const win = createTestWindow();
		const doc = win.document;
		(doc as any).ontouchstart = null;

		const c = createController(doc);
		(c as any).cursor_.rawValue = 2;

		const ev = new (win as any).TouchEvent('touchmove', {
			bubbles: true,
			cancelable: true,
			targetTouches: [] as unknown as Touch[],
		});
		(ev as any).targetTouches.item = (i: number) =>
			(ev as any).targetTouches[i];
		c.view.element.dispatchEvent(ev);

		assert.strictEqual((c as any).cursor_.rawValue, -1);
	});
});
