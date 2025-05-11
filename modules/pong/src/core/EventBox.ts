import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial } from "./constants.js";
import { MapSide, IEventBoxSync } from "./types.js";
import PongEvent from "./PongEvent.js";
import { PongEventType } from 'yatt-lobbies'
import MultiBallPongEvent from "./MultiBallPongEvent.js";
import AttractorPongEvent from "./AttractorPongEvent.js";
import IcePongEvent from "./IcePongEvent.js";

export default class EventBox extends PH2D.Body {
	public static readonly pongEvents = {
		[PongEventType.MULTIBALL]: new MultiBallPongEvent(),
		[PongEventType.ATTRACTOR]: new AttractorPongEvent(),
		[PongEventType.ICE]: new IcePongEvent(),
	}

	private _active: boolean;
	private _event?: PongEvent;

	public constructor(shape: PH2D.Shape, position: Vec2) {
		super(PH2D.PhysicsType.TRIGGER, shape, bounceMaterial, position, Vec2.create());
		this.deactivate();
	}
	
	public activate(event: PongEventType): void {
		this._active = true;
		this.filter = 0;
		this._event = EventBox.pongEvents[event];
	}

	public deactivate(): void {
		this._active = false;
		this.filter = 1;
		this._event = null;
	}

	public sync(other: IEventBoxSync): void {
		this._active = other.active;
		this._event = EventBox.pongEvents[other.eventType];
		this.filter = this._active ? 0 : 1;
	}

	public get active(): boolean {
		return this._active;
	}

	public get eventType(): PongEventType {
		return this._event?.type;
	}

	public get event(): PongEvent | undefined {
		return this._event;
	}
}
