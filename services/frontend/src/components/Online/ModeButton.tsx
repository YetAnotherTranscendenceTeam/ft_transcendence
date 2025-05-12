import Babact from "babact";
import { useLobby } from "../../contexts/useLobby";
import { GameMode, GameModeType } from "yatt-lobbies";
import PopHover from "../../ui/PopHover";

export default function ModeButton({
		gamemode,
		onSelect,
		rating = 200,
	}: {
		gamemode: GameMode,
		onSelect: (mode: string) => void,
		rating?: number
	}) {

	const { lobby } = useLobby();

	const getDescription = () => {
		if (gamemode.type === GameModeType.CUSTOM)
			return <>Bring your friends together<br/> Practice in customizable matches</>;
		if (gamemode.type === GameModeType.TOURNAMENT)
			return <>Clash in a tournament-style bracket<br/> From up to 16 teams, one will triumph</>;
		if (gamemode.type === GameModeType.RANKED)
			return <>Face off in competitive matchmaking<br/> Claim victory to climb the leaderboard!</>;
		if (gamemode.type === GameModeType.UNRANKED)
			return <>Train your skills in casual matchmaking<br/> No ranks, just good times!</>;
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
		className={`mode-button flex flex-col justify-end gap-2 ${gamemode.type} ${disabled ? 'disabled' : ''} ${lobby?.mode.type === gamemode.type ? 'selected' : ''}`}
		onClick={() => onSelect(gamemode.name)}
	>
		{gamemode.type === GameModeType.RANKED && <div className='mode-button-mmr flex gap-1 justify-center'>
			<h3>{Math.floor(rating)}</h3>
			<PopHover
				content="Matchmaking Rating is a score that reflects your skill level in the game. It's used to match you with players of similar ability."
			>
				<i className="fa-solid fa-circle-info"></i>
			</PopHover>
		</div>}
		<div className='flex gap-1 items-end'>
			<h1>{getIcon()} {gamemode.getDisplayTypeName()}</h1>
			{(gamemode.type === GameModeType.RANKED || gamemode.type === GameModeType.UNRANKED) && <h2>{gamemode.getDisplayName()}</h2>}
		</div>
		<p>{getDescription()}</p>
	</div>
}
