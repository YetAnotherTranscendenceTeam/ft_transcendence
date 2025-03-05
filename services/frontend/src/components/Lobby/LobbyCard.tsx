import Babact from "babact";
import Card from "../../ui/Card";
import './lobby.css'
import Button from "../../ui/Button";
import { useLobby } from "../../contexts/useLobby";
import Avatar from "../../ui/Avatar";
import { useNavigate } from "babact-router-dom";


export default function LobbyCard() {

	const {lobby} = useLobby();

	const navigate = useNavigate();

	if (lobby)
	return <Card className='lobby-card bottom gap-4'>
		<div className='lobby-card-header flex items-center justify-between w-full gap-4'>
			<div className='flex flex-col gap-1'>
				<h1>{lobby.mode?.name}</h1>
				<h2>{lobby.mode?.ranked ? 'Ranked' : 'Unranked'}</h2>
			</div>
			<Button className="icon primary" onClick={() => navigate(`/lobby/${lobby.joinSecret}`)}><i className="fa-solid fa-square-arrow-up-right"></i></Button>
		</div>
		<div className='lobby-card-body flex gap-1'>
			{lobby.players.map((player: any) => {
				if (player.profile)
					return <Avatar key={player.account_id} src={player.profile.avatar} name={player.profile.username}/>
				else
					return <Avatar key={player.account_id} name={player.account_id.toString()} />
			})}
		</div>
	</Card>
}