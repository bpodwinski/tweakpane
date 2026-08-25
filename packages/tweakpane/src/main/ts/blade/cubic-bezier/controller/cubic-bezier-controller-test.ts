import {
	createNumberFormatter,
	createValue,
	forceCast,
	NumberTextPropsObject,
	ValueMap,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {afterEach, beforeEach, describe, it} from 'mocha';

import {CubicBezier} from '../model/cubic-bezier.js';
import {CubicBezierController} from './cubic-bezier.js';

function createVisualTestWindow(): Window {
	return forceCast(new JSDOM('', {pretendToBeVisual: true}).window);
}

describe(CubicBezierController.name, () => {
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

	function createController(
		win: Window,
		pickerLayout: 'inline' | 'popup',
		expanded = false,
	) {
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const doc = win.document;
		const value = createValue(new CubicBezier(0.2, 0.8, 0.6, 0.1));
		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const c = new CubicBezierController(doc, {
			axis: {
				textProps: ValueMap.fromObject<NumberTextPropsObject>({
					formatter: createNumberFormatter(2),
					keyScale: 0.1,
					pointerScale: 0.1,
				}),
			},
			expanded,
			pickerLayout,
			value,
			viewProps,
		});
		return {c, value};
	}

	it('should render a button and a text input', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');

		assert.ok(c.view.buttonElement);
		assert.ok(c.view.textElement.querySelector('input'));
	});

	it('should append the picker into a popup for the "popup" layout', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');

		assert.strictEqual(c.view.pickerElement, null);
		assert.ok(c.view.element.querySelector('.tp-popv'));
	});

	it('should append the picker inline for the "inline" layout', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'inline');

		assert.ok(c.view.pickerElement);
		assert.strictEqual(c.view.element.querySelector('.tp-popv'), null);
	});

	it('should expand the popup when the button is clicked, and collapse on a second click', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');
		const winRef = win as unknown as typeof window;

		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(!popup.classList.contains('tp-popv-v'));

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		assert.ok(popup.classList.contains('tp-popv-v'));

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on Escape from within the graph', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');
		const winRef = win as unknown as typeof window;

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const graph = popup.querySelector('.tp-cbzgv') as HTMLElement;
		graph.dispatchEvent(
			new winRef.KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Escape',
			}),
		);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should keep the popup open when blur moves within the graph or to the trigger button', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');
		const winRef = win as unknown as typeof window;

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const graph = popup.querySelector('.tp-cbzgv') as HTMLElement;

		const blurToGraph = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurToGraph, 'relatedTarget', {value: graph});
		graph.dispatchEvent(blurToGraph);
		assert.ok(popup.classList.contains('tp-popv-v'));

		const blurToButton = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurToButton, 'relatedTarget', {
			value: c.view.buttonElement,
		});
		graph.dispatchEvent(blurToButton);
		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup on blur to an unrelated element from within the graph', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');
		const winRef = win as unknown as typeof window;

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const graph = popup.querySelector('.tp-cbzgv') as HTMLElement;

		const outside = win.document.createElement('div');
		win.document.body.appendChild(outside);
		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: outside});
		graph.dispatchEvent(blurEvent);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should close the popup when the trigger button blurs to an unrelated element', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');
		const winRef = win as unknown as typeof window;

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const outside = win.document.createElement('div');
		win.document.body.appendChild(outside);
		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: outside});
		c.view.buttonElement.dispatchEvent(blurEvent);

		assert.ok(!popup.classList.contains('tp-popv-v'));
	});

	it('should keep the popup open when the trigger button blurs into the popup', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'popup');
		const winRef = win as unknown as typeof window;

		c.view.buttonElement.dispatchEvent(
			new winRef.MouseEvent('click', {bubbles: true}),
		);
		const popup = c.view.element.querySelector('.tp-popv') as HTMLElement;
		const graph = popup.querySelector('.tp-cbzgv') as HTMLElement;
		assert.ok(popup.classList.contains('tp-popv-v'));

		const blurEvent = new winRef.FocusEvent('blur', {bubbles: true});
		Object.defineProperty(blurEvent, 'relatedTarget', {value: graph});
		c.view.buttonElement.dispatchEvent(blurEvent);

		assert.ok(popup.classList.contains('tp-popv-v'));
	});

	it('should no-op on button blur in inline layout (no popup to close)', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'inline');
		const winRef = win as unknown as typeof window;

		assert.doesNotThrow(() => {
			c.view.buttonElement.dispatchEvent(
				new winRef.FocusEvent('blur', {bubbles: true}),
			);
		});
	});

	it('should no-op on graph blur/Escape in inline layout (no popup to close)', () => {
		const win = createVisualTestWindow();
		const {c} = createController(win, 'inline');
		const winRef = win as unknown as typeof window;

		const graph = c.view.pickerElement?.querySelector(
			'.tp-cbzgv',
		) as HTMLElement;

		assert.doesNotThrow(() => {
			graph.dispatchEvent(new winRef.FocusEvent('blur', {bubbles: true}));
			graph.dispatchEvent(
				new winRef.KeyboardEvent('keydown', {
					bubbles: true,
					cancelable: true,
					key: 'Escape',
				}),
			);
		});
	});
});
