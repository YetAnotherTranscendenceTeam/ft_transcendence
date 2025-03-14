
const gamemodes = {
	'ranked_1v1': {
		name: '1v1',
		type: 'ranked',
		team_size: 1,
		team_count: 1,
	},
	'ranked_2v2': {
		name: '2v2',
		type: 'ranked',
		team_size: 2,
		team_count: 1,
	},
	'unranked_1v1': {
		name: '1v1',
		type: 'unranked',
		team_size: 1,
		team_count: 2,
	},
	'unranked_2v2': {
		name: '2v2',
		type: 'unranked',
		team_size: 2,
		team_count: 2,
	},
	'tournament_1v1': {
		name: '1v1',
		type: 'tournament',
		team_size: 1,
		team_count: 16,
	},
	'tournament_2v2': {
		name: '2v2',
		type: 'tournament',
		team_size: 2,
		team_count: 16,
	}
}

export default function useGamemodes() {
	return gamemodes;
}