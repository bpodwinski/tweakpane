import * as assert from 'assert';
import {JSDOM} from 'jsdom';
import {afterEach, beforeEach, describe, it} from 'mocha';
import {createValue, forceCast, ViewProps} from 'tweakpane-reborn-core';

import {CubicBezier} from '../model/cubic-bezier.js';
import {CubicBezierPreviewView} from './cubic-bezier-preview.js';

// requestAnimationFrame/cancelAnimationFrame are only exposed by jsdom windows
// created with `pretendToBeVisual: true` (the shared test-util createTestWindow()
// doesn't set this, since most tests don't need rAF).
function createVisualTestWindow(): Window {
	return forceCast(new JSDOM('', {pretendToBeVisual: true}).window);
}

describe(CubicBezierPreviewView.name, () => {
	let prevRaf: typeof requestAnimationFrame | undefined;
	let prevCaf: typeof cancelAnimationFrame | undefined;
	let prevMo: typeof MutationObserver | undefined;

	beforeEach(() => {
		const g = globalThis as any;
		prevRaf = g.requestAnimationFrame;
		prevCaf = g.cancelAnimationFrame;
		prevMo = g.MutationObserver;
	});

	afterEach(() => {
		const g = globalThis as any;
		g.requestAnimationFrame = prevRaf;
		g.cancelAnimationFrame = prevCaf;
		g.MutationObserver = prevMo;
	});

	function createView(win: Window) {
		const g = globalThis as any;
		g.requestAnimationFrame = (win as any).requestAnimationFrame.bind(win);
		g.cancelAnimationFrame = (win as any).cancelAnimationFrame.bind(win);
		g.MutationObserver = (win as any).MutationObserver;

		const doc = win.document;
		const value = createValue(new CubicBezier(0.2, 0.8, 0.6, 0.1));
		return new CubicBezierPreviewView(doc, {
			value,
			viewProps: ViewProps.create(),
		});
	}

	it('should render a tick path with TICK_COUNT segments on refresh', () => {
		const win = createVisualTestWindow();
		const view = createView(win);

		Object.defineProperty(
			view.element.querySelector('svg') as Element,
			'clientWidth',
			{
				configurable: true,
				get: () => 100,
			},
		);
		Object.defineProperty(
			view.element.querySelector('svg') as Element,
			'clientHeight',
			{
				configurable: true,
				get: () => 20,
			},
		);

		view.refresh();

		const d = view.element.querySelector('path')?.getAttribute('d') ?? '';
		assert.strictEqual((d.match(/M /g) ?? []).length, 24);
	});

	it('should add the animating modifier class on play() and remove it on stop()', () => {
		const win = createVisualTestWindow();
		const view = createView(win);

		view.play();
		const marker = view.element.querySelector('.tp-cbzprvv_m') as HTMLElement;
		assert.ok(marker.classList.contains('tp-cbzprvv_m-a'));

		view.stop();
		assert.ok(!marker.classList.contains('tp-cbzprvv_m-a'));
	});

	it('should not throw when stop() is called without a prior play()', () => {
		const win = createVisualTestWindow();
		const view = createView(win);
		assert.doesNotThrow(() => view.stop());
	});

	it('should stop itself once the preview duration elapses', () => {
		const win = createVisualTestWindow();
		const view = createView(win);

		view.play();
		const marker = view.element.querySelector('.tp-cbzprvv_m') as HTMLElement;
		assert.ok(marker.classList.contains('tp-cbzprvv_m-a'));

		// Simulate elapsed time well past PREVIEW_DURATION + PREVIEW_DELAY and
		// invoke the private timer tick directly, instead of waiting ~1.4s.
		(view as any).startTime_ = Date.now() - 10000;
		(view as any).onTimer_();

		assert.ok(!marker.classList.contains('tp-cbzprvv_m-a'));
	});

	it('should keep animating (re-schedule itself) while still within the preview duration', () => {
		const win = createVisualTestWindow();
		const view = createView(win);

		view.play();
		(view as any).startTime_ = Date.now();
		(view as any).onTimer_();

		assert.strictEqual((view as any).stopped_, false);
		assert.notStrictEqual((view as any).requestId_, -1);
		view.stop();
	});

	it('should refresh and replay on a value change', () => {
		const win = createVisualTestWindow();
		const view = createView(win);

		let playCalled = false;
		const originalPlay = view.play.bind(view);
		view.play = () => {
			playCalled = true;
			originalPlay();
		};

		(view as any).onValueChange_();

		assert.strictEqual(playCalled, true);
		view.stop();
	});
});
