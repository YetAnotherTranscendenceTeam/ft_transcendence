
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, WebGPUEngine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, StandardMaterial } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { GameMode, GameModeType, IGameMode, IPlayer, IMatchParameters, PongEventType } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientGoal, ClientEventBox, ClientObstacle } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { KeyState, GameScene, KeyName, ScoredEvent, IServerStep, PaddleSync, PaddleSyncs, GraphicsQuality } from "./types";
import * as PONG from "pong";
import AObject from "./Objects/AObject";
import config from "../../config";
import Keyboard from "./Keyboard";
import DirectionalLightHelper from "./DirectionalLightHelper";
import PongScene from "./PongScene";

let temporary_falg: boolean = true;

export interface IPongOverlay {
	scores: number[],
	teams: {
		players: PONG.IPongPlayer[],
		name: string,
	}[],
	localPlayer: PONG.IPongPlayer,
	time: number,
	countDown: number,
	lastWinner: number,
	gameStatus: PONG.PongState,
	local: boolean,
	gamemode: GameMode,
	pointsToWin: number,
	spectatorCount: number,
	activeEvents: {
		type: PongEventType,
		time: number,
		isGlobal: boolean,
		team: PONG.MapSide,
		scope: PONG.PongEventScope,
		duration: number,
	}[],
	goals: {
		[key: number]: {
			health: number
		}
	}
}

export default class PongClient extends PONG.Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket?: WebSocket;
	private _engine: Engine;
	private _keyboard: Keyboard;
	private _gameScene: GameScene;
	private _babylonScene: PongScene;

	private _ballSteps: Array<IServerStep>;
	private _paddleSteps: Array<PaddleSyncs>;


	private _time: number;

	private _player: PONG.IPongPlayer;

	private _spectatorCount: number;

	// public scoreUpdateCallback: (score: ScoredEvent) => void;
	public callbacks: {
		onConnectionError?: (this: WebSocket, error: CloseEvent) => void,
		updateOverlay: (params: IPongOverlay) => void,
		loadingComplete: () => void,
	};

	public constructor(callbacks: {
		onConnectionError?: (this: WebSocket, error: CloseEvent) => void,
		updateOverlay: (params: IPongOverlay) => void,
		loadingComplete: () => void,
	}) {
		super();
		this._spectatorCount = null;
		this.callbacks = callbacks;
		this._time = 0;
		this._keyboard = new Keyboard();

		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

		// Hardware check
		let quality: GraphicsQuality = GraphicsQuality.LOW;
		const gl = this._canvas.getContext("webgl2");
		if (gl) {
			const info = gl.getExtension("WEBGL_debug_renderer_info");
			if (info) {
				const vendor = gl.getParameter(info.UNMASKED_VENDOR_WEBGL);
				const renderer = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
				if (vendor.includes("NVIDIA") || vendor.includes("AMD")) {
					quality = GraphicsQuality.HIGH;
				} else if (vendor.includes("Intel")) {
					quality = GraphicsQuality.MEDIUM;
				}
			}
		}
		// quality = GraphicsQuality.LOW; // DEBUG

		this._engine = new Engine(this._canvas, true);
		// this._engine = new BABYLON.WebGPUEngine(this._canvas);
		// this._engine.initAsync();

		this._babylonScene = new PongScene(this._canvas, this._engine, this, quality);
		
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("resize", this.resize);
		
		this._ballSteps = [];
		this._paddleSteps = [];
		this._engine.runRenderLoop(this.loop);

		this._state = PONG.PongState.RESERVED.clone();

		this.setGameScene(GameScene.PRELOAD);
		this._babylonScene.scene.render();
		this._babylonScene.scene.onAfterRenderObservable.addOnce(() => {
			this.callbacks.loadingComplete();
		});
	}

	private updateOverlay() {
		this.callbacks.updateOverlay(this.generateOverlay());
	}

	private generateOverlay(): IPongOverlay {
		const teams = this._teamNames.map((team: string, team_index: number) => {
			let players = this._players.filter((player: PONG.IPongPlayer, player_index: number) => Math.floor(player_index / this._gameMode.team_size) === team_index);
			if (team_index === 1)
				players.reverse();
			return {
				name: team,
				players,
			}
		});
		return {
			gamemode: this._gameMode,
			local: this._gameScene !== GameScene.ONLINE,
			scores: this._stats ? this._stats.score : [0, 0],
			teams,
			localPlayer: this._player,
			time: this._tick * PONG.K.DT,
			countDown: this._state.frozen_until,
			lastWinner: (this._state.name === "FREEZE" && this._stats) ? this._stats.lastSideToScore : null,
			gameStatus: this._state,
			pointsToWin: this._matchParameters.point_to_win,
			activeEvents: this._activeEvents?.map((event: PONG.PongEvent) => {
				return {
					type: event.type,
					time: event.time,
					isGlobal: event.isGlobal(),
					team: (event.playerId < 2 ? PONG.MapSide.LEFT : PONG.MapSide.RIGHT),
					scope: event.scope,
					duration: event.duration
				}
			}) ?? [],
			goals: {
				[PONG.MapSide.LEFT]: {
					health: this._goals.get(PONG.MapSide.LEFT)?.health ?? 0,
				},
				[PONG.MapSide.RIGHT]: {
					health: this._goals.get(PONG.MapSide.RIGHT)?.health ?? 0,
				}
			},
			spectatorCount: this._spectatorCount,
		};
	}

	public setGameScene(scene: GameScene) {
		if (this._gameScene === scene) {
			return;
		}
		this._babylonScene.removeAllBalls();
		this._babylonScene.paddleInstance = new Map<number, ClientPaddle>();
		// disable active map
		this._babylonScene.disableMap(this._currentMap?.mapId);
	
		this._gameScene = scene;
		if (this._gameScene === GameScene.MENU) {
			this.menuScene();
		} else if (this._gameScene === GameScene.LOCAL) {
			this.localScene();
		} else if (this._gameScene === GameScene.PRELOAD) {
			this.preloadScene();
		}
		if (this._gameScene !== GameScene.ONLINE && this._websocket) {
			this._websocket.onclose = undefined;
			this._websocket.close();
			this._websocket = undefined;
		}
	}

	public startGame() {
		this._state = PONG.PongState.FREEZE.clone();
		this.start();
		this._time = 0;
	}

	public restartGame() {
		this._state = PONG.PongState.FREEZE.clone();
		this._stats = new PONG.Stats(0, PONG.K.defaultPointsToWin);
		this.start();
		this._time = 0;
	}

	public connect(match_id: number, spectate: boolean = false) {
		if (this._websocket) {
			this._websocket.onclose = undefined;
			this._websocket.close();
		}
		
		let service = "pong";
		if (spectate) {
			service = "spectator";
			this._spectatorCount = 0;
		}
		
		const uri = `${config.WS_URL}/${service}/join?match_id=${match_id}&access_token=${localStorage.getItem("access_token")}`;
		this._websocket = new WebSocket(uri);
		
		this._websocket.onmessage = (ev) => { // step, state, sync
			const msg = JSON.parse(ev.data);
			if (msg.event === "step") {
				// this.counter = msg.data.counter;
				const serverStep = msg.data as IServerStep;
				if (this._state.isFrozen())  {
					this.ballSync(serverStep.balls, this._tick - serverStep.tick, 0);
					this._tick = serverStep.tick;
					this.paddleSync(serverStep.paddles);
					return ;
				}
				this._ballSteps.push(serverStep);
				this._paddleSteps.push(serverStep.paddles);
				this.goalsSync(serverStep.goals);
				this.eventBoxSync(msg.data.event_boxes as PONG.IEventBoxSync[]);
				this.eventSync(msg.data.activeEvents as PONG.IEventSync[]);
			}
			else if (msg.event === "sync") {
				this._tick = msg.data.tick;
				this.setGameScene(GameScene.ONLINE);
				this.onlineScene(msg.data.match.match_id as number, 
					new GameMode(msg.data.match.gamemode as IGameMode),
					msg.data.match.players as IPlayer[],
					msg.data.match.matchParameters as IMatchParameters,
					PONG.PongState[msg.data.match.state.name].clone()
				);
				this._teamNames = msg.data.match.team_names as string[];
				this._stats.score = msg.data.match.score as number[];
				this._tick = msg.data.match.tick as number;
				this._stats.lastSideToScore = msg.data.match.lastSide as number;
				this.ballSync(msg.data.match.balls as PONG.IBall[], 0, 0);
				if (msg.data.player) {
					this._player = this._players.find((player: PONG.IPongPlayer) => player.account_id === msg.data.player.account_id) as PONG.IPongPlayer;
				}
				this._babylonScene.switchCamera();
				this.goalsSync(msg.data.match.goals);
				this.eventBoxSync(msg.data.match.event_boxes as PONG.IEventBoxSync[]);
				this.eventSync(msg.data.match.activeEvents as PONG.IEventSync[]);
				this.updateOverlay();
			}
			else if (msg.event === "state") {
				const state = PONG.PongState[msg.data.state.name].clone();
				const oldState = this._state;
				this._state = state;
				Object.assign(this._state, msg.data.state);
				if (msg.data.state.score && msg.data.state.score.length > 0) {
					this._stats.score = msg.data.state.score;
					this._stats.lastSideToScore = msg.data.state.side;
				}
				this._ballSteps = [];
				for (let i = 0; i < this._balls.length; i++) {
					this._balls[i].previousPosition = Vec2.clone(this._balls[i].position);
				}
				if (this._state.name !== oldState.name
					|| (this._state.frozen_until !== oldState.frozen_until
						&& Math.floor(this._state.frozen_until) !== Math.floor(oldState.frozen_until)
					)
				) {
					this.updateOverlay();
				}
			}
			else if (msg.event === "spectator_count") {
				this._spectatorCount = msg.data.count;
				this.updateOverlay();
			}
		}
		this._websocket.onopen = (ev) => {
		}
		this._websocket.onclose = this.callbacks.onConnectionError;
	}

	public nextRound() {
		this.setState(PONG.PongState.FREEZE.clone());
	}

	public pauseGame() {
		this._state = PONG.PongState.PAUSED.clone();
		this.updateOverlay();
	}

	public resumeGame() {
		this.setState(PONG.PongState.FREEZE.clone());
	}

	public cleanUp(): void {
		super.cleanUp();
		this._babylonScene.removeAllBalls();
		this._spectatorCount = null;
	}
	
	protected switchMap(mapId: PONG.MapID) {
		super.switchMap(mapId);
		const objects: PH2D.Body[] = this._currentMap.getObjects();
		this._babylonScene.meshMap.get(this._currentMap.mapId)?.objects.forEach((object: AObject, index: number) => {
			object.updateBodyReference(objects[index]);
			object.enable();
			if (object instanceof ClientEventBox) {
				object.disable();
			}
			if (object instanceof ClientObstacle && !this._matchParameters.obstacles) {
				object.disable();
			}
		});
		// this._babylonScene.shadowGenerator.getShadowMap().resetRefreshCounter();
	}

	private preloadScene() {
		this.preloadSetup();

		this._babylonScene.enableMap(this._currentMap.mapId);

		this._player = undefined;
		this.bindPaddles();
		this._babylonScene.updateMeshes(0);
		this._babylonScene.switchCamera();
	}

	private menuScene() {
		this.menuSetup();
		
		this._babylonScene.enableMap(this._currentMap.mapId);
		
		this._player = undefined;
		this._babylonScene.updateMeshes(0);
		this._babylonScene.switchCamera();
		this.launchBall();
	}
	
	private localScene() {
		this.localSetup();

		this._babylonScene.enableMap(this._currentMap.mapId);

		this._player = undefined;
		this.bindPaddles();
		this._babylonScene.updateMeshes(0);
		this._babylonScene.switchCamera();
		this.updateOverlay();
	}
	
	private onlineScene(match_id: number, gamemode: GameMode, players: IPlayer[], matchParameters: IMatchParameters, state?: PONG.PongState) {
		this.onlineSetup(match_id, gamemode, players, matchParameters, state);

		this._babylonScene.enableMap(this._currentMap.mapId);
	
		this.bindPaddles();
		this._babylonScene.updateMeshes(0);
	}
	
	private bindPaddles() {
		this._paddles.forEach((paddle: PH2D.Body, playerId: number) => {
			const paddleInstance: ClientPaddle | undefined = this._babylonScene.meshMap.get(this._currentMap.mapId)?.objects.find((object: AObject) => {
				if (object instanceof ClientPaddle) {
					return object.physicsBody === paddle;
				}
				return false;
			}
			) as ClientPaddle;
			if (paddleInstance) {
				this._babylonScene.paddleInstance.set(playerId, paddleInstance);
				paddleInstance.update(1, 1);
			}
		});
	}

	private loop = () => {
		let dt: number = this._engine.getDeltaTime() / 1000;
		this._keyboard.update();
		this._babylonScene.updateCamera(dt);
		if (this._gameScene) {
			if (this._gameScene === GameScene.ONLINE) {
				this.updateOnline(dt);
			} else if (this._gameScene === GameScene.LOCAL) {
				this.updateLocal(dt);
			} else {
				let dt: number = this._engine.getDeltaTime() / 1000;
				const interpolation = this.physicsUpdate(dt);
				this._babylonScene.updateMeshes(dt, interpolation, interpolation);
			}
		}
		this._babylonScene.render();
	}

	private resize = () => {
		this._engine.resize();
	}

	setState(state: PONG.PongState) {
		if (this._state.endCallback) {
			this._state.endCallback(this, state);
		}
		this._state = state;
		if (!this._state.isFrozen())
			this.updateOverlay();
	}

	private updateLocal(dt: number) {
		// let dt: number = this._engine.getDeltaTime() / 1000;
		const oldFreeze = this._state.frozen_until;
		if (this._state.tick(dt, this)) {
			if (this._state.frozen_until != -1 && Math.floor(this._state.frozen_until) !== Math.floor(oldFreeze))
				this.updateOverlay();
			return;
		}

		if (this._state.getNext()) {
			const next = this._state.getNext().clone();
			this.setState(next);
			if (this._state.tick(0, this)) {
				return;
			}
		}

		this._time += dt;
		const oldTick = this._tick;
		this.playerUpdateLocal();
		const interpolation = this.physicsUpdate(dt);
		this._babylonScene.updateMeshes(dt, interpolation, interpolation);
		if (this.scoreUpdate()) {
			if (this._stats.winner !== undefined) {
				this.setState(PONG.PongState.ENDED.clone());
				this.updateOverlay();
			} else {
				this.setState(PONG.PongState.FREEZE.clone());
			}
			return ;
		}
		if (this._tick % PONG.K.TICK_PER_SECOND === 0 && this._tick !== oldTick) {
			this.updateOverlay();
		}
	}

	private updateOnline(dt: number) {
		// let dt: number = this._engine.getDeltaTime() / 1000;
		let ball_interp = dt / PONG.K.DT;
		let interpolation = 1;

		if (!this._state.isFrozen()) {
			const oldTick = this._tick;
			this.playerUpdateOnline();
			interpolation = this.physicsUpdate(dt);
			for (let i = 0; i < this._balls.length; i++) {
				this._balls[i].previousPosition = this._balls[i].interpolatePosition(ball_interp);
			}
			let lastStep: IServerStep | undefined;
			while (this._ballSteps.length > 0
				&& this._tick > oldTick
				&& this._ballSteps[0].tick <= this._tick) {
				const step = this._ballSteps.at(0);
				this.serverStep(step, interpolation, step.collisions > 0);
				this._ballSteps = this._ballSteps.slice(1);
				lastStep = step;
			}
			if (this._ballSteps.length > 3)
				this._tick = this._ballSteps.at(-1).tick;
			else
				this._tick = lastStep ? lastStep.tick : this._tick; 
			for (let paddleStep of this._paddleSteps) {
				this.paddleSync(paddleStep);
			}
			this._paddleSteps = [];
			if (this._tick % PONG.K.TICK_PER_SECOND === 0 && this._tick !== oldTick) {
				this.updateOverlay();
			}
		}
		else {
			interpolation = 1;
			ball_interp = 1;
		}

		this._babylonScene.updateMeshes(dt, ball_interp, interpolation);
	}

	private serverStep(data: IServerStep, dt: number, forced: boolean = false) {
		this.ballSync(data.balls, this._tick - data.tick, dt);
	}

	private paddleSync(paddles: PaddleSyncs) {
		for (let paddlesync of Object.values(paddles)) {
			const paddle = this._babylonScene.paddleInstance.get(paddlesync.id);
			paddle.sync(paddlesync);
		}
	}

	private eventBoxSync(eventBoxes: PONG.IEventBoxSync[]) {
		for (let i = 0; i < eventBoxes.length; i++) {
			const eventBoxSync = eventBoxes[i];
			const eventBox = this._currentMap.eventboxes[i];
			eventBox.sync(eventBoxSync);
		}
	}

	private goalsSync(goals: PONG.IGoalSyncs) {
		this._goals.forEach((goal: PONG.Goal, side: PONG.MapSide) => {
			const goalSync = goals[side];
			if (goalSync) {
				goal.sync(goalSync);
			}
		}
		);
	}

	private eventSync(eventSyncs: PONG.IEventSync[]) {
		for (let i = this._activeEvents.length - 1; i >= 0; i--) {
			const event = this._activeEvents[i];
			if (!eventSyncs.some((eventSync: PONG.IEventSync) => eventSync.id === event.id)) {
				if (event.activationSide === PONG.PongEventActivationSide.BOTH) {
					event.deactivate(this);
				}
				else
					this._activeEvents.splice(i, 1);
				this.updateOverlay();
			}
		}
		for (let i = 0; i < eventSyncs.length; i++) {
			const eventSync = eventSyncs[i];
			let event = this._activeEvents.find((event: PONG.PongEvent) => event.id === eventSync.id);
			if (!event) {
				event = PONG.EventBox.pongEvents[eventSync.type].clone();
				if (event.activationSide === PONG.PongEventActivationSide.BOTH)
					event.activate(this, eventSync.playerId);
				else
					this._activeEvents.push(event);
				event.sync(eventSync);
				this.updateOverlay();
			}
			else
				event.sync(eventSync);
		}
	}

	public addBall(ball: PONG.Ball) {
		if (this._gameScene !== GameScene.ONLINE) {
			this._physicsScene.addBody(ball);
			ball.addEventListener("collision", PONG.ballCollision.bind(this));
		}
		this._balls.push(ball);
		this._babylonScene.addBall(ball);
	}

	public removeBall(ball: PONG.Ball) {
		super.removeBall(ball);
		this._babylonScene.removeBall(ball);
	}

	private playerUpdateLocal() {
		let paddle: ClientPaddle | undefined = this._babylonScene.paddleInstance.get(PONG.PlayerID.RIGHT_BACK);
		if (paddle) {
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.ArrowUp)) {
				moveDirection += 1;
			}
			if (this._keyboard.isDown(KeyName.ArrowDown)) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}

		paddle = this._babylonScene.paddleInstance.get(PONG.PlayerID.LEFT_BACK);
		if (paddle) {
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.W)) {
				moveDirection += 1;
			}
			if (this._keyboard.isDown(KeyName.S)) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}
	}

	private playerUpdateOnline() {
		const paddle: ClientPaddle | undefined = this._babylonScene.paddleInstance.get(this._player?.playerId);
		if (paddle) {
			const side: number = this._player.playerId < 2 ? PONG.MapSide.LEFT : PONG.MapSide.RIGHT;
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.ArrowLeft) ||
				this._keyboard.isDown(KeyName.A)) {
				moveDirection += side === PONG.MapSide.LEFT ? 1 : -1;
			}
			if (this._keyboard.isDown(KeyName.ArrowRight) ||
				this._keyboard.isDown(KeyName.D)) {
				moveDirection += side === PONG.MapSide.LEFT ? -1 : 1;
			}
			paddle.move(moveDirection);
			if (moveDirection !== this._player.movement) {
				this._websocket.send(JSON.stringify({
					event: "movement",
					data: {
						tick: this._tick,
						movement: moveDirection,
					}
				}))
			}
			this._player.movement = moveDirection;
		}
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		// Shift+Ctrl+Alt+I
		if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
			this._babylonScene.toogleDebug();
		}

		this._keyboard.keyDown(ev.key);
	}

	private handleKeyUp = (ev: KeyboardEvent) => {
		this._keyboard.keyUp(ev.key);
	}

	public destroy() {
		this._babylonScene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("keyup", this.handleKeyUp);
		window.removeEventListener("resize", this.resize);
		this._websocket.close();
		this._websocket = undefined as unknown as WebSocket;
	}

	get player() {
		return this._player;
	}

	public override isServer(): boolean {
		return this._websocket === undefined;
	}
}
