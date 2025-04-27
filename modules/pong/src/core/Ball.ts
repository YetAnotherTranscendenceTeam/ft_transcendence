import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, ballShape, defaultBallSpeed, maxBallSpeed } from "./constants.js";

export default class Ball extends PH2D.Body {
	private _speed: number;

	public constructor(position: Vec2 = Vec2.create(), direction: Vec2 = Vec2.create(), speed: number = 0) {
		super(PH2D.PhysicsType.DYNAMIC, ballShape, bounceMaterial, position, Vec2.create());
		this._speed = speed;
		this.velocity = Vec2.normalize(Vec2.create(), direction) as Vec2;
		Vec2.scale(this.velocity, this.velocity, this._speed);
	}

	public faster() {
		if (this._speed < maxBallSpeed) {
			this._speed += 0.5;
		}
		this.correctSpeed();
	}

	public correctSpeed() {
		if (this.velocity.squaredMagnitude != this._speed * this._speed) {
			Vec2.normalize(this.velocity, this.velocity);
			Vec2.scale(this.velocity, this.velocity, this._speed);
		}
	}

	public sync(ball: any, dt: number) {
		this._speed = ball._speed;
		this.position = new Vec2(ball._position[0], ball._position[1]);
		this.velocity = new Vec2(ball._velocity[0], ball._velocity[1]);
		this.angularVelocity = ball._angularVelocity;
		this.setOrientation(ball._orientation);
	}

	public setDirection(direction: Vec2) {
		Vec2.normalize(this.velocity, direction);
		Vec2.scale(this.velocity, this.velocity, this._speed);
	}

	public get speed(): number {
		return this._speed;
	}

	public set speed(value: number) {
		this._speed = value;
		this.correctSpeed();
	}
}
