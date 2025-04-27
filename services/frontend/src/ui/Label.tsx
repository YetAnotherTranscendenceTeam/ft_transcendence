import Babact from "babact";

export default function Label({
	className = '',
	children,
	...props
}: {
	className?: string;
	children?: any;
	[props: string]: any;
}) {
	return <div className={`label ${className}`} {...props}>{children}</div>;
}