import Babact from "babact";
import Card from "./Card";

export default function Toast({
		message,
		type = 'info',
		timeout,
		...props 
	}: {
		message: string,
		type?: 'info' | 'success' | 'error',
		timeout?: number,
		[key: string]: any
	}) {

	return <Card
		style={`--timeout: ${timeout - 500}ms`}
		className={`toast bottom ${type} ${timeout <= 0 ? 'sticky' : ''}`}
		{...props}
	>
		{message}
	</Card>
}