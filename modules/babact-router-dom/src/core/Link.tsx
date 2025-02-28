import Babact from "babact";
import useNavigate from "./useNavigate.js";

export default function Link({to, children, className, ...props}: {to: string, children?: any, className?: string, [key: string]: any}) {

	const navigate = useNavigate();

	const handleClick = (e: any) => {
		e.preventDefault();
		navigate(to);
	};

	return ( 
		<a href={to} onClick={handleClick} className={className} {...props}>
			{children}
		</a>
	);

}