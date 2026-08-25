import type {PickerLayout, Value, ViewProps} from 'tweakpane-reborn-core';

import type {Rotation} from './Rotation.js';

export interface RotationInputGizmoControllerConfig {
	value: Value<Rotation>;
	viewProps: ViewProps;
	pickerLayout: PickerLayout;
	pointerScale: number;
}
