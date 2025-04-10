import { Shape, ShapeType } from './Shape.js';
import { MassData } from '../properties.js';

export class CircleShape extends Shape {
	private readonly _radius: number;

	constructor(radius: number) {
		super();
		this._radius = radius;
	}

	public clone(): CircleShape {
		return new CircleShape(this._radius);
	}

	public computeMass(density: number): MassData {
		const mass = Math.PI * this._radius * this._radius * density;
		const inertia = mass * this._radius * this._radius;
		return {
		mass: mass,
		invMass: mass === 0 ? 0 : 1 / mass,
		inertia: inertia,
		invInertia: inertia === 0 ? 0 : 1 / inertia
		};
	}

	public setOrientation(radians: number): void {}

	public get type(): ShapeType {
		return ShapeType.CIRCLE;
	}

	public get radius(): number {
		return this._radius;
	}
};