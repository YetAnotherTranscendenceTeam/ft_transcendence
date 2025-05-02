
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import Wall from "./Wall.js";
import * as K from "./constants.js";
import { Body } from "physics-engine"
import { Pong } from "./Pong.js";

export class IPongState {
	name: "PLAYING" | "FREEZE" | "RESERVED" | "PAUSED" | "ENDED";
	frozen_until: number;
}

export class PongState implements IPongState {
	static PLAYING = new PongState("PLAYING", {
		frozen_until: 0,
		endCallback: (game: Pong, nextState: PongState) => {
			game.roundStart();
		}
	});
	static FREEZE = new PongState("FREEZE", {
		frozen_until: 3,
		next: () => PongState.PLAYING
	});
	// waiting for game
	static RESERVED = new PongState("RESERVED", {
		frozen_until: -1,
		next: () => PongState.FREEZE,
		endCallback: (game: Pong) => {
			game.roundStart();
		}
	});
	// local only!
	static PAUSED = new PongState("PAUSED", {
		frozen_until: -1,
	});
	static ENDED = new PongState("ENDED", {
		frozen_until: -1,
	});

	public readonly name: "PLAYING" | "FREEZE" | "RESERVED" | "PAUSED" | "ENDED";
	public readonly next?: () => PongState = null;
	public frozen_until: number;
	public endCallback?: ((game: Pong, nextState: PongState) => void) = null;
	public tickCallback?: ((dt: number, game: Pong) => boolean) = null;

	constructor(name: "PLAYING" | "FREEZE" | "RESERVED" | "PAUSED" | "ENDED", { frozen_until, next, endCallback, tickCallback }: { frozen_until: number, next?: () => PongState, endCallback?: (game: Pong, nextState: PongState) => void, tickCallback?: (dt: number, game: Pong) => boolean }) {
		this.name = name;
		this.frozen_until = frozen_until;
		this.next = next;
		this.endCallback = endCallback;
		this.tickCallback = tickCallback;
	}

	// returns true if frozen
	public tick(dt: number, game: Pong): boolean {
		if (this.tickCallback) {
			if (!this.tickCallback(dt, game)) {
				return false;
			}
		}
		if (this.frozen_until > 0) {
			this.frozen_until -= dt;
			if (this.frozen_until < 0)
				this.frozen_until = 0;
			return true;
		}
		else if (this.frozen_until == -1)
			return true;
		return false;
	}

	public getNext(): PongState | null {
		if (!this.next)
			return null;
		return this.next();
	}

	public isFrozen(): boolean {
		return this.frozen_until > 0 || this.frozen_until == -1;
	}

	public clone(): PongState {
		return new PongState(this.name, this);
	}
}

export enum MapSide {
	LEFT = 0,
	RIGHT = 1
}

export enum PaddleID {
	LEFT_BACK = 0,
	LEFT_FRONT = 1,
	RIGHT_BACK = 2,
	RIGHT_FRONT = 3
}

export enum PlayerMovement {
	UP = 1,
	DOWN = -1,
	NONE = 0
}

export enum MapID {
	SMALL = 0,
	BIG = 1,
	FAKE = 2
}

export interface IPongMap {
	mapId: MapID;

	wallTop: Wall;
	wallBottom: Wall;

	goalLeft: Goal;
	goalRight: Goal;

	paddleLeftBack: Paddle;
	paddleLeftFront: Paddle;
	paddleRightBack: Paddle;
	paddleRightFront: Paddle;

	obstacles: Wall[];
	getObjects: () => Body[];
	clone: () => IPongMap;
}

export interface IBall {
	position: number[];
	velocity: number[];
	angularVelocity: number;
	orientation: number;
	speed: number;
}

export interface IPaddle {
	id: PaddleID;
	position: number;
	movement: PlayerMovement;
}
