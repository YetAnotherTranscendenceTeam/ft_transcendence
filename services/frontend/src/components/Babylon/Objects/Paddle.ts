import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import { Vec2 } from "gl-matrix";

export default class ClientPaddle {
	private _scene: Scene;
	private _mesh: Mesh;
	private _physicsBody: PH2D.Body; // for reference

	public constructor(scene: Scene, physicsBody: PH2D.Body) {
		this._scene = scene;
		this._physicsBody = physicsBody;
		this._mesh = MeshBuilder.CreateBox(
			"paddle",
			{ width: PONG.K.paddleSize.x, height: 0.05, depth: PONG.K.paddleSize.y },
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			0.05,
			this._physicsBody.position.y
		);
		const material = new StandardMaterial("wallMaterial", this._scene);
		material.diffuseColor = Color3.White();
		material.specularColor = Color3.Black();
		this._mesh.material = material;
	}

	public update(dt: number): void {
		const paddlePos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = paddlePos.x;
		this._mesh.position.z = paddlePos.y;
		this._physicsBody.velocity = new Vec2(0, 0);
	}

	public move(dir: number): void {
		const speed = PONG.K.paddleSpeed;
		this._physicsBody.velocity = new Vec2(0, dir * speed);
	}

	public get mesh(): Mesh {
		return this._mesh;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};