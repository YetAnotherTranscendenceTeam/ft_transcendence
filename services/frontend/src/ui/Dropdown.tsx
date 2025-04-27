import Babact from "babact";
import Button from "./Button";

export default function Dropdown({
		children,
		openButton,
		openButtonClassName = '',
		className = '',
		...props
	}: {
		children?: any,
		openButton: any,
		className?: string,
		[key: string]: any
	}) {
	
	const [isOpen, setIsOpen] = Babact.useState<boolean>(false);

	const handleClickOutside = (e: MouseEvent) => {
		console.log('click outside', e.target);
		if (e.target instanceof HTMLElement && !e.target.closest('.dropdown')) {
			setIsOpen(false);
		}
	}

	Babact.useEffect(() => {
		if (!isOpen) return;
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		}
	}, [isOpen]);

	return <div className={`dropdown ${className}`} {...props}>
		<Button
			className={`${openButtonClassName}`}
			onClick={() => setIsOpen(!isOpen)}
		>
			{openButton}
		</Button>
		<div className={`dropdown-content ${isOpen ? 'open' : ''}`}>
			{children}
		</div>
	</div>
}