import type {
	BaseInputParams,
	PickerLayout,
	PointDimensionParams,
} from '@tweakpane/core';

import type {EulerOrder} from './EulerOrder.js';
import type {EulerUnit} from './EulerUnit.js';
import type {RotationInputKeys} from './RotationInputKeys.js';

export interface RotationInputPluginEulerParams extends BaseInputParams {
	view: 'rotation';
	expanded?: boolean;
	picker?: PickerLayout;
	rotationMode: 'euler';
	order?: EulerOrder;
	unit?: EulerUnit;
	x?: PointDimensionParams;
	y?: PointDimensionParams;
	z?: PointDimensionParams;
	// Remap the bound object's property names (e.g. {x: '_x', y: '_y', z: '_z'})
	// for engines where the public x/y/z are setters with side effects.
	keys?: RotationInputKeys;
	// Scales the drag distance needed for a full rotation on the gizmo (default 1).
	// Lower values make the gizmo drag less sensitive.
	pointerScale?: number;
}
