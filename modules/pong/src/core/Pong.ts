import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import * as K from "./constants.js";
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import { ballCollision } from "./Behaviors.js";
import { MapSide } from "./types.js";

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
	protected _goals: Map<number, Goal> = new Map();

	protected _score: number[];
	protected _lastSide: MapSide;

	public constructor() {
		this._physicsScene = new PH2D.Scene(Vec2.create(), K.DT, 5);
	}

	public toJSON() {
		return {
			players: this._players,
			match_id: this._matchId,
			gamemode: this._gameMode
		};
	}

	public onlineSetup(match_id: number, gamemode: GameMode, players: IPlayer[], state: PongState = PongState.RESERVED) {
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

	public localSetup() {
		this._physicsScene.clear();
		this._balls = [];
		this._paddles = new Map();
		this._accumulator = 0;
		this._score = [0, 0];

		this._matchId = 0;
		this._gameMode = undefined;
		this._players = [];
		this._state = PongState.RESERVED;
		
		this.defaultSetup();
	}

	private defaultSetup() { // temporary
		// Ball
		const ball: Ball = new Ball(this._physicsScene, Vec2.create(), Vec2.create(), K.defaultBallSpeed);
		this._balls.push(ball);

		// Paddles
		const paddleLeftBody: Paddle = new Paddle(this._physicsScene, K.smallPaddleLeftPosition, Vec2.create(), K.paddleSpeed);
		const paddleRightBody: Paddle = new Paddle(this._physicsScene, K.smallPaddleRightPosition, Vec2.create(), K.paddleSpeed);
		this._paddles.set(0, paddleLeftBody);
		this._paddles.set(1, paddleRightBody);

		// Walls
		const wallBottomBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, K.smallWallShape, K.bounceMaterial, K.smallWallBottomPosition, Vec2.create());
		const wallTopBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, K.smallWallShape, K.bounceMaterial, K.smallWallTopPosition, Vec2.create());
		this._physicsScene.addBody(wallTopBody);
		this._physicsScene.addBody(wallBottomBody);

		// Goal
		// const goalLeftBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.TRIGGER, goalShape, bounceMaterial, new Vec2(-5.2, 0), Vec2.create());
		// const goalRightBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.TRIGGER, goalShape, bounceMaterial, new Vec2(5.2, 0), Vec2.create());
		// this._physicsScene.addBody(goalLeftBody);
		// this._physicsScene.addBody(goalRightBody);
		const goalLeftBody: Goal = new Goal(this._physicsScene, K.smallGoalShape, K.smallGoalLeftPosition, Vec2.create(), K.defaultBallSpeed);
		const goalRightBody: Goal = new Goal(this._physicsScene, K.smallGoalShape, K.smallGoalRightPosition, Vec2.create(), K.defaultBallSpeed);
		this._goals.set(0, goalLeftBody);
		this._goals.set(1, goalRightBody);

		ball.addEventListener("collision", ballCollision.bind(this));
	}

	protected start() {
		this._state = PongState.PLAYING;

		// Ball reset and initial velocity
		this._balls[0].position[0] = 0;
		this._balls[0].position[1] = 0;
		this.initialBallVelocity();
	}

	protected roundStart() {
		// Ball reset and initial velocity
		this._balls[0].position[0] = 0;
		this._balls[0].position[1] = 0;
		this.initialBallVelocity();
		for (const paddle of this._paddles.values()) {
			paddle.position[1] = 0;
		}
	}

	public shouldUpdate(): boolean {
		return true;
	}

	protected physicsUpdate(dt: number): number {
		this._accumulator += dt;
		if (this._accumulator > 0.2) {
			this._accumulator = 0.2;
		}
		while (this._accumulator >= K.DT) {
			this._physicsScene.step();
			this._accumulator -= K.DT;
		}
		this._paddles.forEach((paddle: PH2D.Body) => { // block paddle movement with walls
			if (paddle.position[1] > (K.mapData1v1.playGround.height / 2 - K.paddleSize[1] / 2)) {
				paddle.position[1] = (K.mapData1v1.playGround.height / 2 - K.paddleSize[1] / 2);
			} else if (paddle.position[1] < (-K.mapData1v1.playGround.height / 2 + K.paddleSize[1] / 2)) {
				paddle.position[1] = (-K.mapData1v1.playGround.height / 2 + K.paddleSize[1] / 2);
			}
		});
		return this._accumulator / K.DT;
	}

	protected scoreUpdate(): boolean {
		let scored: boolean = false;
		this._goals.forEach((goal: Goal) => {
			if (goal.contact > 0) {
				if (goal.position.x < 0) { // left goal
					this._score[1]++;
					this._lastSide = MapSide.RIGHT;
				} else { // right goal
					this._score[0]++;
					this._lastSide = MapSide.LEFT;
				}
				goal.resetContact();
				scored = true;
			}
		});
		// console.log("total score: " + this._score[0] + "-" + this._score[1]);
		// check if game ended
		if (this._score[0] == 5) {
			this._state = PongState.ENDED;
			console.log("game ended");
		}
		if (this._score[1] == 5) {
			this._state = PongState.ENDED;
			console.log("game ended");
		}
		if (scored) {
			this.roundStart();
			return true;
		}
		return false;
	}

	private initialBallVelocity() {
		const dir: number = Math.floor(Math.random() * 2); // 0 = left, 1 = right
		const angle: number = Math.random() * 20 * Math.PI / 180; // random angle between -20 and 20 degrees
		const x: number = dir === 0 ? -1 : 1; // horizontal component of the ball's velocity
		const y: number = Math.sin(angle); // vertical component of the ball's velocity
		const ballVelocity: Vec2 = new Vec2(x, y);
		this._balls[0].setDirection(ballVelocity);
		this._balls[0].speed = K.defaultBallSpeed;
	}
}
