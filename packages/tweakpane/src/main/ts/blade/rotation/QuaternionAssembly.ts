import type {PointNdAssembly} from 'tweakpane-reborn-core/dist/input-binding/common/model/point-nd.js';

import {Quaternion} from './Quaternion.js';

export const QuaternionAssembly: PointNdAssembly<Quaternion> = {
	toComponents: (r: Quaternion) => [r.x, r.y, r.z, r.w],
	fromComponents: (c: number[]) => new Quaternion(c[0], c[1], c[2], c[3]),
};
