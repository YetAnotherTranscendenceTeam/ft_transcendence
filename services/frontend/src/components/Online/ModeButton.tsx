import Babact from "babact";
import { useLobby } from "../../contexts/useLobby";
import { GameMode } from "yatt-lobbies";

export default function ModeButton({
		gamemode,
		onSelect
	}: {
		gamemode: GameMode,
		onSelect: (mode: string) => void
	}) {

	const { lobby } = useLobby();


	const disabled = (lobby && gamemode.getLobbyCapacity() < lobby.players.length) || lobby?.mode.name === gamemode.name;
	return <div
		className={`mode-button flex items-center justify-center ${gamemode.type} ${disabled ? 'disabled' : ''}`}
		onClick={() => onSelect(gamemode.name)}
	>
		<h1>{gamemode.getDisplayName()}</h1>
		<p>{gamemode.type}</p>
	</div>
}