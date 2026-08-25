import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/dom-test-util.js';
import {bindFoldable, Foldable} from './foldable.js';

describe(Foldable.name, () => {
	it('should compute styleHeight as 0 when collapsed', () => {
		const f = Foldable.create(false);
		assert.strictEqual(f.styleHeight, '0');
	});

	it('should compute styleHeight as auto when expanded without a fixed height', () => {
		const f = Foldable.create(true);
		assert.strictEqual(f.styleHeight, 'auto');
	});

	it('should compute styleHeight in pixels when shouldFixHeight is set', () => {
		const f = Foldable.create(true);
		f.set('shouldFixHeight', true);
		f.set('expandedHeight', 120);
		assert.strictEqual(f.styleHeight, '120px');
	});

	it('should clean up transition state', () => {
		const f = Foldable.create(true);
		f.set('shouldFixHeight', true);
		f.set('expandedHeight', 120);
		f.set('completed', false);

		f.cleanUpTransition();

		assert.strictEqual(f.get('shouldFixHeight'), false);
		assert.strictEqual(f.get('expandedHeight'), null);
		assert.strictEqual(f.get('completed'), true);
	});
});

describe(bindFoldable.name, () => {
	it('should apply the initial height style', () => {
		const doc = createTestWindow().document;
		const elem = doc.createElement('div');
		const f = Foldable.create(false);

		bindFoldable(f, elem);

		assert.strictEqual(elem.style.height, '0px');
	});

	it('should compute and apply a fixed height when expanding', () => {
		const win = createTestWindow();
		const doc = win.document;
		const elem = doc.createElement('div');
		Object.defineProperty(elem, 'clientHeight', {
			configurable: true,
			get: () => 42,
		});

		const f = Foldable.create(false);
		bindFoldable(f, elem);

		f.set('expanded', true);

		assert.strictEqual(f.get('expandedHeight'), 42);
		assert.strictEqual(f.get('shouldFixHeight'), true);
	});

	it('should clean up transition state on a "height" transitionend event', () => {
		const win = createTestWindow();
		const doc = win.document;
		const elem = doc.createElement('div');
		const f = Foldable.create(true);
		f.set('shouldFixHeight', true);
		f.set('expandedHeight', 10);

		bindFoldable(f, elem);

		const ev = new (win as any).Event('transitionend', {bubbles: true});
		Object.defineProperty(ev, 'propertyName', {value: 'height'});
		elem.dispatchEvent(ev);

		assert.strictEqual(f.get('shouldFixHeight'), false);
		assert.strictEqual(f.get('expandedHeight'), null);
	});

	it('should ignore transitionend events for other properties', () => {
		const win = createTestWindow();
		const doc = win.document;
		const elem = doc.createElement('div');
		const f = Foldable.create(true);
		f.set('shouldFixHeight', true);
		f.set('expandedHeight', 10);

		bindFoldable(f, elem);

		const ev = new (win as any).Event('transitionend', {bubbles: true});
		Object.defineProperty(ev, 'propertyName', {value: 'opacity'});
		elem.dispatchEvent(ev);

		assert.strictEqual(f.get('shouldFixHeight'), true);
		assert.strictEqual(f.get('expandedHeight'), 10);
	});
});
