import type {ValueController} from 'tweakpane-reborn-core';
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
} from 'tweakpane-reborn-core';

import {createAxisEuler} from './createAxisEuler.js';
import {createDimensionConstraint} from './createDimensionConstraint.js';
import {createEulerAssembly} from './createEulerAssembly.js';
import {Euler} from './Euler.js';
import {parseEuler} from './parseEuler.js';
import {parseEulerOrder} from './parseEulerOrder.js';
import {parseEulerUnit} from './parseEulerUnit.js';
import {parseRotationKeys} from './parseRotationKeys.js';
import {RotationInputController} from './RotationInputController.js';
import type {RotationInputPluginEulerParams} from './RotationInputPluginEulerParams.js';

export const RotationInputPluginEuler: InputBindingPlugin<
	Euler,
	Euler,
	RotationInputPluginEulerParams
> = createPlugin({
	id: 'rotation',
	type: 'input',

	accept(exValue: unknown, params: Record<string, unknown>) {
		// Parse parameters object
		const result = parseRecord<RotationInputPluginEulerParams>(params, (p) => ({
			view: p.required.constant('rotation'),
			label: p.optional.string,
			picker: p.optional.custom(parsePickerLayout),
			expanded: p.optional.boolean,
			rotationMode: p.required.constant('euler'),
			x: p.optional.custom(parsePointDimensionParams),
			y: p.optional.custom(parsePointDimensionParams),
			z: p.optional.custom(parsePointDimensionParams),
			order: p.optional.custom(parseEulerOrder),
			unit: p.optional.custom(parseEulerUnit),
			keys: p.optional.custom(parseRotationKeys),
			pointerScale: p.optional.number,
		}));

		return result
			? {
					initialValue: parseEuler(
						exValue,
						result.order ?? 'XYZ',
						result.unit ?? 'rad',
						result.keys,
					),
					params: result,
			  }
			: null;
	},

	binding: {
		reader({params}) {
			return (exValue: unknown): Euler => {
				return parseEuler(
					exValue,
					params.order ?? 'XYZ',
					params.unit ?? 'rad',
					params.keys,
				);
			};
		},

		constraint({params}) {
			return new PointNdConstraint({
				assembly: createEulerAssembly(
					params.order ?? 'XYZ',
					params.unit ?? 'rad',
				),
				components: [
					createDimensionConstraint(params.x),
					createDimensionConstraint(params.y),
					createDimensionConstraint(params.z),
				],
			});
		},

		writer({params}) {
			return (target: BindingTarget, inValue: Euler) => {
				target.writeProperty(params.keys?.x ?? 'x', inValue.x);
				target.writeProperty(params.keys?.y ?? 'y', inValue.y);
				target.writeProperty(params.keys?.z ?? 'z', inValue.z);
			};
		},
	},

	controller({document, value, constraint, params, viewProps}) {
		if (!(constraint instanceof PointNdConstraint)) {
			throw TpError.shouldNeverHappen();
		}

		const expanded = params.expanded;
		const picker = params.picker;

		const unit = params.unit ?? 'rad';
		const digits = {
			rad: 2,
			deg: 0,
			turn: 2,
		}[unit];

		return new RotationInputController(document, {
			axes: [
				createAxisEuler(digits, constraint.components[0]),
				createAxisEuler(digits, constraint.components[1]),
				createAxisEuler(digits, constraint.components[2]),
			],
			assembly: createEulerAssembly(params.order ?? 'XYZ', unit),
			rotationMode: 'euler',
			expanded: expanded ?? false,
			parser: parseNumber,
			pickerLayout: picker ?? 'popup',
			pointerScale: params.pointerScale ?? 1,
			value,
			viewProps: viewProps,
		}) as unknown as ValueController<Euler>; // TODO: resolve type puzzle
	},
});
