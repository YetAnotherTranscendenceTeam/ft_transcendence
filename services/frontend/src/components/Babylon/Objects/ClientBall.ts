import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";

export default class ClientBall extends AObject {

	public constructor(scene: Scene, physicsBody: PH2D.Body) {
		super(scene, physicsBody);
		this._mesh = MeshBuilder.CreateSphere(
			"ball",
			{ diameter: PONG.K.ballRadius * 2 },
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			PONG.K.ballRadius,
			this._physicsBody.position.y
		);
		this._material = ClientBall.template.clone("ballMaterial");
		this._mesh.material = this._material;
	}

	public update(dt: number): void {
		if (!this._isEnabled) return;
		const ballPos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = ballPos.x;
		this._mesh.position.z = ballPos.y;
	}
};