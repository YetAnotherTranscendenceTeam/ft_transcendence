import "@babylonjs/inspector";
import { Engine, Scene, Camera, ArcRotateCamera, Vector2, Vector3, HemisphericLight, Color3, Color4 } from "@babylonjs/core";
import Ball from "./Ball";
import Wall from "./Wall";
import { CellMaterial } from "@babylonjs/materials";

export default function createGameScene(canvas: HTMLCanvasElement, engine: Engine) : Scene {
	const scene: Scene = new Scene(engine);

	const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 5, Vector3.Zero(), scene);
	const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 4, 5, Vector3.Zero(), scene);
	const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 4, 5, Vector3.Zero(), scene);
	cameraTopDown.attachControl(canvas, true);
	cameraTopDown.lowerRadiusLimit = 1.5;
	cameraTopDown.upperRadiusLimit = 10;
	cameraTopDown.wheelPrecision = 50;
	// cameraTopDown.mode = Camera.ORTHOGRAPHIC_CAMERA;
	// const width = 3 * 1.5;

	// cameraTopDown.orthoLeft = (-1.2 * width) / 2;
	// cameraTopDown.orthoRight = -cameraTopDown.orthoLeft;
	// const ratio = canvas.height / canvas.width;
	// if (cameraTopDown.orthoLeft && cameraTopDown.orthoRight) {
	// 	cameraTopDown.orthoTop = cameraTopDown.orthoRight * ratio;
	// 	cameraTopDown.orthoBottom = cameraTopDown.orthoLeft * ratio;
	// }

	const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

	const sphere: Ball = new Ball(scene);

	const wall1: Wall = new Wall(scene, "wall1", new Vector2(0, 1.5), new Vector2(4, 0.1));
	const wall2: Wall = new Wall(scene, "wall2", new Vector2(0, -1.5), new Vector2(4, 0.1));

	// scene.autoClear = false;
	// scene.clearColor = Color4.FromColor3(Color3.Black());
	return scene;
}