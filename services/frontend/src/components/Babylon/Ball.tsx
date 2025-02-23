import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

export default class Ball {
	private _scene: Scene;
	private _mesh: Mesh;
	private _position: BABYLON.Vector2 = new BABYLON.Vector2(0.5, 0);
	private _velocity: BABYLON.Vector2 = new BABYLON.Vector2(0, 0);

	public constructor(scene: Scene) {
		this._scene = scene;
		this.loadBallModel();
	}

	private loadBallModel = async () => {
		const container : BABYLON.AssetContainer = await BABYLON.LoadAssetContainerAsync(
			"scene.gltf",
			this._scene,
			{ rootUrl: "/assets/gltf/tennis_ball/" }
		);
		container.addAllToScene();
		console.log("Model loaded successfully.", container);
		this._mesh = container.meshes[0] as Mesh;
		this._mesh.position = new BABYLON.Vector3(this._position.x, this._position.y, 0);
	}

	public dispose() {
		this._mesh?.dispose();
	}
};