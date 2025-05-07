import { MapSide, IPongMap, MapID, PlayerID, PongState, IPongState, PlayerMovement, IBall, IPongPlayer } from "./types.js";

interface ITeamStats {
	hits: number;
	goals: number;
}

interface IPlayerStats {
	side: MapSide;
	hits: number;
	goals: number;
}

interface IHit {
	playerId: PlayerID;
	ballId: number;
	tick: number;
}

interface ILastGoal {
	playerId: PlayerID;
	ballId: number;
	tick: number;
}

export default class Stats {
	private _pointToWin: number;
	private _winner: MapSide;
	private _score: number[];
	private _team: {
		[side: number]: ITeamStats;
	};
	private _player: {
		[id: number]: IPlayerStats;
	};
	private _lastHit: IHit;
	private _lastGoal: ILastGoal
	private _lastSideToScore: MapSide;
	private _lastSideToHit: MapSide;

	constructor(teamSize: number, pointToWin: number) {
		this._pointToWin = pointToWin;
		this._winner = undefined;
		this._score = [0, 0];
		this._team = {};
		this._team[MapSide.LEFT] = {
			hits: 0,
			goals: 0
		};
		this._team[MapSide.RIGHT] = {
			hits: 0,
			goals: 0
		};
		this._player = {};
		this._player[0] = {
			side: MapSide.LEFT,
			goals: 0,
			hits: 0,
		};
		this._player[2] = {
			side: MapSide.RIGHT,
			hits: 0,
			goals: 0
		};
		if (teamSize === 2) {
			this._player[1] = {
				side: MapSide.LEFT,
				hits: 0,
				goals: 0
			};
			this._player[3] = {
				side: MapSide.RIGHT,
				hits: 0,
				goals: 0
			};
		}
		this._lastHit = {
			playerId: undefined,
			ballId: 0,
			tick: 0
		};
		this._lastGoal = {
			playerId: undefined,
			ballId: 0,
			tick: 0
		};
		this._lastSideToScore = undefined;
		this._lastSideToHit = undefined;
		
	}

	public get winner(): MapSide {
		return this._winner;
	}

	public get score(): number[] {
		return this._score;
	}

	public get team(): {
		[side: number]: ITeamStats;
	} {
		return this._team;
	}

	public get player(): {
		[id: number]: IPlayerStats;
	} {
		return this._player;
	}

	public get lastHit(): IHit {
		return this._lastHit;
	}

	public get lastGoal(): ILastGoal {
		return this._lastGoal;
	}

	public get lastSideToScore(): MapSide {
		return this._lastSideToScore;
	}

	public get lastSideToHit(): MapSide {
		return this._lastSideToHit;
	}

	public set score(score: number[]) {
		this._score = score;
	}

	public set lastSideToScore(side: MapSide) {
		this._lastSideToScore = side;
	}

	public scoreGoal(side: MapSide, ballId: number, tick: number): void {
		if (this.lastGoal.ballId === ballId && this.lastGoal.tick === tick) {
			return;
		}
		const sideToGoal = side === MapSide.LEFT ? MapSide.RIGHT : MapSide.LEFT;
		this._score[sideToGoal]++;
		this._team[sideToGoal].goals++;
		const playerId = this._lastHit.playerId;
		if (playerId !== undefined) {
			this._player[playerId].goals++;
		}
		this._lastGoal = {
			playerId: playerId,
			ballId: ballId,
			tick: tick
		};
		this._lastSideToScore = sideToGoal;
		if (this._score[sideToGoal] >= this._pointToWin) {
			this._winner = sideToGoal;
		}
	}

	public hit(playerId: PlayerID, ballId: number, tick: number): void {
		if (this._lastHit.ballId === ballId && this._lastHit.tick === tick) {
			return;
		}
		const side = this._player[playerId].side;
		this._team[side].hits++;
		this._player[playerId].hits++;
		this._lastHit = {
			playerId: playerId,
			ballId: ballId,
			tick: tick
		};
		this._lastSideToHit = side;
	}
}
