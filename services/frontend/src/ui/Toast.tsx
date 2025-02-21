import Babact from "babact";
import Card from "./Card";

export default function Toast({
		message,
		type = 'info',
		...props 
	}: {
		message: string,
		type?: 'info' | 'success' | 'error',
		[key: string]: any
	}) {


	return <Card className={`toast bottom ${type}`} {...props}>
		{message}
	</Card>
}