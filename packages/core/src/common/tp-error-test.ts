import * as assert from 'assert';
import {describe, it} from 'mocha';

import {TpError} from './tp-error.js';

describe(TpError.name, () => {
	it('should instanciate for invalid parameters', () => {
		const e = new TpError({
			context: {
				name: 'foo',
			},
			type: 'invalidparams',
		});

		assert.strictEqual(e.type, 'invalidparams');
	});

	it('should use message for toString()', () => {
		const e = TpError.shouldNeverHappen();
		assert.strictEqual(e.message, e.toString());
	});

	it('should build an alreadyDisposed error', () => {
		const e = TpError.alreadyDisposed();
		assert.strictEqual(e.type, 'alreadydisposed');
		assert.strictEqual(e.message, 'View has been already disposed');
	});

	it('should build a notBindable error', () => {
		const e = TpError.notBindable();
		assert.strictEqual(e.type, 'notbindable');
		assert.strictEqual(e.message, 'Value is not bindable');
	});

	it('should build a notCompatible error combining bundleId and id', () => {
		const e = TpError.notCompatible('bundle', 'plugin');
		assert.strictEqual(e.type, 'notcompatible');
		assert.strictEqual(
			e.message,
			"Not compatible with  plugin 'bundle.plugin'",
		);
	});

	it('should build a propertyNotFound error', () => {
		const e = TpError.propertyNotFound('foo');
		assert.strictEqual(e.type, 'propertynotfound');
		assert.strictEqual(e.message, "Property 'foo' not found");
	});

	it('should set name to the class name and populate stack', () => {
		const e = TpError.shouldNeverHappen();
		assert.strictEqual(e.name, 'TpError');
		assert.strictEqual(typeof e.stack, 'string');
	});
});
