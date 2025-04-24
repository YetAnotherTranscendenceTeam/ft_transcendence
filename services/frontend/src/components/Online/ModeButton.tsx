import Babact from "babact";
import { useLobby } from "../../contexts/useLobby";
import { GameMode, GameModeType } from "yatt-lobbies";

export default function ModeButton({
		gamemode,
		onSelect
	}: {
		gamemode: GameMode,
		onSelect: (mode: string) => void
	}) {

	const { lobby } = useLobby();

	const getDescription = () => {
		if (gamemode.type === GameModeType.CUSTOM)
			return "Up to 16 teams, any rules. 3+ teams? It's tournament time.";
		if (gamemode.type === GameModeType.RANKED)
			return 'Competitive 1v1 battles with power-ups enabled. Every match affects your MMR';
		if (gamemode.type === GameModeType.UNRANKED)
			return '1v1 matches with power-ups enabled. Play freely without affecting your MMR';
	}



	const disabled = (lobby && gamemode.getLobbyCapacity() < lobby.players.length) || lobby?.mode.name === gamemode.name;
	return <div
		className={`mode-button flex flex-col justify-end gap-2 ${gamemode.type} ${disabled ? 'disabled' : ''}`}
		onClick={() => onSelect(gamemode.name)}
	>
		<h1>{gamemode.type}</h1>
		<h2>{gamemode.getDisplayName()}</h2>
		<p>{getDescription()}</p>
	</div>
}