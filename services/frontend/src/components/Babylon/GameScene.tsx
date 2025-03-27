import "@babylonjs/inspector";
import { Engine, Scene, Camera, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Color3, Color4, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import { CellMaterial } from "@babylonjs/materials";
// import { CircleShape, Body } from "physics-engine";
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";

export default class GameScene {
	private _canvas: HTMLCanvasElement;
	private _engine: Engine;
	private _scene: Scene;

	private _camera: ArcRotateCamera;
	private _light: HemisphericLight;

	private _ball: Ball;
	private _wall1: Wall;
	private _wall2: Wall;
	
	public constructor(canvas: HTMLCanvasElement, engine: Engine) {
		this._canvas = canvas;
		this._engine = engine;
		this._scene = new Scene(engine);
		
		this._camera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 7.5, Vector3.Zero(), this._scene);
		this._camera.attachControl(canvas, true);
		this._camera.lowerRadiusLimit = 1.5;
		this._camera.upperRadiusLimit = 10;
		this._camera.wheelPrecision = 50;
		
		this._light = new HemisphericLight("light1", new Vector3(0, 1, 0), this._scene);
		
		this._ball = new Ball(this._scene);
		this._wall1 = new Wall(this._scene, "wall1", new Vector2(0, 2), new Vector2(6, 0.25));
		this._wall2 = new Wall(this._scene, "wall2", new Vector2(0, -2), new Vector2(6, 0.25));
		const ground = MeshBuilder.CreateGround("ground", {width: 6, height: 4}, this._scene);
		const material = new StandardMaterial("groundMaterial", this._scene);
		material.diffuseColor = new Color3(0.5, 0.5, 0.5);
		material.specularColor = new Color3(0, 0, 0);
		ground.material = material;
	}
	
	public get scene() {
		return this._scene;
	}
	
	public render() {
		this._scene.render();
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
