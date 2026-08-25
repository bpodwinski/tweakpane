import * as assert from 'assert';
import {describe, it} from 'mocha';

import {BindingTarget} from '../../../common/binding/target.js';
import {IntColor} from '../model/int-color.js';
import {
	createColorObjectWriter,
	writeRgbaColorObject,
	writeRgbColorObject,
} from './writer.js';

describe('writer/color', () => {
	it('should write RGBA color object value without destruction', () => {
		const obj = {
			foo: {r: 0, g: 127, b: 255, a: 0.5},
		};
		const objFoo = obj.foo;
		const t = new BindingTarget(obj, 'foo');
		writeRgbaColorObject(t, new IntColor([128, 255, 0, 0.7], 'rgb'), 'int');

		assert.strictEqual(obj.foo, objFoo, 'instance');
		assert.strictEqual(obj.foo.r, 128, 'r');
		assert.strictEqual(obj.foo.g, 255, 'g');
		assert.strictEqual(obj.foo.b, 0, 'b');
		assert.strictEqual(obj.foo.a, 0.7, 'a');
	});

	it('should write RGB color object value without destruction', () => {
		const obj = {
			foo: {r: 0, g: 127, b: 255, a: 0.5},
		};
		const objFoo = obj.foo;
		const t = new BindingTarget(obj, 'foo');
		writeRgbColorObject(t, new IntColor([128, 255, 0, 0.7], 'rgb'), 'int');

		assert.strictEqual(obj.foo, objFoo, 'instance');
		assert.strictEqual(obj.foo.r, 128, 'r');
		assert.strictEqual(obj.foo.g, 255, 'g');
		assert.strictEqual(obj.foo.b, 0, 'b');
		// should not overwrite alpha component
		assert.strictEqual(obj.foo.a, 0.5, 'a');
	});

	describe('createColorObjectWriter', () => {
		it('should write alpha when supportsAlpha is true', () => {
			const obj = {foo: {r: 0, g: 0, b: 0, a: 0}};
			const writer = createColorObjectWriter(true, 'int');
			writer(
				new BindingTarget(obj, 'foo'),
				new IntColor([1, 2, 3, 0.5], 'rgb'),
			);
			assert.strictEqual(obj.foo.a, 0.5);
		});

		it('should not write alpha when supportsAlpha is false', () => {
			const obj = {foo: {r: 0, g: 0, b: 0, a: 0.9}};
			const writer = createColorObjectWriter(false, 'int');
			writer(
				new BindingTarget(obj, 'foo'),
				new IntColor([1, 2, 3, 0.5], 'rgb'),
			);
			assert.strictEqual(obj.foo.a, 0.9);
		});
	});
});
