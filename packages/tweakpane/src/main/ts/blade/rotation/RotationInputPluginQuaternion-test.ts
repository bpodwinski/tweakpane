import {
	BindingTarget,
	createValue,
	PointNdConstraint,
	ViewProps,
} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {Quaternion} from './Quaternion.js';
import {RotationInputPluginQuaternion} from './RotationInputPluginQuaternion.js';

function accept(exValue: unknown, params: Record<string, unknown>) {
	const result = RotationInputPluginQuaternion.accept(exValue, params);
	if (!result) {
		throw new Error('unexpected null result');
	}
	return result;
}

describe('RotationInputPluginQuaternion', () => {
	it('should accept a value shaped like a quaternion param', () => {
		const result = accept({x: 1, y: 2, z: 3, w: 4}, {view: 'rotation'});
		assert.deepStrictEqual(result.initialValue.getComponents(), [1, 2, 3, 4]);
	});

	it('should reject params with a mismatched rotationMode', () => {
		const result = RotationInputPluginQuaternion.accept(
			{x: 1, y: 2, z: 3, w: 4},
			{view: 'rotation', rotationMode: 'euler'},
		);
		assert.strictEqual(result, null);
	});

	it('should build a reader that re-parses the raw exValue', () => {
		const accepted = accept({x: 1, y: 2, z: 3, w: 4}, {view: 'rotation'});
		const reader = RotationInputPluginQuaternion.binding.reader({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});
		const quat = reader({x: 5, y: 6, z: 7, w: 8});
		assert.deepStrictEqual(quat.getComponents(), [5, 6, 7, 8]);
	});

	it('should build a PointNdConstraint from x/y/z/w params', () => {
		const accepted = accept(
			{x: 0, y: 0, z: 0, w: 1},
			{view: 'rotation', x: {min: -1, max: 1}},
		);
		const constraint = RotationInputPluginQuaternion.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});
		assert.ok(constraint instanceof PointNdConstraint);
	});

	it('should write x/y/z/w properties back onto the target', () => {
		const accepted = accept({x: 0, y: 0, z: 0, w: 1}, {view: 'rotation'});
		const writer = RotationInputPluginQuaternion.binding.writer({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});
		const obj = {x: 0, y: 0, z: 0, w: 0};
		writer(
			new BindingTarget({rotation: obj}, 'rotation'),
			new Quaternion(1, 2, 3, 4),
		);
		assert.deepStrictEqual(obj, {x: 1, y: 2, z: 3, w: 4});
	});

	it('should create a controller wired to a Value<Quaternion>', () => {
		const accepted = accept({x: 0, y: 0, z: 0, w: 1}, {view: 'rotation'});
		const doc = createTestWindow().document;
		const constraint = RotationInputPluginQuaternion.binding.constraint?.({
			initialValue: accepted.initialValue,
			params: accepted.params,
			target: new BindingTarget({}, 'rotation'),
		});

		const controller = RotationInputPluginQuaternion.controller({
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
