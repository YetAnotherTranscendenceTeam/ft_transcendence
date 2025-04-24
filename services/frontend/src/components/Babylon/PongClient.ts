
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, StandardMaterial } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { GameMode, GameModeType, IPlayer } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientTrigger } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { KeyState, GameScene, KeyName, ScoredEvent } from "./types";
import * as PONG from "pong";
import AObject from "./Objects/AObject";
import ClientGoal from "./Objects/ClientGoal";

const isDevelopment = process.env.NODE_ENV !== "production";

export default class PongClient extends PONG.Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket: WebSocket;
	private _engine: Engine;
	private _keyboard: Map<string, KeyState>;
	private _babylonScene: Scene;
	private _gameScene: GameScene;

	private _camera: ArcRotateCamera;
	private _light: HemisphericLight;

	private _meshMap: Map<PONG.MapID, Array<AObject>>;

	private _ballInstances: Array<ClientBall>;
	private _paddleInstance: Map<number, ClientPaddle>;

	protected _time: number;
	private _running: number;

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
		this._running = 0;
		this._time = 0;
		this._ballInstances = [];
		this._paddleInstance = new Map<number, ClientPaddle>();
		this._meshMap = new Map<PONG.MapID, Array<AObject>>();
		this._keyboard = new Map<string, KeyState>();
		Object.keys(KeyName).map(key => KeyName[key]).forEach((name: string) => {
			this._keyboard.set(name, KeyState.IDLE);
		});

		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);

		this._babylonScene = new Scene(this._engine);
		// Optimize for performance
		// this._babylonScene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate;
		// this._babylonScene.collisionsEnabled = false;
		this._babylonScene.autoClear = true;
		// this._babylonScene.autoClearDepthAndStencil = false;


		// // Ball Mesh // TODO: not implemented yet
		// this._ballMesh = MeshBuilder.CreateSphere(
		// 	"ball",
		// 	{ diameter: PONG.K.ballRadius * 2 },
		// 	this._babylonScene
		// );
		// this._ballMesh.position = new Vector3(
		// 	0,
		// 	-1,
		// 	0
		// );
		// const material = new StandardMaterial("ballMaterial", this._babylonScene);
		// material.diffuseColor = Color3.White();
		// material.specularColor = Color3.Black();
		// this._ballMesh.material = material;
		// this._ballMesh.isVisible = false;
		// this._ballMesh.isPickable = false;
		// this._ballMesh.checkCollisions = false;

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
		} else if (this._gameScene === GameScene.ONLINE) {
			this.onlineScene(1, new GameMode("test", { type: GameModeType.UNRANKED, team_size: 1, team_count: 2, match_parameters: { obstacles: false, powerups: false, time_limit: 0, ball_speed: 0, point_to_win: 0 } }), [{ account_id: 1}, { account_id: 2}]);
		}
	}

	public startGame() {
		this.start();
		this._time = 0;
		this._running = 1;
		this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.57, 0.67, 0.41));
	}

	public nextRound() {
		this._running = 1;
		this.roundStart();
	}

	public pauseGame() {
		this._running = 0;
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Yellow());
	}

	public resumeGame() {
		this._running = 1;
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Gray());
	}
	
	private loop = () => {
		this.update();
		this._babylonScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
	}

	private sceneSetup() {
		// scene.clearColor = Color4.FromColor3(Color3.Black());
		// scene.createDefaultEnvironment();
		const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, Vector3.Zero(), this._babylonScene);
		camera.inputs.clear();
		camera.inputs.addMouseWheel();
		camera.inputs.addPointers();
		// camera.inputs.attached.pointers.buttons = [0, 1];
		camera.attachControl(this._canvas, true);
		camera.lowerRadiusLimit = 1.5;
		camera.upperRadiusLimit = 30;
		camera.wheelPrecision = 50;

		const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._babylonScene);
		light.intensity = 0.7;
		light.diffuse = new Color3(1, 1, 1);
		light.specular = new Color3(1, 1, 1);

		const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this._babylonScene);
		const skyboxMaterial = new StandardMaterial("skyBox", this._babylonScene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/images/skybox/skybox", this._babylonScene);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
		skyboxMaterial.specularColor = new Color3(0, 0, 0);
		skybox.material = skyboxMaterial;

		const ballMaterial = new BABYLON.PBRMaterial("ballMaterial", this._babylonScene);
		ballMaterial.metallic = 1;
		ballMaterial.roughness = 1;
		ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._babylonScene);
		ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._babylonScene);
		ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.png", this._babylonScene);
		ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.png", this._babylonScene);
		ballMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/images/skybox/skybox", this._babylonScene);
		ballMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
		ClientBall.material = ballMaterial;

		const wallMaterial = new BABYLON.PBRMaterial("wallMaterial", this._babylonScene);
		wallMaterial.metallic = 0;
		wallMaterial.roughness = 0.5;
		wallMaterial.albedoColor = new Color3(0.25, 0.5, 0.62);
		// wallMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/images/skybox/skybox", this._babylonScene);
		// wallMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
		ClientWall.material = wallMaterial;

		const paddleMaterial = new BABYLON.PBRMaterial("paddleMaterial", this._babylonScene);
		paddleMaterial.metallic = 0;
		paddleMaterial.roughness = 0.5;
		paddleMaterial.albedoColor = Color3.White();
		ClientPaddle.material = paddleMaterial;

		const goalMaterial = new BABYLON.PBRMaterial("goalMaterial", this._babylonScene);
		goalMaterial.metallic = 0;
		goalMaterial.roughness = 0.5;
		goalMaterial.albedoColor = Color3.Red();
		goalMaterial.alpha = 0.5;
		ClientGoal.material = goalMaterial;

		this._map.forEach((map: PONG.IPongMap, mapId: PONG.MapID) => {
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

	private menuScene() {
		this.menuSetup();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Blue());

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});

		this.loadBalls();
		this.bindPaddles();
	}

	private lobbyScene() {
		this.lobbySetup();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Green());

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});

		this.loadBalls();
		this.bindPaddles();
	}

	private localScene() {
		this.localSetup();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black()); // debug

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});
		
		this.loadBalls();
		this.bindPaddles();
	}

	private onlineScene(match_id: number, gamemode: GameMode, players: IPlayer[], state?: PONG.PongState) {
		this.onlineSetup(match_id, gamemode, players, state);
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black()); // debug

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});
	
		this.loadBalls();
		this.bindPaddles();
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

	private update() {
		let dt: number = this._engine.getDeltaTime() / 1000;
		if (this._running === 0) {
			return;
		}
		this._time += dt;
		this.callbacks.timeUpdateCallback(Math.floor(this._time));

		this.playerUpdate();
		dt = this.physicsUpdate(dt);
		this._ballInstances.forEach((ball: ClientBall) => {
			ball.update(dt);
		});
		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.update(dt);
		});
		if (this.scoreUpdate()) {
			console.log("score: " + this._score[0] + "-" + this._score[1]);
			this.callbacks.scoreUpdateCallback({ score: this._score, side: this._lastSide });
			this._running = 0;
			if (this._winner !== undefined) {
				this._babylonScene.clearColor = Color4.FromColor3(new Color3(0.56, 0.19, 0.19));
				this.callbacks.endGameCallback();
			}
		}
	}

	private playerUpdate() { // TODO: refactor to use playerId
		if (this._gameScene !== GameScene.LOCAL) {
			return;
		}

		let paddle: ClientPaddle | undefined = this._paddleInstance.get(PONG.PaddleID.RIGHT_BACK);
		if (paddle) {
			let moveDirection: number = 0;
			let keyStateProbe: KeyState = this._keyboard.get(KeyName.ArrowUp) || KeyState.IDLE;
			if (keyStateProbe === KeyState.HELD || keyStateProbe === KeyState.PRESSED) {
				moveDirection += 1;
			}
			keyStateProbe = this._keyboard.get(KeyName.ArrowDown) || KeyState.IDLE;
			if (keyStateProbe === KeyState.HELD || keyStateProbe === KeyState.PRESSED) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}

		paddle = this._paddleInstance.get(PONG.PaddleID.LEFT_BACK);
		if (paddle) {
			let moveDirection: number = 0;
			let keyStateProbe: KeyState = this._keyboard.get(KeyName.W) || KeyState.IDLE;
			if (keyStateProbe === KeyState.HELD || keyStateProbe === KeyState.PRESSED) {
				moveDirection += 1;
			}
			keyStateProbe = this._keyboard.get(KeyName.S) || KeyState.IDLE;
			if (keyStateProbe === KeyState.HELD || keyStateProbe === KeyState.PRESSED) {
				moveDirection -= 1;
			}
			paddle.move(moveDirection);
		}
	}

	private createMaterials() {
		const ballMaterial = new BABYLON.PBRMaterial("ballMaterial", this._babylonScene);
		ballMaterial.metallic = 1;
		ballMaterial.roughness = 1;
		ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_albedo.tif", this._babylonScene);
		ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.tif", this._babylonScene);
		ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.tif", this._babylonScene);
		ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.tif", this._babylonScene);
		ballMaterial.reflectanceTexture = new BABYLON.CubeTexture("/assets/images/skybox/skybox", this._babylonScene);
		// ballMaterial.albedoColor = new Color3(1, 1, 1);
		ClientBall.material = ballMaterial;
	}

	private handleKeyDown = (ev: KeyboardEvent) => {
		// Shift+Ctrl+Alt+I
		if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
			if (this._babylonScene.debugLayer.isVisible()) {
				this._babylonScene.debugLayer.hide();
			} else {
				this._babylonScene.debugLayer.show();
			}
		}
		const key = ev.key.toLowerCase();

		if (this._keyboard.has(key)) {
			const keyStateProbe = this._keyboard.get(key);
			if (keyStateProbe === KeyState.IDLE || keyStateProbe === KeyState.RELEASED) {
				this._keyboard.set(key, KeyState.PRESSED);
			} else if (keyStateProbe === KeyState.PRESSED) {
				this._keyboard.set(key, KeyState.HELD);
			}
		}
	}

	private handleKeyUp = (ev: KeyboardEvent) => {
		const key = ev.key.toLowerCase();

		if (this._keyboard.has(key)) {
			const keyStateProbe = this._keyboard.get(key);
			if (keyStateProbe === KeyState.PRESSED || keyStateProbe === KeyState.HELD) {
				this._keyboard.set(key, KeyState.RELEASED);
			} else if (keyStateProbe === KeyState.RELEASED) {
				this._keyboard.set(key, KeyState.IDLE);
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