import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ListConstraint} from './constraint/list.js';
import {
	createListConstraint,
	normalizeListOptions,
	parseListOptions,
} from './list-util.js';

describe('parseListOptions', () => {
	it('should parse an array of {text, value} items', () => {
		const result = parseListOptions<number>([
			{text: 'a', value: 1},
			{text: 'b', value: 2},
		]);
		assert.deepStrictEqual(result, [
			{text: 'a', value: 1},
			{text: 'b', value: 2},
		]);
	});

	it('should parse an object style map', () => {
		const result = parseListOptions<number>({a: 1, b: 2});
		assert.deepStrictEqual(result, {a: 1, b: 2});
	});

	it('should return undefined for a primitive value', () => {
		assert.strictEqual(parseListOptions('foo'), undefined);
		assert.strictEqual(parseListOptions(42), undefined);
		assert.strictEqual(parseListOptions(undefined), undefined);
	});
});

describe('normalizeListOptions', () => {
	it('should pass an array through unchanged', () => {
		const items = [{text: 'a', value: 1}];
		assert.strictEqual(normalizeListOptions(items), items);
	});

	it('should convert an object map into an item array', () => {
		const items = normalizeListOptions({a: 1, b: 2});
		assert.deepStrictEqual(items, [
			{text: 'a', value: 1},
			{text: 'b', value: 2},
		]);
	});
});

describe('createListConstraint', () => {
	it('should return null for an empty options value', () => {
		assert.strictEqual(createListConstraint(undefined), null);
	});

	it('should build a ListConstraint from array-style options', () => {
		const c = createListConstraint([{text: 'a', value: 1}]);
		assert.ok(c instanceof ListConstraint);
	});

	it('should build a ListConstraint from object-style options', () => {
		const c = createListConstraint({a: 1, b: 2});
		assert.ok(c instanceof ListConstraint);
	});
});
