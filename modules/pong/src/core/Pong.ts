import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer, IMatchParameters, PongEventType } from 'yatt-lobbies'
import * as K from "./constants.js";
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import Wall from "./Wall.js";
import EventBox from "./EventBox.js";
import { ballCollision } from "./Behaviors.js";
import { MapSide, IPongMap, MapID, PlayerID, PongState, IPongState, PlayerMovement, IBall, IPongPlayer } from "./types.js";
import * as maps from "../maps/index.js";
import Stats from "./Stats.js";
import EventBoxManager from "./EventBoxManager.js";
import PongEvent from "./PongEvent.js";
import Obstacle from "./Obstacle.js";

export class Pong {
	private _accumulator: number;
	protected readonly _physicsScene: PH2D.Scene;
	protected _tick: number;

	protected _matchId: number;
	protected _gameMode: GameMode;
	protected _matchParameters: IMatchParameters;
	protected _players: IPongPlayer[] = [];
	protected _state: PongState;

	protected static _map: Map<MapID, IPongMap> = Pong.loadMaps();
	protected _currentMap: IPongMap;

	protected _balls: Ball[] = [];
	protected _paddles: Map<number, Paddle>;
	protected _goals: Map<number, Goal>;
	protected _eventBoxes: Map<number, EventBox>;
	protected _teamNames: string[] = [];
	protected _eventBoxManager: EventBoxManager;

	protected _stats: Stats;

	protected _activeEvents: PongEvent[];

	public constructor() {
		this._physicsScene = new PH2D.Scene(Vec2.create(), K.DT, K.substeps);
		this._paddles = new Map();
		this._goals = new Map();
		this._eventBoxes = new Map();
		this._balls = [];
		this._tick = 0;
		this._accumulator = 0;
		this._currentMap = undefined;
		this._state = PongState.RESERVED.clone();
		this._stats = undefined;
	}

	private static loadMaps(): Map<MapID, IPongMap> {
		const map = new Map<MapID, IPongMap>();
		map.set(MapID.SMALL, maps.small.createMap());
		map.set(MapID.BIG, maps.big.createMap());
		map.set(MapID.FAKE, maps.fake.createMap());
		return map;
	}

	protected switchMap(mapId: MapID) {
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
			this._paddles.set(PlayerID.LEFT_BACK, this._currentMap.paddleLeftBack);
		}
		if (this._currentMap.paddleRightBack) {
			this._physicsScene.addBody(this._currentMap.paddleRightBack);
			this._paddles.set(PlayerID.RIGHT_BACK, this._currentMap.paddleRightBack);
		}
		if (this._currentMap.paddleLeftFront) {
			this._physicsScene.addBody(this._currentMap.paddleLeftFront);
			this._paddles.set(PlayerID.LEFT_FRONT, this._currentMap.paddleLeftFront);
		}
		if (this._currentMap.paddleRightFront) {
			this._physicsScene.addBody(this._currentMap.paddleRightFront);
			this._paddles.set(PlayerID.RIGHT_FRONT, this._currentMap.paddleRightFront);
		}
		if (this._matchParameters.obstacles) {
			this._currentMap.obstacles.forEach((obstacle: Obstacle) => {
				this._physicsScene.addBody(obstacle);
			});
		}
		if (this._matchParameters.events) {
			this._currentMap.eventboxes.forEach((eventbox: EventBox) => {
				this._physicsScene.addBody(eventbox);
				this._eventBoxes.set(eventbox.id, eventbox);
			});
		}
	}

	public cleanUp() {
		this._tick = 0;
		this._accumulator = 0;
		this._teamNames = [];
		this._players = [];
		this._matchId = 0;
		this._state = PongState.RESERVED.clone();
		this._stats = undefined;
	}

	private setup() {
		if (this._gameMode.team_size === 2) {
			this.switchMap(MapID.BIG);
		} else if (this._gameMode.team_size === 1) {
			this.switchMap(MapID.SMALL);
		} else {
			this.switchMap(MapID.FAKE);
		}
		this.addBall(new Ball());
		this._stats = new Stats(this._gameMode.team_size, this._matchParameters.point_to_win);
		this._eventBoxManager = new EventBoxManager(this._currentMap.eventboxes, this._matchParameters.events, this, this._stats);
		this._activeEvents = [];
	}

	protected onlineSetup(match_id: number, gamemode: GameMode, players: IPlayer[], matchParameters: IMatchParameters, state: IPongState = PongState.RESERVED.clone()) {
		this.cleanUp();
		this._matchId = match_id;
		this._gameMode = gamemode;
		console.log("Game mode", this._gameMode);
		console.log({matchParameters});
		this._matchParameters = matchParameters;
		if (state instanceof PongState)
			this._state = state;
		else
			this._state = new PongState(state.name, state);

		this.setup();

		let playerId: number = 0;
		this._players = players.map((player: IPlayer, index: number) => {
			if (!this._paddles.has(playerId)) {
				playerId++;
			}
			return {
				...player,
				objectId: this._paddles.get(playerId).id,
				playerId: playerId++,
				movement: PlayerMovement.NONE,
				toJSON() {
					return {
						account_id: this.account_id,
						profile: this.profile,
						playerId: this.playerId,
						objectId: this.objectId,
						movement: this.movement,
					}
				}
			}
		});
	}

	protected localSetup() {
		this.cleanUp();

		this._gameMode = new GameMode("local", {
			type: null,
			team_size: 1,
			team_count: 2
		});
		this._matchParameters = {
			obstacles: true,
			events: [
				PongEventType.MULTIBALL,
				PongEventType.ATTRACTOR,
				PongEventType.ICE,
			],
			ball_speed: K.defaultBallSpeed,
			point_to_win: K.defaultPointsToWin,
		}
		this._matchId = -1;

		this.setup();
	}

	protected menuSetup() {
		this.cleanUp();

		this._gameMode = new GameMode("menu", {
			type: null,
			team_size: 0,
			team_count: 0,
		});
		this._matchParameters = {
			obstacles: true,
			events: [],
			ball_speed: K.defaultBallSpeed,
			point_to_win: K.defaultPointsToWin,
		}
		this._matchId = -1;

		this.setup();
	}

	protected start() {
		this._tick = 0;
		this._accumulator = 0;

		this.roundStart();
	}

	public roundStart() {
		for (let i = this._activeEvents.length - 1; i >= 0; i--) {
			const event: PongEvent = this._activeEvents[i];
			event.deactivate(this);
		}
		this.launchBall();
		for (const paddle of this._paddles.values()) {
			paddle.position.y = 0;
			paddle.previousPosition.y = 0;
			paddle.velocity = new Vec2(0, 0);
		}
	}

	public isServer(): boolean {
		return true;
	}

	protected physicsUpdate(dt: number): number {
		this._accumulator += dt;
		if (this._accumulator > 0.2) {
			this._accumulator = 0.2;
		}
		while (this._accumulator >= K.DT) {
			this._activeEvents.forEach((event: PongEvent) => {
				if (this.isServer() && event.shouldDeactivate(this)) {
					event.deactivate(this);
					return;
				}
				if (event.shouldUpdate(this))
					event.update(this);
			});
			this._currentMap.getObstacles().forEach((obstacle: Obstacle) => {
				obstacle.update();
			});
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
			if (goal.scored) {
				scored = true;
				goal.resetScore();
			}
		});
		return scored;
	}

	protected launchBall() {
		this._balls.forEach((ball: Ball) => {
			ball.position[0] = 0;
			ball.position[1] = 0;
			ball.previousPosition[0] = 0;
			ball.previousPosition[1] = 0;
			let dir: number;
			if (this._stats.lastSideToScore === undefined) {
				dir = Math.floor(Math.random() * 2); // 0 = left, 1 = right
			} else {
				dir = this._stats.lastSideToScore === MapSide.LEFT ? 1 : 0; // losing side gets the ball
			}
			const angle: number = (Math.random() - 0.5) * 2 * K.launchAngle; // random angle between -20 and 20 degrees
			const x: number = dir === 0 ? -1 : 1; // horizontal component of the ball's velocity
			const y: number = Math.sin(angle); // vertical component of the ball's velocity
			const ballVelocity: Vec2 = new Vec2(x, y);
			ball.speed = K.defaultBallSpeed;
			ball.setDirection(ballVelocity);
		});
	}

	protected ballSync(balls: Array<IBall>, tickDiff: number, dt: number) {
		if (balls.length < 1) {
			return;
		}
		for (let i = 0; i < this._balls.length; i++) {
			if (i >= balls.length) {
				break;
			}
			this._balls[i].sync(balls[i], tickDiff, dt);
		}
		for (let i = this._balls.length; i < balls.length; i++) {
			const ball = new Ball();
			ball.sync(balls[i], tickDiff, dt);
			this.addBall(ball);
		}
		for (let i = this._balls.length - 1; i >= balls.length; i--) {
			this.removeBall(this._balls[i]);
		}
	}

	public getPlayerIdFromBodyId(bodyId: number): PlayerID | undefined {
		for (const [playerId, paddle] of this._paddles.entries()) {
			if (paddle.id === bodyId) {
				return playerId;
			}
		}
		return undefined;
	}

	public addBall(ball: Ball): void {
		this._physicsScene.addBody(ball);
		this._balls.push(ball);
		ball.addEventListener("collision", ballCollision.bind(this));
	}

	public removeBall(ball: Ball): void {
		this._physicsScene.removeBody(ball);
		this._balls.splice(this._balls.indexOf(ball), 1);
	}

	public get activeEvents(): PongEvent[] {
		return this._activeEvents;
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

	public get paddles(): Map<number, Paddle> {
		return this._paddles;
	}

	public get lastSideToScore(): MapSide {
		return this._stats.lastSideToScore;
	}

	public set lastSideToScore(side: MapSide) {
		this._stats.lastSideToScore = side;
	}

	public get balls(): Ball[] {
		return this._balls;
	}

	public get goals(): Map<number, Goal> {
		return this._goals;
	}
}


