import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {afterEach, beforeEach, describe, it} from 'mocha';
import {
	createNumberFormatter,
	createValue,
	forceCast,
	NumberTextPropsObject,
	ValueMap,
	ViewProps,
} from 'tweakpane-reborn-core';

import {CubicBezier} from '../model/cubic-bezier.js';
import {CubicBezierPickerController} from './cubic-bezier-picker.js';

function createVisualTestWindow(): Window {
	return forceCast(new JSDOM('', {pretendToBeVisual: true}).window);
}

describe(CubicBezierPickerController.name, () => {
	let prevRaf: unknown;
	let prevCaf: unknown;
	let prevMo: unknown;
	let activeViewProps: ViewProps | null;

	beforeEach(() => {
		const g = globalThis as any;
		prevRaf = g.requestAnimationFrame;
		prevCaf = g.cancelAnimationFrame;
		prevMo = g.MutationObserver;
		activeViewProps = null;
	});

	afterEach(() => {
		activeViewProps?.set('disposed', true);

		const g = globalThis as any;
		g.requestAnimationFrame = prevRaf;
		g.cancelAnimationFrame = prevCaf;
		g.MutationObserver = prevMo;
	});

	function createController(win: Window) {
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const doc = win.document;
		const value = createValue(new CubicBezier(0.2, 0.8, 0.6, 0.1));
		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const c = new CubicBezierPickerController(doc, {
			axis: {
				textProps: ValueMap.fromObject<NumberTextPropsObject>({
					formatter: createNumberFormatter(2),
					keyScale: 0.1,
					pointerScale: 0.1,
				}),
			},
			value,
			viewProps,
		});
		return {c, value};
	}

	it('should render a graph inside graphElement and text inputs inside textElement', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win);

		assert.ok(c.view.graphElement.querySelector('div'));
		assert.strictEqual(c.view.textElement.querySelectorAll('input').length, 4);
	});

	it('should list the graph and 4 text inputs as focusable elements', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win);

		assert.strictEqual(c.allFocusableElements.length, 5);
		assert.strictEqual(
			c.allFocusableElements[0],
			c.view.element.querySelector('.tp-cbzgv'),
		);
	});

	it('should refresh without throwing', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win);
		assert.doesNotThrow(() => c.refresh());
	});
});
