import Babact from "babact";

export default function PopHover({
		children,
		content,
		className,
		pos = 'bottom',
		...props
	}: {
		children?: any,
		content?: any,
		className?: string
		width?: string,
		pos?: 'top' | 'bottom' | 'left' | 'right',
		[key: string]: any
	}) {


	return <div
		className={`pop-hover-container flex ${className ?? ''}`}
		{...props}
	>
		{children}
		{content && <div
			className={`pop-hover ${pos}`}
		>
			{content}
		</div>}
	</div>
}