import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import { Vec2 } from "gl-matrix";

export default class ClientBall {
	private _scene: Scene;
	private _mesh: Mesh;
	private _physicsBody: PH2D.Body; // for reference

	public constructor(scene: Scene, physicsBody: PH2D.Body) {
		this._scene = scene;
		this._physicsBody = physicsBody;
		this._mesh = MeshBuilder.CreateSphere(
			"ball",
			{ diameter: PONG.K.ballRadius * 2 },
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			0.05,
			this._physicsBody.position.y
		);
		const material = new StandardMaterial("ballMaterial", this._scene);
		material.diffuseColor = Color3.White();
		material.specularColor = Color3.Black();
		this._mesh.material = material;
	}

	public update(dt: number): void {
		const ballPos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = ballPos.x;
		this._mesh.position.z = ballPos.y;
	}

	public get mesh(): Mesh {
		return this._mesh;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};