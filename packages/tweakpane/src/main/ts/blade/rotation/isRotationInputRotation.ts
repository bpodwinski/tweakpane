import type {Quaternion} from './Quaternion.js';

export function isRotationInputRotation(input: unknown): input is Quaternion {
	if (typeof input !== 'object') {
		return false;
	}

	if (
		typeof (input as any)?.x !== 'number' ||
		/* istanbul ignore next -- once the x check above passes, input is proven non-nullish, so the `?.` null-guard on y/z/w below can never itself short-circuit */
		/* c8 ignore next 3 */
		typeof (input as any)?.y !== 'number' ||
		typeof (input as any)?.z !== 'number' ||
		typeof (input as any)?.w !== 'number'
	) {
		return false;
	}

	return true;
}
