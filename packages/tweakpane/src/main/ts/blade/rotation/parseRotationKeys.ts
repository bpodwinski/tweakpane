import type {RotationInputKeys} from './RotationInputKeys.js';

export function parseRotationKeys(
	value: unknown,
): RotationInputKeys | undefined {
	if (typeof value !== 'object' || value === null) {
		return undefined;
	}

	const src = value as Record<string, unknown>;
	const result: RotationInputKeys = {};
	(['x', 'y', 'z', 'w'] as const).forEach((axis) => {
		if (typeof src[axis] === 'string') {
			result[axis] = src[axis] as string;
		}
	});
	return result;
}
