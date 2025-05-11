import { PongEventType } from 'yatt-lobbies';
import { Pong } from './Pong.js';
import * as K from './constants.js';
import { PlayerID } from './types.js';

export default class PongEvent {
	public readonly type: PongEventType;
	protected _time: number;
	protected _playerId: PlayerID;

	protected constructor(type?: PongEventType) {
		this.type = type;
		this._time = -1;
	}

	public activate(game: Pong, playerID: PlayerID, time?: number): void {
		game.activeEvents.push(this);
		this._playerId = playerID;
		this._time = time ?? -1;
		// Override in subclasses
	}

	public deactivate(game: Pong): void {
		game.activeEvents.splice(game.activeEvents.indexOf(this), 1);
	}

	public update(game: Pong): void {
		if (this._time > 0) {
			this._time -= K.DT;
			if (this._time <= 0) {
				this.deactivate(game);
			}
		}
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
