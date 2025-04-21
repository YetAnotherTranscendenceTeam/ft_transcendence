export enum KeyState {
	IDLE = 0,
	PRESSED,
	HELD,
	RELEASED
}

export enum GameScene {
	MENU,
	LOBBY,
	ONLINE,
	LOCAL,
}

export enum KeyName {
	W = "w",
	S = "s",
	ArrowUp = "arrowup",
	ArrowDown = "arrowdown",
}

export interface ScoredEvent {
	score: Array<number>;
	side: number;
}
