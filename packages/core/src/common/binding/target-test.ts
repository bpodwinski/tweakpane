import * as assert from 'assert';
import {describe, it} from 'mocha';

import {BindingTarget} from './target.js';

describe(BindingTarget.name, () => {
	it('should get properties', () => {
		const obj = {foo: 'bar'};
		const target = new BindingTarget(obj, 'foo');
		assert.strictEqual(target.key, 'foo');
	});

	it('should read value', () => {
		const obj = {foo: 'bar'};
		const target = new BindingTarget(obj, 'foo');
		assert.strictEqual(target.read(), 'bar');
	});

	it('should write value', () => {
		const obj = {foo: 'bar'};
		const target = new BindingTarget(obj, 'foo');
		target.write('wrote');
		assert.strictEqual(obj.foo, 'wrote');
	});

	it('should bind static class field', () => {
		class Test {
			static foo = 1;
		}

		assert.doesNotThrow(() => {
			new BindingTarget(Test, 'foo');
		});
	});

	it('should determine class is bindable', () => {
		class Test {
			static foo = 1;
		}

		assert.strictEqual(BindingTarget.isBindable(Test), true);
	});

	it('should not consider null bindable', () => {
		assert.strictEqual(BindingTarget.isBindable(null), false);
	});

	it('should not consider a primitive bindable', () => {
		assert.strictEqual(BindingTarget.isBindable('foo'), false);
		assert.strictEqual(BindingTarget.isBindable(42), false);
	});

	it('should write a nested property via writeProperty', () => {
		const obj = {nested: {foo: 'bar'}};
		const target = new BindingTarget(obj, 'nested');
		target.writeProperty('foo', 'updated');
		assert.strictEqual(obj.nested.foo, 'updated');
	});

	it('should throw notBindable when writing a property on a non-bindable value', () => {
		const obj = {foo: 'bar'};
		const target = new BindingTarget(obj, 'foo');
		assert.throws(() => target.writeProperty('length', 1));
	});

	it('should throw propertyNotFound when the property does not exist', () => {
		const obj = {nested: {foo: 'bar'}};
		const target = new BindingTarget(obj, 'nested');
		assert.throws(() => target.writeProperty('missing', 1));
	});
});
