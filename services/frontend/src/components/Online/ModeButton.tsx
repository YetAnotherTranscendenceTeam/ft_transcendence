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
			return "Custom matches played with friends. No MMR changes";
		if (gamemode.type === GameModeType.TOURNAMENT)
			return "Clash matches played with friends. No MMR changes";
		if (gamemode.type === GameModeType.RANKED)
			return 'Competitive matches with power-ups enabled. Every match affects your MMR';
		if (gamemode.type === GameModeType.UNRANKED)
			return 'Matches with power-ups enabled. Play freely without affecting your MMR';
		
	}

	const getIcon = () => {
		if (gamemode.type === GameModeType.CUSTOM)
			return <i className="fa-solid fa-users"></i>;
		if (gamemode.type === GameModeType.RANKED)
			return <i className="fa-solid fa-trophy"></i>;
		if (gamemode.type === GameModeType.UNRANKED)
			return <i className="fa-solid fa-gamepad"></i>;
		if (gamemode.type === GameModeType.TOURNAMENT)
			return <i className="fa-solid fa-people-group"></i>;
	}



	const disabled = (lobby && gamemode?.getLobbyCapacity() < lobby.players.length) || lobby?.mode.name === gamemode.name;
	return <div
		className={`mode-button flex flex-col justify-end gap-2 ${gamemode.type} ${disabled ? 'disabled' : ''}`}
		onClick={() => onSelect(gamemode.name)}
	>
		<div className='flex gap-1 items-end'>
			<h1>{getIcon()} {gamemode.getDisplayTypeName()}</h1>
			{(gamemode.type === GameModeType.RANKED || gamemode.type === GameModeType.UNRANKED) && <h2>{gamemode.getDisplayName()}</h2>}
		</div>
		<p>{getDescription()}</p>
	</div>
}