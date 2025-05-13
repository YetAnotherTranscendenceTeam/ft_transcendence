import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial } from "./constants.js";

export default class Obstacle extends PH2D.Body {
	private _rotation: number;

	/**
	 * Create a wall.
	 * @param shape The shape of the wall.
	 * @param position The position of the wall.
	 * @param size The size of the wall.
	 */
	public constructor(shape: PH2D.Shape, position: Vec2, rotation: number) {
		super(PH2D.PhysicsType.KINEMATIC, shape, bounceMaterial, position, Vec2.create());
		this._rotation = rotation;
	}

	public update() {
		this.angularVelocity = this._rotation;
	}
}
