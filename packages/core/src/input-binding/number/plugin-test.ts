import * as assert from 'assert';
import {describe, it} from 'mocha';

import {BindingTarget} from '../../common/binding/target.js';
import {InputBindingValue} from '../../common/binding/value/input-binding.js';
import {findConstraint} from '../../common/constraint/composite.js';
import {Constraint} from '../../common/constraint/constraint.js';
import {StepConstraint} from '../../common/constraint/step.js';
import {ListController} from '../../common/controller/list.js';
import {ComplexValue} from '../../common/model/complex-value.js';
import {getBoundValue} from '../../common/model/test-util.js';
import {NumberTextController} from '../../common/number/controller/number-text.js';
import {SliderTextController} from '../../common/number/controller/slider-text.js';
import {createTestWindow} from '../../misc/dom-test-util.js';
import {createInputBindingController} from '../plugin.js';
import {NumberInputPlugin} from './plugin.js';

describe(NumberInputPlugin.id, () => {
	it('should return appropriate step constraint', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {
				min: 1,
				step: 2,
			},
			target: new BindingTarget({foo: 1}, 'foo'),
		});

		const v = getBoundValue(
			c?.value as InputBindingValue<number>,
		) as ComplexValue<number>;
		const constraint = findConstraint(
			v.constraint as Constraint<number>,
			StepConstraint,
		);
		assert.strictEqual(constraint?.step, 2);
		assert.strictEqual(constraint?.origin, 1);
	});

	it('should apply format', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {
				format: (v: number) => `foo ${v} bar`,
			},
			target: new BindingTarget({foo: 123}, 'foo'),
		});

		const vc = c?.valueController as NumberTextController;
		assert.strictEqual(vc.view.inputElement.value, 'foo 123 bar');
	});

	it('should apply pointerScale', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {
				pointerScale: 123,
			},
			target: new BindingTarget({foo: 123}, 'foo'),
		});

		const vc = c?.valueController as NumberTextController;
		assert.strictEqual(vc.props.get('pointerScale'), 123);
	});

	it('should apply keyScale', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {
				keyScale: 123,
			},
			target: new BindingTarget({foo: 123}, 'foo'),
		});

		const vc = c?.valueController as NumberTextController;
		assert.strictEqual(vc.props.get('keyScale'), 123);
	});

	it('should reject a non-number value', () => {
		assert.strictEqual(NumberInputPlugin.accept('42', {}), null);
	});

	it('should use a ListController with list options and expose a list api', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {options: {a: 1, b: 2}},
			target: new BindingTarget({foo: 1}, 'foo'),
		});

		assert.ok(c?.valueController instanceof ListController);
		const api = NumberInputPlugin.api?.({controller: c as any});
		assert.ok(api);
	});

	it('should use a SliderTextController when both min and max are set, and expose a slider api', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {min: 0, max: 100},
			target: new BindingTarget({foo: 50}, 'foo'),
		});

		assert.ok(c?.valueController instanceof SliderTextController);
		const api = NumberInputPlugin.api?.({controller: c as any});
		assert.ok(api);
	});

	it('should return null from api() for a non-number value', () => {
		const doc = createTestWindow().document;
		const c = createInputBindingController(NumberInputPlugin, {
			document: doc,
			params: {},
			target: new BindingTarget({foo: 1}, 'foo'),
		});
		if (!c) {
			throw new Error('unexpected null controller');
		}

		const api = NumberInputPlugin.api?.({
			controller: {
				...c,
				value: {rawValue: 'not a number'},
			} as any,
		});
		assert.strictEqual(api, null);
	});
});
