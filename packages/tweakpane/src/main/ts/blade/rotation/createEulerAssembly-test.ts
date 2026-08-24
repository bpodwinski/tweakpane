import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createEulerAssembly} from './createEulerAssembly.js';
import {Euler} from './Euler.js';

describe('createEulerAssembly', () => {
	it('should convert an Euler to its raw components', () => {
		const assembly = createEulerAssembly('XYZ', 'rad');
		const e = new Euler(1, 2, 3, 'XYZ', 'rad');
		assert.deepStrictEqual(assembly.toComponents(e), [1, 2, 3]);
	});

	it('should build an Euler from raw components using the configured order/unit', () => {
		const assembly = createEulerAssembly('ZYX', 'deg');
		const e = assembly.fromComponents([1, 2, 3]);
		assert.deepStrictEqual(e.getComponents(), [1, 2, 3]);
		assert.strictEqual(e.order, 'ZYX');
		assert.strictEqual(e.unit, 'deg');
	});
});
