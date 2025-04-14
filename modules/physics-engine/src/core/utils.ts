import { Vec2 } from "gl-matrix";

export function pseudoCross(v1: Vec2, v2: Vec2): number {
	return v1[0] * v2[1] - v1[1] * v2[0];
}
