import { Body } from "./Body.js";
import { Manifold } from "./Manifold.js";
import { Vec2 } from 'gl-matrix';

export class Scene {
	private _gravity: Vec2;
	private _dt: number;
	private _substeps: number;
	private _bodies: Body[];
	private _contact: Manifold[];

	constructor(gravity: Vec2 = Vec2.create(), dt: number = 1 / 60, substeps: number = 1) {
		this._substeps = substeps;
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
		const substepDT = this._dt / this._substeps;
		for (let substep = 0; substep < this._substeps; substep++) {
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
				this._bodies[i].integrateForces(substepDT, this._gravity);
			}

			for (let i = 0; i < this._contact.length; i++) {
				this._contact[i].initialize(substepDT, this._gravity);
			}

			for (let j = 0; j < 10; j++) {
				for (let i = 0; i < this._contact.length; i++) {
					this._contact[i].applyImpulse();
				}
			}

			for (let i = 0; i < this._contact.length; i++) {
				this._contact[i].bodyA.onCollision(this._contact[i].bodyB, this._contact[i]);
				this._contact[i].bodyB.onCollision(this._contact[i].bodyA, this._contact[i]);
			}

			for (let i = 0; i < this._bodies.length; i++) {
				this._bodies[i].integrateVelocity(substepDT, this._gravity, substep);
			}

			for (let i = 0; i < this._contact.length; i++) {
				this._contact[i].positionalCorrection();
			}

			for (let i = 0; i < this._bodies.length; i++) {
				this._bodies[i].resetForces();
			}

		}
	}

	public clear(): void {
		this._bodies = [];
	}

	public get bodies(): Body[] {
		return this._bodies;
	}
}
