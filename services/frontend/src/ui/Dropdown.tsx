import Babact from "babact";
import Button from "./Button";

export default function Dropdown({
		children,
		openButton,
		openButtonClassName = '',
		className = '',
		pos = 'left',
		...props
	}: {
		children?: any,
		openButton: any,
		className?: string,
		pos?: 'left' | 'right' | 'top' | 'bottom',
		[key: string]: any
	}) {
	
	const [isOpen, setIsOpen] = Babact.useState<boolean>(false);
	const dropdownRef = Babact.useRef<HTMLDivElement>(null);
	const id = Babact.useRef<number>(Math.floor(Math.random() * 1000000));

	const handleClickOutside = (e: MouseEvent) => {
		if (!dropdownRef.current) return;
		if (e.target instanceof HTMLElement && !dropdownRef.current.contains(e.target)) {
			setIsOpen(false);
		}
	}

	Babact.useEffect(() => {
		dropdownRef.current = document.querySelector(`#dropdown${id.current}`) as HTMLDivElement;
	}, [])

	Babact.useEffect(() => {
		if (!isOpen) return;
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		}
	}, [isOpen]);


	return <div className={`dropdown ${className}`} {...props}
		id={'dropdown' + id.current}
	>
		<Button
			className={`${openButtonClassName}`}
			onClick={() => setIsOpen(!isOpen)}
		>
			{openButton}
		</Button>
		<div className={`dropdown-content ${isOpen ? 'open' : ''} ${pos}`}>
			{children}
		</div>
	</div>
}