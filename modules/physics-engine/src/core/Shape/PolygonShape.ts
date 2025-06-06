import { Shape, ShapeType } from "./Shape.js";
import { MassData } from "../properties.js";
import { Vec2, Mat2 } from "gl-matrix";
import { EPSILON } from 'gl-matrix/common';
import { signedArea2 } from "../utils.js";

export class PolygonShape extends Shape {
	private readonly _vertices: Array<Vec2>;
	private readonly _normals: Array<Vec2>;
	private readonly _u: Mat2;

	constructor(vertices: Array<{ x: number, y: number }>);
	constructor(vertices: Array<Vec2>);
	constructor(halfWidth: number, halfHeight: number);
	constructor(arg: any, halfHeight?: number) {
		super();
		if (arg instanceof Array) {
			if (arg[0] instanceof Vec2) {
				this._vertices = arg.slice();
			} else {
				this._vertices = new Array<Vec2>();
				for (let i = 0; i < arg.length; i++) {
					this._vertices.push(Vec2.fromValues(arg[i].x, arg[i].y));
				}
			}
		} else {
			const halfWidth = arg;
			this._vertices = new Array<Vec2>();
			this._vertices.push(Vec2.fromValues(-halfWidth, halfHeight));
			this._vertices.push(Vec2.fromValues(halfWidth, halfHeight));
			this._vertices.push(Vec2.fromValues(halfWidth, -halfHeight));
			this._vertices.push(Vec2.fromValues(-halfWidth, -halfHeight));
		}
		if (this._vertices.length < 3) {
			throw new Error("Polygon must have at least 3 vertices");
		}
		if (signedArea2(this._vertices) > 0) {
			this._vertices.reverse();
		}
		this._normals = new Array<Vec2>();
		for (let i = 0; i < this._vertices.length; i++) {
			const n = Vec2.create();
			Vec2.subtract(n, this._vertices[(i + 1) % this._vertices.length], this._vertices[i]);
			if (Vec2.squaredLength(n) <= EPSILON) {
				throw new Error("Vertices must not be coincident");
			}
			Vec2.normalize(n, Vec2.fromValues(-n.y, n.x));
			if (Math.abs(n.x) <= EPSILON) {
				n.x = 0;
			}
			if (Math.abs(n.y) <= EPSILON) {
				n.y = 0;
			}
			this._normals.push(n);
		}
		this._u = Mat2.create();
	}

	public clone(): PolygonShape {
		return new PolygonShape(this._vertices);
	}

	public computeMass(density: number): MassData {
		let area = 0;
		let inertia = 0;
		let c = Vec2.create();
		Vec2.set(c, 0, 0);
		const k_inv3 = 1 / 3;
		for (let i = 0; i < this._vertices.length; i++) {
			const p1 = this._vertices[i];
			const p2 = this._vertices[(i + 1) % this._vertices.length];
	
			const D = p1.x * p2.y - p1.y * p2.x;
			const triangleArea = 0.5 * D;

			area += Math.abs(triangleArea);

			const weight = triangleArea * k_inv3;
			c.scaleAndAdd(Vec2.add(Vec2.create(), p1, p2), weight);

			const intx2 = p1.x * p1.x + p2.x * p1.x + p2.x * p2.x;
			const inty2 = p1.y * p1.y + p2.y * p1.y + p2.y * p2.y;
			inertia += Math.abs((0.25 * k_inv3 * D) * (intx2 + inty2));
		}
		c.scale(1 / area);
		
		for (let i = 0; i < this._vertices.length; i++) {
			this._vertices[i].sub(c);
		}

		return {
			mass: density * area,
			invMass: area === 0 ? 0 : 1 / (density * area),
			inertia: density * inertia,
			invInertia: inertia === 0 ? 0 : 1 / inertia
		};
	}

	public setOrientation(radians: number): void {
		const c = Math.cos(radians);
		const s = Math.sin(radians);
		this._u[0] = c;
		this._u[1] = -s;
		this._u[2] = s;
		this._u[3] = c;
	}

	public getSupport(direction: Vec2): Vec2 {
		let bestProjection = -Number.MAX_VALUE;
		let bestVertex = Vec2.create();
		for (let i = 0; i < this._vertices.length; i++) {
			const v = this._vertices[i];
			const projection = Vec2.dot(v, direction);
			if (projection > bestProjection) {
				bestVertex = v;
				bestProjection = projection;
			}
		}
		return bestVertex;
	}

	public get type(): ShapeType {
		return ShapeType.POLYGON;
	}

	public get vertices(): Array<Vec2> {
		return this._vertices;
	}

	public get normals(): Array<Vec2> {
		return this._normals;
	}

	public get u(): Mat2 {
		return this._u;
	}
};
