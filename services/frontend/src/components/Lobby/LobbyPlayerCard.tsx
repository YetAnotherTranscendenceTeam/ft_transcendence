import Babact from "babact";
import Card from "../../ui/Card";
import Avatar from "../../ui/Avatar";

export default function LobbyPlayerCard({
		player,
		position,
		dragging,
		onMouseDown,
		onMouseEnter,
		onMouseLeave,
		...props
	} : {
		player: any,
		position: {x: number, y: number},
		dragging: boolean,
		onMouseDown: (e: any) => void,
		onMouseEnter: (e: any) => void,
		onMouseLeave: (e: any) => void,
		[key: string]: any
	}) {

	console.log('player', player);
	return <div className='lobby-player-card-wrapper flex items-center justify-center'
		onMouseEnter={onMouseEnter}
		onMouseLeave={onMouseLeave}
		{...props}
	>
		<Card
			onMouseDown={onMouseDown}
			className={`lobby-player-card flex flex-row gap-2 items-center justify-between ${dragging ? 'dragging' : ''}`}
			style={`--x: ${position.x}px; --y: ${position.y}px;`}
			>
			<div className='flex flex-row gap-2 items-center'>
				<Avatar src={player.profile?.avatar} name={player.profile?.username}/>
				{player.isLeader && <i className="fa-solid fa-crown"></i>}
				{player.profile?.username}
			</div>
			<i className="fa-solid fa-grip-vertical"></i>
		</Card>
	</div>
}