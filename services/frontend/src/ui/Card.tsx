import Babact from "babact"
import "./ui.css"

export default function Card({ children, className = '', ...props }: { children?: any, className?: any, [key: string]: any }) {
	return <div className={`card ${className}`} {...props}>
		{children}
	</div>

}