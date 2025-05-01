import Babact from "babact";
import { Match } from "../../hooks/useTournament";
import Avatar from "../../ui/Avatar";

export default function ProfileGameListItem({
		match
	}: {
		match?: Match
	}) {

	const [isWin, setIsWin] = Babact.useState(false);

	Babact.useEffect(() => {
		setIsWin(Math.random() > 0.5);
	}, []);

	return <div className={`profile-game-list-item flex flex-row items-center justify-between w-full ${isWin ? 'win' : 'lose'}`}>
		<div className='flex flex-row items-center gap-2'>
			<Avatar
				size="lg"
				name="Player 1"
			/>
			<Avatar
				size="lg"
				name="Player 2"
			/>
			<h2>
				Teams 1
			</h2>
		</div>
		<div className='flex flex-col items-center justify-center gap-1'>
			<h1>
				0 - 3
			</h1>
			<h3>
				Unranked
			</h3>
		</div>
		<div className='flex flex-row items-center gap-2'>
			<h2>
				Teams 2
			</h2>
			<Avatar
				size="lg"
				name="Player 3"
			/>
			<Avatar
				size="lg"
				name="Player 4"
			/>
		</div>
	</div>
}