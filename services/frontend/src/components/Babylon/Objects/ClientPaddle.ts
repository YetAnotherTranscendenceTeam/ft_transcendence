import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import { PaddleSync } from "../types";

export default class ClientPaddle extends AObject {

	public constructor(scene: Scene, name: string, physicsBody: PH2D.Body) {
		super(scene, physicsBody);
		this._mesh = MeshBuilder.CreateBox(
			name,
			{ width: PONG.K.paddleSize.x, height: 0.05, depth: PONG.K.paddleSize.y },
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			0.05,
			this._physicsBody.position.y
		);
		this._material = ClientPaddle.template.clone("paddleMaterial");
		this._mesh.material = this._material;
	}

	public update(dt: number): void {
		if (!this._isEnabled) return;
		const paddlePos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = paddlePos.x;
		this._mesh.position.z = paddlePos.y;
	}

	public move(dir: number): void {
		if (!this._isEnabled) return;
		const speed = PONG.K.paddleSpeed;
		this._physicsBody.velocity = new Vec2(0, dir * speed);
	}

	public sync(paddleSync: PaddleSync) {
		this._physicsBody.position.y = paddleSync.y
		this.move(paddleSync.movement);
	}
};