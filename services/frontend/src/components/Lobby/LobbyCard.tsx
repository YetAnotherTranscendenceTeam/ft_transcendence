import Babact from "babact";
import Card from "../../ui/Card";
import './lobby.css'
import Button from "../../ui/Button";
import { useLobby } from "../../contexts/useLobby";
import Avatar from "../../ui/Avatar";
import { useNavigate } from "babact-router-dom";
import useGamemodes from "../../hooks/useGamemodes";
import { useAuth } from "../../contexts/useAuth";


export default function LobbyCard() {

	const { lobby, leave } = useLobby();

	const navigate = useNavigate();

	const gamemodes = useGamemodes();

	const { me } = useAuth();

	const onLeave = () => {
		leave();
		if (window.location.pathname.startsWith('/lobby'))
			navigate('/');
	}

	if (lobby)
	return <Card className='lobby-card left gap-4'>
		<div className='lobby-card-header flex items-center justify-between w-full gap-4'>
			<div className='flex gap-4'>
				<div className='flex flex-col gap-1'>
					<h1>{gamemodes[lobby.mode.name].name}</h1>
					<h2>{gamemodes[lobby.mode.name].type}</h2>
				</div>
				{ !window.location.pathname.startsWith('/lobby')  &&
					<Button
						className="icon primary"
						onClick={() => navigate(`/lobby/${lobby.joinSecret}`)}
					>
						<i className="fa-solid fa-square-arrow-up-right"></i>
					</Button>
				}
			</div>
			<div className='flex flex-col gap-2 items-end'>
				<div className='flex gap-2'>
					<h1 className='flex gap-2'>
						{lobby.state.joinable ? <i className="fa-solid fa-lock-open"></i> : <i className="fa-s	-lock"></i>}
						{lobby.state.type}
					</h1>
				</div>
				<h2>
					{lobby.players.length}/{lobby.mode.team_size * lobby.mode.team_count} Players
				</h2>
			</div>
		</div>
		<div className='lobby-card-body flex gap-1'>
			{lobby.players.map((player: any, i) => {
				if (player.profile)
					return <Avatar key={i} src={player.profile.avatar} name={player.profile.username}/>
				else
					return <Avatar key={i} name={player.account_id.toString() } />
			})}
		</div>
		<div className='lobby-card-footer flex gap-2'>
			{ me && lobby.leader_account_id === me.account_id &&
			<Button className="success">
				<i className="fa-solid fa-play"></i>
				Start
			</Button>
			}
			<Button className="danger" onClick={onLeave}>
				<i className="fa-solid fa-sign-out"></i>
				Leave
			</Button>
		</div>
	</Card>
}