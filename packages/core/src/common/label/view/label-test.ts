import * as assert from 'assert';
import {describe, it} from 'mocha';

import {createTestWindow} from '../../../misc/dom-test-util.js';
import {ValueMap} from '../../model/value-map.js';
import {ViewProps} from '../../model/view-props.js';
import {LabelPropsObject, LabelView} from './label.js';

describe(LabelView.name, () => {
	it('should mark the element as label-less when the label is empty', () => {
		const doc = createTestWindow().document;
		const view = new LabelView(doc, {
			props: ValueMap.fromObject<LabelPropsObject>({label: null}),
			viewProps: ViewProps.create(),
		});
		assert.ok(view.element.classList.contains('tp-lblv-nol'));
	});

	it('should render a single-line label without a <br>', () => {
		const doc = createTestWindow().document;
		const view = new LabelView(doc, {
			props: ValueMap.fromObject<LabelPropsObject>({label: 'foo'}),
			viewProps: ViewProps.create(),
		});
		assert.strictEqual(view.labelElement.textContent, 'foo');
		assert.strictEqual(view.labelElement.querySelectorAll('br').length, 0);
	});

	it('should render a multi-line label with <br> separators', () => {
		const doc = createTestWindow().document;
		const view = new LabelView(doc, {
			props: ValueMap.fromObject<LabelPropsObject>({label: 'foo\nbar\nbaz'}),
			viewProps: ViewProps.create(),
		});
		assert.strictEqual(view.labelElement.textContent, 'foobarbaz');
		assert.strictEqual(view.labelElement.querySelectorAll('br').length, 2);
		assert.ok(!view.element.classList.contains('tp-lblv-nol'));
	});
});
