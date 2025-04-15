import Babact from "babact";
import Button from "../../ui/Button";
import Timer from "./Timer";
import config from "../../config";
import Key from "../../ui/Key";
import Card from "../../ui/Card";

export default function GamePausedModal({
		onResume,
		onClick,
	}: {
		onResume: () => void,
		onClick: () => void,
	}) {

	const [resumeTimer, setResumeTimer] = Babact.useState<boolean>(false);

	return <div className={`game-paused-modal flex flex-col gap-8 justify-center items-center`}>
		<Card className="player-hint gap-4 right team1">
			<h2>Left player</h2>
			<div className="flex flex-col gap-2">
				<p><Key key="W"/> Move up</p>
				<p><Key key="S"/> Move down</p>
			</div>
		</Card>

		<Card className="player-hint gap-4 left team2">
			<h2>Right player</h2>
			<div className="flex flex-col gap-2">
				<p><Key key="ArrowUp"><i className="fa-solid fa-arrow-up"></i></Key> Move up</p>
				<p><Key key="ArrowDown"><i className="fa-solid fa-arrow-down"></i></Key> Move down</p>
			</div>
		</Card>
		{resumeTimer ?
		<h2>Restart in</h2> :
		<h2>Game is paused</h2>}
		{!resumeTimer ?
			<Button
				className="primary"
				onClick={() => {
					setResumeTimer(true)
					onClick();
				}}
			>
				<i className="fa-solid fa-play"></i> Resume Game
			</Button>:
			<Timer
				timer={config.PAUSE_TIMEOUT}
				onTimeout={() => {
					onResume();
				}}
			/>
		}
	</div>

}