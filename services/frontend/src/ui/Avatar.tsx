import Babact from "babact";
import { FollowStatus } from "../hooks/useSocials";

export default function Avatar({
		className = '',
		src,
		name,
		status,
		children,
		...props
	}: {
		className?: string,
		src?: string,
		name?: string,
		status?: string,
		children?: any,
		[key: string]: any
	}) {

	if (typeof name !== 'string') name = 'Anonymous';
	const initials = name.split(" ").map((n) => n[0]).join("");

	const stringToColour = (str: string) => {
		let hash = 0;
		str.split('').forEach(char => {
		  hash = char.charCodeAt(0) + ((hash << 5) - hash)
		})
		let colour = '#'
		for (let i = 0; i < 3; i++) {
		  const value = (hash >> (i * 8)) & 0xff
		  colour += value.toString(16).padStart(2, '0')
		}
		return colour
	}

	return <div className={`avatar ${className}`} style={`background-color: ${stringToColour(name)};`} {...props}>
		<p>{initials}</p>
		<img key={src} src={src} alt="avatar" onError={(e) => {
			e.target.style.display = 'none';
		}}/>
		{status && <span style={`background-color: var(--${status}-color);`} />}
		{children && <div  className='avatar-children'>{children}</div>}
	</div>
}