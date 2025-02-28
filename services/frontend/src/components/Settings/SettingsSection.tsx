import Babact from "babact"
import Separator from "../../ui/Separator"
import "./settings.css"

export default function SettingsSection({
		name,
		children,
		className,
		...props
	} : {
		name: string
		children?: any,
		className?: string,
	}) {

	return <div className={`settings-section w-full flex flex-col gap-4 ${className}`} {...props}>
		<div className='flex items-center w-full gap-2'>
			<h2>{name}</h2>
			<Separator className="w-full" />
		</div>
		{children}
	</div>
}