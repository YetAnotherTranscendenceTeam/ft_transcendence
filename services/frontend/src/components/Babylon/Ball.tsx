import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

export default class Ball {
	private _scene: Scene;
	private _mesh: Mesh;
	private _radius: number = 0.1;

	public constructor(scene: Scene) {
		this._scene = scene;
	}

	public update(): void {
	}

	public get mesh(): Mesh {
		return this._mesh;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};