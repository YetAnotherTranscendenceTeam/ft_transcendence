import { MeshBuilder, Mesh, Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import '@babylonjs/loaders';
import * as BABYLON from '@babylonjs/core';
import * as PH2D from "physics-engine";
import * as PONG from "pong";
import AObject from "./AObject";
import { Vec2 } from "gl-matrix";
import createEventBoxMaterial from "../Materials/eventBoxMaterial";
import { PongEventType } from "yatt-lobbies";

const PARTICULE_SPEED = 0.01;
const PARTICULE_GRAVITY = -0.001;
const PARTICULE_LIFE = 2;

export default class ClientEventBox extends AObject {
	private _name: string;
	private _sps: BABYLON.SolidParticleSystem;
	private _time: number;
	private _justTurnedOff: boolean;
	private _dummy: BABYLON.Mesh;
	private _Y: number;

	public constructor(scene: Scene, name: string, physicsBody: PONG.EventBox) {
		super(scene, physicsBody);
		const shape = physicsBody.shape as PH2D.CircleShape;
		this._name = name;
		this._isEnabled = false;
		this._justTurnedOff = false;
		this._time = 100;
		this._Y = Math.sqrt(shape.radius * shape.radius + shape.radius * shape.radius) + 0.1;
		const size = shape.radius * 2 * Math.SQRT1_2;
		this._dummy = MeshBuilder.CreateSphere(
			name + "Dummy",
			{
				diameter: size,
				segments: 4,
				sideOrientation: Mesh.DOUBLESIDE,
			},
			this._scene
		);
		this._dummy.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			Math.sqrt(shape.radius * shape.radius + shape.radius * shape.radius) + 0.1,
			this._physicsBody.position.y
		);
		this._mesh = this._dummy;
		this._material = createEventBoxMaterial(name + "Mat", this._scene);
		this._mesh.material = this._material.clone(this._name + "Mat");
	}

	public update(dt: number, interpolation: number): void {
		const physicsBody = this._physicsBody as PONG.EventBox;
		if (physicsBody.active) {
			if (!this._isEnabled) {
				this._time = 0;
				this.createSPS();
			}
			this.enable();
		} else {
			this._time += dt;
			if (this._isEnabled) {
				this._justTurnedOff = true;
				(this._mesh.material as BABYLON.PBRMaterial).emissiveIntensity = 0.2;
				(this._mesh.material as BABYLON.PBRMaterial).alpha = 0.2;
			} else {
				this._justTurnedOff = false;
			}
			this._physicsBody.filter = 1;
			this._isEnabled = false
			if (this._time > PARTICULE_LIFE) {
				this._mesh.setEnabled(false);
				this._sps?.dispose();
			} else {
				this._sps?.setParticles();
			}
		}
		if (!this._isEnabled) return;
		const pos = this._physicsBody.interpolatePosition(interpolation) as Vec2;
		this._mesh.position.x = pos.x;
		this._mesh.position.y = this._Y;
		this._mesh.position.z = pos.y;
		this._mesh.rotation.y += 0.5 * dt;
		this._mesh.rotation.x += 0.3 * dt;
		this._mesh.rotation.z += 0.6 * dt;
	}

	private createModel(): BABYLON.Mesh {
		const shape = this._physicsBody.shape as PH2D.CircleShape;
		const size = shape.radius * 2 * Math.SQRT1_2;
		const model = MeshBuilder.CreateBox(
			this._name,
			{
				width: size,
				height: size,
				depth: size,
				sideOrientation: Mesh.DOUBLESIDE,
			},
			this._scene
		);

		model.increaseVertices(8);

		return model;
	}

	private createSPS(): void {
		if (this._sps) {
			this._sps.dispose();
			this._sps = undefined;
			this._mesh.material.dispose();
			this._mesh.dispose();
			this._mesh = undefined;
		}
		const body = this._physicsBody as PONG.EventBox;
		const shape = this._physicsBody.shape as PH2D.CircleShape;
		const model = this.createModel();
		this._sps = new BABYLON.SolidParticleSystem(this._name + "SPS", this._scene);
		this._sps.digest(model, {number: 64});
		model.dispose();
		this._mesh = this._sps.buildMesh();
		this._sps.setParticles();
		this._sps.refreshVisibleSize();

		const physicsBody = this._physicsBody as PONG.EventBox;
		this._sps.updateParticle = (particle: any) => {
			if (physicsBody.active) {
				return particle;
			}
			if (this._justTurnedOff) {
				particle.velocity.x = ((Math.random() - 0.5) * PARTICULE_SPEED);
				particle.velocity.y = ((Math.random() - 0.5) * PARTICULE_SPEED);
				particle.velocity.z = ((Math.random() - 0.5) * PARTICULE_SPEED);
				particle.rand = Math.random() / 100;
				if (particle.rand === 0) {
					particle.rand = 0.0001;
				}
			}

			if (!this._justTurnedOff) {
				particle.position.x += particle.velocity.x;
				particle.position.y += particle.velocity.y;
				particle.position.z += particle.velocity.z;
				
				// rotate
				particle.rotation.x += (particle.velocity.z) * particle.rand;
				particle.rotation.y += (particle.velocity.x) * particle.rand;
				particle.rotation.z += (particle.velocity.y) * particle.rand;
			}
			return particle;
		};

		
		this._mesh.position = new BABYLON.Vector3(
			this._physicsBody.position.x,
			Math.sqrt(shape.radius * shape.radius + shape.radius * shape.radius) + 0.1,
			this._physicsBody.position.y
		);
		this._mesh.rotation.x = Math.random() * Math.PI * 2;
		this._mesh.rotation.y = Math.random() * Math.PI * 2;
		this._mesh.rotation.z = Math.random() * Math.PI * 2;
		this._mesh.material = this._material.clone(this._name + "Mat");
		let color: BABYLON.Color3;
		switch (body.eventType) {
			case PongEventType.MULTIBALL:
				color = BABYLON.Color3.FromHexString("#e88b33");
				break;
			case PongEventType.ATTRACTOR:
				color = BABYLON.Color3.FromHexString("#e32f2f");
				break;
			case PongEventType.ICE:
				color = BABYLON.Color3.FromHexString("#a1e9e8");
				break;
			default:
				color = BABYLON.Color3.White();
				break;
		}
		(this._mesh.material as BABYLON.PBRMaterial).albedoColor = color;
		(this._mesh.material as BABYLON.PBRMaterial).emissiveColor = color;
	}

	public enable(): void {
		super.enable();
	}

	public disable(): void {
		super.disable();
		this._justTurnedOff = false;
		this._time = 10;
		this._sps?.dispose();
		this._sps = undefined;
	}

	public dispose() {
		this._mesh?.dispose();
	}
};
