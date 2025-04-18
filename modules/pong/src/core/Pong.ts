import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import * as K from "./constants.js";
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import Wall from "./Wall.js";
import { ballCollision } from "./Behaviors.js";
import { MapSide, IPongMap, MapID } from "./types.js";
import * as maps from "../maps/index.js";

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

	protected _time: number;
	protected _score: number[];
	protected _lastSide: MapSide;

	protected _map: Map<MapID, IPongMap>;
	protected _currentMap: IPongMap;
	protected _currentMapID: MapID;

	public constructor() {
		this._physicsScene = new PH2D.Scene(Vec2.create(), K.DT, K.substeps);
		this._map = new Map();
		this.createMaps();
		this.createCommonObjects();
		this._accumulator = 0;
		this._currentMapID = undefined;
		this._currentMap = undefined;

		this.switchMap(MapID.FAKE);
	}
	
	public toJSON() {
		return {
			players: this._players,
			match_id: this._matchId,
			gamemode: this._gameMode
		};
	}
	
	private createMaps() {
		this.createFakeMap();
		this.createSmallMap();
		this.createBigMap();
	}

	private createFakeMap() {
		const wallBottom: Wall = new Wall(maps.fake.wallShape, maps.fake.wallBottomPosition);
		const wallTop: Wall = new Wall(maps.fake.wallShape, maps.fake.wallTopPosition);
		this._physicsScene.addBody(wallTop);
		this._physicsScene.addBody(wallBottom);

		const map: IPongMap = {
			mapId: MapID.FAKE,
			wallTop: wallTop,
			wallBottom: wallBottom,
			goalLeft: null,
			goalRight: null,
			paddleLeftBack: null,
			paddleLeftFront: null,
			paddleRightBack: null,
			paddleRightFront: null,
			obstacles: []
		};
		this._map.set(MapID.FAKE, map);
	}

	private createSmallMap() {
		// Walls
		const wallBottom: Wall = new Wall(maps.small.wallShape, maps.small.wallBottomPosition);
		const wallTop: Wall = new Wall(maps.small.wallShape, maps.small.wallTopPosition);
		
		// Goals
		const goalLeft: Goal = new Goal(maps.small.goalShape, maps.small.goalLeftPosition);
		const goalRight: Goal = new Goal(maps.small.goalShape, maps.small.goalRightPosition);
		
		// Paddles
		const paddleLeft: Paddle = new Paddle(maps.small.paddleLeftPosition, Vec2.create(), K.paddleSpeed);
		const paddleRight: Paddle = new Paddle(maps.small.paddleRightPosition, Vec2.create(), K.paddleSpeed);
	
		const map: IPongMap = {
			mapId: MapID.SMALL,
			wallTop: wallTop,
			wallBottom: wallBottom,
			goalLeft: goalLeft,
			goalRight: goalRight,
			paddleLeftBack: paddleLeft,
			paddleLeftFront: undefined,
			paddleRightBack: paddleRight,
			paddleRightFront: undefined,
			obstacles: []
		};
		this._map.set(MapID.SMALL, map);
	}

	private createBigMap() {
		// Walls
		const wallBottom: Wall = new Wall(maps.big.wallShape, maps.big.wallBottomPosition);
		const wallTop: Wall = new Wall(maps.big.wallShape, maps.big.wallTopPosition);

		// Goals
		const goalLeft: Goal = new Goal(maps.big.goalShape, maps.big.goalLeftPosition);
		const goalRight: Goal = new Goal(maps.big.goalShape, maps.big.goalRightPosition);

		// Paddles
		const paddleLeftBack: Paddle = new Paddle(maps.big.paddleLeftBackPosition, Vec2.create(), K.paddleSpeed);
		const paddleLeftFront: Paddle = new Paddle(maps.big.paddleLeftFrontPosition, Vec2.create(), K.paddleSpeed);
		const paddleRightBack: Paddle = new Paddle(maps.big.paddleRightBackPosition, Vec2.create(), K.paddleSpeed);
		const paddleRightFront: Paddle = new Paddle(maps.big.paddleRightFrontPosition, Vec2.create(), K.paddleSpeed);

		const map: IPongMap = {
			mapId: MapID.BIG,
			wallTop: wallTop,
			wallBottom: wallBottom,
			goalLeft: goalLeft,
			goalRight: goalRight,
			paddleLeftBack: paddleLeftBack,
			paddleLeftFront: paddleLeftFront,
			paddleRightBack: paddleRightBack,
			paddleRightFront: paddleRightFront,
			obstacles: []
		};
		this._map.set(MapID.BIG, map);
	}

	private createCommonObjects() {
		const ball: Ball = new Ball(Vec2.create(), Vec2.create(), K.defaultBallSpeed);
		this._balls.push(ball);
		ball.addEventListener("collision", ballCollision.bind(this));
	}

	protected switchMap(mapId: MapID) {
		if (!this._currentMapID || this._currentMapID !== mapId) {
			this._currentMap = this._map.get(mapId);
			this._currentMapID = mapId;
			this._physicsScene.clear();
			this._physicsScene.addBody(this._currentMap.wallTop);
			this._physicsScene.addBody(this._currentMap.wallBottom);
			if (mapId === MapID.FAKE) {
				return;
			}
			this._physicsScene.addBody(this._currentMap.goalLeft);
			this._physicsScene.addBody(this._currentMap.goalRight);
			this._physicsScene.addBody(this._currentMap.paddleLeftBack);
			this._physicsScene.addBody(this._currentMap.paddleRightBack);
			if (mapId === MapID.BIG) {
				this._physicsScene.addBody(this._currentMap.paddleLeftFront);
				this._physicsScene.addBody(this._currentMap.paddleRightFront);
			}
			this._currentMap.obstacles.forEach((obstacle: Wall) => {
				this._physicsScene.addBody(obstacle);
			});
		}
	}
	
	protected onlineSetup(match_id: number, gamemode: GameMode, players: IPlayer[], state: PongState = PongState.RESERVED) {
		this._accumulator = 0;
		this._time = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this._matchId = match_id;
		this._gameMode = gamemode;
		this._players = players;
		this._state = state;

		// do things based on gamemode (not implemented yet)
		this.switchMap(MapID.SMALL);
	}

	protected localSetup() {
		this._accumulator = 0;
		this._time = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this._matchId = 0;
		this._gameMode = undefined;
		this._players = [];
		this._state = PongState.RESERVED;

		this.switchMap(MapID.SMALL);
	}

	protected menuSetup() {
		this._accumulator = 0;
		this._time = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this.switchMap(MapID.FAKE);
	}

	protected lobbySetup() {
		this._accumulator = 0;
		this._time = 0;
		this._score = [0, 0];
		this._lastSide = undefined;

		this.switchMap(MapID.FAKE);
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
