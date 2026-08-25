import {createValue, forceCast} from '@tweakpane/core';
import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {RadioGridController} from './controller/radio-grid.js';
import {
	RadioGruidBooleanInputPlugin,
	RadioGruidNumberInputPlugin,
	RadioGruidStringInputPlugin,
} from './input-plugin.js';

describe('RadioGridInputPlugins', () => {
	it('should accept a number value shaped like a radio grid', () => {
		const result = RadioGruidNumberInputPlugin.accept(0, {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: () => ({title: 'x', value: 0}),
		});
		assert.ok(result);
		assert.strictEqual(result?.initialValue, 0);
	});

	it('should reject a non-number value for the number plugin', () => {
		const result = RadioGruidNumberInputPlugin.accept('nope', {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: () => ({title: 'x', value: 0}),
		});
		assert.strictEqual(result, null);
	});

	it('should accept a string value shaped like a radio grid', () => {
		const result = RadioGruidStringInputPlugin.accept('a', {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: () => ({title: 'x', value: 'a'}),
		});
		assert.ok(result);
		assert.strictEqual(result?.initialValue, 'a');
	});

	it('should reject a non-string value for the string plugin', () => {
		const result = RadioGruidStringInputPlugin.accept(1, {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: () => ({title: 'x', value: 'a'}),
		});
		assert.strictEqual(result, null);
	});

	it('should accept a boolean value shaped like a radio grid', () => {
		const result = RadioGruidBooleanInputPlugin.accept(true, {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: () => ({title: 'x', value: true}),
		});
		assert.ok(result);
		assert.strictEqual(result?.initialValue, true);
	});

	it('should reject a non-boolean value for the boolean plugin', () => {
		const result = RadioGruidBooleanInputPlugin.accept(1, {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: () => ({title: 'x', value: true}),
		});
		assert.strictEqual(result, null);
	});

	it('should reject params missing required fields', () => {
		const result = RadioGruidNumberInputPlugin.accept(0, {view: 'radiogrid'});
		assert.strictEqual(result, null);
	});

	it('should build a RadioGridController from the accepted params', () => {
		const doc = createTestWindow().document;
		const accepted = RadioGruidStringInputPlugin.accept('0,0', {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 2],
			cells: (x: number, y: number) => ({
				title: `${x},${y}`,
				value: `${x},${y}`,
			}),
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}
		const value = createValue(accepted.initialValue);
		const controller = RadioGruidStringInputPlugin.controller({
			constraint: undefined,
			document: doc,
			initialValue: accepted.initialValue,
			params: forceCast(accepted.params),
			value,
			viewProps: forceCast({}),
		});
		assert.ok(controller instanceof RadioGridController);
		assert.strictEqual(controller.cellControllers.length, 4);
	});

	it('should build a number reader/writer that read/write raw values', () => {
		const reader = RadioGruidNumberInputPlugin.binding.reader(forceCast({}));
		assert.strictEqual(reader(3), 3);
		const target: Record<string, unknown> = {};
		const writer = RadioGruidNumberInputPlugin.binding.writer(forceCast({}));
		writer(forceCast({write: (v: unknown) => (target.v = v)}), 3);
		assert.strictEqual(target.v, 3);
	});

	it('should build a boolean reader/writer that read/write raw values', () => {
		const reader = RadioGruidBooleanInputPlugin.binding.reader(forceCast({}));
		assert.strictEqual(reader(true), true);
		const target: Record<string, unknown> = {};
		const writer = RadioGruidBooleanInputPlugin.binding.writer(forceCast({}));
		writer(forceCast({write: (v: unknown) => (target.v = v)}), true);
		assert.strictEqual(target.v, true);
	});

	it('should build a string reader/writer that read/write raw values', () => {
		const reader = RadioGruidStringInputPlugin.binding.reader(forceCast({}));
		assert.strictEqual(reader('a'), 'a');
		const target: Record<string, unknown> = {};
		const writer = RadioGruidStringInputPlugin.binding.writer(forceCast({}));
		writer(forceCast({write: (v: unknown) => (target.v = v)}), 'a');
		assert.strictEqual(target.v, 'a');
	});

	it('should build a boolean RadioGridController from the accepted params', () => {
		const doc = createTestWindow().document;
		const accepted = RadioGruidBooleanInputPlugin.accept(true, {
			view: 'radiogrid',
			groupName: 'g',
			size: [2, 1],
			cells: (x: number, y: number) => ({
				title: `${x},${y}`,
				value: x === 0,
			}),
		});
		if (!accepted) {
			throw new Error('unexpected null result');
		}
		const controller = RadioGruidBooleanInputPlugin.controller({
			constraint: undefined,
			document: doc,
			initialValue: accepted.initialValue,
			params: forceCast(accepted.params),
			value: createValue(accepted.initialValue),
			viewProps: forceCast({}),
		});
		assert.ok(controller instanceof RadioGridController);
		assert.strictEqual(controller.cellControllers.length, 2);
	});
});
