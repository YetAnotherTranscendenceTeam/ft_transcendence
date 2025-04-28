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
		onClick?: (e?: MouseEvent) => void,
		[key: string]: any
	}) {
	
	if (!loading)
		return <a
			className={`button ${className ? className : ''} ${disabled ? 'disabled' : ''}`}
			onClick={(e) => (!disabled && onClick) && onClick(e)}
			{...props}
		>
			{children}
		</a>

	return <a
		className={`button ${className ? className : ''} disabled loading`}
	>
		<Spinner/>
		<p>
			Loading...
		</p>
	</a>
		
	
}