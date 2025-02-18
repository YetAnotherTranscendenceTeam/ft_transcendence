import Babact from "babact"

export default function Button({
		children,
		className = '',
		...props
	}: {
		children?: any,
		className?: string,
		[key: string]: any
	}) {
	
	return <a className={`button ${className}`} {...props}>
		{children}
	</a>
}