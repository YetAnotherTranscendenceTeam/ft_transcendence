import { IBall, IGoalSyncs, PlayerMovement } from "pong";
import { PongEventType } from 'yatt-lobbies'
import AObject from "./Objects/AObject";
import { Mesh } from "@babylonjs/core";

export enum GraphicsQuality {
	LOW = 0,
	MEDIUM,
	HIGH,
}

export enum KeyState {
	IDLE = 0,
	PRESSED,
	HELD,
	RELEASED
}

export enum GameScene {
	PRELOAD,
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
	goals: IGoalSyncs;
	tick: number;
}

export interface ClientMap {
	mapId: number;
	objects: Array<AObject>;
	ground: Mesh;
	iceRink: {
		left: Mesh;
		right: Mesh;
	}
}
