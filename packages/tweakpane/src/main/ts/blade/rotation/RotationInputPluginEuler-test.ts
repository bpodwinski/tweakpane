import {
	BindingTarget,
	createValue,
	PointNdConstraint,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {Euler} from './Euler.js';
import {RotationInputPluginEuler} from './RotationInputPluginEuler.js';

function accept(exValue: unknown, params: Record<string, unknown>) {
	const result = RotationInputPluginEuler.accept(exValue, params);
	if (!result) {
		throw new Error('unexpected null result');
	}
	return result;
}

describe('RotationInputPluginEuler', () => {
	it('should accept a value shaped like a rotation param', () => {
		const result = accept(
			{x: 1, y: 2, z: 3},
			{view: 'rotation', rotationMode: 'euler'},
		);
		assert.deepStrictEqual(result.initialValue.getComponents(), [1, 2, 3]);
	});

	it('should reject params with a mismatched rotationMode', () => {
		const result = RotationInputPluginEuler.accept(
			{x: 1, y: 2, z: 3},
			{view: 'rotation', rotationMode: 'quaternion'},
		);
		assert.strictEqual(result, null);
	});

	it('should build a reader that re-parses the raw exValue', () => {
		const accepted = accept(
			{x: 1, y: 2, z: 3},
			{view: 'rotation', rotationMode: 'euler'},
		);
		const reader = RotationInputPluginEuler.binding.reader({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});
		const euler = reader({x: 4, y: 5, z: 6});
		assert.deepStrictEqual(euler.getComponents(), [4, 5, 6]);
	});

	it('should build a PointNdConstraint from x/y/z params', () => {
		const accepted = accept(
			{x: 0, y: 0, z: 0},
			{
				view: 'rotation',
				rotationMode: 'euler',
				x: {min: -1, max: 1},
			},
		);
		const constraint = RotationInputPluginEuler.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});
		assert.ok(constraint instanceof PointNdConstraint);
	});

	it('should write x/y/z properties back onto the target', () => {
		const accepted = accept(
			{x: 0, y: 0, z: 0},
			{view: 'rotation', rotationMode: 'euler'},
		);
		const writer = RotationInputPluginEuler.binding.writer({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});
		const obj = {x: 0, y: 0, z: 0};
		writer(
			new BindingTarget({rotation: obj}, 'rotation'),
			new Euler(1, 2, 3, 'XYZ', 'rad'),
		);
		assert.strictEqual(obj.x, 1);
		assert.strictEqual(obj.y, 2);
		assert.strictEqual(obj.z, 3);
	});

	it('should create a controller wired to a Value<Euler>', () => {
		const accepted = accept(
			{x: 0.1, y: 0.2, z: 0.3},
			{view: 'rotation', rotationMode: 'euler'},
		);
		const doc = createTestWindow().document;
		const constraint = RotationInputPluginEuler.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});

		const controller = RotationInputPluginEuler.controller({
			document: doc,
			initialValue: accepted.initialValue,
			value: createValue(accepted.initialValue),
			constraint,
			params: accepted.params,
			viewProps: ViewProps.create(),
		});

		assert.ok(controller.view.element);
	});
});
