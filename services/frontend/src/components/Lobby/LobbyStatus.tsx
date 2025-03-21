import Babact from "babact";
import { LobbyStateType } from "yatt-lobbies";

export default function LobbyStatus({state}) {

	if (state.type === LobbyStateType.QUEUED)
		return <div className='flex gap-2 items-center'>
			<i className="fa-solid fa-clock"></i>
			<p>Queueing</p>
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