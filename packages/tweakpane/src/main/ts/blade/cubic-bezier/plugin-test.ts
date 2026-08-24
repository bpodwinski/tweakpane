import {
	createBlade,
	forceCast,
	LabeledValueBladeController,
	PluginPool,
	ViewProps,
} from '@tweakpane/core';
import {BladeApiCache} from '@tweakpane/core/dist/plugin/blade-api-cache.js';
import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {afterEach, beforeEach, describe, it} from 'mocha';

import {CubicBezierController} from './controller/cubic-bezier.js';
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

	it('should return null from api() for a foreign controller', () => {
		const pool = new PluginPool(new BladeApiCache());
		const result = CubicBezierBladePlugin.api({
			controller: forceCast({}),
			pool,
		});
		assert.strictEqual(result, null);
	});
});
