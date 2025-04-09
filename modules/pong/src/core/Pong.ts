import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import { DT, ballSpeedMin, ballSize, bounceMaterial, paddleHalfSize, defaultBallSpeed, defaultPaddleSpeed, defaultPaddleShape } from "./constants.js";
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import { ballCollision } from "./Behaviors.js";

export enum PongState {
	RESERVED = "reserved",
	PLAYING = "playing",
	PAUSED = "paused",
	ENDED = "ended"
}

export class Pong {
	private readonly _physicsScene: PH2D.Scene;
	private _accumulator: number = 0;

	protected _matchId: number;
	protected _gameMode: GameMode;
	protected _players: IPlayer[] = [];
	protected _state: PongState = PongState.RESERVED;

	protected _balls: Ball[] = [];
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
		const ball: Ball = new Ball(this._physicsScene, Vec2.create(), Vec2.create(), defaultBallSpeed);
		this._balls.push(ball);

		// Paddles
		const paddleLeftBody: Paddle = new Paddle(this._physicsScene, new Vec2(-5 + paddleHalfSize[0], 0), Vec2.create(), defaultPaddleSpeed);
		const paddleRightBody: Paddle = new Paddle(this._physicsScene, new Vec2(5 - paddleHalfSize[0], 0), Vec2.create(), defaultPaddleSpeed);
		this._paddles.set(0, paddleLeftBody);
		this._paddles.set(1, paddleRightBody);

		// Walls
		const wallShape: PH2D.PolygonShape = new PH2D.PolygonShape(5, 0.1);
		const wallBottomBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, wallShape, bounceMaterial, new Vec2(0, -4), Vec2.create());
		const wallTopBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, wallShape, bounceMaterial, new Vec2(0, 4), Vec2.create());
		this._physicsScene.addBody(wallTopBody);
		this._physicsScene.addBody(wallBottomBody);

		// Goal
		const goalShape: PH2D.PolygonShape = new PH2D.PolygonShape(0.1, 4.1);
		const goalLeftBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.TRIGGER, goalShape, bounceMaterial, new Vec2(-5.2, 0), Vec2.create());
		const goalRightBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.TRIGGER, goalShape, bounceMaterial, new Vec2(5.2, 0), Vec2.create());
		this._physicsScene.addBody(goalLeftBody);
		this._physicsScene.addBody(goalRightBody);

		ball.addEventListener("collision", ballCollision);
	}

	protected start() {
		this._state = PongState.PLAYING;

		// Ball reset and initial velocity
		const dir: number = Math.floor(Math.random() * 2); // 0 = left, 1 = right
		const angle: number = Math.random() * Math.PI / 2 - Math.PI / 4; // random angle between -45 and 45 degrees
		const x: number = dir === 0 ? -1 : 1; // direction of the ball
		const y: number = Math.sin(angle); // vertical component of the ball's velocity
		const ballVelocity: Vec2 = new Vec2(x, y);
		this._balls[0].setDirection(ballVelocity);
		this._balls[0].speed = defaultBallSpeed;
		this._balls[0].position[0] = 0;
		this._balls[0].position[1] = 0;
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
		this._paddles.forEach((paddle: PH2D.Body) => { // block paddle movement with walls
			if (paddle.position[1] > (4 - paddleHalfSize[1] - 0.1)) {
				paddle.position[1] = (4 - paddleHalfSize[1] - 0.1);
			} else if (paddle.position[1] < (-4 + paddleHalfSize[1] + 0.1)) {
				paddle.position[1] = (-4 + paddleHalfSize[1] + 0.1);
			}
		});
		return this._accumulator / DT;
	}
}
