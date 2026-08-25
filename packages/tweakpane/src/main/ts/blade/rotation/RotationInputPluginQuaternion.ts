import {
	BindingTarget,
	createPlugin,
	InputBindingPlugin,
	parseNumber,
	parsePickerLayout,
	parsePointDimensionParams,
	parseRecord,
	PointNdConstraint,
	TpError,
	ValueController,
} from '@tweakpane/core';

import {createAxisQuaternion} from './createAxisQuaternion.js';
import {createDimensionConstraint} from './createDimensionConstraint.js';
import {parseQuaternion} from './parseQuaternion.js';
import {parseRotationKeys} from './parseRotationKeys.js';
import {Quaternion} from './Quaternion.js';
import {QuaternionAssembly} from './QuaternionAssembly.js';
import {RotationInputController} from './RotationInputController.js';
import type {RotationInputPluginQuaternionParams} from './RotationInputPluginQuaternionParams.js';

export const RotationInputPluginQuaternion: InputBindingPlugin<
	Quaternion,
	Quaternion,
	RotationInputPluginQuaternionParams
> = createPlugin({
	id: 'rotation',
	type: 'input',

	accept(exValue: unknown, params: Record<string, unknown>) {
		// Parse parameters object
		const result = parseRecord<RotationInputPluginQuaternionParams>(
			params,
			(p) => ({
				view: p.required.constant('rotation'),
				label: p.optional.string,
				picker: p.optional.custom(parsePickerLayout),
				expanded: p.optional.boolean,
				rotationMode: p.optional.constant('quaternion'),
				x: p.optional.custom(parsePointDimensionParams),
				y: p.optional.custom(parsePointDimensionParams),
				z: p.optional.custom(parsePointDimensionParams),
				w: p.optional.custom(parsePointDimensionParams),
				keys: p.optional.custom(parseRotationKeys),
				pointerScale: p.optional.number,
			}),
		);

		return result
			? {
					initialValue: parseQuaternion(exValue, result.keys),
					params: result,
			  }
			: null;
	},

	binding: {
		reader({params}) {
			return (exValue: unknown): Quaternion => {
				return parseQuaternion(exValue, params.keys);
			};
		},

		constraint({params}) {
			return new PointNdConstraint({
				assembly: QuaternionAssembly,
				components: [
					createDimensionConstraint(params.x),
					createDimensionConstraint(params.y),
					createDimensionConstraint(params.z),
					createDimensionConstraint(params.w),
				],
			});
		},

		writer({params}) {
			return (target: BindingTarget, inValue: Quaternion) => {
				target.writeProperty(params.keys?.x ?? 'x', inValue.x);
				target.writeProperty(params.keys?.y ?? 'y', inValue.y);
				target.writeProperty(params.keys?.z ?? 'z', inValue.z);
				target.writeProperty(params.keys?.w ?? 'w', inValue.w);
			};
		},
	},

	controller({document, value, constraint, params, viewProps}) {
		if (!(constraint instanceof PointNdConstraint)) {
			throw TpError.shouldNeverHappen();
		}

		const expanded = params.expanded;
		const picker = params.picker;

		return new RotationInputController(document, {
			axes: [
				createAxisQuaternion(constraint.components[0]),
				createAxisQuaternion(constraint.components[1]),
				createAxisQuaternion(constraint.components[2]),
				createAxisQuaternion(constraint.components[3]),
			],
			assembly: QuaternionAssembly,
			rotationMode: 'quaternion',
			expanded: expanded ?? false,
			parser: parseNumber,
			pickerLayout: picker ?? 'popup',
			pointerScale: params.pointerScale ?? 1,
			value,
			viewProps: viewProps,
		}) as unknown as ValueController<Quaternion>; // TODO;
	},
});
