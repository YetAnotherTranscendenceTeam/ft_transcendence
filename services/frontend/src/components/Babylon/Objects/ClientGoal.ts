import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";

export default class ClientGoal extends AObject {

	public constructor(scene: Scene, name: string, physicsBody: PONG.Goal) {
		super(scene, physicsBody);
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
		this._material = ClientGoal.template.clone("goalMaterial");
		this._mesh.material = this._material;
	}

	public update(dt: number): void {
		if (!this._isEnabled) return;
		const goalPos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = goalPos.x;
		this._mesh.position.z = goalPos.y;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};
