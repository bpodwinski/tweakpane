import * as assert from 'assert';
import {describe, it} from 'mocha';

import {PrimitiveValue} from '../../model/primitive-value.js';
import {ReadWriteBinding} from '../read-write.js';
import {BindingTarget} from '../target.js';
import {InputBindingValue, isInputBindingValue} from './input-binding.js';

describe(InputBindingValue.name, () => {
	it('should apply rawValue to target', () => {
		const iv = new PrimitiveValue(0);
		const target = new BindingTarget({foo: 0}, 'foo');
		const bv = new InputBindingValue(
			iv,
			new ReadWriteBinding({
				reader: (v: unknown) => Number(v),
				writer: (t, v) => t.write(v),
				target: target,
			}),
		);

		bv.rawValue = 1;
		assert.strictEqual(target.read(), 1);
	});

	it('should have its own sender', (done) => {
		const iv = new PrimitiveValue(0);
		const bv = new InputBindingValue(
			iv,
			new ReadWriteBinding({
				reader: (v: unknown) => Number(v),
				writer: (t, v) => t.write(v),
				target: new BindingTarget({foo: 0}, 'foo'),
			}),
		);
		bv.emitter.on('change', (ev) => {
			assert.strictEqual(ev.sender, bv);
			done();
		});
		iv.rawValue = 1;
	});

	it('should re-emit beforechange with its own sender', (done) => {
		const iv = new PrimitiveValue(0);
		const bv = new InputBindingValue(
			iv,
			new ReadWriteBinding({
				reader: (v: unknown) => Number(v),
				writer: (t, v) => t.write(v),
				target: new BindingTarget({foo: 0}, 'foo'),
			}),
		);
		bv.emitter.on('beforechange', (ev) => {
			assert.strictEqual(ev.sender, bv);
			done();
		});
		iv.rawValue = 1;
	});

	it('should identify an InputBindingValue via isInputBindingValue', () => {
		const iv = new PrimitiveValue(0);
		const bv = new InputBindingValue(
			iv,
			new ReadWriteBinding({
				reader: (v: unknown) => Number(v),
				writer: (t, v) => t.write(v),
				target: new BindingTarget({foo: 0}, 'foo'),
			}),
		);

		assert.strictEqual(isInputBindingValue(bv as any), true);
		assert.strictEqual(isInputBindingValue(iv as any), false);
	});

	it('should set rawValue via setRawValue with options', () => {
		const iv = new PrimitiveValue(0);
		const target = new BindingTarget({foo: 0}, 'foo');
		const bv = new InputBindingValue(
			iv,
			new ReadWriteBinding({
				reader: (v: unknown) => Number(v),
				writer: (t, v) => t.write(v),
				target,
			}),
		);

		bv.setRawValue(2, {forceEmit: true, last: true});
		assert.strictEqual(bv.rawValue, 2);
		assert.strictEqual(target.read(), 2);
	});
});
