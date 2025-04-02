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

	public constructor() {
		this._physicsScene = new PH2D.Scene(Vec2.create(), DT);
	}

	public setup(match_id: number, gamemode: GameMode, players: IPlayer[], state: PongState = PongState.RESERVED) {
		this._physicsScene.clear();
		this._balls = [];
		this._paddles = new Map();
		this._accumulator = 0;

		this._matchId = match_id;
		this._gameMode = gamemode;
		this._players = players;
		this._state = state;

		this.defaultSetup();
	}

	private defaultSetup() { // temporary
		const ballShape: PH2D.CircleShape = new PH2D.CircleShape(ballSize);
		const ballBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.DYNAMIC, ballShape, bounceMaterial, Vec2.create(), Vec2.create());
		this._physicsScene.addBody(ballBody);
		this._balls.push(ballBody);

		const paddleShape: PH2D.PolygonShape = new PH2D.PolygonShape(paddleHalfSize[0], paddleHalfSize[1]);
		const paddleLeftBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.KINEMATIC, paddleShape, bounceMaterial, new Vec2(-5, 0), Vec2.create());
		const paddleRightBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.KINEMATIC, paddleShape, bounceMaterial, new Vec2(5, 0), Vec2.create());
		this._physicsScene.addBody(paddleLeftBody);
		this._physicsScene.addBody(paddleRightBody);
		this._paddles.set(0, paddleLeftBody);
		this._paddles.set(1, paddleRightBody);
		
		const wallShape: PH2D.PolygonShape = new PH2D.PolygonShape(5, 0.1);
		const wallTopBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, wallShape, bounceMaterial, new Vec2(0, -4), Vec2.create());
		const wallBottomBody: PH2D.Body = new PH2D.Body(PH2D.PhysicsType.STATIC, wallShape, bounceMaterial, new Vec2(0, 4), Vec2.create());
		this._physicsScene.addBody(wallTopBody);
		this._physicsScene.addBody(wallBottomBody);

		ballBody.addEventListener("collision", (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
			const { emitter, other, manifold } = event.detail;
			console.log("collision " + emitter.id + "-" + other.id);
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
		return this._accumulator / DT;
	}
}
