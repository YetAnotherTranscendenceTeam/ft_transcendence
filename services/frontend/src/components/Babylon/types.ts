import { IBall } from "pong";

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
export type PaddleSync = {[key: number]: {id: number, y: number}};

export interface IServerStep {
	collision: Array<Object>;
	balls: Array<IBall>;
	paddles: PaddleSync;
	tick: number;
}
