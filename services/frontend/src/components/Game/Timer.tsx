import Babact from "babact";

export default function Timer({
		timer,
		onTimeout,
		...props
	}: {
		timer: number,
		onTimeout?: () => void,
		[key: string]: any
	}) {

	
	const [time, setTime] = Babact.useState<number>(timer);

	Babact.useEffect(() => {
		const interval = setInterval(() => {
			setTime(time => time -= 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	Babact.useEffect(() => {
		if (time <= 0 && onTimeout) {
			onTimeout();
		}
	}, [time]);

	return <div className={`timer flex flex-col gap-2 `} {...props}>
		<h2 key={time}>{time}</h2>
	</div>

}