import { PongEventType } from 'yatt-lobbies';
import { Pong } from './Pong.js';
import * as K from './constants.js';
import { IEventSync, PlayerID, PongEventActivationSide } from './types.js';

export default class PongEvent {
	private static counter = 0;
	
	public readonly type: PongEventType;
	public readonly activationSide: PongEventActivationSide;
	protected _time: number;
	protected _startTime: number;
	protected _playerId: PlayerID;
	protected _id: number;

	protected constructor(type?: PongEventType, activationSide: PongEventActivationSide = PongEventActivationSide.SERVER) {
		this.type = type;
		this._time = -1;
		this._startTime = -1;
		this.activationSide = activationSide;
		this._id = PongEvent.counter++;
	}

	public toJSON(): IEventSync {
		return {
			type: this.type,
			time: this._time,
			playerId: this._playerId,
			id: this._id
		}
	}

	public activate(game: Pong, playerID: PlayerID, time?: number): void {
		if (!this.isGlobal()) {
			const existingEvent = game.activeEvents.find(event => event.type === this.type && event.playerId === playerID);
			if (existingEvent) {
				existingEvent.resetTimer();
				return;
			}
		}
		game.activeEvents.push(this);
		this._playerId = playerID;
		this._time = time ?? -1;
		this._startTime = this._time;
		// Override in subclasses
	}

	public deactivate(game: Pong): void {
		game.activeEvents.splice(game.activeEvents.indexOf(this), 1);
	}

	public shouldUpdate(game: Pong): boolean {
		if (this.activationSide === PongEventActivationSide.SERVER && game.isServer())
			return true;
		return this.activationSide === PongEventActivationSide.BOTH;
	}

	public shouldDeactivate(game: Pong): boolean {
		if (this._time > 0) {
			this._time -= K.DT;
			if (this._time <= 0) {
				return true;
			}
		}
		return false;
	}

	public shouldSpawn(game: Pong): boolean {
		if (this.isGlobal())
			return !game.activeEvents.some(event => event.type === this.type);
		return true;
	}

	public update(game: Pong): void {
	}

	public clone(): PongEvent {
		const clone = new (this.constructor as any)();
		clone._time = this._time;
		clone._playerId = this._playerId;
		return clone;
	}

	public sync(other: IEventSync): void {
		this._time = other.time;
		this._playerId = other.playerId;
		this._id = other.id;
	}

	public resetTimer(): void {
		this._time = this._startTime;
	}

	public get id(): number {
		return this._id;
	}

	public get time(): number {
		return this._time;
	}

	public get playerId(): PlayerID {
		return this._playerId;
	}

	public isGlobal(): boolean {
		return false;
	}
}
