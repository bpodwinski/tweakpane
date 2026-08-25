import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createNumberFormatter} from '../../../common/converter/number.js';
import {
	createPushedBuffer,
	initializeBuffer,
} from '../../../common/model/buffered-value.js';
import {ValueMap} from '../../../common/model/value-map.js';
import {createValue} from '../../../common/model/values.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {GraphLogView} from './graph-log.js';

function createView(doc: Document) {
	const value = createValue(initializeBuffer<number>(4));
	const cursor = createValue(-1);
	const view = new GraphLogView(doc, {
		cursor,
		formatter: createNumberFormatter(0),
		props: ValueMap.fromObject({max: 10, min: 0}),
		rows: 1,
		value,
		viewProps: ViewProps.create(),
	});
	return {view, value, cursor};
}

describe(GraphLogView.name, () => {
	it('should expose the svg element via graphElement', () => {
		const doc = createTestWindow().document;
		const {view} = createView(doc);
		assert.strictEqual(view.graphElement.tagName.toLowerCase(), 'svg');
	});

	it('should refresh the polyline when the value changes', () => {
		const doc = createTestWindow().document;
		const {view, value} = createView(doc);

		value.rawValue = createPushedBuffer(value.rawValue, 5);

		const points = view.graphElement
			.querySelector('polyline')
			?.getAttribute('points');
		assert.ok(points && points.length > 0);
	});

	it('should show the tooltip when the cursor points to a defined value', () => {
		const doc = createTestWindow().document;
		const {view, value, cursor} = createView(doc);

		value.rawValue = createPushedBuffer(value.rawValue, 5);
		cursor.rawValue = 0;

		const tooltip = view.element.querySelector('.tp-grlv_t') as HTMLElement;
		assert.ok(tooltip.classList.contains('tp-grlv_t-a'));
	});
});
