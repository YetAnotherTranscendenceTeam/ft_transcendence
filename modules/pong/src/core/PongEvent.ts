import { PongEventType } from 'yatt-lobbies';
import { Pong } from './Pong.js';

export default class PongEvent {
	public readonly type: PongEventType;

	protected constructor(type?: PongEventType) {
		this.type = type;
	}

	public activate(game: Pong): void {
		game.activeEvents.push(this);
		// Override in subclasses
	}

	public deactivate(game: Pong): void {
		game.activeEvents.slice(game.activeEvents.indexOf(this), 1);
	}
}
