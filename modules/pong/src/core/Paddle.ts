import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, paddleShape } from "./constants.js";

export default class Paddle extends PH2D.Body {
	private _speed: number;

	public constructor(position: Vec2, direction: Vec2, speed: number) {
		super(PH2D.PhysicsType.KINEMATIC, paddleShape, bounceMaterial, position, Vec2.create());
	}

	public get speed(): number {
		return this._speed;
	}

	public set speed(value: number) {
		this._speed = value;
	}
}
