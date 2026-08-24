import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Semver} from '../misc/semver.js';
import {VERSION} from '../version.js';
import {isCompatible, warnDeprecation, warnMissing} from './compat.js';

describe('isCompatible', () => {
	it('should return false for version 1.x (undefined semver)', () => {
		assert.strictEqual(isCompatible(undefined), false);
	});

	it('should return true when major version matches', () => {
		assert.strictEqual(isCompatible(new Semver(`${VERSION.major}.0.0`)), true);
	});

	it('should return false when major version differs', () => {
		assert.strictEqual(
			isCompatible(new Semver(`${VERSION.major + 1}.0.0`)),
			false,
		);
	});
});

describe('warnDeprecation', () => {
	it('should warn with name only', () => {
		const messages: unknown[][] = [];
		const orig = console.warn;
		console.warn = (...args: unknown[]) => messages.push(args);
		try {
			warnDeprecation({name: 'Foo'});
		} finally {
			console.warn = orig;
		}
		assert.strictEqual(messages.length, 1);
		assert.ok(String(messages[0][0]).includes('Foo is deprecated.'));
	});

	it('should warn with alternative and postscript', () => {
		const messages: unknown[][] = [];
		const orig = console.warn;
		console.warn = (...args: unknown[]) => messages.push(args);
		try {
			warnDeprecation({
				name: 'Foo',
				alternative: 'Bar',
				postscript: 'See docs.',
			});
		} finally {
			console.warn = orig;
		}
		const text = String(messages[0][0]);
		assert.ok(text.includes('use Bar instead.'));
		assert.ok(text.includes('See docs.'));
	});
});

describe('warnMissing', () => {
	it('should warn with key/target/place', () => {
		const messages: unknown[][] = [];
		const orig = console.warn;
		console.warn = (...args: unknown[]) => messages.push(args);
		try {
			warnMissing({key: 'foo', target: 'Bar', place: 'Baz'});
		} finally {
			console.warn = orig;
		}
		assert.strictEqual(messages.length, 1);
		const text = String(messages[0][0]);
		assert.ok(text.includes("Missing 'foo' of Bar in Baz."));
		assert.ok(text.includes('rebuild plugins'));
	});
});
