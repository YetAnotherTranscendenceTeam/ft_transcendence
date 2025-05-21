import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import { addGlow, updateInputBlock } from "../Materials/utils";
import createGoalMaterial from "../Materials/goalMaterial";

function healthToTreshold(health: number): number {
	// Convert health to a threshold value between 0 and 1
	const minThreshold = -0.1;
	const maxThreshold = 0.05;
	return (health / PONG.K.goalHealthMax) * (maxThreshold - minThreshold) + minThreshold;
}

export default class ClientGoal extends AObject {
	// private override _material: BABYLON.NodeMaterial;
	private _previousHealth: number;
	private _colorBlend: number;

	public constructor(scene: Scene, name: string, physicsBody: PONG.Goal) {
		super(scene, physicsBody);
		this._previousHealth = physicsBody.health;
		this._colorBlend = 0;
		const wallHeight: number = 0.1;
		const faceUVs = [
			new BABYLON.Vector4(0, 0, physicsBody.width, wallHeight), // Rear
			new BABYLON.Vector4(0, 0, physicsBody.width, wallHeight), // Front
			new BABYLON.Vector4(0, 0, physicsBody.height, wallHeight), // Right
			new BABYLON.Vector4(0, 0, physicsBody.height, wallHeight), // Left
			new BABYLON.Vector4(0, 0, physicsBody.width, physicsBody.height), // Top
			new BABYLON.Vector4(0, 0, physicsBody.width, physicsBody.height), // Bottom
		];
		this._mesh = MeshBuilder.CreateBox(
			name,
			{
				width: physicsBody.width,
				height: wallHeight,
				depth: physicsBody.height,
				faceUV: faceUVs,
				wrap: true,
			},
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			wallHeight / 2,
			this._physicsBody.position.y
		);
		this._material = createGoalMaterial();
		this._mesh.material = this._material;
		addGlow(this._scene, this._mesh);
		updateInputBlock(this._material, {
			colorBlend: this._colorBlend,
		});
	}

	public enable(): void {
		super.enable();
	}

	public dispose() {
		this._mesh?.dispose();
	}

	public override update(dt: number, interpolation: number): void {
		const body = this._physicsBody as PONG.Goal;
		if (this._colorBlend > 0) {
			this._colorBlend -= dt;
			if (this._colorBlend < 0) {
				this._colorBlend = 0;
			}
			updateInputBlock(this._material, {
				colorBlend: this._colorBlend,
			});
		}
		if (this._isEnabled && body.health <= 0) {
			this._isEnabled = false;
			this._mesh?.setEnabled(false);
		} else if (!this._isEnabled && body.health > 0) {
			this._isEnabled = true;
			this._mesh?.setEnabled(true);
		}
		if (this._previousHealth !== body.health) {
			this._previousHealth = body.health;
			if (body.health < PONG.K.goalHealthMax) {
				this._colorBlend = 1;
			}
			updateInputBlock(this._material, {
				treshold: healthToTreshold(body.health),
				colorBlend: this._colorBlend,
			});
		}
		super.update(dt, interpolation);
	}
};
