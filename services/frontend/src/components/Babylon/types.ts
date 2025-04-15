export enum keyState {
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

export interface scoredEvent {
	score: Array<number>;
	side: number;
}
