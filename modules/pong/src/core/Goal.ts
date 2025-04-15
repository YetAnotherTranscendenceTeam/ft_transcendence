import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial } from "./constants.js";

export default class Goal extends PH2D.Body {
	private _contact: number;

	public constructor(scene: PH2D.Scene, shape: PH2D.Shape, position: Vec2, direction: Vec2, speed: number) {
		super(PH2D.PhysicsType.TRIGGER, shape, bounceMaterial, position, Vec2.create());
		this._contact = 0;

		scene.addBody(this);
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
