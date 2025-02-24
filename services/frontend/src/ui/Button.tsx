import Babact from "babact"
import Spinner from "./Spinner"

export default function Button({
		children,
		className = '',
		disabled = false,
		loading = false,
		onClick,
		...props
	}: {
		children?: any,
		className?: string,
		disabled?: boolean,
		loading?: boolean,
		onClick?: Function,
		[key: string]: any
	}) {
	
	return <a
		className={`button ${className ? className : ''} ${disabled || loading ? 'disabled' : ''}`}
		onClick={(e) => (!disabled && onClick) && onClick(e)}
		{...props}
	>
		{
			!loading
			? (children)
			: (<><Spinner/> Loading...</>)
		}
	</a>
}