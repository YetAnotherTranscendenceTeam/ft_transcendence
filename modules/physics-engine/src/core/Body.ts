import { Manifold } from "./Manifold.js";
import { Shape } from "./Shape/Shape.js";
import { MassData, Material, PhysicsType } from "./properties.js";
import { Vec2 } from "gl-matrix";

export class Body extends EventTarget {
	private static _idCounter: number = 0;

	private _id: number;

	private _type: PhysicsType;
	private _shape: Shape;

	private _material: Material;
	private _massData: MassData;

	private _force: Vec2;

	private _angularVelocity: number;
	private _torque: number;
	private _orientation: number;

	private _position: Vec2;
	private _velocity: Vec2;

	constructor(type: PhysicsType = PhysicsType.DYNAMIC, shape: Shape, material: Material, position: Vec2 = Vec2.create(), velocity: Vec2 = Vec2.create()) {
		super();
		this._id = Body._idCounter++;
		this._type = type;
		this._shape = shape;
		this._material = material;
		this._force = Vec2.create();
		this._angularVelocity = 0;
		this._torque = 0;
		this._orientation = 0;
		this._position = position;
		console.log("position1", this._position);
		console.log("position2", this._position[0], this._position[1]);
		console.log("position3", this._position.x, this._position.y);
		this._velocity = velocity;
		console.log("velocity", this._velocity);
		if (this._type === PhysicsType.DYNAMIC) {
			this._massData = this._shape.computeMass(this._material.density);
		} else {
			this._massData = {
				mass: 0,
				invMass: 0,
				inertia: 0,
				invInertia: 0
			};
		}
	}

	public applyForce(force: Vec2): void {
		Vec2.add(this._force, this._force, force);
	}

	public applyTorque(torque: number): void {
		this._torque += torque;
	}

	public applyImpulse(impulse: Vec2, contact: Vec2): void {
		if (this._type !== PhysicsType.DYNAMIC || this._massData.invMass === 0) {
			return;
		}
		Vec2.add(this._velocity, this._velocity, Vec2.scale(Vec2.create(), impulse, this._massData.invMass));
		this._angularVelocity += this._massData.invInertia * (contact.x * impulse.y - contact.y * impulse.x);
	}

	public integrateForces(dt: number, gravity: Vec2): void {
		if (this._type !== PhysicsType.DYNAMIC || this._massData.invMass === 0) {
			return;
		}

		const step = dt * 0.5;
		let tmp: Vec2 = Vec2.create();
		// this._velocity.add(
		// 	Vec2.scale(
		// 		Vec2.create(),
		// 		Vec2.add(
		// 			Vec2.create(),
		// 			gravity,
		// 			Vec2.scale(
		// 				Vec2.create(),
		// 				this._force,
		// 				this._massData.invMass
		// 			)
		// 		),
		// 		step
		// 	)
		// );
		Vec2.scale(tmp, this._force, this._massData.invMass);
		Vec2.add(tmp, gravity, tmp);
		Vec2.scale(tmp, tmp, step);
		Vec2.add(this._velocity, this._velocity, tmp);
		this._angularVelocity += step * this._torque * this._massData.invInertia;
	}

	public integrateVelocity(dt: number, gravity: Vec2): void {
		if (this._type !== PhysicsType.DYNAMIC || this._massData.invMass === 0) {
			return;
		}

		this._position.add(Vec2.scale(Vec2.create(), this._velocity, dt));
		this._orientation += this._angularVelocity * dt;
		this._setOrientation(this._orientation);
		this.integrateForces(dt, gravity);
	}

	public resetForces(): void {
		Vec2.set(this._force, 0, 0);
		this._torque = 0;
	}

	public onCollision(other: Body, manifold: Manifold): void {
		this.dispatchEvent(new CustomEvent("collision", { detail: { emitter: this, other, manifold } }));
	}

	public get id(): number {
		return this._id;
	}

	public get type(): PhysicsType {
		return this._type;
	}

	public get shape(): Shape {
		return this._shape;
	}

	public get material(): Material {
		return this._material;
	}

	public get massData(): MassData {
		return this._massData;
	}

	public get force(): Vec2 {
		return this._force;
	}

	public get angularVelocity(): number {
		return this._angularVelocity;
	}

	public get torque(): number {
		return this._torque;
	}

	public get orientation(): number {
		return this._orientation;
	}

	public get position(): Vec2 {
		return this._position;
	}

	public get velocity(): Vec2 {
		return this._velocity;
	}

	private _setOrientation(radians: number): void {
		this._orientation = radians;
		this._shape.setOrientation(radians);
	}

	public set position(position: Vec2) {
		this._position = position;
	}

	public set velocity(velocity: Vec2) {
		this._velocity = velocity;
	}
}
