import Babact from "babact";
import useGamemodes from "../../hooks/useGamemodes";
import { useLobby } from "../../contexts/useLobby";

export default function ModeButton({
		mode,
		onSelect
	}: {
		mode: string,
		onSelect: (mode: string) => void
	}) {

	const { lobby } = useLobby();

	const gamemodes = useGamemodes();

	
	if (!gamemodes[mode])
		return null;
	const disabled = (lobby && gamemodes[mode].team_size * gamemodes[mode].team_count < lobby.players.length) || lobby?.mode.name === mode;
	return <div
		className={`mode-button flex items-center justify-center ${gamemodes[mode].type} ${disabled ? 'disabled' : ''}`}
		onClick={() => onSelect(mode)}
	>
		<h1>{gamemodes[mode].name}</h1>
		<p>{gamemodes[mode].type}</p>
	</div>
}