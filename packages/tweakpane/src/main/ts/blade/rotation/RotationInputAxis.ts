import type {Constraint} from 'tweakpane-reborn-core';
import type {NumberTextProps} from 'tweakpane-reborn-core';

export interface RotationInputAxis {
	baseStep: number;
	constraint: Constraint<number> | undefined;
	textProps: NumberTextProps;
}
