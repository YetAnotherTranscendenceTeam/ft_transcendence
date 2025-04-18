import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, paddleShape } from "./constants.js";

export default class Wall extends PH2D.Body {
	public constructor(shape: PH2D.Shape, position: Vec2) {
		super(PH2D.PhysicsType.STATIC, shape, bounceMaterial, position, Vec2.create());
	}
}
