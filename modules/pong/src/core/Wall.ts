import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { DT, bounceMaterial, paddleShape } from "./constants.js";

export default class Wall extends PH2D.Body {
	private _width: number;
	private _height: number;
	/**
	 * Create a wall.
	 * @param shape The shape of the wall.
	 * @param position The position of the wall.
	 * @param size The size of the wall.
	 */
	public constructor(shape: PH2D.Shape, position: Vec2, size: Vec2) {
		super(PH2D.PhysicsType.STATIC, shape, bounceMaterial, position, Vec2.create());
		this._width = size[0];
		this._height = size[1];
	}

	/**
	 * Get the width of the wall.
	 * @returns The width of the wall.
	 */
	public get width(): number {
		return this._width;
	}

	/**
	 * Get the height of the wall.
	 * @returns The height of the wall.
	 */
	public get height(): number {
		return this._height;
	}
}
