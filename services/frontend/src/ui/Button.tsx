import Babact from "babact"

export default function Button({
		children,
		className = '',
		disabled = false,
		onClick,
		...props
	}: {
		children?: any,
		className?: string,
		disabled?: boolean,
		onClick?: Function,
		[key: string]: any
	}) {
	
	return <a
		className={`button ${className ? className : ''} ${disabled ? 'disabled' : ''}`}
		onClick={(e) => (!disabled && onClick) && onClick(e)}
		{...props}
	>
		{children}
	</a>
}