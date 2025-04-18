import Babact from "babact";
import Card from "../../ui/Card";
import LobbyPlayerCard from "./LobbyPlayerCard";
import { useLobby } from "../../contexts/useLobby";
import { useAuth } from "../../contexts/useAuth";
import Editable from "../../ui/Editable";
import { IPlayer } from "yatt-lobbies";
import { ITeam } from "yatt-lobbies/dist/Lobby";

class DraggableCard {

	card: HTMLElement;
	switchCard: HTMLElement;
	initialX: number;
	initialY: number;

	constructor(card: HTMLElement) {
		this.card = card;
		this.initialX = card.getBoundingClientRect().x;
		this.initialY = card.getBoundingClientRect().y;
		this.switchCard = null;
		this.setPosition(this.initialX,  this.initialY);
		this.card.style.width = `${card.getBoundingClientRect().width}px`;
		this.card.classList.add('dragging');
	}

	getInitialPosition() {
		return {
			x: this.initialX,
			y: this.initialY
		}
	}

	setPosition(x: number, y: number) {
		this.card.style.setProperty('--x', x + 'px');
		this.card.style.setProperty('--y', y + 'px');
	}

	getPosition() {
		return {
			x: parseInt(this.card.style.getPropertyValue('--x')) ?? 0,
			y: parseInt(this.card.style.getPropertyValue('--y')) ?? 0
		}
	}

	setSwitchCard(wrapper: HTMLElement) {
		this.switchCard = wrapper.firstChild as HTMLElement;
		this.switchCard.style.width = `${this.card.getBoundingClientRect().width}px`;
		this.switchCard.style.position = 'absolute';
		this.switchCard.style.left = `${this.initialX}px`;
		this.switchCard.style.top = `${this.initialY}px`;
	}

	resetSwitchCard() {
		if (!this.switchCard)
			return;
		this.switchCard.style.removeProperty('width');
		this.switchCard.style.removeProperty('position');
		this.switchCard.style.removeProperty('left');
		this.switchCard.style.removeProperty('top');
		this.switchCard = null;
	}

	getSwitchPlayerId() {
		if (!this.switchCard)
			return null;
		return parseInt(this.switchCard.id);
	}

	resetPosition() {
		this.card.classList.remove('dragging');
		this.card.style.removeProperty('width');
		this.card.style.removeProperty('--x');
		this.card.style.removeProperty('--y');
	}

}

export default function LobbyTeamsList() {

	const draggingCard = Babact.useRef<DraggableCard>(null);
	const { lobby } = useLobby();

	const [teams, setTeams] = Babact.useState<ITeam[]>([]);

	const { me } = useAuth();

	const swapTeamPlayers = (id1: number, id2: number) => {
		const newTeams = [...teams];
		const player1 = newTeams.find(t => t.players.find(p => p.account_id === id1)).players.find(p => p.account_id === id1);
		const player2 = newTeams.find(t => t.players.find(p => p.account_id === id2)).players.find(p => p.account_id === id2);
		const team1 = newTeams.find(t => t.players.find(p => p.account_id === id1));
		const team2 = newTeams.find(t => t.players.find(p => p.account_id === id2));
		const index1 = team1.players.indexOf(player1);
		const index2 = team2.players.indexOf(player2);
		team1.players[index1] = player2;
		team2.players[index2] = player1;
		setTeams(newTeams);
	};

	Babact.useEffect(() => {
		setTeams(lobby.getTeams());
	}, [lobby]);

	const [draggingPlayer, setDraggingPlayer] = Babact.useState<number>(null);

	Babact.useEffect(() => {
		if (!draggingPlayer) return;
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);
		return () => {
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mousemove', handleMouseMove);
		}
	}, [draggingPlayer]);

	const handleMouseMove = (e: MouseEvent) => {
		if (draggingPlayer && draggingCard.current) {
			const {x, y} = draggingCard.current.getPosition();
			draggingCard.current.setPosition(x + e.movementX, y + e.movementY);
		}
	}

	const handleMouseDown = (e: MouseEvent, account_id: number) => {
		if (e.button !== 0) return;
		if (!(e.target instanceof HTMLElement))
			return;
		draggingCard.current = new DraggableCard(e.target);
		setDraggingPlayer(account_id);
	}

	const handleMouseUp = (e: MouseEvent) => {
		setDraggingPlayer(null);
		if (draggingPlayer && draggingCard.current) {
			const switchPlayerId = draggingCard.current.getSwitchPlayerId();
			draggingCard.current.resetSwitchCard();
			if (switchPlayerId) {
				lobby.swapPlayers(draggingPlayer, switchPlayerId);
				swapTeamPlayers(draggingPlayer, switchPlayerId);
			}
			draggingCard.current.resetPosition();
		}
	}

	const handleMouseEnter = (e: MouseEvent, account_id: number) => {
		if (draggingPlayer && account_id !== draggingPlayer) {
			draggingCard.current?.setSwitchCard(e.target as HTMLElement);
		}
	}

	const handleMouseLeave = (e: MouseEvent, account_id: number) => {
		draggingCard.current?.resetSwitchCard();
		setTeams(lobby.getTeams());
	}

	if (me)
	return <div className='lobby-teams scrollbar'>
		{teams.map((team, i) => (
			<Card
				key={'team'+i} className='lobby-team'
				style={`--team-color: var(--team-${i % 2 + 1}-color);`}
			>
				<Editable
					key={'editable'}
					defaultValue={team.name ?? `Team ${i + 1}`}
					disabled={!team.players.find(p => p.account_id === me.account_id)}
					maxLength={20}
					onEdit={(value) => {
						lobby.changeTeamName(value);
					}}
				/>
				{team.players.map((player: IPlayer, i) => (
					<LobbyPlayerCard
						isLeader={player.account_id === lobby.leader_account_id}
						draggable={(me.account_id === lobby.leader_account_id || team.players.find(p => p.account_id === me.account_id)) && lobby.mode.team_size > 1}
						onMouseDown={(e) => handleMouseDown(e, player.account_id)}
						onMouseEnter={(e) => handleMouseEnter(e, player.account_id)}
						onMouseLeave={(e) => handleMouseLeave(e, player.account_id)}
						key={'player'+i}
						player={player}
					/>
				))}
				{new Array(Math.max(lobby.mode.team_size - team.players.length, 0)).fill(null).map((_, index) => (
					<Card key={'empty'+index} className='empty flex flex-row gap-2 items-center'>
					</Card>
				))}
			</Card>
		))}
	</div>
}
