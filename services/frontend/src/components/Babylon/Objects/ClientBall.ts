import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import createBallMaterial from "../Materials/ballMaterial";

export default class ClientBall extends AObject {
	private _used: boolean;

	public constructor(scene: Scene, name: string, physicsBody: PH2D.Body) {
		super(scene, physicsBody);
		this._mesh = MeshBuilder.CreateSphere(
			name,
			{ diameter: PONG.K.ballRadius * 2 },
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
		this._material = createBallMaterial(name + "Mat", this._scene);
		this._mesh.material = this._material;
	}

	public update(dt: number): void {
		if (!this._used) {
			return;
		}
		super.update(dt);
	}
	
	public disable(): void {
		console.log("disable");
		this._mesh?.setEnabled(false);
		this._isEnabled = false;
		if (this._physicsBody) {
			this._physicsBody.filter = 1;
		}
	}
	
	public enable(): void {
		console.log("enable");
		this._mesh?.setEnabled(true);
		this._isEnabled = true;
		if (this._physicsBody) {
			this._physicsBody.filter = 0;
		}
	}

	public updateBodyReference(physicsBody: PH2D.Body): void {
		if (!physicsBody) {
			this._used = false;
			this._physicsBody = undefined;
		}
		this._used = true;
		this._physicsBody = physicsBody;
	}
};