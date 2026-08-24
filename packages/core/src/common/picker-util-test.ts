import * as assert from 'assert';
import {describe, it} from 'mocha';

import {parsePickerLayout} from './picker-util.js';

describe('parsePickerLayout', () => {
	it('should parse "inline"', () => {
		assert.strictEqual(parsePickerLayout('inline'), 'inline');
	});

	it('should parse "popup"', () => {
		assert.strictEqual(parsePickerLayout('popup'), 'popup');
	});

	it('should return undefined for an invalid string', () => {
		assert.strictEqual(parsePickerLayout('foo'), undefined);
	});

	it('should return undefined for non-string values', () => {
		assert.strictEqual(parsePickerLayout(undefined), undefined);
		assert.strictEqual(parsePickerLayout(null), undefined);
		assert.strictEqual(parsePickerLayout(123), undefined);
	});
});
