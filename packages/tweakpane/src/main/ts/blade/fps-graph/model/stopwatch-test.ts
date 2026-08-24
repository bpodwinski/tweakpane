import * as assert from 'assert';
import {describe, it} from 'mocha';

import {Fpswatch} from './stopwatch.js';

describe(Fpswatch.name, () => {
	it('should compute duration from numeric timestamps', () => {
		const sw = new Fpswatch();
		sw.begin(1000);
		sw.end(1016);

		assert.strictEqual(sw.duration, 16);
	});

	it('should not update duration/fps when end() is called without begin()', () => {
		const sw = new Fpswatch();
		sw.end(1000);

		assert.strictEqual(sw.duration, 0);
		assert.strictEqual(sw.fps, null);
	});

	it('should compute fps from consecutive frames', () => {
		const sw = new Fpswatch();

		// First frame: no prior timestamp to compare against yet.
		sw.begin(0);
		sw.end(16);
		assert.strictEqual(sw.fps, null);

		// Second frame, 16ms later: ~1000/16 fps computed from the two timestamps.
		sw.begin(16);
		sw.end(32);
		assert.ok(sw.fps !== null);
		assert.ok(Math.abs((sw.fps as number) - 1000 / 16) < 1e-9);
	});
});
