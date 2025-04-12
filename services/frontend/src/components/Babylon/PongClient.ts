
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, InputBlock, AudioEngine } from "@babylonjs/core";
import createDefaultScene from "./DefaultScene";
import { GameMode, GameModeType, IPlayer } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientTrigger } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { keyState, GameScene } from "./types";
import * as PONG from "pong";

function createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
	const scene = new Scene(engine);
	// scene.clearColor = Color4.FromColor3(Color3.Black());
	// scene.createDefaultEnvironment();
	const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 12.5, Vector3.Zero(), scene);
	// camera.attachControl(canvas, true);
	// camera.lowerRadiusLimit = 1.5;
	// camera.upperRadiusLimit = 15;
	// camera.wheelPrecision = 50;

	const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

	// default setup
	const wall1: ClientWall = new ClientWall(scene, "wall1", new Vector2(0, -4), new Vector2(10, 0.2));
	const wall2: ClientWall = new ClientWall(scene, "wall2", new Vector2(0, 4), new Vector2(10, 0.2));

	const goal1: ClientTrigger = new ClientTrigger(scene, "goal1", new Vector2(-5.2, 0), new Vector2(0.2, 8.2), Color3.Red());
	const goal2: ClientTrigger = new ClientTrigger(scene, "goal2", new Vector2(5.2, 0), new Vector2(0.2, 8.2), Color3.Red());

	return scene;
}

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

	public scoreUpdateCallback: (score: Array<number>) => void;

	public constructor(scoreUpdateCallback: (score: Array<number>) => void) {
		super();
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
		this._babylonScene = createScene(this._engine, this._canvas);

		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("keypress", this.handleKeyPress);
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

	private loop = () => {
		this.update();
		this._babylonScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
	}

	public setGameScene(scene: GameScene) {
		this._gameScene = scene;
		if (this._gameScene === GameScene.LOCAL) {
			this.localGame();
		} else if (this._gameScene === GameScene.MENU) {
			this._babylonScene.clearColor = Color4.FromColor3(Color3.Blue());
		}
	}

	public onlineGame(match_id: number, gamemode: GameMode, players: IPlayer[], state?: PONG.PongState) {
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

	public localGame() {
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

	public startGame() {
		this.start();
		this._running = 1;
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Gray());
	}

	public nextRound() {
		this._running = 0;
		this.nextRound();
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
		const score: Array<number> = this.scoreUpdate();
		if (score) {
			console.log("score: " + score[0] + "-" + score[1]);
			this.scoreUpdateCallback(score);
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

/*

export interface IGameMode {
	name: string;
	type: GameModeType;
	team_size: number;
	team_count: number;
	match_parameters: IMatchParameters;
}

*/

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
		// if (ev.key === "1") {
		// 	this._babylonScene.activeCamera = this._babylonScene.cameras[0];
		// } else if (ev.key === "2") {
		// 	this._babylonScene.activeCamera = this._babylonScene.cameras[1];
		// } else if (ev.key === "3") {
		// 	this._babylonScene.activeCamera = this._babylonScene.cameras[2];
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
		// if (ev.key === "ArrowUp") {
		// 	const keyStateProbe = this._keyboard.get(ev.key);
		// 	if (keyStateProbe === keyState.IDLE || keyStateProbe === keyState.RELEASED) {
		// 		this._keyboard.set("ArrowUp", keyState.PRESSED);
		// 	} else {
		// 		this._keyboard.set("ArrowUp", keyState.HELD);
		// 	}
		// }
		// if (ev.key === "ArrowDown") {
		// 	const keyStateProbe = this._keyboard.get(ev.key);
		// 	if (keyStateProbe === keyState.IDLE || keyStateProbe === keyState.RELEASED) {
		// 		this._keyboard.set("ArrowDown", keyState.PRESSED);
		// 	} else if (keyStateProbe === keyState.PRESSED) {
		// 		this._keyboard.set("ArrowDown", keyState.HELD);
		// 	}
		// }
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

	private handleKeyPress = (ev: KeyboardEvent) => {
		// console.log(ev);

		// if (ev.key === "ArrowUp") {
		// 	this._babylonScene.playerUp(1);
		// }
		// if (ev.key === "ArrowDown") {
		// 	this._babylonScene.playerDown(1);
		// }
	}

	public destroy() {
		// this._babylonScene.dispose();
		this._engine.dispose();
		window.removeEventListener("keydown", this.handleKeyDown);
		window.removeEventListener("resize", this.resize);
	}
}