import { PongEventType } from "yatt-lobbies";
import EventBox from "./EventBox.js"
import Stats from "./Stats.js";

export default class EventBoxManager {
	private _eventBoxes: EventBox[];
	private _events: PongEventType[];
	private _nextEventIn: number;
	private _stats: Stats;

	constructor(boxes: EventBox[], events: PongEventType[], stats: Stats) {
		this._eventBoxes = boxes;
		this._events = events;
		this._stats = stats;
		this._resetNextEventIn();
	}

	private _resetNextEventIn(): void {
		this._nextEventIn = Math.floor(Math.random() * 3) + 3;
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
		if (this._nextEventIn == 0) {
			const eventBoxIndex: number = Math.floor(Math.random() * availableEventBoxes.length);
			const eventBox: EventBox = availableEventBoxes[eventBoxIndex];
			const availableEvents: PongEventType[] = this._events.filter((event: PongEventType) => !this._eventBoxes.some((eventbox: EventBox) => eventbox.eventType === event));
			const randomEventIndex = Math.floor(Math.random() * availableEvents.length);
			const event = availableEvents[randomEventIndex];
			eventBox.activate(event);
			this._resetNextEventIn();
		}
	}
}
