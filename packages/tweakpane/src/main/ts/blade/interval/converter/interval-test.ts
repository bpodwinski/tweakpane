import * as assert from 'assert';
import {describe, it} from 'mocha';
import {BindingTarget} from 'tweakpane-reborn-core';

import {Interval} from '../model/interval.js';
import {intervalFromUnknown, writeInterval} from './interval.js';

describe('intervalFromUnknown', () => {
	it('should read min/max from an object shaped like an interval', () => {
		const interval = intervalFromUnknown({min: 2, max: 8});
		assert.strictEqual(interval.min, 2);
		assert.strictEqual(interval.max, 8);
	});

	it('should fall back to (0, 0) for a malformed value', () => {
		const interval = intervalFromUnknown('not-an-interval');
		assert.strictEqual(interval.min, 0);
		assert.strictEqual(interval.max, 0);
	});
});

describe('writeInterval', () => {
	it('should write min/max properties onto the target', () => {
		const obj = {min: 0, max: 0};
		writeInterval(
			new BindingTarget({interval: obj}, 'interval'),
			new Interval(2, 8),
		);
		assert.deepStrictEqual(obj, {min: 2, max: 8});
	});
});
