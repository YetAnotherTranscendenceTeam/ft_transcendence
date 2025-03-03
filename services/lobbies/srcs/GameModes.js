export class GameMode {
	constructor(name, { team_size, team_count, ranked }) {
		this.name = name;
		this.team_size = team_size;
		this.team_count = team_count;
		this.ranked = ranked;
	}
}

export const GameModes = [
	new GameMode("ranked_1v1", { team_size: 1, team_count: 1, ranked: true }),
	new GameMode("ranked_2v2", { team_size: 2, team_count: 1, ranked: true }),
	new GameMode("unranked_1v1", { team_size: 1, team_count: 2, ranked: false }),
	new GameMode("unranked_2v2", { team_size: 2, team_count: 2, ranked: false }),
].reduce((prev, curr) =>
	({...prev, [curr.name]: curr}), {});

