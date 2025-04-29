
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, StandardMaterial } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { GameMode, GameModeType, IGameMode, IPlayer } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientTrigger } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { KeyState, GameScene, KeyName, ScoredEvent, IServerStep, PaddleSync, PaddleSyncs } from "./types";
import * as PONG from "pong";
import AObject from "./Objects/AObject";
import config from "../../config";
import Keyboard from "./Keyboard";

const isDevelopment = process.env.NODE_ENV !== "production";

export default class PongClient extends PONG.Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket?: WebSocket;
	private _engine: Engine;
	private _keyboard: Keyboard;
	private _babylonScene: Scene;
	private _gameScene: GameScene;

	private _camera: ArcRotateCamera;
	private _light: HemisphericLight;

	private _meshMap: Map<PONG.MapID, Array<AObject>>;

	private _serverSteps: Array<IServerStep>;

	private _ballInstances: Array<ClientBall>;
	private _paddleInstance: Map<number, ClientPaddle>;

	private _time: number;
	private _interpolation: number;

	private _player: PONG.IPongPlayer;

	// public scoreUpdateCallback: (score: ScoredEvent) => void;
	public callbacks: {
		scoreUpdateCallback: (score: ScoredEvent) => void;
		timeUpdateCallback: (time: number) => void;
		endGameCallback: () => void;
	};

	public constructor(callbacks: {
		scoreUpdateCallback: (score: ScoredEvent) => void,
		timeUpdateCallback: (time: number) => void,
		endGameCallback: () => void
	}) {
		super();
		this.callbacks = callbacks;
		this._time = 0;
		this._interpolation = 0;
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		this._meshMap = new Map<PONG.MapID, Array<AObject>>();
		this._keyboard = new Keyboard();

		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);
		
		this._babylonScene = new Scene(this._engine);
		// Optimize for performance
		// this._babylonScene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate;
		// this._babylonScene.collisionsEnabled = false;
		this._babylonScene.autoClear = true;
		// this._babylonScene.autoClearDepthAndStencil = false;
		
		this.sceneSetup();
		
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("resize", this.resize);
		
		this._serverSteps = [];
		this._engine.runRenderLoop(this.loop);

		this._state = PONG.PongState.RESERVED.clone();
		
		//this.setGameScene(GameScene.ONLINE);
	}

	public setGameScene(scene: GameScene) {
		if (this._gameScene === scene) {
			return;
		}
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.dispose();
		});
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		// disabble active map
		if (this._currentMap) {
			this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
				map.disable();
			});
		}
		this._gameScene = scene;
		if (this._gameScene === GameScene.MENU) {
			this.menuScene();
		} else if (this._gameScene === GameScene.LOBBY) {
			this.lobbyScene();
		} else if (this._gameScene === GameScene.LOCAL) {
			this.localScene();
		}
		if (this._gameScene !== GameScene.ONLINE && this._websocket) {
			this._websocket.close();
			this._websocket = null;
		}
	}

	public startGame() {
		this._state = PONG.PongState.PLAYING.clone();
		this.start();
		this._time = 0;
		this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.57, 0.67, 0.41));
	}

	public connect(match_id: number) {
		this._websocket = new WebSocket(`${config.WS_URL}/pong/join?match_id=${match_id}&access_token=${localStorage.getItem("access_token")}`);
		
		this._websocket.onmessage = (ev) => { // step, state, sync
			const msg = JSON.parse(ev.data);
			console.log(msg);
			if (msg.event === "step") {
				// this.counter = msg.data.counter;
				if (this._state.isFrozen()) 
					this.serverStep(msg.data as IServerStep, true);
				this._serverSteps.push(msg.data as IServerStep);
			}
			else if (msg.event === "sync") {
				this._tick = msg.data.tick;
				this.setGameScene(GameScene.ONLINE);
				this.onlineScene(msg.data.match.match_id as number, 
					new GameMode(msg.data.match.gamemode as IGameMode),
					msg.data.match.players as IPlayer[],
					PONG.PongState[msg.data.match.state.name].clone() as PONG.PongState,
				);
				this.bindPaddles();
				this._player = this._players.find((player: PONG.IPongPlayer) => player.account_id === msg.data.player.account_id) as PONG.IPongPlayer;
			}
			else if (msg.event === "state") {
				const state = PONG.PongState[msg.data.state.name].clone();
				if (this._state.endCallback)
					this._state.endCallback(this, state);
				this._state = state;
			}
		}
		this._websocket.onopen = (ev) => {
			console.log(ev);
		}
		this._websocket.onclose = (ev) => {
			console.log(ev);
		}
	}

	public nextRound() {
		this._state = PONG.PongState.PLAYING.clone();
		this.roundStart();
	}

	public pauseGame() {
		this._state = PONG.PongState.PAUSED.clone();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Yellow());
	}

	public resumeGame() {
		this._state = PONG.PongState.PLAYING.clone();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Gray());
	}

	private sceneSetup() {
		// scene.clearColor = Color4.FromColor3(Color3.Black());
		// scene.createDefaultEnvironment();
		const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, Vector3.Zero(), this._babylonScene);
		camera.attachControl(this._canvas, true);
		camera.lowerRadiusLimit = 1.5;
		camera.upperRadiusLimit = 30;
		camera.wheelPrecision = 50;
		
		const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._babylonScene);
		
		PONG.Pong._map.forEach((map: PONG.IPongMap, mapId: PONG.MapID) => {
			const mapMesh: Array<AObject> = [];
			
			if (map.wallBottom) {
				const wallBottom: ClientWall = new ClientWall(this._babylonScene, ("wallBottom" + map.mapId.toString()), map.wallBottom);
				wallBottom.disable();
				mapMesh.push(wallBottom);
			}
			if (map.wallTop) {
				const wallTop: ClientWall = new ClientWall(this._babylonScene, ("wallTop" + map.mapId.toString()), map.wallTop);
				wallTop.disable();
				mapMesh.push(wallTop);
			}
			if (map.goalLeft && isDevelopment) {
				const goalLeft: ClientTrigger = new ClientTrigger(this._babylonScene, ("goalLeft" + map.mapId.toString()), map.goalLeft);
				goalLeft.disable();
				mapMesh.push(goalLeft);
			}
			if (map.goalRight && isDevelopment) {
				const goalRight: ClientTrigger = new ClientTrigger(this._babylonScene, ("goalRight" + map.mapId.toString()), map.goalRight);
				goalRight.disable();
				mapMesh.push(goalRight);
			}
			if (map.paddleLeftBack) {
				const paddleLeftBack: ClientPaddle = new ClientPaddle(this._babylonScene, ("paddleLeftBack" + map.mapId.toString()), map.paddleLeftBack);
				paddleLeftBack.disable();
				mapMesh.push(paddleLeftBack);
			}
			if (map.paddleLeftFront) {
				const paddleLeftFront: ClientPaddle = new ClientPaddle(this._babylonScene, ("paddleLeftFront" + map.mapId.toString()), map.paddleLeftFront);
				paddleLeftFront.disable();
				mapMesh.push(paddleLeftFront);
			}
			if (map.paddleRightBack) {
				const paddleRightBack: ClientPaddle = new ClientPaddle(this._babylonScene, ("paddleRightBack" + map.mapId.toString()), map.paddleRightBack);
				paddleRightBack.disable();
				mapMesh.push(paddleRightBack);
			}
			if (map.paddleRightFront) {
				const paddleRightFront: ClientPaddle = new ClientPaddle(this._babylonScene, ("paddleRightFront" + map.mapId.toString()), map.paddleRightFront);
				paddleRightFront.disable();
				mapMesh.push(paddleRightFront);
			}
			if (map.obstacles) {
				map.obstacles.forEach((obstacle: PONG.Wall) => {
					const wall: ClientWall = new ClientWall(this._babylonScene, ("obstacle" + map.mapId.toString()), obstacle);
					wall.disable();
					mapMesh.push(wall);
				});
			}
			
			this._meshMap.set(mapId, mapMesh);
		});
	}
	
	protected switchMap(mapId: PONG.MapID) {
		super.switchMap(mapId);
		const objects: PH2D.Body[] = this._currentMap.getObjects();
		this._meshMap.get(this._currentMap.mapId)?.forEach((object: AObject, index: number) => {
			object.enable();
			object.updateBodyReference(objects[index]);
		});
		
	}
	
	private menuScene() {
		this.menuSetup();
		this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.305882353, 0.384313725, 0.521568627));
		
		this.loadBalls();
		this.bindPaddles();
	}
	
	private lobbyScene() {
		this.lobbySetup();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Green());
		
		this.loadBalls();
		this.bindPaddles();
	}
	
	private localScene() {
		this.localSetup();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black()); // debug
		
		this.loadBalls();
		this.bindPaddles();
	}
	
	private onlineScene(match_id: number, gamemode: GameMode, players: IPlayer[], state?: PONG.PongState) {
		this.onlineSetup(match_id, gamemode, players, state);
		
		// const { me } = useAuth();
		//const myPlayer = players.find((player: IPongPlayer) => player.account_id === me?.account_id);
		
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black()); // debug
		
		this.loadBalls();
		// this.bindPaddles();
	}
	
	private loadBalls() {
		this._balls.forEach((ball: PH2D.Body) => {
			const ballInstance: ClientBall = new ClientBall(this._babylonScene, ball);
			this._ballInstances.push(ballInstance);
		});
	}
	
	private bindPaddles() {
		this._paddles.forEach((paddle: PH2D.Body, playerId: number) => {
			const paddleInstance: ClientPaddle | undefined = this._meshMap.get(this._currentMap.mapId)?.find((object: AObject) => {
				if (object instanceof ClientPaddle) {
					return object.physicsBody === paddle;
				}
				return false;
			}
			) as ClientPaddle;
			if (paddleInstance) {
				this._paddleInstance.set(playerId, paddleInstance);
			}
		});
	}

	private loop = () => {
		this._keyboard.update();
		if (this._gameScene) {
			if (this._websocket) {
				this.updateOnline();
			} else {
				this.updateLocal();
			}
		}
		// this.update();
		this._babylonScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
	}

	private updateLocal() {
		let dt: number = this._engine.getDeltaTime() / 1000;
		if (this._state.tick(dt, this)) {
			return;
		}

		if (this._state.getNext()) {
			const next = this._state.getNext().clone();
			if (this._state.endCallback) {
				this._state.endCallback(this, next);
			}
			this._state = next;
		}

		this._time += dt;
		this.callbacks.timeUpdateCallback(Math.floor(this._time));

		this.playerUpdateLocal();
		dt = this.physicsUpdate(dt);
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.update(dt);
		});
		this._meshMap.get(this._currentMap.mapId)?.forEach((object: AObject) => {
			object.update(dt);
		});
		if (this.scoreUpdate()) {
			console.log("score: " + this._score[0] + "-" + this._score[1]);
			this.callbacks.scoreUpdateCallback({ score: this._score, side: this._lastSide });
			if (this._winner !== undefined) {
				this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.56, 0.19, 0.19));
				this.callbacks.endGameCallback();
				this._state = PONG.PongState.ENDED.clone();
			} else {
				this._state = PONG.PongState.FREEZE.clone();
			}
		}
	}

	private updateOnline() {
		let dt: number = this._engine.getDeltaTime() / 1000;
		// let dt: number = 1.0;
		// if (this._state.tick(dt, this)) {
		// 	return;
		// }

		// if (this._state.getNext()) {
		// 	if (this._state.endCallback) {
		// 		this._state.endCallback(this);
		// 	}
		// 	this._state = this._state.getNext().clone();
		// }

		// this._time += dt;
		// this.callbacks.timeUpdateCallback(Math.floor(this._time));

		if (!this._state.isFrozen()) {
			this.playerUpdateOnline();
			this._interpolation = this.physicsUpdate(dt);
			this._serverSteps.forEach((step: IServerStep) => {
				this.serverStep(step, step.collisions > 0);
			});
			this._serverSteps = [];
		}
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.update(this._interpolation);
		});
		this._meshMap.get(this._currentMap.mapId)?.forEach((object: AObject) => {
			object.update(this._interpolation);
		});
		// if (this.scoreUpdate()) {
		// 	console.log("score: " + this._score[0] + "-" + this._score[1]);
		// 	this.callbacks.scoreUpdateCallback({ score: this._score, side: this._lastSide });
		// 	if (this._winner !== undefined) {
		// 		this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.56, 0.19, 0.19));
		// 		this.callbacks.endGameCallback();
		// 		this._state = PONG.PongState.ENDED.clone();
		// 	} else {
		// 		this._state = PONG.PongState.FREEZE.clone();
		// 	}
		// }
	}

	private serverStep(data: IServerStep, forced: boolean = false) {
		console.log("server step", data);
		const shouldSyncPositions = Math.abs(this._tick - data.tick) > 3 || forced;
		if (shouldSyncPositions) {
			console.log("tick mismatch", this.tick, data.tick);
			this._tick = data.tick;
			this.ballSync(data.balls);
		}
		this.paddleSync(data.paddles);
	}

	private paddleSync(paddles: PaddleSyncs) {
		for (let paddlesync of Object.values(paddles)) {
			console.log("paddle sync", paddlesync);
			console.log("thispaddles", this._paddleInstance);
			const paddle = this._paddleInstance.get(paddlesync.id);
			paddle.sync(paddlesync);
		}
	}

	private playerUpdateLocal() {
		let paddle: ClientPaddle | undefined = this._paddleInstance.get(PONG.PaddleID.RIGHT_BACK);
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

		paddle = this._paddleInstance.get(PONG.PaddleID.LEFT_BACK);
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

		const paddle: ClientPaddle | undefined = this._paddleInstance.get(this._player.paddleId);
		if (paddle) {
			console.log("player", this._player)
			let moveDirection: number = 0;
			if (this._keyboard.isDown(KeyName.ArrowUp)) {
				moveDirection += 1;
			}
			if (this._keyboard.isDown(KeyName.ArrowDown)) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
			if (moveDirection !== this._player.movement) {
				console.log("send move", moveDirection);
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
		// if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
		// 	if (this._babylonScene.debugLayer.isVisible()) {
		// 		this._babylonScene.debugLayer.hide();
		// 	} else {500
		// 		this._babylonScene.debugLayer.show();
		// 	}
		// }

		this._keyboard.keyDown(ev.key);
	}

	private handleKeyUp = (ev: KeyboardEvent) => {
		this._keyboard.keyUp(ev.key);
	}

	public destroy() {
		// this._babylonScene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("keyup", this.handleKeyUp);
		window.removeEventListener("resize", this.resize);
		this._websocket.close();
		this._websocket = undefined as unknown as WebSocket;
	}
}