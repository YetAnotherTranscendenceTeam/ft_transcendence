import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3, PolygonMeshBuilder } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import { glV2ArrayToBabylonV3Array } from "../vectorUtils";
import earcut from "earcut";

export default class ClientObstacle extends AObject {
	public constructor(scene: Scene, name: string, physicsBody: PONG.Obstacle) {
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
			0.5,
			this._physicsBody.position.y
		);

		this._material = ClientObstacle.template.clone("obstacleMaterial");
		this._mesh.material = this._material;
	}
};