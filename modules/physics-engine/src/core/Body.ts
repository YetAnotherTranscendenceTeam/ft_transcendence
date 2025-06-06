import { Manifold } from "./Manifold.js";
import { Shape } from "./Shape/Shape.js";
import { MassData, Material, PhysicsType } from "./properties.js";
import { Vec2, Vec2Like } from "gl-matrix";

export class Body extends EventTarget {
	private static _idCounter: number = 0;

	protected _id: number;
	
	protected _type: PhysicsType;
	protected _shape: Shape;
	
	protected _material: Material;
	protected _massData: MassData;
	
	protected _force: Vec2;
	
	protected _angularVelocity: number;
	protected _torque: number;
	protected _orientation: number;
	
	protected _position: Vec2;
	protected _velocity: Vec2;
	
	protected _previousPosition: Vec2;
	protected _previousOrientation: number;
	protected _prevVelocity: Vec2;

	public filter: number;
	
	constructor(type: PhysicsType = PhysicsType.DYNAMIC, shape: Shape, material: Material = {density: 1, restitution: 1, staticFriction: 0, dynamicFriction: 0}, position: Vec2 = Vec2.create(), velocity: Vec2 = Vec2.create()) {
		super();
		this._id = Body._idCounter++;
		this._type = type;
		this._shape = shape;
		this._material = material;
		this._force = Vec2.create();
		this._angularVelocity = 0;
		this._torque = 0;
		this._orientation = 0;
		this._position = Vec2.clone(position);
		this._velocity = Vec2.clone(velocity);
		this._previousPosition = Vec2.clone(position);
		this._previousOrientation = 0;
		this._prevVelocity = Vec2.clone(velocity);
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
		this.filter = 0;
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

	public integrateVelocity(dt: number, gravity: Vec2, substep: number): void {
		if (this._type === PhysicsType.STATIC) {
			return;
		}

		if (substep === 0) {
			this._previousPosition = Vec2.clone(this._position);
			this._previousOrientation = this._orientation;
		}
		this._prevVelocity = Vec2.clone(this._velocity);
		this._position.add(Vec2.scale(Vec2.create(), this._velocity, dt));
		this._orientation += this._angularVelocity * dt;
		this.setOrientation(this._orientation);
		this.integrateForces(dt, gravity);
	}

	public resetForces(): void {
		Vec2.set(this._force, 0, 0);
		this._torque = 0;
	}

	public onCollision(other: Body, manifold: Manifold): void {
		this.dispatchEvent(new CustomEvent("collision", { detail: { emitter: this, other, manifold } }));
	}

	public interpolatePosition(alpha: number): Vec2 {
		const out = Vec2.create();
		Vec2.lerp(out, this._previousPosition, this._position, alpha);
		return out;
	}

	public interpolateOrientation(alpha: number): number {
		return this._previousOrientation + alpha * (this._orientation - this._previousOrientation);
	}

	public changeType(type: PhysicsType): void {
		if (this._type === type) {
			return;
		}
		this._type = type;
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

	public get previousPosition(): Vec2 {
		return this._previousPosition;
	}

	public get velocity(): Vec2 {
		return this._velocity;
	}

	public get previousVelocity(): Vec2 {
		return this._prevVelocity;
	}

	public setOrientation(radians: number): void {
		this._orientation = radians;
		this._shape.setOrientation(radians);
	}

	public set position(position: Vec2) {
		this._position = position;
	}

	public set previousPosition(previousPosition: Vec2) {
		this._previousPosition = previousPosition;
	}

	public set velocity(velocity: Vec2) {
		this._velocity = velocity;
	}

	public set angularVelocity(angularVelocity: number) {
		this._angularVelocity = angularVelocity;
	}
}
