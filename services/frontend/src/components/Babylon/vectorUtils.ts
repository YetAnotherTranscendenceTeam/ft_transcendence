import { Vec2 } from "gl-matrix";
import { Vector2, Vector3 } from "@babylonjs/core";

export function glV2ToBabylonVector2(vec: Vec2): Vector2 {
	return new Vector2(vec[0], vec[1]);
}

export function babylonVector2ToGlV2(vec: Vector2): Vec2 {
	return Vec2.fromValues(vec.x, vec.y);
}

export function glV2ToBabylonVector3(vec: Vec2): Vector3 {
	return new Vector3(vec[0], 0, vec[1]);
}

export function babylonVector3ToGlV2(vec: Vector3): Vec2 {
	return Vec2.fromValues(vec.x, vec.z);
}

export function glV2ToBabylonVector3WithY(vec: Vec2, y: number): Vector3 {
	return new Vector3(vec[0], y, vec[1]);
}

export function glV2ArrayToBabylonV2Array(vecs: Vec2[]): Vector2[] {
	return vecs.map((vec) => new Vector2(vec[0], vec[1]));
}

export function glV2ArrayToBabylonV3Array(vecs: Vec2[]): Vector3[] {
	return vecs.map((vec) => new Vector3(vec[0], 0, vec[1]));
}
