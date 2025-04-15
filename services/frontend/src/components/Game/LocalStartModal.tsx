import Babact from "babact";
import Key from "../../ui/Key";
import Card from "../../ui/Card";
import Button from "../../ui/Button";

export default function LocalStartModal({
		isOpen,
		onStart,
	}: {
		isOpen: boolean,
		onStart: () => void,
	}) {

	if (!isOpen) return null;
	return <div className='local-start-modal flex flex-col gap-4 justify-center items-center'>

		<Card className="player-hint gap-4 right team1">
			<h2>Left</h2>
			<div className="flex flex-col gap-2">
				<p><Key key="W"/> Move up</p>
				<p><Key key="S"/> Move down</p>
			</div>
		</Card>

		<Card className="player-hint gap-4 left team2">
			<h2>Right</h2>
			<div className="flex flex-col gap-2">
				<p><Key key="ArrowUp"><i className="fa-solid fa-arrow-up"></i></Key> Move up</p>
				<p><Key key="ArrowDown"><i className="fa-solid fa-arrow-down"></i></Key> Move down</p>
			</div>
		</Card>
		<div className='flex flex-col gap-2'>
			<Button className="primary" onClick={() => onStart()}>
				<i className="fa-solid fa-play"></i> Start Game
			</Button>
		</div>
	</div>
	
}