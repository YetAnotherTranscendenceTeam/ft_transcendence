import Babact from "babact";
import Card from "../../ui/Card";
import './game.css'

export default function Scores({
		scores,
		startTime
	}: {
		scores: number[]
		startTime: Date
	}) {

	const [deltaTime, setDeltaTime] = Babact.useState<number>(0);

	Babact.useEffect(() => {
		if (!startTime) {
			return;
		}
		const interval = setInterval(() => {
			const now = new Date();
			const delta = now.getTime() - startTime.getTime();
			setDeltaTime(delta / 1000);
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	return <Card className='scores'>
		<div className="flex flex-row gap-2 items-center">
			<div className='score'>
				{scores[0]}
			</div>
			<div className='time'>
				{Math.round(deltaTime / 60).toString().padStart(2, '0')} : {Math.round(deltaTime % 60).toString().padStart(2, '0')}
			</div>
			<div className='score'>
				{scores[1]}
			</div>
		</div>
	</Card>
}