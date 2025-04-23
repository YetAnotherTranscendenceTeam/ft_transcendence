
import Ball from "./Ball.js";
import Paddle from "./Paddle.js";
import Goal from "./Goal.js";
import Wall from "./Wall.js";
import * as K from "./constants.js";
import { Body } from "physics-engine"
import { Pong } from "./Pong.js";

export class IPongState {
	name: string;
	frozen_until: number;
}

export class PongState implements IPongState {
	// waiting for game
	static RESERVED = new PongState("reserved", {
		frozen_until: -1,
	});
	static PLAYING = new PongState("playing", {
		frozen_until: 0,
	});
	static FREEZE = new PongState("freeze", {
		frozen_until: 4,
		next: PongState.PLAYING,
		endCallback: (game: Pong) => {
			game.roundStart();
		}
	});
	// local only!
	static PAUSED = new PongState("paused", {
		frozen_until: -1,
	});
	static ENDED = new PongState("ended", {
		frozen_until: -1,
	});

	public readonly name: string;
	public readonly next?: PongState = null;
	public readonly endCallback?: ((game: Pong) => void) = null;
	public frozen_until: number;

	constructor(name: string, { frozen_until, next, endCallback }: { frozen_until: number, next?: PongState, endCallback?: (game: Pong) => void }) {
		this.name = name;
		this.frozen_until = frozen_until;
		this.next = next;
		this.endCallback = endCallback;
	}

	// returns true if frozen
	public tick(dt: number): boolean {
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
		return this.next;
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
