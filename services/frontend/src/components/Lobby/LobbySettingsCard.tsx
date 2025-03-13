import Babact from "babact";
import Card from "../../ui/Card";
import useGamemodes from "../../hooks/useGamemodes";
import Button from "../../ui/Button";
import { useAuth } from "../../contexts/useAuth";
import { useLobby } from "../../contexts/useLobby";
import { useNavigate } from "babact-router-dom";

export default function LobbySettingsCard({
		lobby
	}: {
		lobby: any
	}) {

	const gamemodes = useGamemodes();
	const { leave } = useLobby();

	const { me } = useAuth();

	const navigate = useNavigate();

	const onLeave = () => {
		leave();
		if (window.location.pathname.startsWith('/lobby'))
			navigate('/');
	}

	return <Card className='lobby-settings-card left gap-4 justify-center'>
		<div className='flex justify-between'>
			<div className='flex flex-col gap-2'>
				<h1>{gamemodes[lobby.mode.name].name}</h1>
				<h2>{gamemodes[lobby.mode.name].type}</h2>
			</div>
			<div className='flex flex-col gap-2'>
				<div className='flex gap-2'>
					{lobby.state.joinable ? <i className="fa-solid fa-lock-open"></i> : <i className="fa-s	-lock"></i>}
					<p>{lobby.state.type}</p>
				</div>
				<p>
					{lobby.players.length}/{lobby.mode.team_size * lobby.mode.team_count} Players
				</p>
			</div>
		</div>
			<div className='flex gap-2'>
				{ me && lobby.leader_account_id === me.account_id &&
					<>
						<Button className="success">
							<i className="fa-solid fa-play"></i>
							Start
						</Button>
						<Button>
							<i className="fa-solid fa-cog"></i>
							Change Gamemode
						</Button>
					</>
				}
				<Button className="danger" onClick={onLeave}>
					<i className="fa-solid fa-sign-out"></i>
					Logout
				</Button>
			</div>
	</Card>
}