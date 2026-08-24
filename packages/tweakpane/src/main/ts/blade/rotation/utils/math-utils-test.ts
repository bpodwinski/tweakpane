import * as assert from 'assert';
import {describe, it} from 'mocha';

import {clamp} from './clamp.js';
import {iikanjiEaseout} from './iikanjiEaseout.js';
import {linearstep} from './linearstep.js';
import {lofi} from './lofi.js';
import {mod} from './mod.js';
import {sanitizeAngle} from './sanitizeAngle.js';
import {saturate} from './saturate.js';

describe('clamp', () => {
	it('should clamp within range', () => {
		assert.strictEqual(clamp(5, 0, 10), 5);
	});

	it('should clamp below the lower bound', () => {
		assert.strictEqual(clamp(-5, 0, 10), 0);
	});

	it('should clamp above the upper bound', () => {
		assert.strictEqual(clamp(15, 0, 10), 10);
	});
});

describe('saturate', () => {
	it('should clamp into [0, 1]', () => {
		assert.strictEqual(saturate(-1), 0);
		assert.strictEqual(saturate(0.5), 0.5);
		assert.strictEqual(saturate(2), 1);
	});
});

describe('linearstep', () => {
	it('should return 0 at or before a', () => {
		assert.strictEqual(linearstep(0, 10, -5), 0);
		assert.strictEqual(linearstep(0, 10, 0), 0);
	});

	it('should return 1 at or after b', () => {
		assert.strictEqual(linearstep(0, 10, 10), 1);
		assert.strictEqual(linearstep(0, 10, 15), 1);
	});

	it('should interpolate linearly between a and b', () => {
		assert.strictEqual(linearstep(0, 10, 5), 0.5);
	});
});

describe('iikanjiEaseout', () => {
	it('should clamp to 0 at or below 0', () => {
		assert.strictEqual(iikanjiEaseout(0), 0);
		assert.strictEqual(iikanjiEaseout(-1), 0);
	});

	it('should clamp to 1 at or above 1', () => {
		assert.strictEqual(iikanjiEaseout(1), 1);
		assert.strictEqual(iikanjiEaseout(2), 1);
	});

	it('should stay within [0, 1] in between', () => {
		const y = iikanjiEaseout(0.5);
		assert.ok(y >= 0 && y <= 1);
	});
});

describe('lofi', () => {
	it('should floor to the nearest multiple of d', () => {
		assert.strictEqual(lofi(7, 2), 6);
		assert.strictEqual(lofi(-7, 2), -8);
		assert.strictEqual(lofi(4, 2), 4);
	});
});

describe('mod', () => {
	it('should return the remainder within [0, d)', () => {
		assert.strictEqual(mod(7, 2), 1);
		assert.strictEqual(mod(-1, 5), 4);
		assert.strictEqual(mod(6, 3), 0);
	});
});

describe('sanitizeAngle', () => {
	it('should keep angles already within (-PI, PI] unchanged', () => {
		assert.ok(Math.abs(sanitizeAngle(0) - 0) < 1e-9);
		assert.ok(Math.abs(sanitizeAngle(1) - 1) < 1e-9);
	});

	it('should wrap angles beyond PI back into range', () => {
		const twoPi = Math.PI * 2;
		assert.ok(Math.abs(sanitizeAngle(Math.PI + 1) - (1 - Math.PI)) < 1e-9);
		assert.ok(Math.abs(sanitizeAngle(twoPi) - sanitizeAngle(0)) < 1e-9);
	});
});
