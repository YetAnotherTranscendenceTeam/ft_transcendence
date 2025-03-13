import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

export default class Wall {
	private _scene: Scene;
	private _material: StandardMaterial;
	private _mesh: Mesh;
	private _position: BABYLON.Vector2;	// x, z (top-down)
	private _size: BABYLON.Vector2;	// width, depth
	// private _velocity: BABYLON.Vector2 = new BABYLON.Vector2(0, 0);

	public constructor(scene: Scene, name: string, position: BABYLON.Vector2 = BABYLON.Vector2.Zero(), size: BABYLON.Vector2 = BABYLON.Vector2.One(), color: Color3 = Color3.White()) {
		this._position = position;
		this._scene = scene;
		this._size = size;
		this.loadMaterial().then(() => {
			this.createWallModel(name, color);
		});
	}

	private loadMaterial = async () => {
		const container : BABYLON.AssetContainer = await BABYLON.LoadAssetContainerAsync(
			"red_brick_4k.gltf",
			this._scene,
			{ rootUrl: "/assets/gltf/red_brick_4k/" }
		);
		// container.addAllToScene();
		console.log("Texture loaded successfully.", container);
		// return container.materials[0] as StandardMaterial;
		this._material = (container.materials[0] as StandardMaterial).clone("wallMaterial");
		// container.dispose();
		this._material.backFaceCulling = true;
	}

	private createWallModel = (name : string, color : Color3) => {
		const height = 0.1;
		const faceUV = [];
		faceUV[0] = new BABYLON.Vector4(0, 0, this._size.x, height); // Rear
		faceUV[1] = new BABYLON.Vector4(0, 0, this._size.x, height); // Front
		faceUV[2] = new BABYLON.Vector4(0, 0, this._size.y, height); // Right
		faceUV[3] = new BABYLON.Vector4(0, 0, this._size.y, height); // Left
		faceUV[4] = new BABYLON.Vector4(0, 0, this._size.x, this._size.y); // Top
		faceUV[5] = new BABYLON.Vector4(0, 0, this._size.x, this._size.y); // Bottom
		this._mesh = MeshBuilder.CreateBox(
			name,
			{
				width: this._size.x,
				height: height,
				depth: this._size.y,
				faceUV: faceUV,
				wrap: true
			},
			this._scene
		);
		this._mesh.material = this._material;
		this._mesh.position = new BABYLON.Vector3(this._position.x, 0, this._position.y);
		console.log("Wall created successfully.", this._mesh);
	}

	public dispose() {
		this._mesh?.dispose();
	}
};