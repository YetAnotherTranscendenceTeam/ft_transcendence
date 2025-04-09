import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, ballSpeedMin, ballSize, bounceMaterial, defaultBallShape, defaultBallSpeed } from "./constants.js";

// export default class Ball {
// 	private readonly _physicsScene: PH2D.Scene;
// 	private readonly _body: PH2D.Body;
// 	public speed: number;

// 	// static readonly ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballSize);

// 	public constructor(scene: PH2D.Scene, position: Vec2, direction: Vec2, speed: number) {
// 		this._physicsScene = scene;
// 		this._body = new PH2D.Body(PH2D.PhysicsType.DYNAMIC, defaultBallShape, bounceMaterial, position, Vec2.create());
// 		this.speed = speed;
// 		this._body.velocity = Vec2.normalize(Vec2.create(), direction) as Vec2;
// 		Vec2.scale(this._body.velocity, this._body.velocity, this.speed);

// 		this._physicsScene.addBody(this._body);
// 	}

// 	public correctSpeed() {
// 		if (this._body.velocity.squaredMagnitude != this.speed * this.speed) {
// 			Vec2.normalize(this._body.velocity, this._body.velocity);
// 			Vec2.scale(this._body.velocity, this._body.velocity, this.speed);
// 		}
// 	}

// 	public get body(): PH2D.Body {
// 		return this._body;
// 	}
// }

export default class Ball extends PH2D.Body {
	private _speed: number;

	public constructor(scene: PH2D.Scene, position: Vec2, direction: Vec2, speed: number) {
		super(PH2D.PhysicsType.DYNAMIC, defaultBallShape, bounceMaterial, position, Vec2.create());
		this._speed = speed;
		this.velocity = Vec2.normalize(Vec2.create(), direction) as Vec2;
		Vec2.scale(this.velocity, this.velocity, this._speed);

		scene.addBody(this);
	}

	public correctSpeed() {
		if (this.velocity.squaredMagnitude != this._speed * this._speed) {
			Vec2.normalize(this.velocity, this.velocity);
			Vec2.scale(this.velocity, this.velocity, this._speed);
		}
	}

	public get speed(): number {
		return this._speed;
	}

	public set speed(value: number) {
		this._speed = value;
		this.correctSpeed();
	}

	public setDirection(direction: Vec2) {
		Vec2.normalize(this.velocity, direction);
		Vec2.scale(this.velocity, this.velocity, this._speed);
	}
}
