import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import * as K from "./constants.js";
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import Wall from "./Wall.js";
import { ballCollision } from "./Behaviors.js";
import { MapSide, IPongMap, MapID, PaddleID, PongState, IPongState, PlayerMovement, IBall } from "./types.js";
import * as maps from "../maps/index.js";

export type IPongPlayer = IPlayer & {
	paddleId: PaddleID;
	movement: PlayerMovement;
}

export class Pong {
	private readonly _physicsScene: PH2D.Scene;
	private _accumulator: number;
	protected _tick: number;

	protected _matchId: number;
	protected _gameMode: GameMode;
	protected _players: IPongPlayer[] = [];
	protected _state: PongState;

	protected static _map: Map<MapID, IPongMap> = Pong.loadMaps();
	protected _currentMap: IPongMap;

	protected _balls: Ball[] = [];
	protected _paddles: Map<number, PH2D.Body>;
	protected _goals: Map<number, Goal>;
	protected _teamNames: string[] = [];

	protected _score: number[];
	protected _lastSide: MapSide;
	protected _winner: MapSide;

	public constructor() {
		this._physicsScene = new PH2D.Scene(Vec2.create(), K.DT, K.substeps);
		this._paddles = new Map();
		this._goals = new Map();
		this._balls = [];
		this._tick = 0;
		this._accumulator = 0;
		this._currentMap = undefined;
		this._state = PongState.RESERVED.clone();
	}

	private static loadMaps(): Map<MapID, IPongMap> {
		const map = new Map<MapID, IPongMap>();
		map.set(MapID.SMALL, maps.small.createMap());
		map.set(MapID.BIG, maps.big.createMap());
		map.set(MapID.FAKE, maps.fake.createMap());
		return map;
	}

	protected switchMap(mapId: MapID) {
		if (!this._currentMap || this._currentMap.mapId !== mapId) {

			this._currentMap = Pong._map?.get(mapId).clone();
			if (!this._currentMap) {
				throw new Error("Map not found");
			}
			this._physicsScene.clear();
			this._paddles.clear();
			this._goals.clear();
			this._balls = [];
			this._physicsScene.addBody(this._currentMap.wallTop);
			this._physicsScene.addBody(this._currentMap.wallBottom);
			if (this._currentMap.goalLeft) {
				this._physicsScene.addBody(this._currentMap.goalLeft);
				this._goals.set(MapSide.LEFT, this._currentMap.goalLeft);
			}
			if (this._currentMap.goalRight) {
				this._physicsScene.addBody(this._currentMap.goalRight);
				this._goals.set(MapSide.RIGHT, this._currentMap.goalRight);
			}
			if (this._currentMap.paddleLeftBack) {
				this._physicsScene.addBody(this._currentMap.paddleLeftBack);
				this._paddles.set(PaddleID.LEFT_BACK, this._currentMap.paddleLeftBack);
			}
			if (this._currentMap.paddleRightBack) {
				this._physicsScene.addBody(this._currentMap.paddleRightBack);
				this._paddles.set(PaddleID.RIGHT_BACK, this._currentMap.paddleRightBack);
			}
			if (this._currentMap.paddleLeftFront) {
				this._physicsScene.addBody(this._currentMap.paddleLeftFront);
				this._paddles.set(PaddleID.LEFT_FRONT, this._currentMap.paddleLeftFront);
			}
			if (this._currentMap.paddleRightFront) {
				this._physicsScene.addBody(this._currentMap.paddleRightFront);
				this._paddles.set(PaddleID.RIGHT_FRONT, this._currentMap.paddleRightFront);
			}
			this._currentMap.obstacles.forEach((obstacle: Wall) => {
				this._physicsScene.addBody(obstacle);
			});
		}
	}

	protected onlineSetup(match_id: number, gamemode: GameMode, players: IPlayer[], state: IPongState = PongState.RESERVED.clone()) {
		this._tick = 0;
		this._accumulator = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this._matchId = match_id;
		this._gameMode = gamemode;
		if (state instanceof PongState)
			this._state = state;
		else
			this._state = new PongState(state.name, state);

		// do things based on gamemode (not implemented yet)
		if (gamemode.team_size === 2)
			this.switchMap(MapID.BIG);
		else
			this.switchMap(MapID.SMALL);
		let paddleId: number = 0;
		this._players = players.map((player: IPlayer, index: number) => {
			if (!this._paddles.has(paddleId)) {
				paddleId++;
			}
			return {
				...player,
				paddleId: paddleId++,
				movement: PlayerMovement.NONE,
				toJSON() {
					return {
						account_id: this.account_id,
						profile: this.profile,
						paddleId: this.paddleId,
						movement: this.movement,
					}
				}
			}
		});

		this._balls.push(new Ball());
		this._physicsScene.addBody(this._balls[0]);
		this._balls[0].addEventListener("collision", ballCollision.bind(this));
	}

	protected localSetup() {
		this._tick = 0;
		this._accumulator = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this._matchId = 0;
		this._gameMode = undefined;
		this._players = [];

		this.switchMap(MapID.SMALL);

		this._balls.push(new Ball());
		this._physicsScene.addBody(this._balls[0]);
		this._balls[0].addEventListener("collision", ballCollision.bind(this));
	}

	protected menuSetup() {
		this._tick = 0;
		this._accumulator = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this.switchMap(MapID.FAKE);

		this._balls.push(new Ball());
		this._physicsScene.addBody(this._balls[0]);
		this._balls[0].addEventListener("collision", ballCollision.bind(this));
	}

	protected lobbySetup() {
		this._tick = 0;
		this._accumulator = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this.switchMap(MapID.FAKE);

		this._balls.push(new Ball());
		this._physicsScene.addBody(this._balls[0]);
		this._balls[0].addEventListener("collision", ballCollision.bind(this));
	}

	protected start() {
		this._tick = 0;
		this._accumulator = 0;
		this._score = [0, 0];
		this._lastSide = undefined;
		this._winner = undefined;

		this.roundStart();
	}

	public roundStart() {
		this.launchBall();
		for (const paddle of this._paddles.values()) {
			paddle.position.y = 0;
			paddle.previousPosition.y = 0;
			paddle.velocity = new Vec2(0, 0);
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
			this._tick++;
		}
		this._paddles.forEach((paddle: PH2D.Body) => { // block paddle movement within walls
			const border: number = this._currentMap.wallTop.position.y - this._currentMap.wallTop.height / 2;
			if (paddle.position[1] > (border - K.paddleSize[1] / 2)) {
				paddle.position[1] = (border - K.paddleSize[1] / 2);
			} else if (paddle.position[1] < (-border + K.paddleSize[1] / 2)) {
				paddle.position[1] = (-border + K.paddleSize[1] / 2);
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
		if (this._score[0] >= K.defaultPointsToWin) {
			this._winner = MapSide.LEFT;
		} else if (this._score[1] >= K.defaultPointsToWin) {
			this._winner = MapSide.RIGHT;
		}
		return scored;
	}

	private launchBall() {
		this._balls[0].position[0] = 0;
		this._balls[0].position[1] = 0;
		this._balls[0].previousPosition[0] = 0;
		this._balls[0].previousPosition[1] = 0;
		const dir: number = Math.floor(Math.random() * 2); // 0 = left, 1 = right
		const angle: number = Math.random() * 20 * Math.PI / 180; // random angle between -20 and 20 degrees
		const x: number = dir === 0 ? -1 : 1; // horizontal component of the ball's velocity
		const y: number = Math.sin(angle); // vertical component of the ball's velocity
		const ballVelocity: Vec2 = new Vec2(x, y);
		this._balls[0].speed = K.defaultBallSpeed;
		this._balls[0].setDirection(ballVelocity);
	}

	protected ballSync(balls: Array<IBall>) {
		if (balls.length < 1) {
			return;
		}
		for (let i = 0; i < this._balls.length; i++) {
			if (i >= balls.length) {
				break;
			}
			this._balls[i].sync(balls[i]);
		}
		for (let i = this._balls.length; i < balls.length; i++) {
			this._balls.push(new Ball());
			this._physicsScene.addBody(this._balls[i]);
			this._balls[i].addEventListener("collision", ballCollision.bind(this));
		}
		for (let i = this._balls.length - 1; i >= balls.length; i--) {
			this._physicsScene.removeBody(this._balls[i]);
			this._balls.splice(i, 1);
		}
	}

	public get cumulator(): number {
		return this._accumulator;
	}

	public get tick(): number {
		return this._tick;
	}

	public get players(): IPongPlayer[] {
		return this._players;
	}

	public get paddles(): Map<number, PH2D.Body> {
		return this._paddles;
	}
}


