import { Engine, Scene, MeshBuilder } from "@babylonjs/core";

export default function createDefaultScene(canvas: HTMLCanvasElement, engine: Engine) : Scene {
	const scene: Scene = new Scene(engine);

	const box = MeshBuilder.CreateBox("box", {});
    scene.createDefaultCameraOrLight(true, true, true);
    scene.createDefaultEnvironment();
	
	return scene;
}