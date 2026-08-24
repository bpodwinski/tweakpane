import * as assert from 'assert';
import {describe, it} from 'mocha';

import {
	getHorizontalStepKeys,
	getStepForKey,
	getVerticalStepKeys,
	isArrowKey,
	isVerticalArrowKey,
} from './ui.js';

function keys(overrides: Partial<KeyboardEvent>): KeyboardEvent {
	return {
		altKey: false,
		key: '',
		shiftKey: false,
		...overrides,
	} as KeyboardEvent;
}

describe('getStepForKey', () => {
	it('should return positive step for up key', () => {
		assert.strictEqual(
			getStepForKey(1, {
				altKey: false,
				downKey: false,
				shiftKey: false,
				upKey: true,
			}),
			1,
		);
	});

	it('should return negative step for down key', () => {
		assert.strictEqual(
			getStepForKey(1, {
				altKey: false,
				downKey: true,
				shiftKey: false,
				upKey: false,
			}),
			-1,
		);
	});

	it('should return 0 when neither up nor down', () => {
		assert.strictEqual(
			getStepForKey(1, {
				altKey: false,
				downKey: false,
				shiftKey: false,
				upKey: false,
			}),
			0,
		);
	});

	it('should scale down by 0.1 with altKey', () => {
		assert.strictEqual(
			getStepForKey(1, {
				altKey: true,
				downKey: false,
				shiftKey: false,
				upKey: true,
			}),
			0.1,
		);
	});

	it('should scale up by 10 with shiftKey', () => {
		assert.strictEqual(
			getStepForKey(1, {
				altKey: false,
				downKey: false,
				shiftKey: true,
				upKey: true,
			}),
			10,
		);
	});
});

describe('getVerticalStepKeys', () => {
	it('should map ArrowUp to upKey', () => {
		const r = getVerticalStepKeys(keys({key: 'ArrowUp'}));
		assert.strictEqual(r.upKey, true);
		assert.strictEqual(r.downKey, false);
	});

	it('should map ArrowDown to downKey', () => {
		const r = getVerticalStepKeys(keys({key: 'ArrowDown'}));
		assert.strictEqual(r.downKey, true);
		assert.strictEqual(r.upKey, false);
	});

	it('should propagate altKey/shiftKey', () => {
		const r = getVerticalStepKeys(
			keys({key: 'ArrowUp', altKey: true, shiftKey: true}),
		);
		assert.strictEqual(r.altKey, true);
		assert.strictEqual(r.shiftKey, true);
	});
});

describe('getHorizontalStepKeys', () => {
	it('should map ArrowRight to upKey', () => {
		const r = getHorizontalStepKeys(keys({key: 'ArrowRight'}));
		assert.strictEqual(r.upKey, true);
		assert.strictEqual(r.downKey, false);
	});

	it('should map ArrowLeft to downKey', () => {
		const r = getHorizontalStepKeys(keys({key: 'ArrowLeft'}));
		assert.strictEqual(r.downKey, true);
		assert.strictEqual(r.upKey, false);
	});
});

describe('isVerticalArrowKey', () => {
	it('should be true for ArrowUp/ArrowDown', () => {
		assert.strictEqual(isVerticalArrowKey('ArrowUp'), true);
		assert.strictEqual(isVerticalArrowKey('ArrowDown'), true);
	});

	it('should be false for other keys', () => {
		assert.strictEqual(isVerticalArrowKey('ArrowLeft'), false);
		assert.strictEqual(isVerticalArrowKey('Enter'), false);
	});
});

describe('isArrowKey', () => {
	it('should be true for all 4 arrow keys', () => {
		['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach((key) => {
			assert.strictEqual(isArrowKey(key), true);
		});
	});

	it('should be false for a non-arrow key', () => {
		assert.strictEqual(isArrowKey('Enter'), false);
	});
});
