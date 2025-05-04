import { MapSide, IPongMap, MapID, PaddleID, PongState, IPongState, PlayerMovement, IBall, IPongPlayer } from "./types.js";

interface ITeamStats {
	points: number;
	shots: number;
	hits: number;
	misses: number;
	goals: number;
}

interface IPlayerStats {
	side: MapSide;
	hits: number;
	goals: number;
}

interface IHit {
	paddleId: PaddleID;
	ballId: number;
	tick: number;
}

interface ILastGoal {
	paddleId: PaddleID;
	ballId: number;
	tick: number;
}

export default class Stats {
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

	constructor(numberOfPlayers: number) {
		this._score = [0, 0];
		this._team = {};
		this._team[MapSide.LEFT] = {
			points: 0,
			shots: 0,
			hits: 0,
			misses: 0,
			goals: 0
		};
		this._team[MapSide.RIGHT] = {
			points: 0,
			shots: 0,
			hits: 0,
			misses: 0,
			goals: 0
		};
		this._player = {};
		this._player[0] = {
			side: MapSide.LEFT, // left side
			goals: 0, // points scored (wordy description: 1 point per goal scored by the player)
			hits: 0, // hits made (wordy description: 1 hit per ball hit by the player)
		};
		if (numberOfPlayers <= 1) {
			this._player[1] = {
				side: MapSide.RIGHT,
				hits: 0,
				goals: 0
			};
		} else {
			this._player[1] = {
				side: MapSide.LEFT,
				hits: 0,
				goals: 0
			};
			this._player[2] = {
				side: MapSide.RIGHT,
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
			paddleId: undefined,
			ballId: 0,
			tick: 0
		};
		this._lastGoal = {
			paddleId: undefined,
			ballId: 0,
			tick: 0
		};
		this._lastSideToScore = undefined;
		this._lastSideToHit = undefined;
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
}
