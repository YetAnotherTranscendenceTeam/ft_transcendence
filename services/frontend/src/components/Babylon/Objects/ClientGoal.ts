import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import { addGlow, updateInputBlock } from "../Materials/utils";
import createGoalMaterial from "../Materials/goalMaterial";

const isDevelopment = process.env.NODE_ENV !== "production";

export default class ClientGoal extends AObject {
	// private override _material: BABYLON.NodeMaterial;

	public constructor(scene: Scene, name: string, physicsBody: PONG.Goal) {
		super(scene, physicsBody);
		if (!isDevelopment) {
			this._isEnabled = false;
			return;
		}
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
		// updateInputBlock(this._material, {
		// 	hexagonSize: new BABYLON.Vector2(physicsBody.height, 1),
		// });
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
