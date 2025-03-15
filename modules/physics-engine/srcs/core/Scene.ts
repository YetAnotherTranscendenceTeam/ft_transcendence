import { Body } from "./Body";
import { Manifold } from "./Manifold";
import { Vec2 } from 'gl-matrix';

export class Scene {
	private _gravity: Vec2;
	private _dt: number;
	private _bodies: Body[];
	private _contact: Manifold[];

	constructor(gravity: Vec2 = Vec2.create(), dt: number = 1 / 60) {
		this._gravity = gravity;
		this._dt = dt;
		this._bodies = [];
		this._contact = [];
	}

	public addBody(body: Body): void {
		this._bodies.push(body);
	}

	public removeBody(body: Body): void {
		const index = this._bodies.indexOf(body);
		if (index !== -1) {
			this._bodies.splice(index, 1);
		}
	}

	public step(): void {
		this._contact = [];

		for (let i = 0; i < this._bodies.length; i++) {
			const bodyA = this._bodies[i];
			for (let j = i + 1; j < this._bodies.length; j++) {
				const bodyB = this._bodies[j];
				const manifold = new Manifold(bodyA, bodyB);
				manifold.solve();
				if (manifold.contacts.length > 0) {
					this._contact.push(manifold);
				}
			}
		}

		for (let i = 0; i < this._bodies.length; i++) {
			this._bodies[i].integrateForces(this._dt, this._gravity);
		}

		for (let i = 0; i < this._contact.length; i++) {
			this._contact[i].initialize(this._dt, this._gravity);
		}

		for (let j = 0; j < 10; j++) {
			for (let i = 0; i < this._contact.length; i++) {
				this._contact[i].applyImpulse();
			}
		}

		for (let i = 0; i < this._bodies.length; i++) {
			this._bodies[i].integrateVelocity(this._dt, this._gravity);
		}

		for (let i = 0; i < this._contact.length; i++) {
			this._contact[i].positionalCorrection();
		}

		for (let i = 0; i < this._bodies.length; i++) {
			this._bodies[i].resetForces();
		}
	}

	public get bodies(): Body[] {
		return this._bodies;
	}
}
