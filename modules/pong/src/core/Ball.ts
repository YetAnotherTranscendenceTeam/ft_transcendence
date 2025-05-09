import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, ballShape, defaultBallSpeed, maxBallSpeed } from "./constants.js";
import { IBall } from "./types.js"
import trunc from "./trunc.js";



export default class Ball extends PH2D.Body {
	private _speed: number;
	private _bounceCount: number;

	public constructor(position: Vec2 = Vec2.create(), direction: Vec2 = Vec2.create(), speed: number = 0) {
		super(PH2D.PhysicsType.DYNAMIC, ballShape, bounceMaterial, position, Vec2.create());
		this._speed = speed;
		this.velocity = Vec2.normalize(Vec2.create(), direction) as Vec2;
		Vec2.scale(this.velocity, this.velocity, this._speed);
		this._bounceCount = 0;
	}

	public toJSON(): IBall {
		return {
			position: [this.position[0], this.position[1]],
			//position: [trunc(this.position[0], 3), trunc(this.position[1], 3)],
			velocity: [this.velocity[0], this.velocity[1]],
			//velocity: [trunc(this.velocity[0], 3), trunc(this.velocity[1], 3)],
			angularVelocity: this.angularVelocity,
			//angularVelocity: trunc(this.angularVelocity, 3),
			orientation: this.orientation,
			//orientation: trunc(this.orientation, 3),
			speed: this._speed,
			bounceCount: this._bounceCount,
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

	public sync(ball: IBall, tickDiff: number, dt: number) {
		this._speed = ball.speed;
		this.velocity = new Vec2(ball.velocity[0], ball.velocity[1]);
		this.angularVelocity = ball.angularVelocity;
		this.setOrientation(ball.orientation);
		let newPos = Vec2.fromValues(ball.position[0], ball.position[1]);
		//Vec2.scaleAndAdd(newPos, newPos, this.velocity, DT * tickDiff);
		//const compare = Vec2.create();
		//Vec2.sub(compare, newPos, this.position);
		//if (Vec2.length(compare) > 0.4)
		this._bounceCount = ball.bounceCount;
		this.position = newPos;
	}

	public setDirection(direction: Vec2) {
		Vec2.normalize(this.velocity, direction);
		Vec2.scale(this.velocity, this.velocity, this._speed);
	}

	public enableDamage() {
		if (this._bounceCount !== -1) {
			return;
		}
		this._bounceCount = 0;
	}

	public resetDamage() {
		this._bounceCount = 0;
	}

	public disableDamage() {
		this._bounceCount = -1;
	}

	public increaseDamage() {
		if (this._bounceCount !== -1) {
			this._bounceCount++;
		}
	}

	public get bounceCount(): number {
		return this._bounceCount;
	}

	public get speed(): number {
		return this._speed;
	}

	public set speed(value: number) {
		this._speed = value;
		this.correctSpeed();
	}
}
