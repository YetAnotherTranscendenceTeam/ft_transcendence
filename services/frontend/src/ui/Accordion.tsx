import Babact from "babact";

export default function Accordion({
		children,
		className,
		openButton,
		openButtonClassName,
		openDefault = false,
		...props
	}: {
		children?: any;
		className?: string;
		openButton: any;
		openButtonClassName?: string;
		openDefault?: boolean;
		[props: string]: any;
	}) {

	const [open, setOpen] = Babact.useState(openDefault);

	return <div className={`accordion flex flex-col ${className ?? ''}`} {...props}>
		<div
			className={`accordion-header flex items-center w-full gap-2 ${open ? 'open' : ''} ${openButtonClassName ?? ''}`}
			onClick={() => setOpen(!open)}
		>
			<i className={`fa-solid fa-chevron-down accordion-icon`}></i>
			{openButton}
		</div>
		<div
			className={`accordion-content ${open ? 'open' : ''}`}
		>
			{children}
		</div>
	</div>

}