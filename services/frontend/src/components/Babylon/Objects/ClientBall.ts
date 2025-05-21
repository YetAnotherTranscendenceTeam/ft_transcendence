import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import createBallMaterial, { createDamageMaterial } from "../Materials/ballMaterial";
import { addGlow, updateInputBlock } from "../Materials/utils";
import { readBuilderProgram } from "typescript";

function bounceToTreshold(bounce: number): number {
	// Convert health to a threshold value between 0 and 1
	const minThreshold = -0.15;
	const maxThreshold = 0.01;
	return (bounce / PONG.K.ballBounceMax) * (maxThreshold - minThreshold) + minThreshold;
}

export default class ClientBall extends AObject {
	private _used: boolean;
	private _damageMesh: Mesh;
	private _damageMaterial: BABYLON.NodeMaterial;
	private _pointLight: BABYLON.PointLight;

	public constructor(scene: Scene, name: string, physicsBody: PH2D.Body) {
		super(scene, physicsBody);
		this._mesh = MeshBuilder.CreateSphere(
			name,
			{ diameter: PONG.K.ballRadius * 2 },
			this._scene
		);
		this._damageMesh = MeshBuilder.CreateSphere(
			name + "Damage",
			{ diameter: PONG.K.ballRadius * 2 + 0.05 },
			this._scene
		);
		this._used = false;
		if (physicsBody) {
			this._mesh.position = new BABYLON.Vector3(
				this._physicsBody.position.x,
				PONG.K.ballRadius,
				this._physicsBody.position.y
			);
			this._used = true;
		} else {
			this._mesh.position = new BABYLON.Vector3(0, PONG.K.ballRadius, 0);
		}

		this._damageMesh.position = this._mesh.position;
		this._material = createBallMaterial(name + "Mat", this._scene);
		// this._material.alpha = 0.99;
		this._mesh.material = this._material;

		this._damageMaterial = createDamageMaterial(name + "DamageMat", this._scene);
		this._damageMesh.material = this._damageMaterial;
		addGlow(this._scene, this._damageMesh);
		this._damageMesh.setEnabled(false);

		this._pointLight = new BABYLON.PointLight(name + "PointLight", this._mesh.position, this._scene);
		this._pointLight.diffuse = new Color3(1, 0.3, 0);
		this._pointLight.specular = new Color3(1, 0.3, 0);
		this._pointLight.intensity = 0;
		this._pointLight.excludedMeshes = [this._mesh, this._damageMesh];
		// this._pointLight.setEnabled(false);
		console.log("ClientBall", this._used);
	}

	public update(dt: number, interpolation: number): void {
		if (!this._used) {
			return;
		}
		const ball = this._physicsBody as PONG.Ball;
		if (ball.bounceCount > 0) {
			this._damageMesh.setEnabled(true);
			// this._pointLight.setEnabled(true);
		} else {
			this._damageMesh.setEnabled(false);
			// this._pointLight.setEnabled(false);
			this._pointLight.intensity = 0;
		}
		if (this._damageMesh.isEnabled()) {
			updateInputBlock(this._damageMaterial, {
				treshold: bounceToTreshold(ball.bounceCount),
			});
			this._pointLight.intensity = ball.bounceCount / 10;
		}
		super.update(dt, interpolation);
		this._damageMesh.position = this._mesh.position;
		this._pointLight.position = this._mesh.position.clone();
		// this._pointLight.position.y = PONG.K.ballRadius + 0.1;
	}
	
	public disable(): void {
		this._mesh?.setEnabled(false);
		this._damageMesh?.setEnabled(false);
		this._pointLight.intensity = 0;
		this._isEnabled = false;
		if (this._physicsBody) {
			this._physicsBody.filter = 1;
		}
	}
	
	public enable(): void {
		this._mesh?.setEnabled(true);
		this._damageMesh?.setEnabled(true); // REMOVE THIS
		this._isEnabled = true;
		if (this._physicsBody) {
			this._physicsBody.filter = 0;
		}
	}

	public updateBodyReference(physicsBody: PH2D.Body): void {
		if (!physicsBody) {
			this._used = false;
			this._physicsBody = undefined;
			return;
		}
		this._used = true;
		this._physicsBody = physicsBody;
	}

	public meshes(): Mesh[] {
		return [this._mesh, this._damageMesh];
	}
};