import { Mesh } from "@babylonjs/core";

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

export interface ScoredEvent {
	score: Array<number>;
	side: number;
}
