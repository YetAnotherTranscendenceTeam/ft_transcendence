import Babact from "babact";
import Card from "../../ui/Card";
import './game.css'

export default function Scores({
		scores,
		timer,
	}: {
		scores: number[]
		timer: number
	}) {

	

	return <Card className='scores'>
		<div className="flex flex-row gap-2 items-center">
			<div className='score'>
				{scores[0]}
			</div>
			<div className='time'>
				{Math.round(timer / 60).toString().padStart(2, '0')} : {Math.round(timer % 60).toString().padStart(2, '0')}
			</div>
			<div className='score'>
				{scores[1]}
			</div>
		</div>
	</Card>
}