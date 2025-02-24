import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector2, Vector3, Color3, Color4, HemisphericLight, DirectionalLight, MeshBuilder, StandardMaterial } from "@babylonjs/core";

export default function createGroundScene(canvas: HTMLCanvasElement, engine: Engine) : Scene {
	const scene: Scene = new Scene(engine);

	const cameraTopDown: ArcRotateCamera = new ArcRotateCamera("CameraTopDown", -Math.PI / 2, 0, 5, Vector3.Zero(), scene);
	const cameraPlayerLeft: ArcRotateCamera = new ArcRotateCamera("CameraPlayerLeft", -Math.PI, Math.PI / 4, 5, Vector3.Zero(), scene);
	const cameraPlayerRight: ArcRotateCamera = new ArcRotateCamera("CameraPlayerRight", 0, Math.PI / 4, 5, Vector3.Zero(), scene);
	cameraTopDown.attachControl(canvas, true);
	cameraTopDown.lowerRadiusLimit = 1.5;
	cameraTopDown.upperRadiusLimit = 10;
	cameraTopDown.wheelPrecision = 50;
	const light1: DirectionalLight = new DirectionalLight("light1", new Vector3(1, -1, 0), scene);

	const groundMaterial = new StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseColor = new Color3(0, 1, 0);

	const ground = MeshBuilder.CreateGround("ground", {width: 4, height: 4}, scene);
	ground.position = new Vector3(0, 0, 0);
	ground.material = groundMaterial;



	return scene;
}