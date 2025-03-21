import Babact from "babact";
import Card from "../../ui/Card";
import LobbyPlayerCard from "./LobbyPlayerCard";
import { useLobby } from "../../contexts/useLobby";
import { useAuth } from "../../contexts/useAuth";
import Editable from "../../ui/Editable";
import { IPlayer } from "yatt-lobbies";
import { ITeam } from "yatt-lobbies/dist/Lobby";

export default function LobbyTeamsList() {

	const { lobby } = useLobby();
	const switchingPlayer = Babact.useRef(null);
	
	const [players, setPlayers] = Babact.useState(lobby.players);
	const [teams, setTeams] = Babact.useState<ITeam[]>([]);
	const width = Babact.useRef(0);

	const { me } = useAuth();

	Babact.useEffect(() => {
		setTeams(lobby.getTeams());
		console.log(lobby.getTeams());
	}, [players, lobby]);

	Babact.useEffect(() => {
		setPlayers(lobby.players);
	}, [lobby]);

	const [draggingPlayer, setDraggingPlayer] = Babact.useState(null);
	const [transform, setTransform] = Babact.useState({x: 0, y: 0});

	Babact.useEffect(() => {
		if (!draggingPlayer) return;
		
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);
		return () => {
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mousemove', handleMouseMove);
		}
	}, [draggingPlayer]);

	const handleMouseMove = (e) => {
		if (draggingPlayer) {
			setTransform((p) => ({
				x: e.movementX + p.x,
				y: e.movementY + p.y
			}))
		}
	}

	const handleMouseDown = (e, account_id) => {
		if (e.button !== 0) return;
		setDraggingPlayer(account_id);
		width.current = e.target.getBoundingClientRect().width;
		setTransform({
			x: e.target.getBoundingClientRect().x,
			y: e.target.getBoundingClientRect().y
		});
	}

	const handleMouseUp = (e) => {
		setDraggingPlayer(null);
		setTransform({
			x: 0,
			y: 0
		})
		if (switchingPlayer.current)
			lobby.swapPlayers(draggingPlayer, switchingPlayer.current);
		switchingPlayer.current = null;
	}

	const handleMouseEnter = (e, account_id) => {
		if (draggingPlayer && account_id !== draggingPlayer) {
			const newPlayers = [...players];
			const draggingIndex = newPlayers.findIndex((p) => p.account_id === draggingPlayer);
			const accountIndex = newPlayers.findIndex((p) => p.account_id === account_id);
			const temp = newPlayers[draggingIndex];
			newPlayers[draggingIndex] = newPlayers[accountIndex];
			newPlayers[accountIndex] = temp;
			setPlayers(newPlayers);
			switchingPlayer.current = account_id;
		}
	}

	const handleMouseLeave = (e, account_id) => {
		if (players != lobby.players)
			setPlayers(lobby.players);
		switchingPlayer.current = null;
	}

	if (me)
	return <div className='lobby-teams scrollbar'>
		{teams.map((team, i) => (
			<Card
				key={'team'+i} className='lobby-team'
				style={`--team-color: var(--team-${i % 2 + 1}-color)`}
			>
				<Editable
					defaultValue={team.name ?? `Team ${i + 1}`}
					disabled={!team.players.find(p => p.account_id === me.account_id)}
					onEdit={(value) => {
						lobby.changeTeamName(i, value);
					}}
				/>
				{team.players.map((player: IPlayer, i) => (
					<LobbyPlayerCard
						isLeader={player.account_id === lobby.leader_account_id}
						draggable={(me.account_id === lobby.leader_account_id || team.players.find(p => p.account_id === me.account_id)) && lobby.mode.team_size > 1}
						position={draggingPlayer === player.account_id ? transform : {x: 0, y: 0}}
						dragging={draggingPlayer === player.account_id}
						onMouseDown={(e) => handleMouseDown(e, player.account_id)}
						onMouseEnter={(e) => handleMouseEnter(e, player.account_id)}
						onMouseLeave={(e) => handleMouseLeave(e, player.account_id)}
						key={'player'+i}
						style={`--width: ${width.current}px;`}
						player={player}
					/>
				))}
				{new Array(Math.max(lobby.mode.team_size - team.players.length, 0)).fill(null).map((_, index) => (
					<Card key={'empty-'+index} className='empty flex flex-row gap-2 items-center'>
					</Card>
				))}
			</Card>
		))}
	</div>
}