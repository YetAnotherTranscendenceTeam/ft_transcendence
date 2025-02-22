import Babact from "babact";
import Card from "./Card";
import Button from "./Button";

export default function Modal({
		isOpen,
		onClose,
		children,
		className = '',
		closeOnBackgroundClick = true,
		closeOnEscape = false,
		overlay = true,
		closeButton = false,
		...props
	}: {
		isOpen: boolean,
		onClose: () => void,
		children?: any,
		className?: string,
		closeOnBackgroundClick?: boolean,
		closeOnEscape?: boolean,
		overlay?: boolean,
		[key: string]: any
	}) {

	if (isOpen) {
		document.querySelector('html').style.overflow = 'hidden';
	} else {
		document.querySelector('html').style.overflow = 'auto';
	}

	const handleBackgroundClick = (e: any) => {
		if (e.target === e.currentTarget && closeOnBackgroundClick) onClose();
	}
	
	const handleEscape = (e: any) => {
		console.log(e.key);
		if (e.key === 'Escape') onClose();
	}
	
	Babact.useEffect(() => {
		if (!closeOnEscape) return;
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, []);
	
	if (!isOpen) return null;
	return <div className={`modal ${overlay ? 'overlay' : ''}`} onClick={handleBackgroundClick}>

		<Card className={`modal-content ${className}`} {...props}>
			{closeButton && <Button onClick={onClose} className='close icon ghost'><i className="fa-solid fa-xmark"></i></Button>}
			{children}
		</Card>

	</div>
}