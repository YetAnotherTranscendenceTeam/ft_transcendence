import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3, PolygonMeshBuilder } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import { glV2ArrayToBabylonV3Array } from "../vectorUtils";
import earcut from "earcut";

export default class ClientWall extends AObject {
	public constructor(scene: Scene, name: string, physicsBody: PONG.Wall) {
		super(scene, physicsBody);

		const vertices: Vec2[]= (physicsBody.shape as PH2D.PolygonShape).vertices;
		const corners = glV2ArrayToBabylonV3Array(vertices);
		this._mesh = MeshBuilder.ExtrudePolygon(
			name,
			{
				shape: corners,
				depth: 0.5,
				sideOrientation: Mesh.DOUBLESIDE,
				updatable: true
			},
			this._scene,
			earcut
		);

		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			0.25,
			this._physicsBody.position.y
		);

		const material = new StandardMaterial("wallMaterial", this._scene);
		material.diffuseColor = new Color3(0.25, 0.5, 0.62);
		material.specularColor = new Color3(0, 0, 0);
		this._mesh.material = material;
	}

	public update(dt: number): void {
		if (!this._isEnabled) return;
		const wallPos = this._physicsBody.interpolatePosition(dt) as Vec2;
		this._mesh.position.x = wallPos.x;
		this._mesh.position.z = wallPos.y;
	}
};