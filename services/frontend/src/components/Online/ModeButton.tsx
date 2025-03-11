import Babact from "babact";

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

export default function ModeButton({
		mode,
		onSelect
	}: {
		mode: string,
		onSelect: (mode: string) => void
	}) {

	if (!gamemodes[mode])
		return null;
	return <div
		// style={`--image: url(${gamemodes[mode].image})`}
		className={`mode-button flex items-center justify-center ${gamemodes[mode].type}`}
		onClick={() => onSelect(mode)}
	>
		<h1>{gamemodes[mode].name}</h1>
		<p>{gamemodes[mode].type}</p>
	</div>
}