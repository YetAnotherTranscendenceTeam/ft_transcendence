import { MassData } from '../properties'

export enum ShapeType {
	CIRCLE = 0,
	POLYGON,
	COUNT
};

export abstract class Shape {
	public abstract clone(): Shape;
	public abstract computeMass(density: number): MassData;
	public abstract setOrientation(radians: number): void;
	public abstract get type(): ShapeType;
}
