import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial } from "./constants.js";
import { MapSide } from "./types.js";

export default class EventBox extends PH2D.Body {
	private _active: boolean;

	public constructor(shape: PH2D.Shape, position: Vec2) {
		super(PH2D.PhysicsType.TRIGGER, shape, bounceMaterial, position, Vec2.create());
		this._active = false;
	}

	public activate(): void {
		this._active = true;
	}

	public get active(): boolean {
		return this._active;
	}
}
