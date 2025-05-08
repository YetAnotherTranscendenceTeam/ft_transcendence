import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial } from "./constants.js";
import { MapSide, IEventBoxSync } from "./types.js";
import { PongEventType } from 'yatt-lobbies'

export default class EventBox extends PH2D.Body {
	private _active: boolean;
	private _eventType: PongEventType;

	public constructor(shape: PH2D.Shape, position: Vec2) {
		super(PH2D.PhysicsType.TRIGGER, shape, bounceMaterial, position, Vec2.create());
		this._active = false;
		this._eventType = PongEventType.NONE;
	}
	
	public activate(event: PongEventType): void {
		this._active = true;
		this.filter = 0;
		this._eventType = event;
	}

	public deactivate(): void {
		this._active = false;
		this.filter = 1;
		this._eventType = PongEventType.NONE;
	}

	public sync(other: IEventBoxSync): void {
		this._active = other.active;
		this._eventType = other.eventType;
		this.filter = this._active ? 0 : 1;
	}

	public get active(): boolean {
		return this._active;
	}

	public get eventType(): PongEventType {
		return this._eventType;
	}
}
