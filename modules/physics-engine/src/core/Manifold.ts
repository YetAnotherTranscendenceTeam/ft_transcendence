import { Body } from './Body.js';
import { Vec2 } from "gl-matrix";
import { COLLISION_CALLBACKS } from './Collision.js';
import { EPSILON } from 'gl-matrix/common';
import { PhysicsType } from './properties.js';

function floatEqual(a: number, b: number): boolean {
	return Math.abs(a - b) < EPSILON;
}

export class Manifold {
	private _bodyA: Body;
	private _bodyB: Body;

	public normal: Vec2;
	public contacts: Vec2[];
	public penetration: number;

	private _restitution: number;
	private _staticFriction: number;
	private _dynamicFriction: number;
	
	constructor(bodyA: Body, bodyB: Body) {
		this._bodyA = bodyA;
		this._bodyB = bodyB;
		this.normal = Vec2.create();
		this.contacts = [];
		this.penetration = 0;
		this._restitution = 0;
		this._staticFriction = 0;
		this._dynamicFriction = 0;
	}

	public solve(): void {
		COLLISION_CALLBACKS.get(this._bodyA.shape.type).get(this._bodyB.shape.type)(this, this._bodyA, this._bodyB);
	}

	public initialize(dt: number, gravity: Vec2): void {
		this._restitution = Math.min(this._bodyA.material.restitution, this._bodyB.material.restitution);
		this._staticFriction = Math.sqrt(this._bodyA.material.staticFriction * this._bodyB.material.staticFriction);
		this._dynamicFriction = Math.sqrt(this._bodyA.material.dynamicFriction * this._bodyB.material.dynamicFriction);

		for (let i = 0; i < this.contacts.length; i++) {
			const ra: Vec2 = Vec2.subtract(Vec2.create(), this.contacts[i], this._bodyA.position) as Vec2;
			const rb: Vec2 = Vec2.subtract(Vec2.create(), this.contacts[i], this._bodyB.position) as Vec2;

			const rv: Vec2 = Vec2.clone(this._bodyB.velocity);
			Vec2.add(rv, rv, new Vec2(-this._bodyB.angularVelocity * rb.y, this._bodyB.angularVelocity * rb.x));
			Vec2.subtract(rv, rv, this._bodyA.velocity);
			Vec2.subtract(rv, rv, new Vec2(-this._bodyA.angularVelocity * ra.y, this._bodyA.angularVelocity * ra.x));

			if (Vec2.squaredLength(rv) < Vec2.squaredLength(gravity) * dt + EPSILON) {
				this._restitution = 0;
			}
		}
	}

	public applyImpulse(): void {
		if (floatEqual(this._bodyA.massData.invMass + this._bodyB.massData.invMass, 0)) {
			this.infiniteMassCorrection();
			return;
		}

		for (let i = 0; i < this.contacts.length; i++) {
			const ra: Vec2 = Vec2.subtract(Vec2.create(), this.contacts[i], this._bodyA.position) as Vec2;
			const rb: Vec2 = Vec2.subtract(Vec2.create(), this.contacts[i], this._bodyB.position) as Vec2;

			let rv: Vec2 = Vec2.clone(this._bodyB.velocity);
			Vec2.add(rv, rv, new Vec2(-this._bodyB.angularVelocity * rb.y, this._bodyB.angularVelocity * rb.x));
			Vec2.subtract(rv, rv, this._bodyA.velocity);
			Vec2.subtract(rv, rv, new Vec2(-this._bodyA.angularVelocity * ra.y, this._bodyA.angularVelocity * ra.x));

			const contactVel: number = Vec2.dot(rv, this.normal);

			if (contactVel > 0) {
				return;
			}

			const raCrossN: number = ra.x * this.normal.y - ra.y * this.normal.x;
			const rbCrossN: number = rb.x * this.normal.y - rb.y * this.normal.x;
			const invMassSum: number = this._bodyA.massData.invMass + this._bodyB.massData.invMass + raCrossN * raCrossN * this._bodyA.massData.invInertia + rbCrossN * rbCrossN * this._bodyB.massData.invInertia;

			let j: number = -(1 + this._restitution) * contactVel;
			j /= invMassSum;
			j /= this.contacts.length;

			const impulse: Vec2 = Vec2.scale(Vec2.create(), this.normal, j) as Vec2;
			this._bodyA.applyImpulse(Vec2.negate(Vec2.create(), impulse) as Vec2, ra);
			this._bodyB.applyImpulse(impulse, rb);

			rv = Vec2.clone(this._bodyB.velocity);
			Vec2.add(rv, rv, new Vec2(-this._bodyB.angularVelocity * rb.y, this._bodyB.angularVelocity * rb.x));
			Vec2.subtract(rv, rv, this._bodyA.velocity);
			Vec2.subtract(rv, rv, new Vec2(-this._bodyA.angularVelocity * ra.y, this._bodyA.angularVelocity * ra.x));

			const tangent: Vec2 = Vec2.subtract(Vec2.create(), rv, Vec2.scale(Vec2.create(), this.normal, Vec2.dot(rv, this.normal))) as Vec2;
			Vec2.normalize(tangent, tangent);

			let jt: number = -Vec2.dot(rv, tangent);
			jt /= invMassSum;
			jt /= this.contacts.length;

			if (Math.abs(jt) < EPSILON) {
				return;
			}

			let tangentImpulse: Vec2;
			if (Math.abs(jt) < j * this._staticFriction) {
				tangentImpulse = Vec2.scale(Vec2.create(), tangent, jt) as Vec2;
			} else {
				tangentImpulse = Vec2.scale(Vec2.create(), tangent, -j * this._dynamicFriction) as Vec2;
			}

			this._bodyA.applyImpulse(Vec2.negate(Vec2.create(), tangentImpulse) as Vec2, ra);
			this._bodyB.applyImpulse(tangentImpulse, rb);
		}
	}

	public positionalCorrection(): void {
		const slop: number = 0.01;
		const percent: number = 0.2;
		const correction: Vec2 = Vec2.scale(Vec2.create(), this.normal, Math.max(this.penetration - slop, 0) / (this._bodyA.massData.invMass + this._bodyB.massData.invMass) * percent) as Vec2;
		
		if (this._bodyA.massData.invMass !== 0) {
			this._bodyA.position = (Vec2.subtract(Vec2.create(), this._bodyA.position, Vec2.scale(Vec2.create(), correction, this._bodyA.massData.invMass)) as Vec2);
		}

		if (this._bodyB.massData.invMass !== 0) {
			this._bodyB.position = (Vec2.add(Vec2.create(), this._bodyB.position, Vec2.scale(Vec2.create(), correction, this._bodyB.massData.invMass)) as Vec2);
		}
	}

	public infiniteMassCorrection(): void {
		if (this._bodyA.type !== PhysicsType.KINEMATIC) {
			this._bodyA.velocity = Vec2.create();
		}
		if (this._bodyB.type !== PhysicsType.KINEMATIC) {
			this._bodyB.velocity = Vec2.create();
		}
	}

	public get bodyA(): Body {
		return this._bodyA;
	}

	public get bodyB(): Body {
		return this._bodyB;
	}
}
