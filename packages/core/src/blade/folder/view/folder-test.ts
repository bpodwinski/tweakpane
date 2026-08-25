import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ValueMap} from '../../../common/model/value-map.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {Foldable} from '../../common/model/foldable.js';
import {FolderPropsObject, FolderView} from './folder.js';

describe(FolderView.name, () => {
	it('should mark the element title-less when the title is undefined', () => {
		const doc = createTestWindow().document;
		const view = new FolderView(doc, {
			foldable: Foldable.create(true),
			props: ValueMap.fromObject<FolderPropsObject>({title: undefined}),
			viewProps: ViewProps.create(),
		});
		assert.ok(view.element.classList.contains('tp-fldv-not'));
	});

	it('should not mark the element title-less when a title is set', () => {
		const doc = createTestWindow().document;
		const view = new FolderView(doc, {
			foldable: Foldable.create(true),
			props: ValueMap.fromObject<FolderPropsObject>({title: 'Folder'}),
			viewProps: ViewProps.create(),
		});
		assert.ok(!view.element.classList.contains('tp-fldv-not'));
	});
});
