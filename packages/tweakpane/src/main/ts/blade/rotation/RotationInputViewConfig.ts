import type {Foldable, PickerLayout} from 'tweakpane-reborn-core';

import type {RotationInputRotationMode} from './RotationInputRotationMode.js';

export interface RotationInputViewConfig {
	rotationMode: RotationInputRotationMode;
	foldable: Foldable;
	pickerLayout: PickerLayout;
}
