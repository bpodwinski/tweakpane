import * as assert from 'assert';
import {afterEach, beforeEach, describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/test-util.js';
import {waitToBeAddedToDom} from './util.js';

describe('waitToBeAddedToDom', () => {
	let prevMutationObserver: typeof MutationObserver | undefined;

	beforeEach(() => {
		prevMutationObserver = (
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver;
	});

	afterEach(() => {
		(
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver = prevMutationObserver;
	});

	it('should invoke the callback once the element is added to the document', (done) => {
		const win = createTestWindow();
		const doc = win.document;
		(
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver = (
			win as unknown as {MutationObserver: typeof MutationObserver}
		).MutationObserver;

		const elem = doc.createElement('div');
		waitToBeAddedToDom(elem, () => {
			done();
		});

		doc.body.appendChild(elem);
	});

	it('should disconnect after the first matching mutation batch (no further calls)', (done) => {
		const win = createTestWindow();
		const doc = win.document;
		(
			globalThis as {MutationObserver?: typeof MutationObserver}
		).MutationObserver = (
			win as unknown as {MutationObserver: typeof MutationObserver}
		).MutationObserver;

		const elem = doc.createElement('div');
		let calls = 0;
		waitToBeAddedToDom(elem, () => {
			calls++;
		});

		doc.body.appendChild(elem);

		setTimeout(() => {
			assert.strictEqual(calls, 1);
			doc.body.appendChild(doc.createElement('span'));

			setTimeout(() => {
				assert.strictEqual(calls, 1);
				done();
			}, 10);
		}, 10);
	});
});
