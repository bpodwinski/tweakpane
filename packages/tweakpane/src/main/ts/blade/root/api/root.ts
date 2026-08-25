import {FolderApi, PluginPool} from 'tweakpane-reborn-core';

import {RootController} from '../controller/root.js';

export class RootApi extends FolderApi {
	/**
	 * @hidden
	 */
	constructor(controller: RootController, pool: PluginPool) {
		super(controller, pool);
	}

	get element(): HTMLElement {
		return this.controller.view.element;
	}
}
