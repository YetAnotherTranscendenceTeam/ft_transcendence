import Babact from "babact";

export default function Timer({
		time,
		...props
	}: {
		time: number,
		[key: string]: any
	}) {


	return <div className={`timer flex flex-col gap-2 `} {...props}>
		<h2 key={Math.ceil(time)}>{Math.ceil(time)}</h2>
	</div>

}