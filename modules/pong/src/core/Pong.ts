import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import { DT, ballSpeedMin, ballSize, bounceMaterial, paddleHalfSize } from "./constants.js";

export enum PongState {
	RESERVED = "reserved",
	PLAYING = "playing",
	PAUSED = "paused",
	ENDED = "ended"
}

export class Pong {
	private _physicsScene: PH2D.Scene;
	private _accumulator: number = 0;

	protected _matchId: number;
	protected _gameMode: GameMode;
	protected _players: IPlayer[] = [];
	protected _state: PongState = PongState.RESERVED;

	protected _balls: PH2D.Body[] = [];
	protected _paddles: Map<number, PH2D.Body> = new Map();

	protected _score: number[];

	public constructor() {
		this._physicsScene = new PH2D.Scene(Vec2.create(), DT);
	}

	public setup(match_id: number, gamemode: GameMode, players: IPlayer[], state: PongState = PongState.RESERVED) {
		this._physicsScene.clear();
		this._balls = [];
		this._paddles = new Map();
		this._accumulator = 0;
		this._score = [0, 0];

		this._matchId = match_id;
		this._gameMode = gamemode;
		this._players = players;
		this._state = state;

		this.defaultSetup();
	}

	private defaultSetup() { // temporary
		// Ball
		const ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballSize);
		const ballBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.DYNAMIC, ballShape, bounceMaterial, Vec2.create(), Vec2.create());
		this._physicsScene.addBody(ballBody);
		this._balls.push(ballBody);

		// Paddles
		const paddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleHalfSize[0], paddleHalfSize[1]);
		const paddleLeftBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.KINEMATIC, paddleShape, bounceMaterial, new Vec2(-5, 0), Vec2.create());
		const paddleRightBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.KINEMATIC, paddleShape, bounceMaterial, new Vec2(5, 0), Vec2.create());
		this._physicsScene.addBody(paddleLeftBody);
		this._physicsScene.addBody(paddleRightBody);
		this._paddles.set(0, paddleLeftBody);
		this._paddles.set(1, paddleRightBody);

		// Walls
		const wallShape: PH2D.PolygonShape = new PH2D.PolygonShape(5, 0.1);
		const wallBottomBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, wallShape, bounceMaterial, new Vec2(0, -4), Vec2.create());
		const wallTopBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, wallShape, bounceMaterial, new Vec2(0, 4), Vec2.create());
		this._physicsScene.addBody(wallTopBody);
		this._physicsScene.addBody(wallBottomBody);

		// Goal
		// const goalShape: PH2D.PolygonShape = new PH2D.PolygonShape(0.1, 4);
		// const goalLeftBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, goalShape, bounceMaterial, new Vec2(-6.2, 0), Vec2.create());
		// const goalRightBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, goalShape, bounceMaterial, new Vec2(6.2, 0), Vec2.create());
		// this._physicsScene.addBody(goalLeftBody);
		// this._physicsScene.addBody(goalRightBody);

		ballBody.addEventListener("collision", (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
			const { emitter, other, manifold } = event.detail;
			// console.log("collision " + emitter.id + "-" + other.id);
			// console.log(emitter);
			// console.log(other);
			if (other === paddleLeftBody || other === paddleRightBody) { // control direction of the ball
				let relativePosition: number = emitter.position[1] - other.position[1];
				relativePosition /= paddleHalfSize[1];
				relativePosition = Math.max(-1, Math.min(1, relativePosition));
				const angle: number = Math.PI / 4 * relativePosition; // angle between -45 and 45 degrees
				const speed: number = emitter.velocity.magnitude;
				const x: number = other === paddleLeftBody ? 1 : -1; // direction of the ball
				const y: number = Math.sin(angle); // vertical component of the ball's velocity
				const paddleVelocity: Vec2 = new Vec2(x, y);
				Vec2.normalize(paddleVelocity, paddleVelocity);
				Vec2.scale(paddleVelocity, paddleVelocity, speed);
				// emitter.velocity = paddleVelocity;
				// blend the ball's velocity with the paddle's velocity
				Vec2.add(emitter.velocity, paddleVelocity, emitter.velocity);
				Vec2.normalize(emitter.velocity, emitter.velocity);
				Vec2.scale(emitter.velocity, emitter.velocity, speed);
				// emitter.position[0] = other.position[0] + (other === paddleLeftBody ? 1 : -1) * (paddleHalfSize[0] + ballSize);
			}
		});

		paddleLeftBody.addEventListener("collision", (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
			const { emitter, other, manifold } = event.detail;
			console.log("collision " + emitter.id + "-" + other.id);
			console.log(emitter);
			console.log(other);
		});
	}

	protected start() {
		this._state = PongState.PLAYING;
		const dir: number = Math.floor(Math.random() * 2); // 0 = left, 1 = right
		const angle: number = Math.random() * Math.PI / 2 - Math.PI / 4; // random angle between -45 and 45 degrees
		const speed: number = 1; // speed of the ball (to normalize with)
		const x: number = dir === 0 ? -1 : 1; // direction of the ball
		const y: number = Math.sin(angle); // vertical component of the ball's velocity
		const ballVelocity: Vec2 = new Vec2(x, y);
		Vec2.normalize(ballVelocity, ballVelocity);
		Vec2.scale(ballVelocity, ballVelocity, speed);
		this._balls[0].velocity = ballVelocity;
	}

	public toJSON() {
		return {
			players: this._players,
			match_id: this._matchId,
			gamemode: this._gameMode
		};
	}

	public shouldUpdate(): boolean {
		return true;
	}

	protected physicsUpdate(dt: number): number {
		this._accumulator += dt;
		if (this._accumulator > 0.2) {
			this._accumulator = 0.2;
		}
		while (this._accumulator >= DT) {
			this._physicsScene.step();
			this._accumulator -= DT;
		}
		// this._paddles.forEach((paddle: PH2D.Body) => {
		// 	if (paddle.position[1] > (4 - paddleHalfSize[1] - 0.1)) {
		// 		paddle.position[1] = (4 - paddleHalfSize[1] - 0.1);
		// 	} else if (paddle.position[1] < (-4 + paddleHalfSize[1] + 0.1)) {
		// 		paddle.position[1] = (-4 + paddleHalfSize[1] + 0.1);
		// 	}
		// });
		return this._accumulator / DT;
	}
}
