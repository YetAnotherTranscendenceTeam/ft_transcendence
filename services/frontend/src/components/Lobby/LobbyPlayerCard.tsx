import Babact from "babact";
import Card from "../../ui/Card";
import Avatar from "../../ui/Avatar";

function LobbyPlayerCardContent({player, isLeader, draggable} : {player: any, isLeader: boolean, draggable?: boolean}) {
	return <div className='lobby-player-card-content flex flex-row gap-2 items-center'>
		<Avatar src={player.profile?.avatar} name={player.profile?.username}/>
		{player.profile?.username}
		{isLeader && <i className="fa-solid fa-crown"></i>}
		{draggable && <i className="grab-icon fa-solid fa-grip-vertical"></i>}
	</div>
}

export default function LobbyPlayerCard({
		player,
		position,
		dragging,
		onMouseDown,
		onMouseEnter,
		onMouseLeave,
		draggable,
		isLeader,
		...props
	} : {
		player: any,
		position: {x: number, y: number},
		dragging: boolean,
		onMouseDown: (e: any) => void,
		onMouseEnter: (e: any) => void,
		onMouseLeave: (e: any) => void,
		draggable: boolean,
		isLeader: boolean,
		[key: string]: any
	}) {

	if (draggable)
		return <div className='lobby-player-card-wrapper flex items-center justify-center'
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			{...props}
		>
			<Card
				onMouseDown={onMouseDown}
				className={`lobby-player-card flex flex-row gap-2 items-center justify-between draggable ${dragging ? 'dragging' : ''}`}
				style={`--x: ${position.x}px; --y: ${position.y}px;`}
				>
				<LobbyPlayerCardContent player={player} isLeader={isLeader} draggable/>
			</Card>
		</div>

	return <div className='lobby-player-card-wrapper flex items-center justify-center'
		{...props}
	>
		<Card
			className={`lobby-player-card flex flex-row gap-2 items-center justify-between`}
		>
			<LobbyPlayerCardContent player={player} isLeader={isLeader}/>
		</Card>
	</div>
}