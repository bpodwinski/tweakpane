import {Quaternion} from './Quaternion.js';
import type {RotationInputKeys} from './RotationInputKeys.js';

export function parseQuaternion(
	exValue: unknown,
	keys?: RotationInputKeys,
): Quaternion {
	const kx = keys?.x ?? 'x';
	const ky = keys?.y ?? 'y';
	const kz = keys?.z ?? 'z';
	const kw = keys?.w ?? 'w';

	if (
		typeof (exValue as any)?.[kx] === 'number' &&
		/* istanbul ignore next -- once the kx check above passes, exValue is proven non-nullish, so the `?.` null-guard on ky/kz/kw below can never itself short-circuit */
		/* c8 ignore next 3 */
		typeof (exValue as any)?.[ky] === 'number' &&
		typeof (exValue as any)?.[kz] === 'number' &&
		typeof (exValue as any)?.[kw] === 'number'
	) {
		return new Quaternion(
			(exValue as any)[kx],
			(exValue as any)[ky],
			(exValue as any)[kz],
			(exValue as any)[kw],
		);
	} else {
		return new Quaternion(0.0, 0.0, 0.0, 1.0);
	}
}
