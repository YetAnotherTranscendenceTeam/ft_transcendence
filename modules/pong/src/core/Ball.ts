import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial, ballShape, ballSpeedControl, ballDamageMax, ballBounceMax, ballBounceStuckAngle, ballBounceStuckLimit, ballSpeedMin, ballSpeedMax, ballAcceleration } from "./constants.js";
import { IBall } from "./types.js"

export default class Ball extends PH2D.Body {
	private _speed: number;
	private _bounceCount: number;
	private _stuckCount: number;
	public playerId: number;

	public constructor(position: Vec2 = Vec2.create(), direction: Vec2 = Vec2.create(), speed: number = 0) {
		super(PH2D.PhysicsType.DYNAMIC, ballShape, bounceMaterial, position, Vec2.create());
		this._speed = speed;
		this.velocity = Vec2.normalize(Vec2.create(), direction) as Vec2;
		Vec2.scale(this.velocity, this.velocity, this._speed);
		this._bounceCount = -1;
		this._stuckCount = 0;
		this.playerId = -1;
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
		if (this._speed < ballSpeedControl) {
			this._speed += ballAcceleration;
		}
		this.correctSpeed();
	}

	public correctSpeed() {
		if (this.velocity.squaredMagnitude != this._speed * this._speed) {
			Vec2.normalize(this.velocity, this.velocity);
			Vec2.scale(this.velocity, this.velocity, this._speed);
		}
	}

	public limitSpeed() {
		const speed = this.velocity.squaredMagnitude;
		if (speed > ballSpeedMax * ballSpeedMax) {
			console.log("ball high speed limit");
			Vec2.normalize(this.velocity, this.velocity);
			Vec2.scale(this.velocity, this.velocity, ballSpeedControl);
		}
		if (speed < ballSpeedMin * ballSpeedMin) {
			console.log("ball low speed limit");
			Vec2.normalize(this.velocity, this.velocity);
			Vec2.scale(this.velocity, this.velocity, ballSpeedMin);
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
	
	public getDamage(): number {
		// return 1 / (1 + Math.exp(-this._bounceCount/1.5 + 4.2)) * 8 + 1;
		if (this._bounceCount >= ballDamageMax) {
			return ballDamageMax;
		}
		return this._bounceCount + 1;
	}
	
	public disableDamage() {
		this._bounceCount = -1;
	}
	
	public increaseDamage() {
		if (this._bounceCount !== -1 && this._bounceCount < ballBounceMax) {
			this._bounceCount++;
		}
	}

	public stuckUpdate() {
		// absolute angle relative to Y axis
		let angle = Math.abs(Math.atan2(this.velocity[0], this.velocity[1]));
		if (angle > Math.PI / 2) {
			angle = Math.PI - angle;
		}
		console.log("angleR: " + angle, "angleD: " + angle * 180 / Math.PI);
		if (angle <= ballBounceStuckAngle) {
			this._stuckCount++;
		}
		else {
			this._stuckCount = 0;
		}
		if (this._stuckCount > ballBounceStuckLimit) {
			console.log("ball stuck");
			this._stuckCount = 0;
			let direction; // 1 = trigonometric, -1 = anti-trigonometric
			if (this.velocity[0] > 0) {
				if (this.velocity[1] > 0) {
					direction = -1;
				} else {
					direction = 1;
				}
			} else {
				if (this.velocity[1] > 0) {
					direction = 1;
				} else {
					direction = -1;
				}
			}
			Vec2.rotate(this.velocity, this.velocity, Vec2.create(), direction * ballBounceStuckAngle);
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
