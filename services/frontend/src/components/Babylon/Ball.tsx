import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";

export default class Ball {
	private _scene: Scene;
	private _mesh: Mesh;

	public constructor(scene: Scene) {
		this._scene = scene;
		this._mesh = MeshBuilder.CreateSphere(
			"ball",
			{ diameter: 0.1 },
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(0, 0, 0);
		const material = new StandardMaterial("ballMaterial", this._scene);
		material.diffuseColor = Color3.White();
		this._mesh.material = material;
	}

	// public update(): void {
	// 	this._mesh.position = new BABYLON.Vector3(this._physicsBody.position.x, 0, this._physicsBody.position.y);
	// }

	public get mesh(): Mesh {
		return this._mesh;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};