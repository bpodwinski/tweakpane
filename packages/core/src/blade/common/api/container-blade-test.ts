import * as assert from 'assert';
import {describe, it} from 'mocha';

import {ValueMap} from '../../../common/model/value-map.js';
import {ViewProps} from '../../../common/model/view-props.js';
import {createTestWindow} from '../../../misc/dom-test-util.js';
import {BladeApiCache} from '../../../plugin/blade-api-cache.js';
import {PluginPool} from '../../../plugin/pool.js';
import {FolderController} from '../../folder/controller/folder.js';
import {FolderPropsObject} from '../../folder/view/folder.js';
import {createBlade} from '../model/blade.js';
import {ContainerBladeApi, isContainerBladeApi} from './container-blade.js';

function createFolderController(doc: Document): FolderController {
	return new FolderController(doc, {
		blade: createBlade(),
		props: ValueMap.fromObject<FolderPropsObject>({title: 'Folder'}),
		viewProps: ViewProps.create(),
	});
}

describe(ContainerBladeApi.name, () => {
	it('should refresh the underlying rack', () => {
		const doc = createTestWindow().document;
		const controller = createFolderController(doc);
		const pool = new PluginPool(new BladeApiCache());
		const api = new ContainerBladeApi(controller, pool);

		assert.doesNotThrow(() => api.refresh());
	});
});

describe(isContainerBladeApi.name, () => {
	it('should return true for a ContainerBladeApi', () => {
		const doc = createTestWindow().document;
		const controller = createFolderController(doc);
		const pool = new PluginPool(new BladeApiCache());
		const api = new ContainerBladeApi(controller, pool);

		assert.strictEqual(isContainerBladeApi(api), true);
	});

	it('should return false for a value without a rackApi_ property', () => {
		assert.strictEqual(isContainerBladeApi({} as any), false);
	});
});
