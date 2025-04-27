import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, ballShape, defaultBallSpeed, maxBallSpeed } from "./constants.js";
import { IBall } from "./types.js"
import trunc from "./trunc.js";

export default class Ball extends PH2D.Body {
	private _speed: number;

	public constructor(position: Vec2 = Vec2.create(), direction: Vec2 = Vec2.create(), speed: number = 0) {
		super(PH2D.PhysicsType.DYNAMIC, ballShape, bounceMaterial, position, Vec2.create());
		this._speed = speed;
		this.velocity = Vec2.normalize(Vec2.create(), direction) as Vec2;
		Vec2.scale(this.velocity, this.velocity, this._speed);
	}

	public toJSON(): IBall {
		return {
			position: [trunc(this.position[0], 3), trunc(this.position[1], 3)],
			// velocity: [this.velocity[0], this.velocity[1]],
			velocity: [trunc(this.velocity[0], 3), trunc(this.velocity[1], 3)],
			// angularVelocity: this.angularVelocity,
			angularVelocity: trunc(this.angularVelocity, 3),
			// orientation: this.orientation,
			orientation: trunc(this.orientation, 3),
			speed: this._speed
		};
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

	public sync(ball: IBall, dt: number) {
		this._speed = ball.speed;
		this.position = new Vec2(ball.position[0], ball.position[1]);
		this.velocity = new Vec2(ball.velocity[0], ball.velocity[1]);
		this.angularVelocity = ball.angularVelocity;
		this.setOrientation(ball.orientation);
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
