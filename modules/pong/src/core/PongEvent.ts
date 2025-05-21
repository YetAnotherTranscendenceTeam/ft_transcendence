import { PongEventType } from 'yatt-lobbies';
import { Pong } from './Pong.js';
import * as K from './constants.js';
import { IEventSync, PlayerID, PongEventActivationSide } from './types.js';

export enum PongEventScope {
	GLOBAL = 'global',
	POSITIVE = 'positive',
	NEGATIVE = 'negative',
}

export default class PongEvent {
	private static counter = 0;
	
	public readonly type: PongEventType;
	public readonly activationSide: PongEventActivationSide;
	protected _time: number;
	protected _duration: number;
	protected _playerId: PlayerID;
	protected _id: number;
	protected _scope: PongEventScope;
	protected _weight: number;

	protected constructor(type?: PongEventType, scope: PongEventScope = PongEventScope.GLOBAL, activationSide: PongEventActivationSide = PongEventActivationSide.SERVER, weight: number = 20) {
		this.type = type;
		this._time = -1;
		this._duration = -1;
		this.activationSide = activationSide;
		this._scope = scope;
		this._id = PongEvent.counter++;
		this._weight = weight;
	}

	public toJSON(): IEventSync {
		return {
			type: this.type,
			time: this._time,
			playerId: this._playerId,
			id: this._id,
			duration: this._duration,
		}
	}

	public activate(game: Pong, playerID: PlayerID, time?: number): boolean {
		if (!this.isGlobal()) {
			const existingEvent = game.activeEvents.find(event => event.type === this.type && event.playerId === playerID);
			if (existingEvent) {
				existingEvent.resetTimer();
				return false;
			}
		}
		game.activeEvents.push(this);
		this._playerId = playerID;
		this._time = time ?? -1;
		this._duration = this._time;
		return true;
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
		else if (game.activeEvents.some(event => event.type === PongEventType.MULTIBALL))
			return false;
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
		this._duration = other.duration;
		this._id = other.id;
	}

	public resetTimer(): void {
		this._time = this._duration;
	}

	public get duration(): number {
		return this._duration;
	}

	public get weight(): number {
		return this._weight;
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

	public get scope(): PongEventScope {
		return this._scope;
	}

	public isGlobal(): boolean {
		return this._scope === PongEventScope.GLOBAL;
	}
}
