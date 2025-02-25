import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3, PhysicsAggregate, PhysicsShapeType, PhysicsBody } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';

export default class Ball {
	private _scene: Scene;
	// private _material: StandardMaterial;
	private _mesh: Mesh;
	private _body: PhysicsBody;
	private _shape: BABYLON.PhysicsShapeSphere;
	private _radius: number = 0.1;
	private _position: BABYLON.Vector2 = new BABYLON.Vector2(0, 0);	// x, z (top-down)
	private _velocity: BABYLON.Vector2;

	public constructor(scene: Scene) {
		this._scene = scene;
		// this.loadMaterial();
		this._velocity = new BABYLON.Vector2(Math.floor(Math.random() + 0.5) * 2 - 1, 0);
		this.createBallModel();
		this._shape = new BABYLON.PhysicsShapeSphere(new BABYLON.Vector3(0,0,0), this._radius, scene);
		const material = {friction: 0, restitution: 1};
		this._shape.material = material;
		this._body = new PhysicsBody(this._mesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene);
		this._body.shape = this._shape;
		this._body.setMassProperties({
			mass: 1,
			centerOfMass: new BABYLON.Vector3(0, 0, 0),
			inertia: new BABYLON.Vector3(1, 1, 1),
			inertiaOrientation: new BABYLON.Quaternion(0, 0, 0, 1)
		});
		// this._body.setLinearVelocity(new BABYLON.Vector3(this._velocity.x, 0, this._velocity.y));
		// this._body.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
		this._body.setLinearDamping(0);
		// this._body.setAngularDamping(0.1);
	}

	public launch = () => {
		this._body.setLinearVelocity(new BABYLON.Vector3(this._velocity.y, 0, this._velocity.x));
	}
	

	// private loadMaterial = async () => {
	// 	const container : BABYLON.AssetContainer = await BABYLON.LoadAssetContainerAsync(
	// 		"scene.gltf",
	// 		this._scene,
	// 		{ rootUrl: "/assets/gltf/tennis_ball/" }
	// 	);
	// 	container.addAllToScene();
	// 	console.log("Model loaded successfully.", container);
	// 	this._mesh = container.meshes[0] as Mesh;
	// 	this._mesh.position = new BABYLON.Vector3(this._position.x, this._position.y, 0);
	// }

	private createBallModel = () => {
		this._mesh = MeshBuilder.CreateSphere(
			"ball",
			{
				diameter: this._radius * 2
			},
			this._scene
		);
		this._mesh.position = new BABYLON.Vector3(this._position.x, 0, this._position.y);
		console.log("Ball created successfully.", this._mesh);
	}

	public get mesh() {
		return this._mesh;
	}

	public dispose() {
		this._body?.dispose();
		this._shape?.dispose();
		this._mesh?.dispose();
	}
};