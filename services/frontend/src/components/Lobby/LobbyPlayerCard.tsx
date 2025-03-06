import Babact from "babact";
import Card from "../../ui/Card";
import Avatar from "../../ui/Avatar";

export default function LobbyPlayerCard({
		player,
		position,
		dragging,
		...props
	} : {
		player: any,
		position: {x: number, y: number},
		dragging: boolean,
		[key: string]: any
	}) {

	return <Card
		className={`lobby-player-card flex flex-row gap-2 items-center justify-between ${dragging ? 'dragging' : ''}`}
		style={`--x: ${position.x}px; --y: ${position.y}px;`}
		{...props}
	>
		<div className='flex flex-row gap-2 items-center'>
			<Avatar src={player.profile?.avatar} name={player.profile?.username}/>
			{player.profile?.username}
		</div>
		<i className="fa-solid fa-grip-vertical"></i>
	</Card>
}