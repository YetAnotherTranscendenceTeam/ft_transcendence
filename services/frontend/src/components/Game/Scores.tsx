import Babact from "babact";
import Card from "../../ui/Card";
import './game.css'
import { usePong } from "../../contexts/usePong";
import Avatar from "../../ui/Avatar";

export default function Scores() {

	const { overlay } = usePong();

	return <Card className='scores'>
		<div className="flex flex-row gap-4 items-center">
			{ overlay.teams.length > 1 &&
				<div className="flex items-center gap-2">
					{overlay.teams[0].players.map((player, index) => (
						<Avatar
							name={player.profile.username}
							src={player.profile.avatar}
							key={player.account_id}
						/>
					))}
					<p>
						{overlay.teams[0].getDisplayName()}
					</p>
				</div>
			}
			<div className='score'>
				{overlay.scores[0]}
			</div>
			<div className='time'>
				{Math.round(overlay.time / 60).toString().padStart(2, '0')} : {Math.round(overlay.time % 60).toString().padStart(2, '0')}
			</div>
			<div className='score'>
				{overlay.scores[1]}
			</div>
			{ overlay.teams.length > 1 &&
				<div className="flex items-center gap-2">
					<p>
						{overlay.teams[1].getDisplayName()}
					</p>
					{overlay.teams[1].players.map((player, index) => (
						<Avatar
							name={player.profile.username}
							src={player.profile.avatar}
							key={player.account_id}
						/>
					))}
				</div>
			}
		</div>
	</Card>
}