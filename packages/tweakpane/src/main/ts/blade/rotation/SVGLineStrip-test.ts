import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../misc/test-util.js';
import {PointProjector} from './PointProjector.js';
import {Quaternion} from './Quaternion.js';
import {SVGLineStrip} from './SVGLineStrip.js';
import {Vector3} from './Vector3.js';

describe(SVGLineStrip.name, () => {
	it('should create an SVG path element', () => {
		const doc = createTestWindow().document;
		const strip = new SVGLineStrip(
			doc,
			[new Vector3(0, 0, 0)],
			new PointProjector(),
		);
		assert.strictEqual(strip.element.tagName.toLowerCase(), 'path');
	});

	it('should build a "d" attribute starting with M and using L for later vertices', () => {
		const doc = createTestWindow().document;
		const projector = new PointProjector();
		projector.viewport = [0, 0, 100, 100];
		const strip = new SVGLineStrip(
			doc,
			[new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)],
			projector,
		);

		strip.setRotation(new Quaternion());

		const d = strip.element.getAttribute('d') ?? '';
		assert.ok(d.startsWith('M'));
		assert.strictEqual((d.match(/L/g) ?? []).length, 2);
	});

	it('should return itself for chaining', () => {
		const doc = createTestWindow().document;
		const strip = new SVGLineStrip(
			doc,
			[new Vector3(0, 0, 0)],
			new PointProjector(),
		);
		assert.strictEqual(strip.setRotation(new Quaternion()), strip);
	});
});
