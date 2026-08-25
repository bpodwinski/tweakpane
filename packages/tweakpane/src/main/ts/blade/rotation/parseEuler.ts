import {Euler} from './Euler.js';
import {EulerOrder} from './EulerOrder.js';
import {EulerUnit} from './EulerUnit.js';
import type {RotationInputKeys} from './RotationInputKeys.js';

export function parseEuler(
	exValue: unknown,
	order: EulerOrder,
	unit: EulerUnit,
	keys?: RotationInputKeys,
): Euler {
	const kx = keys?.x ?? 'x';
	const ky = keys?.y ?? 'y';
	const kz = keys?.z ?? 'z';

	if (
		typeof (exValue as any)?.[kx] === 'number' &&
		/* istanbul ignore next -- once the kx check above passes, exValue is proven non-nullish, so the `?.` null-guard on ky/kz below can never itself short-circuit */
		/* c8 ignore next 2 */
		typeof (exValue as any)?.[ky] === 'number' &&
		typeof (exValue as any)?.[kz] === 'number'
	) {
		return new Euler(
			(exValue as any)[kx],
			(exValue as any)[ky],
			(exValue as any)[kz],
			order,
			unit,
		);
	} else {
		return new Euler(0.0, 0.0, 0.0, order, unit);
	}
}
