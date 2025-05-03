import { Vec2 } from "gl-matrix";

export function pseudoCross(v1: Vec2, v2: Vec2): number {
	return v1[0] * v2[1] - v1[1] * v2[0];
}

export function signedArea2(verts: Vec2[]): number {
	let sum = 0;
	for (let i = 0; i < verts.length; i++) {
		const j = (i + 1) % verts.length;
		sum += verts[i].x * verts[j].y - verts[j].x * verts[i].y;
	}
	return sum;
}
