import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import createEventBoxMaterial from "../Materials/eventBoxMaterial";

const isDevelopment = process.env.NODE_ENV !== "production";

export default class ClientEventBox extends AObject {

	public constructor(scene: Scene, name: string, physicsBody: PONG.EventBox) {
		super(scene, physicsBody);
		this._isEnabled = false;
		this._mesh = MeshBuilder.CreateCylinder(
			name,
			{
				diameter: (physicsBody.shape as PH2D.CircleShape).radius * 2,
				height: 0.1,
				tessellation: 6,
				sideOrientation: Mesh.DOUBLESIDE,
			},
			this._scene
		)
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			0.05,
			this._physicsBody.position.y
		);
		this._material = createEventBoxMaterial(name + "Mat", this._scene);
		this._mesh.material = this._material;
	}

	public update(dt: number, interpolation: number): void {
		const physicsBody = this._physicsBody as PONG.EventBox;
		if (physicsBody.active) {
			this.enable();
		} else {
			this.disable();
		}
		super.update(dt, interpolation);
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
