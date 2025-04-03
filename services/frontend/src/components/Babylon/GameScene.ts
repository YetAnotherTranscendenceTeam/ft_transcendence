import "@babylonjs/inspector";
import { Engine, Scene, Camera, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Color3, Color4, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import Ball from "./Ball";
import Paddle from "./Paddle";
import Wall from "./Wall";
import { CellMaterial } from "@babylonjs/materials";
// import { CircleShape, Body } from "physics-engine";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import { Pong, PongState } from "pong";
import { keyState } from "./types";

export default class PongScene extends Pong {
	private _canvas: HTMLCanvasElement;
	private _engine: Engine;
	private _keyboard: Map<string, keyState>;
	private _babylonScene: Scene;

	private _camera: ArcRotateCamera;
	private _light: HemisphericLight;

	private _ballInstances: Ball[];
	private _paddleInstance: Map<number, Paddle>;
	
	public constructor(canvas: HTMLCanvasElement, engine: Engine, keyboard: Map<string, keyState>) {
		super();
		this._canvas = canvas;
		this._engine = engine;
		this._keyboard = keyboard;
		this._babylonScene = new Scene(engine);
		this._ballInstances = [];
		this._paddleInstance = new Map<number, Paddle>();
		
		this._camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 12.5, Vector3.Zero(), this._babylonScene);
		// this._camera.attachControl(canvas, true);
		// this._camera.lowerRadiusLimit = 1.5;
		// this._camera.upperRadiusLimit = 15;
		// this._camera.wheelPrecision = 50;
		
		this._light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._babylonScene);
		
		// this._ball = new Ball(this._babylonScene);
		// this._wall1 = new Wall(this._babylonScene, "wall1", new Vector2(0, 2), new Vector2(6, 0.25));
		// this._wall2 = new Wall(this._babylonScene, "wall2", new Vector2(0, -2), new Vector2(6, 0.25));
		// const ground = MeshBuilder.CreateGround("ground", {width: 6, height: 4}, this._babylonScene);
		// const material = new StandardMaterial("groundMaterial", this._babylonScene);
		// material.diffuseColor = new Color3(0.5, 0.5, 0.5);
		// material.specularColor = new Color3(0, 0, 0);
		// ground.material = material;
	}

	public newGame(match_id: number, gamemode: GameMode, players: IPlayer[], state?: PongState) {
		this.setup(match_id, gamemode, players, state);
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Black());
		// this._babylonScene.createDefaultEnvironment();
		
		this._ballInstances = [];
		this._paddleInstance = new Map<number, Paddle>();
		this._balls.forEach((ball: PH2D.Body) => {
			const ballInstance: Ball = new Ball(this._babylonScene, ball);
			this._ballInstances.push(ballInstance);
		});
		this._paddles.forEach((paddle: PH2D.Body, playerId: number) => {
			const paddleInstance: Paddle = new Paddle(this._babylonScene, paddle);
			this._paddleInstance.set(playerId, paddleInstance);
		});
		// default setup
		const wall1: Wall = new Wall(this._babylonScene, "wall1", new Vector2(0, -4), new Vector2(10, 0.2));
		const wall2: Wall = new Wall(this._babylonScene, "wall2", new Vector2(0, 4), new Vector2(10, 0.2));
	}

	public startGame() {
		this.start();
		this._babylonScene.clearColor = Color4.FromColor3(Color3.Gray());
	}
	
	public get scene() {
		return this._babylonScene;
	}

	public update() {
		this.playerUpdate();

		let dt: number = this._engine.getDeltaTime() / 1000;
		dt = this.physicsUpdate(dt);
		this._paddleInstance.forEach((paddle: Paddle) => {
			paddle.update(dt);
		});
		this._ballInstances.forEach((ball: Ball) => {
			ball.update(dt);
		});

		if (this._keyboard.get("c") === keyState.PRESSED || this._keyboard.get("c") === keyState.HELD) {
			console.log("paddle 0 position: ", this._paddles.get(0)?.position);
			console.log("paddle 1 position: ", this._paddles.get(1)?.position);
			console.log("ball position: ", this._balls[0]?.position);
		}
	}
	
	public render() {
		this._babylonScene.render();
	}
	
	// private playerUpdate(playerId: number) {
	// 	const paddle: Paddle | undefined = this._paddleInstance.get(playerId);
	// 	if (paddle) {
	// 		let moveDirection: number = 0;
	// 		let keyStateProbe: keyState = this._keyboard.get("ArrowUp") || keyState.IDLE;
	// 		if (keyStateProbe === keyState.HELD || keyStateProbe === keyState.PRESSED) {
	// 			moveDirection += 1;
	// 		}
	// 		keyStateProbe = this._keyboard.get("ArrowDown") || keyState.IDLE;
	// 		if (keyStateProbe === keyState.HELD || keyStateProbe === keyState.PRESSED) {
	// 			moveDirection -= 1;
	// 		}
	// 		paddle.move(moveDirection);
	// 	}
	// }

	private playerUpdate() {
		let paddle: Paddle | undefined = this._paddleInstance.get(1);
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
}

// export default function createGameScene(canvas: HTMLCanvasElement, engine: Engine) : Scene {
// 	const scene: Scene = new Scene(engine);

// 	const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 7.5, Vector3.Zero(), scene);
// 	const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 3, 5, new Vector3(-2, 0, 0), scene);
// 	const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 3, 5, new Vector3(2, 0, 0), scene);
// 	cameraTopDown.attachControl(canvas, true);
// 	cameraTopDown.lowerRadiusLimit = 1.5;
// 	cameraTopDown.upperRadiusLimit = 10;
// 	cameraTopDown.wheelPrecision = 50;
// 	// cameraTopDown.mode = Camera.ORTHOGRAPHIC_CAMERA;
// 	// const width = 3 * 1.5;

// 	// cameraTopDown.orthoLeft = (-1.2 * width) / 2;
// 	// cameraTopDown.orthoRight = -cameraTopDown.orthoLeft;
// 	// const ratio = canvas.height / canvas.width;
// 	// if (cameraTopDown.orthoLeft && cameraTopDown.orthoRight) {
// 	// 	cameraTopDown.orthoTop = cameraTopDown.orthoRight * ratio;
// 	// 	cameraTopDown.orthoBottom = cameraTopDown.orthoLeft * ratio;
// 	// }

// 	// physicalBall.addEventListener("collision", (event: CustomEventInit<{emitter: PH2D.Body, other: PH2D.Body, manifold: PH2D.Manifold}>) => {
// 	// 	const { emitter, other, manifold } = event.detail;
// 	// 	console.log(emitter, other, manifold);
// 	// });


// 	const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// 	// const sphere: Ball = new Ball(scene);
// 	const sphere: Ball = undefined;

// 	const wall1: Wall = new Wall(scene, "wall1", new Vector2(0, 2), new Vector2(6, 0.25));
// 	const wall2: Wall = new Wall(scene, "wall2", new Vector2(0, -2), new Vector2(6, 0.25));

// 	// scene.autoClear = false;
// 	// scene.clearColor = Color4.FromColor3(Color3.Black());
// 	return scene;
// }
