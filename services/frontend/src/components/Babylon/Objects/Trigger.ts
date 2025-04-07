import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

export default class Trigger {
	private _scene: Scene;
	private _material: StandardMaterial;
	private _mesh: Mesh;
	private _position: BABYLON.Vector2;	// x, z (top-down)
	private _size: BABYLON.Vector2;	// width, depth
	// private _velocity: BABYLON.Vector2 = new BABYLON.Vector2(0, 0);

	public constructor(scene: Scene, name: string, position: BABYLON.Vector2 = BABYLON.Vector2.Zero(), size: BABYLON.Vector2 = BABYLON.Vector2.One(), color: Color3 = Color3.White()) {
		this._position = position;
		this._scene = scene;
		this._size = size;

		this._material = new StandardMaterial("wallMaterial", this._scene);
		this._material.diffuseColor = color;
		this._material.specularColor = new Color3(0, 0, 0);
		this._material.alpha = 0.5;
		this.createTriggerModel(name);
	}

	private createTriggerModel = (name : string) => {
		const height = 0.1;
		this._mesh = MeshBuilder.CreateBox(
			name,
			{
				width: this._size.x,
				height: height,
				depth: this._size.y,
			},
			this._scene
		);
		this._mesh.material = this._material;
		this._mesh.position = new BABYLON.Vector3(this._position.x, height / 2, this._position.y);
		console.log("TriggerBox created successfully.", this._mesh);
	}

	public dispose() {
		this._mesh?.dispose();
	}
};
