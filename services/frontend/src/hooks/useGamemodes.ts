
const gamemodes = {
	'ranked_1v1': {
		name: '1v1',
		image: 'https://cdn-0001.qstv.on.epicgames.com/ISfvNqRrgZJYiukxUk/image/landscape_comp.jpeg',
		type: 'ranked',
	},
	'ranked_2v2': {
		name: '2v2',
		image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNTKPQNODV6msbJoT0UQtvOLOO1ANGjZdJuA&s',
		type: 'ranked',
	},
	'unranked_1v1': {
		name: '1v1',
		image: 'https://cdn-0001.qstv.on.epicgames.com/ISfvNqRrgZJYiukxUk/image/landscape_comp.jpeg',
		type: 'unranked',
	},
	'unranked_2v2': {
		name: '2v2',
		image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNTKPQNODV6msbJoT0UQtvOLOO1ANGjZdJuA&s',
		type: 'unranked',
	},
	'tournament_1v1': {
		name: '1v1',
		image: 'https://cdn-0001.qstv.on.epicgames.com/ISfvNqRrgZJYiukxUk/image/landscape_comp.jpeg',
		type: 'tournament',
	},
	'tournament_2v2': {
		name: '2v2',
		image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNTKPQNODV6msbJoT0UQtvOLOO1ANGjZdJuA&s',
		type: 'tournament',
	}
}

export default function useGamemodes() {
	return gamemodes;
}