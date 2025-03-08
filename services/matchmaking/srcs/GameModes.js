export class GameMode {
	/**
	 * @param {string} name
	 * @param {{ team_size: number, team_count: number, ranked: boolean }} param1
	 */
	constructor(name, { team_size, team_count, ranked }) {
		this.name = name;
		this.team_size = team_size;
		this.team_count = team_count;
		this.ranked = ranked;
	}
}

/**
 * @type {Object<string, GameMode>}
 */
export const GameModes = {...[
	new GameMode("unranked_2v2", { team_size: 2, team_count: 2, ranked: false }),
	new GameMode("unranked_1v1", { team_size: 1, team_count: 2, ranked: false }),
	new GameMode("ranked_2v2", { team_size: 2, team_count: 2, ranked: true }),
	new GameMode("ranked_1v1", { team_size: 1, team_count: 2, ranked: true }),
	new GameMode("tournament_2v2", { team_size: 2, team_count: 16, ranked: false }),
	new GameMode("tournament_1v1", { team_size: 1, team_count: 16, ranked: false }),
].reduce((prev, curr) =>
	({...prev, [curr.name]: curr}), {}), equals(other) {
		for (let key in this) {
			if (typeof this[key] === "function") continue;
			if (!other[key]) return false;
			if (this[key].name !== other[key].name) return false;
			if (this[key].team_size !== other[key].team_size) return false;
			if (this[key].team_count !== other[key].team_count) return false;
			if (this[key].ranked !== other[key].ranked) return false;
		}
		return true;
	}};

