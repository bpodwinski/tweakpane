import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ValueMap} from '../../../common/model/value-map.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {Point2d} from '../model/point-2d.js';
import {Point2dPickerProps, Point2dPickerView} from './point-2d-picker.js';

function createProps(): Point2dPickerProps {
	return ValueMap.fromObject<{
		invertsY: boolean;
		max: number;
		xKeyScale: number;
		yKeyScale: number;
	}>({
		invertsY: false,
		max: 100,
		xKeyScale: 1,
		yKeyScale: 1,
	});
}

describe(Point2dPickerView.name, () => {
	it('should refresh the marker position when props change', () => {
		const doc = createTestWindow().document;
		const props = createProps();
		const view = new Point2dPickerView(doc, {
			layout: 'inline',
			props,
			value: createValue(new Point2d(50, 0)),
			viewProps: ViewProps.create(),
		});

		const markerElem = view.padElement.querySelector(
			'.tp-p2dpv_m',
		) as HTMLElement;
		assert.strictEqual(markerElem.style.left, '75%');

		props.set('max', 50);
		assert.strictEqual(markerElem.style.left, '100%');
	});
});
