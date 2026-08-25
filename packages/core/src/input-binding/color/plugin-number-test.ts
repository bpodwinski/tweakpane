import * as assert from 'assert';
import {describe, it} from 'mocha';

import {BindingTarget} from '../../common/binding/target.js';
import {createValue} from '../../common/model/values.js';
import {ViewProps} from '../../common/model/view-props.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {ColorController} from './controller/color.js';
import {IntColor} from './model/int-color.js';
import {NumberColorInputPlugin} from './plugin-number.js';

describe('NumberColorInputPlugin', () => {
	[
		{
			view: 'color',
		},
		{
			color: {},
		},
		{
			color: {type: 'float'},
		},
	].forEach((params) => {
		context(`when params=${JSON.stringify(params)}`, () => {
			const input = {
				color: 0x00000000,
			};
			const result = NumberColorInputPlugin.accept(input.color, params);

			it('should accept params', () => {
				assert.ok(result !== null);
			});
		});
	});

	[
		{
			params: {
				view: 'color',
			},
			expected: 1,
		},
		{
			params: {
				color: {
					alpha: true,
				},
			},
			expected: 0,
		},
	].forEach(({params, expected}) => {
		context(`when params=${JSON.stringify(params)}`, () => {
			const input = {
				color: 0xffffff00,
			};
			const result = NumberColorInputPlugin.accept(input.color, params);
			if (!result) {
				throw new Error('unexpected result');
			}
			const reader = NumberColorInputPlugin.binding.reader({
				initialValue: input.color,
				params: result.params,
				target: new BindingTarget(input, 'color'),
			});

			it('should apply alpha', () => {
				const c = reader(input.color);
				assert.strictEqual(c.getComponents('rgb')[3], expected);
			});
		});
	});

	it('should build a ColorController with alpha support', () => {
		const doc = createTestWindow().document;
		const result = NumberColorInputPlugin.accept(0xffffffff, {
			color: {alpha: true},
		});
		if (!result) {
			throw new Error('unexpected null result');
		}

		const controller = NumberColorInputPlugin.controller({
			document: doc,
			initialValue: 0xffffffff,
			value: createValue(new IntColor([255, 255, 255, 1], 'rgb')),
			constraint: undefined,
			params: result.params,
			viewProps: ViewProps.create(),
		});

		assert.ok(controller instanceof ColorController);
	});

	it('should build a ColorController without alpha support', () => {
		const doc = createTestWindow().document;
		const result = NumberColorInputPlugin.accept(0xffffff, {view: 'color'});
		if (!result) {
			throw new Error('unexpected null result');
		}

		const controller = NumberColorInputPlugin.controller({
			document: doc,
			initialValue: 0xffffff,
			value: createValue(new IntColor([255, 255, 255, 1], 'rgb')),
			constraint: undefined,
			params: result.params,
			viewProps: ViewProps.create(),
		});

		assert.ok(controller instanceof ColorController);
		// Confirms the non-alpha formatter branch actually ran (6 hex digits, no alpha byte).
		assert.strictEqual(
			(controller as ColorController).textController.view.inputElement.value,
			'0xffffff',
		);
	});
});
