import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";

// const isDevelopment = process.env.NODE_ENV !== "production";
const isDevelopment = false;

export default class ClientGoal extends AObject {

	public constructor(scene: Scene, name: string, physicsBody: PONG.Goal) {
		super(scene, physicsBody);
		if (!isDevelopment) {
			this._isEnabled = false;
			return;
		}
		this._mesh = MeshBuilder.CreateBox(
			name,
			{
				width: physicsBody.width,
				height: 0.1,
				depth: physicsBody.height,
			},
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			0.05,
			this._physicsBody.position.y
		);
		const material = new StandardMaterial("wallMaterial", this._scene);
		material.diffuseColor = Color3.Red();
		material.specularColor = new Color3(0, 0, 0);
		material.alpha = 0.5;
		this._mesh.material = material;
	}

	public update(dt: number): void {
		if (!this._isEnabled) return;
		const goalPos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = goalPos.x;
		this._mesh.position.z = goalPos.y;
	}

	public enable(): void {
		if (!isDevelopment) {
			return;
		}
		super.enable();
	}

	public dispose() {
		this._mesh?.dispose();
	}
};
