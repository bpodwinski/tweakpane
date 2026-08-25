import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {afterEach, beforeEach, describe, it} from 'mocha';
import {
	ButtonController,
	ButtonPropsObject,
	createBlade,
	forceCast,
	LabeledValueBladeController,
	LabelPropsObject,
	PluginPool,
	ValueMap,
	ViewProps,
} from 'tweakpane-reborn-core';
import {BladeApiCache} from 'tweakpane-reborn-core/dist/plugin/blade-api-cache.js';

import {CubicBezierController} from './controller/cubic-bezier.js';
import {CubicBezier} from './model/cubic-bezier.js';
import {CubicBezierBladePlugin} from './plugin.js';

function createVisualTestWindow(): Window {
	return forceCast(new JSDOM('', {pretendToBeVisual: true}).window);
}

describe('CubicBezierBladePlugin', () => {
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

	it('should accept well-formed params', () => {
		const result = CubicBezierBladePlugin.accept({
			view: 'cubicbezier',
			value: [0.2, 0.8, 0.6, 0.1],
		});
		assert.ok(result);
		assert.deepStrictEqual(result?.params.value, [0.2, 0.8, 0.6, 0.1]);
	});

	it('should reject params with the wrong view id', () => {
		const result = CubicBezierBladePlugin.accept({
			view: 'slider',
			value: [0, 0, 1, 1],
		});
		assert.strictEqual(result, null);
	});

	it('should reject params missing the value array', () => {
		const result = CubicBezierBladePlugin.accept({view: 'cubicbezier'});
		assert.strictEqual(result, null);
	});

	it('should accept a valid picker value and normalize an invalid one to undefined', () => {
		const okResult = CubicBezierBladePlugin.accept({
			view: 'cubicbezier',
			value: [0, 0, 1, 1],
			picker: 'inline',
		});
		assert.strictEqual(okResult?.params.picker, 'inline');

		const badResult = CubicBezierBladePlugin.accept({
			view: 'cubicbezier',
			value: [0, 0, 1, 1],
			picker: 'bogus',
		});
		assert.strictEqual(badResult?.params.picker, undefined);
	});

	function createInstance(win: Window) {
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const accepted = CubicBezierBladePlugin.accept({
			view: 'cubicbezier',
			value: [0.2, 0.8, 0.6, 0.1],
			label: 'Curve',
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}

		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const controller = CubicBezierBladePlugin.controller({
			blade: createBlade(),
			document: win.document,
			params: forceCast(accepted.params),
			viewProps,
		});
		const pool = new PluginPool(new BladeApiCache());
		const api = CubicBezierBladePlugin.api({controller, pool});
		return {controller, api};
	}

	it('should use explicit expanded/picker values when provided', () => {
		const win = createVisualTestWindow();
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const accepted = CubicBezierBladePlugin.accept({
			view: 'cubicbezier',
			value: [0.2, 0.8, 0.6, 0.1],
			expanded: true,
			picker: 'inline',
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}
		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const controller = CubicBezierBladePlugin.controller({
			blade: createBlade(),
			document: win.document,
			params: forceCast(accepted.params),
			viewProps,
		});
		assert.ok(controller instanceof LabeledValueBladeController);
		const vc = (controller as LabeledValueBladeController<any, any>)
			.valueController as CubicBezierController;
		assert.strictEqual((vc as any).foldable_.get('expanded'), true);
	});

	it('should build a LabeledValueBladeController wrapping a CubicBezierController', () => {
		const win = createVisualTestWindow();
		const {controller} = createInstance(win);

		assert.ok(controller instanceof LabeledValueBladeController);
		assert.ok(
			(controller as LabeledValueBladeController<any, any>)
				.valueController instanceof CubicBezierController,
		);
	});

	it('should build an api that reads/writes the label and value', () => {
		const win = createVisualTestWindow();
		const {api} = createInstance(win);

		if (!api) {
			throw new Error('unexpected null api');
		}
		const bezierApi: any = api;
		assert.strictEqual(bezierApi.label, 'Curve');
		assert.deepStrictEqual(bezierApi.value.toObject(), [0.2, 0.8, 0.6, 0.1]);

		bezierApi.label = 'Bezier';
		assert.strictEqual(bezierApi.label, 'Bezier');
	});

	it('should set the value via the api and emit a change event', () => {
		const win = createVisualTestWindow();
		const {api} = createInstance(win);
		if (!api) {
			throw new Error('unexpected null api');
		}
		const bezierApi: any = api;

		let received: any = null;
		bezierApi.on('change', (ev: any) => {
			received = ev;
		});

		bezierApi.value = new CubicBezier(0, 0, 1, 1);

		assert.deepStrictEqual(bezierApi.value.toObject(), [0, 0, 1, 1]);
		assert.ok(received);
		assert.deepStrictEqual(received.value.toObject(), [0, 0, 1, 1]);
	});

	it('should use default expanded/picker values when omitted', () => {
		const win = createVisualTestWindow();
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const accepted = CubicBezierBladePlugin.accept({
			view: 'cubicbezier',
			value: [0.2, 0.8, 0.6, 0.1],
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}
		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const controller = CubicBezierBladePlugin.controller({
			blade: createBlade(),
			document: win.document,
			params: forceCast(accepted.params),
			viewProps,
		});
		assert.ok(controller instanceof LabeledValueBladeController);
		const vc = (controller as LabeledValueBladeController<any, any>)
			.valueController as CubicBezierController;
		assert.strictEqual((vc as any).foldable_.get('expanded'), false);
	});

	it('should return null from api() for a foreign controller', () => {
		const pool = new PluginPool(new BladeApiCache());
		const result = CubicBezierBladePlugin.api({
			controller: forceCast({}),
			pool,
		});
		assert.strictEqual(result, null);
	});

	it('should return null from api() when the wrapped value controller is foreign', () => {
		const win = createVisualTestWindow();
		const viewProps = ViewProps.create();
		activeViewProps = viewProps;
		const buttonController = new ButtonController(win.document, {
			props: ValueMap.fromObject<ButtonPropsObject>({title: 'Click'}),
			viewProps,
		});
		const controller = new LabeledValueBladeController(win.document, {
			blade: createBlade(),
			props: ValueMap.fromObject({label: undefined} as LabelPropsObject),
			value: (buttonController as unknown as {value: unknown}).value as never,
			valueController: buttonController as unknown as never,
		});
		const pool = new PluginPool(new BladeApiCache());
		const result = CubicBezierBladePlugin.api({
			controller: forceCast(controller),
			pool,
		});
		assert.strictEqual(result, null);
	});
});
