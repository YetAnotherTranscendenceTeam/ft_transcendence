import Babact from "babact";
import { LobbyStateType } from "yatt-lobbies";
import Spinner from "../../ui/Spinner";

export default function LobbyStatus({
		state,
		timer
	}: {
		state: {
			type: LobbyStateType
		}
		timer?: number;
	}) {

	if (state.type === LobbyStateType.QUEUED)
		return <div className='flex gap-2 items-center'>
			<p>{Math.floor((timer ?? 0) / 60).toString().padStart(2, '0')}:{Math.floor((timer ?? 0) % 60).toString().padStart(2, '0')}</p>
			<Spinner />
			<p>In Queue</p>
		</div>

	if (state.type === LobbyStateType.WAITING)
		return <div className='flex gap-2 items-center'>
			<i className="fa-solid fa-users"></i>
			<p>Waiting for Players</p>
		</div>

	if (state.type === LobbyStateType.PLAYING)
		return <div className='flex gap-2 items-center'>
			<i className="fa-solid fa-play"></i>
			<p>In game</p>
		</div>
}