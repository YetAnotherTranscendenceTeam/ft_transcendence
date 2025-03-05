import Babact from "babact";
import Card from "../../ui/Card";
import LobbyPlayerCard from "./LobbyPlayerCard";

export default function LobbyPlayerList({lobby}) {
	
	const createTeam = () => {
		const teams = new Array(lobby.mode.team_count).fill(null).map(() => []);
		lobby.players.forEach((player, i) => {
			teams[i % lobby.mode.team_count].push(player);
		})
		return teams;
	}

	const [dragging, setDragging] = Babact.useState(false);
	
	const [position, setPosition] = Babact.useState({x: 0, y: 0});

	const [initialPosition, setInitialPosition] = Babact.useState({x: 0, y: 0});

	Babact.useEffect(() => {
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}
	}, [dragging]);

	const handleMouseMove = (e) => {
		if (dragging !== false) {
			setPosition({x: e.clientX - initialPosition.x, y: e.clientY - initialPosition.y});
		}
	}

	const handleMouseDown = (e, account_id) => {
		setInitialPosition({x: e.clientX, y: e.clientY});
		setPosition({x: 0, y: 0});
		setDragging(account_id);
	}

	const handleMouseUp = (e) => {
		setDragging(false);
	}

	return <div className='lobby-player-list'>
		{createTeam().map((team, i) => (
			<Card key={i} className='lobby-player-list-team left' style={`--team-color: var(--team-${i % 2 + 1}-color)`}>
				<h1>Team {i + 1}</h1>
				{team.map((player) => (
					<LobbyPlayerCard
						position={position}
						dragging={dragging === player.account_id}
						onMouseDown={(e) => handleMouseDown(e, player.account_id)}
						key={player.account_id}
						player={player}
					/>
				))}
				{new Array(lobby.mode.team_size - team.length).fill(null).map((_, i) => (
					<Card key={-i} className='empty flex flex-row gap-2 items-center'>
						Empty
					</Card>
				))}
			</Card>
		))}
	</div>
}