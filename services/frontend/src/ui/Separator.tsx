import Babact from "babact"

export default function Separator({ className = '', children, ...props }: { className?: string, children?: any }) {
	if (children && children.length)
		return <div className={`separator-container ${className}`} {...props}>
			<span className='separator'/>
			{children}
			<span className='separator'/>
		</div>

		return <span className={`separator ${className}`}/> 
}