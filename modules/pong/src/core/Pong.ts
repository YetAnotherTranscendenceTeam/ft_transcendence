import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode, IPlayer } from 'yatt-lobbies'
import { DT, ballSpeedMin, bounceMaterial } from "./constants.js";

export enum PongState {
	RESERVED = "reserved",
	PLAYING = "playing",
	PAUSED = "paused",
	ENDED = "ended"
}

export class Pong {
	private _matchId: number;
	private _physicsScene: PH2D.Scene;
	private _gameMode: GameMode;
	private _players: IPlayer[] = [];
	private _state: PongState = PongState.RESERVED;

	private _balls: PH2D.Body[] = [];
	private _paddles: Map<number, PH2D.Body> = new Map();

	public constructor(match_id: number, gamemode: GameMode, players: IPlayer[], state: PongState = PongState.RESERVED) {
		this._matchId = match_id;
		this._gameMode = gamemode;
		this._players = players;
		this._physicsScene = new PH2D.Scene(Vec2.create(), DT);
		this._state = state;
	}

	public toJSON() {
		return {
			players: this._players,
			match_id: this._matchId,
			gamemode: this._gameMode
		};
	}

	public shouldUpdate(): boolean {
		return true;
	}

	public update() {
		this._physicsScene.step();
	}
}
