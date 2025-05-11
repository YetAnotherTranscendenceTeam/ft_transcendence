import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, paddleShape } from "./constants.js";
import { MapSide } from "./types.js";

export default class Paddle extends PH2D.Body {
	private _speed: number;

	public constructor(position: Vec2, speed: number) {
		super(PH2D.PhysicsType.KINEMATIC, paddleShape, bounceMaterial, position, Vec2.create());
		this._speed = speed;
	}

	public get speed(): number {
		return this._speed;
	}

	public set speed(value: number) {
		this._speed = value;
	}

	public side(): MapSide {
		if (this.position[0] < 0) {
			return MapSide.LEFT;
		} else {
			return MapSide.RIGHT;
		}
	}

	public move = (direction: number): void => {
		this.velocity = new Vec2(0, direction * this._speed)
	};
}
