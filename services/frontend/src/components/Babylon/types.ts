import { IBall, PlayerMovement } from "pong";

export enum KeyState {
	IDLE = 0,
	PRESSED,
	HELD,
	RELEASED
}

export enum GameScene {
	MENU,
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
export type PaddleSync = {id: number, y: number, movement: PlayerMovement};
export type PaddleSyncs = {[key: number]: PaddleSync};

export interface IServerStep {
	collisions: number;
	balls: Array<IBall>;
	paddles: PaddleSyncs;
	tick: number;
}
