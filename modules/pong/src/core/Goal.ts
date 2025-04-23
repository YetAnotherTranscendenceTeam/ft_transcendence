import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial } from "./constants.js";

export default class Goal extends PH2D.Body {
	private _contact: number;
	private _width: number;
	private _height: number;

	/**
	 * Create a goal.
	 * @param shape The shape of the goal.
	 * @param position The position of the goal.
	 * @param size The size of the goal.
	 */
	public constructor(shape: PH2D.Shape, position: Vec2, size: Vec2) {
		super(PH2D.PhysicsType.TRIGGER, shape, bounceMaterial, position, Vec2.create());
		this._contact = 0;
		this._width = size[0];
		this._height = size[1];
	}

	/**
	 * Get the width of the goal.
	 * @returns The width of the goal.
	 */
	public get width(): number {
		return this._width;
	}

	/**
	 * Get the height of the goal.
	 * @returns The height of the goal.
	 */
	public get height(): number {
		return this._height;
	}

	public get contact(): number {
		return this._contact;
	}
	public incrementContact() {
		this._contact++;
	}

	public resetContact() {
		this._contact = 0;
	}
}
