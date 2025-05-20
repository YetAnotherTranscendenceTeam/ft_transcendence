import { PongEventType } from "yatt-lobbies";
import EventBox from "./EventBox.js"
import Stats from "./Stats.js";
import { Pong } from "./Pong.js";

export default class EventBoxManager {
	private _eventBoxes: EventBox[];
	private _events: PongEventType[];
	private _nextEventIn: number;
	private _stats: Stats;
	private _game: Pong;

	constructor(boxes: EventBox[], events: PongEventType[], game: Pong, stats: Stats) {
		this._eventBoxes = boxes;
		this._events = events;
		this._stats = stats;
		this._game = game;
		this._resetNextEventIn();
	}

	private _resetNextEventIn(): void {
		this._nextEventIn = 1;
		//this._nextEventIn = Math.floor(Math.random() * 10) + 10;
	}

	canCreateEvent(availableEventBoxes: EventBox[]): boolean {
		return (
			this._events.length > 0 &&
			this._eventBoxes.some((eventbox: EventBox) => !eventbox.active) &&
			this._eventBoxes.length - availableEventBoxes.length < this._events.length &&
			availableEventBoxes.length > 0
		)
	}

	onBallPaddleCollision(): void {
		if (!this._stats.lastHit.isTrade)
			return;
		const availableEventBoxes: EventBox[] = this._eventBoxes.filter((eventbox: EventBox) => !eventbox.active);
		if (!this.canCreateEvent(availableEventBoxes)) {
			return;
		}
		this._nextEventIn -= 1;
		if (this._nextEventIn <= 0) {
			const eventBoxIndex: number = Math.floor(Math.random() * availableEventBoxes.length);
			const eventBox: EventBox = availableEventBoxes[eventBoxIndex];
			const availableEvents: PongEventType[] = this._events.filter((event: PongEventType) => EventBox.pongEvents[event].shouldSpawn(this._game) && !this._eventBoxes.some((eventbox: EventBox) => eventbox.eventType === event));
			
			const totalWeight = availableEvents.reduce((acc: number, event: PongEventType) => acc + EventBox.pongEvents[event].weight, 0);
			
			const randomEventWeight = Math.floor(Math.random() * totalWeight);


			let randomEventIndex = -1;
			let cumulativeWeight = 0;
			for (let i = 0; i < availableEvents.length; i++) {
				cumulativeWeight += EventBox.pongEvents[availableEvents[i]].weight;
				if (randomEventWeight <= cumulativeWeight) {
					randomEventIndex = i;
					break;
				}
			}
			const event = availableEvents[randomEventIndex];
			if (!event) {
				return;
			}
			eventBox.activate(event);
			this._resetNextEventIn();
		}
	}
}
