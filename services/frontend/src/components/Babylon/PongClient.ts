
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, InputBlock, AudioEngine } from "@babylonjs/core";
import { GameMode, GameModeType, IPlayer } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientTrigger } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { keyState, GameScene, scoredEvent } from "./types";
import * as PONG from "pong";

export default class PongClient extends PONG.Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket: WebSocket;
	private _engine: Engine;
	private _keyboard: Map<string, keyState>;
	private _babylonScene: Scene;
	private _gameScene: GameScene;

	private _camera: ArcRotateCamera;
	private _light: HemisphericLight;

	private _ballInstances: ClientBall[];
	private _paddleInstance: Map<number, ClientPaddle>;

	private _running: number = 0;

	public scoreUpdateCallback: (score: scoredEvent) => void;

	public constructor(scoreUpdateCallback: (score: scoredEvent) => void) {
		super();
		this._gameScene = GameScene.MENU;
		this.scoreUpdateCallback = scoreUpdateCallback;
		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);
		this._keyboard = new Map<string, keyState>();
		this._keyboard.set("ArrowUp", keyState.IDLE);
		this._keyboard.set("ArrowDown", keyState.IDLE);
		this._keyboard.set("w", keyState.IDLE);
		this._keyboard.set("s", keyState.IDLE);
		this._keyboard.set("c", keyState.IDLE);

		// (async () => {
		// 	const audioEngine = new AudioEngine();
		
		// 	// Create sounds here, but don't call `play()` on them, yet ...
		
		// 	// Wait until audio engine is ready to play sounds.
		// 	audioEngine.unlock();
		
		// 	// Start sound playback ...
		// })();

		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();

		// this._babylonScene = new GameScene(this._canvas, this._engine, this._keyboard, scoreUpdateCallback);
		// this._babylonScene = createScene(this._engine, this._canvas);
		this.sceneSetup();

		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("resize", this.resize);
		
		this._engine.runRenderLoop(this.loop);

		this._websocket = new WebSocket("ws://localhost:4124");

		this._websocket.onmessage = (ev) => {
			const msg = JSON.parse(ev.data);
			if (msg.event === "state") {
				console.log({counter: msg.data.counter});
				// this.counter = msg.data.counter;
			}
		}
		this._websocket.onopen = (ev) => {
			console.log(ev);
		}
		this._websocket.onclose = (ev) => {
			console.log(ev);
		}
		
	}
	
	public setGameScene(scene: GameScene) {
		this._gameScene = scene;
		if (this._gameScene === GameScene.LOCAL) {
			this.localGame();
		} else if (this._gameScene === GameScene.MENU) {
			this.cleanup();
			this._babylonScene.clearColor = Color4.FromColor3(Color3.Blue());
		} else if (this._gameScene === GameScene.ONLINE) {
			this.onlineGame(1, new GameMode("test", { type: GameModeType.UNRANKED, team_size: 1, team_count: 2, match_parameters: { obstacles: false, powerups: false, time_limit: 0, ball_speed: 0, point_to_win: 0 } }), [{ account_id: 1}, { account_id: 2}]);
		} else if (this._gameScene === GameScene.LOBBY) {
			this._babylonScene.clearColor = Color4.FromColor3(Color3.Green());
		}
	}

	public startGame() {
		this.start();
		this._running = 1;
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Gray());
	}

	public nextRound() {
		this._running = 1;
		this.roundStart();
	}
	
	private loop = () => {
		this.update();
		this._babylonScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
	}

	private cleanup() {
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.dispose();
		});
		this._paddleInstance.forEach((paddle: ClientPaddle) => {
			paddle.dispose();
		});
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black());
	}

	private sceneSetup() {
		
		this._babylonScene = new Scene(this._engine);
		// scene.clearColor = Color4.FromColor3(Color3.Black());
		// scene.createDefaultEnvironment();
		const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, Vector3.Zero(), this._babylonScene);
		// camera.attachControl(canvas, true);
		// camera.lowerRadiusLimit = 1.5;
		// camera.upperRadiusLimit = 15;
		// camera.wheelPrecision = 50;

		const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._babylonScene);

		// default setup
		const wallSize: Vector2 = new Vector2(PONG.K.smallWallSize.x, PONG.K.smallWallSize.y);
		const wallBottom: ClientWall = new ClientWall(this._babylonScene, "wallBottom", new Vector2(0, PONG.K.smallWallBottomPosition.y), wallSize);
		const wallTop: ClientWall = new ClientWall(this._babylonScene, "wallTop", new Vector2(0, PONG.K.smallWallTopPosition.y), wallSize);

		const goalSize: Vector2 = new Vector2(PONG.K.smallGoalSize.x, PONG.K.smallGoalSize.y);
		const goalLeft: ClientTrigger = new ClientTrigger(this._babylonScene, "goalLeft", new Vector2(PONG.K.smallGoalLeftPosition.x, 0), goalSize, Color3.Red());
		const goalRight: ClientTrigger = new ClientTrigger(this._babylonScene, "goalRight", new Vector2(PONG.K.smallGoalRightPosition.x, 0), goalSize, Color3.Red());
	}

	private onlineGame(match_id: number, gamemode: GameMode, players: IPlayer[], state?: PONG.PongState) {
		this.onlineSetup(match_id, gamemode, players, state);
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black());
		// this._babylonScene.createDefaultEnvironment();
		
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		this._balls.forEach((ball: PONG.Ball) => {
			const ballInstance: ClientBall = new ClientBall(this._babylonScene, ball);
			this._ballInstances.push(ballInstance);
		});
		this._paddles.forEach((paddle: PH2D.Body, playerId: number) => {
			const paddleInstance: ClientPaddle = new ClientPaddle(this._babylonScene, paddle);
			this._paddleInstance.set(playerId, paddleInstance);
		});
	}

	private localGame() {
		this.localSetup();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black());
		// this._babylonScene.createDefaultEnvironment();
		
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		this._balls.forEach((ball: PONG.Ball) => {
			const ballInstance: ClientBall = new ClientBall(this._babylonScene, ball);
			this._ballInstances.push(ballInstance);
		});
		this._paddles.forEach((paddle: PH2D.Body, playerId: number) => {
			const paddleInstance: ClientPaddle = new ClientPaddle(this._babylonScene, paddle);
			this._paddleInstance.set(playerId, paddleInstance);
		});
	}

	private update() {
		let dt: number = this._engine.getDeltaTime() / 1000;
		if (this._running === 0) {
			return;
		}

		this.playerUpdate();
		dt = this.physicsUpdate(dt);
		this._paddleInstance.forEach((paddle: ClientPaddle) => {
			paddle.update(dt);
		});
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.update(dt);
		});
		if (this.scoreUpdate()) {
			console.log("score: " + this._score[0] + "-" + this._score[1]);
			this.scoreUpdateCallback({ score: this._score, side: this._lastSide });
			this._running = 0;
		}
	}

	private playerUpdate() { // TODO: refactor to use playerId
		let paddle: ClientPaddle | undefined = this._paddleInstance.get(1);
		if (paddle) {
			let moveDirection: number = 0;
			let keyStateProbe: keyState = this._keyboard.get("ArrowUp") || keyState.IDLE;
			if (keyStateProbe === keyState.HELD || keyStateProbe === keyState.PRESSED) {
				moveDirection += 1;
			}
			keyStateProbe = this._keyboard.get("ArrowDown") || keyState.IDLE;
			if (keyStateProbe === keyState.HELD || keyStateProbe === keyState.PRESSED) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}

		paddle = this._paddleInstance.get(0);
		if (paddle) {
			let moveDirection: number = 0;
			let keyStateProbe: keyState = this._keyboard.get("w") || keyState.IDLE;
			if (keyStateProbe === keyState.HELD || keyStateProbe === keyState.PRESSED) {
				moveDirection += 1;
			}
			keyStateProbe = this._keyboard.get("s") || keyState.IDLE;
			if (keyStateProbe === keyState.HELD || keyStateProbe === keyState.PRESSED) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		// console.log(ev);
		// Shift+Ctrl+Alt+I
		// if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
		// 	if (this._scene[this._activeScene].debugLayer.isVisible()) {
		// 		this._scene[this._activeScene].debugLayer.hide();
		// 	} else {
		// 		this._scene[this._activeScene].debugLayer.show();
		// 	}
		// }

		if (ev.key === "z") {
			this.onlineGame(1, new GameMode("test", { type: GameModeType.UNRANKED, team_size: 1, team_count: 2, match_parameters: { obstacles: false, powerups: false, time_limit: 0, ball_speed: 0, point_to_win: 0 } }), [{ account_id: 1}, { account_id: 2}]);
		}

		if (ev.key === "x") {
			this.startGame();
		}

		if (this._keyboard.has(ev.key)) {
			const keyStateProbe = this._keyboard.get(ev.key);
			if (keyStateProbe === keyState.IDLE || keyStateProbe === keyState.RELEASED) {
				this._keyboard.set(ev.key, keyState.PRESSED);
			} else if (keyStateProbe === keyState.PRESSED) {
				this._keyboard.set(ev.key, keyState.HELD);
			}
		}
	}

	private handleKeyUp = (ev: KeyboardEvent) => {
		// console.log(ev);

		if (this._keyboard.has(ev.key)) {
			const keyStateProbe = this._keyboard.get(ev.key);
			if (keyStateProbe === keyState.PRESSED || keyStateProbe === keyState.HELD) {
				this._keyboard.set(ev.key, keyState.RELEASED);
			} else if (keyStateProbe === keyState.RELEASED) {
				this._keyboard.set(ev.key, keyState.IDLE);
			}
		}
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