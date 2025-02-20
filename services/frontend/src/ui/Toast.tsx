import Babact from "babact";

export default function Toast({ 
		message,
		type = 'info',
		...props 
	}: {
		message: string,
		type?: 'info' | 'success' | 'error'
		[key: string]: any
	}) {

	return <div className={`toast ${type}`}>
		{message}
	</div>
}