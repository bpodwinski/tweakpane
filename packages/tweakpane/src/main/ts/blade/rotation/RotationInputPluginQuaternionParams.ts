import type {
	BaseInputParams,
	PickerLayout,
	PointDimensionParams,
} from '@tweakpane/core';

import type {RotationInputKeys} from './RotationInputKeys.js';

export interface RotationInputPluginQuaternionParams extends BaseInputParams {
	view: 'rotation';
	expanded?: boolean;
	picker?: PickerLayout;
	rotationMode?: 'quaternion';
	x?: PointDimensionParams;
	y?: PointDimensionParams;
	z?: PointDimensionParams;
	w?: PointDimensionParams;
	// Remap the bound object's property names (e.g. {x: '_x', y: '_y', z: '_z', w: '_w'})
	// for engines where the public x/y/z/w are setters with side effects.
	keys?: RotationInputKeys;
	// Scales the drag distance needed for a full rotation on the gizmo (default 1).
	// Lower values make the gizmo drag less sensitive.
	pointerScale?: number;
}
