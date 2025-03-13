import Babact from "babact";
import useGamemodes from "../../hooks/useGamemodes";

export default function ModeButton({
		mode,
		onSelect
	}: {
		mode: string,
		onSelect: (mode: string) => void
	}) {

	const gamemodes = useGamemodes();

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