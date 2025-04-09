import Babact from "babact";
import Card from "./Card";
import { ToastType } from "../hooks/useToast";

export default function Toast({
		message,
		type,
		timeout,
		...props
	}: {
		message: string,
		type: ToastType,
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