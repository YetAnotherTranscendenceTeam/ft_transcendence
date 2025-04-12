import Babact from "babact";
import Card from "../../ui/Card";

export default function Scores({
		scores,
		startTime
	}: {
		scores: number[]
		startTime: Date
	}) {

	const [deltaTime, setDeltaTime] = Babact.useState<number>(0);

	Babact.useEffect(() => {
		console.log('startTime', startTime);
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

	return <Card>
		<div className="flex flex-row gap-2">
			<div>
				{scores[0]}
			</div>
			<div>
				{Math.round(deltaTime / 60)} : {Math.round(deltaTime % 60)}
			</div>
			<div>
				{scores[1]}
			</div>
		</div>
	</Card>
}