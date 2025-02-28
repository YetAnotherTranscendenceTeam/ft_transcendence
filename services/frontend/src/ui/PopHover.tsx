import Babact from "babact";

export default function PopHover({ children, content, className, ...props }: { children?: any, content?: any, className?: string }) {


	return <div
		className={`pop-hover-container ${className}`}
		{...props}
	>
		{children}
		{content && <div className='pop-hover'>
			{content}
		</div>}
	</div>
}