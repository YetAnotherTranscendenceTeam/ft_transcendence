
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Mesh, MeshBuilder, Color3, Color4, StandardMaterial } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { GameMode, GameModeType, IPlayer } from 'yatt-lobbies'
import { ClientBall, ClientPaddle, ClientWall, ClientGoal } from "./Objects/objects";
// import * as GLMATH from "gl-matrix";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { KeyState, GameScene, KeyName, ScoredEvent } from "./types";
import * as PONG from "pong";
import AObject from "./Objects/AObject";
import Keyboard from "./Keyboard";

const isDevelopment = process.env.NODE_ENV !== "production";

export default class PongClient extends PONG.Pong {
	private readonly _canvas: HTMLCanvasElement;
	private _websocket: WebSocket;
	private _engine: Engine;
	private _keyboard: Keyboard;
	private _babylonScene: Scene;
	private _gameScene: GameScene;

	private _skybox: Mesh;
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
		this._keyboard = new Keyboard();

		this._canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this._engine = new Engine(this._canvas, true);

		this._babylonScene = new Scene(this._engine);
		// Optimize for performance
		this._babylonScene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate;
		// this._babylonScene.collisionsEnabled = false;
		// this._babylonScene.autoClear = true;
		// this._babylonScene.autoClearDepthAndStencil = false;

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
	}

	public nextRound() {
		this._running = 1;
		this.roundStart();
	}

	public pauseGame() {
		this._running = 0;
	}

	public resumeGame() {
		this._running = 1;
	}
	
	private loop = () => {
		this._keyboard.update();
		this.update();
		this._babylonScene.render();
		// console.log(this.);
	}

	private resize = () => {
		this._engine.resize();
	}

	private sceneSetup() {
		const camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 20, Vector3.Zero(), this._babylonScene);
		camera.inputs.clear();
		camera.inputs.addMouseWheel();
		camera.inputs.addPointers();
		// camera.inputs.attached.pointers.buttons = [0, 1];
		camera.attachControl(this._canvas, true);
		camera.lowerRadiusLimit = 1.5;
		camera.upperRadiusLimit = 300;
		camera.wheelPrecision = 50;

		const hdrTexture = new BABYLON.CubeTexture(
			"/assets/images/disco_4k.env",
			this._babylonScene,
			null,
			false,
			null,
			() => {
				this._babylonScene.environmentTexture = hdrTexture;
				// Display in the background for visual reference
				this._skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 500.0 }, this._babylonScene);
				const skyboxMaterial = new BABYLON.PBRMaterial('skyBox', this._babylonScene);
				skyboxMaterial.backFaceCulling = false;
				skyboxMaterial.disableLighting = true;
				this._skybox.material = skyboxMaterial;
				this._skybox.infiniteDistance = true;
				skyboxMaterial.disableLighting = true;
				skyboxMaterial.reflectionTexture = hdrTexture.clone();
				skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
				skyboxMaterial.roughness = 0.075;
			}
		);

		const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._babylonScene);
		light.intensity = 0.7;
		light.diffuse = new Color3(1, 1, 1);
		light.specular = new Color3(1, 1, 1);


		const ballMaterial = new BABYLON.PBRMaterial("ballMaterial", this._babylonScene);
		ballMaterial.metallic = 1;
		ballMaterial.roughness = 1;
		ballMaterial.albedoTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._babylonScene);
		ballMaterial.metallicTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_metallic.png", this._babylonScene);
		ballMaterial.microSurfaceTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_roughness.png", this._babylonScene);
		ballMaterial.bumpTexture = new BABYLON.Texture("/assets/images/TCom_Metal_StainlessClean_1K_normal.png", this._babylonScene);
		ballMaterial.reflectionTexture = hdrTexture;
		ballMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PLANAR_MODE;
		ClientBall.template = ballMaterial;

		const wallMaterial = new BABYLON.PBRMaterial("wallMaterial", this._babylonScene);
		wallMaterial.metallic = 0;
		wallMaterial.roughness = 0.5;
		wallMaterial.albedoColor = new Color3(0.25, 0.5, 0.62);
		ClientWall.template = wallMaterial;

		const paddleMaterial = new BABYLON.PBRMaterial("paddleMaterial", this._babylonScene);
		paddleMaterial.metallic = 0;
		paddleMaterial.roughness = 0.5;
		paddleMaterial.albedoColor = Color3.White();
		ClientPaddle.template = paddleMaterial;

		const goalMaterial = new BABYLON.PBRMaterial("goalMaterial", this._babylonScene);
		goalMaterial.metallic = 0;
		goalMaterial.roughness = 0.5;
		goalMaterial.albedoColor = Color3.Red();
		goalMaterial.alpha = 0.5;
		ClientGoal.template = goalMaterial;

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
				const goalLeft: ClientGoal = new ClientGoal(this._babylonScene, ("goalLeft" + map.mapId.toString()), map.goalLeft);
				goalLeft.disable();
				mapMesh.push(goalLeft);
			}
			if (map.goalRight && isDevelopment) {
				const goalRight: ClientGoal = new ClientGoal(this._babylonScene, ("goalRight" + map.mapId.toString()), map.goalRight);
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

		// for each map, add every object to every other object probe
		this._meshMap.forEach((map: Array<AObject>) => {
			map.forEach((object: AObject) => {
				map.forEach((otherObject: AObject) => {
					if (object !== otherObject) {
						console.log("adding to probe: " + object.mesh.name + " -> " + otherObject.mesh.name);
						object.addToProbe(otherObject);
					}
				});
				// add skybox to probe
				object.addToProbe(this._skybox);
			});
		});
	}

	private menuScene() {
		this.menuSetup();

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});

		this.loadBalls();
		this.bindPaddles();
	}

	private lobbyScene() {
		this.lobbySetup();

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});

		this.loadBalls();
		this.bindPaddles();
	}

	private localScene() {
		this.localSetup();

		this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
			map.enable();
		});
		
		this.loadBalls();
		this.bindPaddles();
	}

	private onlineScene(match_id: number, gamemode: GameMode, players: IPlayer[], state?: PONG.PongState) {
		this.onlineSetup(match_id, gamemode, players, state);

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
			// add ball to all objects probe and objects to ball probe
			this._meshMap.get(this._currentMap.mapId)?.forEach((map: AObject) => {
				map.addToProbe(ballInstance);
				ballInstance.addToProbe(map);
			}
			);
		});
		// add ball to all balls probe
		this._ballInstances.forEach((ball: ClientBall) => {
			this._ballInstances.forEach((otherBall: ClientBall) => {
				if (ball !== otherBall) {
					ball.addToProbe(otherBall);
				}
			});
			// add skybox to probe
			ball.addToProbe(this._skybox);
		}
		);
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

	private handleKeyDown = (ev: KeyboardEvent) => {
		// Shift+Ctrl+Alt+I
		if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
			if (this._babylonScene.debugLayer.isVisible()) {
				this._babylonScene.debugLayer.hide();
			} else {
				this._babylonScene.debugLayer.show();
			}
		}

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