import Babact from "babact";
import Card from "../../ui/Card";
import LobbyPlayerCard from "./LobbyPlayerCard";

type PlayerCard = {
	account_id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export default function LobbyTeamsList({lobby}) {
	
	const [players, setPlayers] = Babact.useState(lobby.players);

	const createTeam = () => {
		const teams = new Array(lobby.mode.team_count).fill(null).map(() => []);
		players.forEach((player, i) => {
			teams[i % lobby.mode.team_count].push(player);
		})
		// console.log('teams', teams)
		return teams;
	}

	const teams = Babact.useRef([]);

	Babact.useEffect(() => {
		teams.current = createTeam();
	}, [players]);

	const [draggingPlayer, setDraggingPlayer] = Babact.useState(false);

	const [position, setPosition] = Babact.useState({x: 0, y: 0});

	const [initialPosition, setInitialPosition] = Babact.useState({x: 0, y: 0});

	Babact.useEffect(() => {
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}
	}, [draggingPlayer, initialPosition]);

	Babact.useEffect(() => {
		setPlayers(lobby.players);
	}, [lobby]);

	const handleMouseMove = (e) => {
		// if (dragging !== false) {
		// 	setPosition({x: e.clientX - initialPosition.x, y: e.clientY - initialPosition.y});
		// }
	}

	const handleMouseDown = (e, account_id) => {
		setDraggingPlayer({
			account_id,
			x: e.clientX,
			y: e.clientY,
			width: e.target.offsetWidth,
			height: e.target.offsetHeight
		});
		// console.log('down', account_id, e)	
		// setInitialPosition({x: e.clientX, y: e.clientY});
		// setPosition({x: 0, y: 0});
		// setDragging(account_id);
	}

	const handleMouseUp = (e) => {
		// setDragging(false);
	}

	const handleMouseEnter = (e, account_id) => {
		// console.log('enter', account_id)
		// if (dragging != false && dragging != account_id) {
		// 	const playerIndex = players.findIndex((player) => player.account_id === account_id);
		// 	const draggingIndex = players.findIndex((player) => player.account_id === dragging);
		// 	const newPlayers = [...players];
		// 	const temp = newPlayers[playerIndex];
		// 	newPlayers[playerIndex] = newPlayers[draggingIndex];
		// 	newPlayers[draggingIndex] = temp;
		// 	setPlayers(newPlayers);
		// 	setInitialPosition({x: e.clientX, y: e.clientY});
		// }

	}

	const handleMouseLeave = (e, account_id) => {
		// console.log('leave', account_id)
		// setPlayers(lobby.players);
		// setInitialPosition({x: e.clientX, y: e.clientY});
	}

	return <div className='lobby-teams'>
		{teams.current.map((team, i) => (
			<Card
				key={i} className='lobby-team left'
				// style={`--team-color: var(--team-${i % 2 + 1}-color)`}
			>
				<h1>Team {i + 1}</h1>
				{team.map((player) => (
					<LobbyPlayerCard
						position={draggingPlayer.account_id === player.account_id ? position : {x: 0, y: 0}}
						dragging={draggingPlayer.account_id === player.account_id}
						onMouseDown={(e) => handleMouseDown(e, player.account_id)}
						onMouseEnter={(e) => handleMouseEnter(e, player.account_id)}
						onMouseLeave={(e) => handleMouseLeave(e, player.account_id)}
						key={player.account_id}
						player={player}
					/>
				))}
				{new Array(lobby.mode.team_size - team.length).fill(null).map((_, index) => (
					<Card key={'empty-'+index} className='empty flex flex-row gap-2 items-center'>
						Empty
					</Card>
				))}
			</Card>
		))}
	</div>
}