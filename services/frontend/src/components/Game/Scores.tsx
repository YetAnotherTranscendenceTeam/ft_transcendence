import Babact from "babact";
import Card from "../../ui/Card";
import './game.css'
import { usePong } from "../../contexts/usePong";
import Avatar from "../../ui/Avatar";
import { PongState } from "pong";

export default function Scores() {

	const { overlay } = usePong();
	const [scores, setScores] = Babact.useState<string[]>(null);

	const pointToWin = overlay.pointsToWin;
	const bestOf = pointToWin * 2 - 1;
	const goal = Math.floor(bestOf / 2);

	const generateScores = () => {
		const newScores = new Array(overlay.scores[0]).fill('team-1').concat(
			new Array(bestOf - overlay.scores[0] - overlay.scores[1]).fill('')
		).concat(
			new Array(overlay.scores[1]).fill('team-2')
		);
		setScores(newScores);
	}

	const pulseIndex: number = (overlay.gameStatus.name === PongState.ENDED.name && goal) || (overlay.lastWinner !== null && (overlay.lastWinner === 0 ? overlay.scores[0] - 1 : bestOf - overlay.scores[1]));

	Babact.useEffect(() => {
		if (overlay.scores) {
			generateScores();
		}
	}, [overlay.scores[0], overlay.scores[1]]);

	return <Card className='scores'>
		<div className="flex flex-row gap-2 items-center flex-1">
			{ overlay.teams.length > 1 &&
				<div className="flex items-center gap-2">
					{overlay.teams[0].players.map((player, index) => (
						<Avatar
						name={player.profile.username}
						src={player.profile.avatar}
						key={player.account_id}
						/>
					))}
				</div>
			}
			<div className='score flex flex-col gap-2 justify-center items-center'>
				<div
					className='flex gap-2 justify-center items-center w-full'
				>
					{overlay.teams.length > 1 &&<div className="score-team-name flex flex-col">
						<p>{overlay.teams[0].getDisplayName()}</p>
						<p>{overlay.teams[1].getDisplayName()}</p>
					</div>}
					<i className="fa-solid fa-crown"></i>
					{overlay.teams.length > 1 &&<div className="score-team-name flex flex-col">
						<p>{overlay.teams[1].getDisplayName()}</p>
						<p>{overlay.teams[0].getDisplayName()}</p>
					</div>}
				</div>
				<div className='score-frame-container flex justify-between items-center gap-1'>
					{scores && scores.map((_, index) => <span
						className={`score-frame ${index === goal ? 'goal' : ''} ${_} ${index === pulseIndex ? 'pulse' : ''}`}
						key={index}
					/>)}
				</div>
			</div>
			{ overlay.teams.length > 1 &&
				<div className="flex items-center gap-2 flex-1">
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
		<div className='time'>
			{Math.round(overlay.time / 60).toString().padStart(2, '0')} : {Math.round(overlay.time % 60).toString().padStart(2, '0')}
		</div>
	</Card>
}