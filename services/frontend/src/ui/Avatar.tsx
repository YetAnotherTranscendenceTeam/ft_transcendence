import Babact from "babact";

export default function Avatar({
		className = '',
		src,
		name,
		status,
		children,
		size = 'md',
		...props
	}: {
		className?: string,
		src?: string,
		name?: string,
		status?: string,
		children?: any,
		size?: 'xs' | 'sm' | 'md' | 'lg',
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

	const [error, setError] = Babact.useState<boolean>(false);

	return <div className={`avatar ${size} ${className}`} style={`background-color: ${error ? stringToColour(name) : 'var(--bg-2)'};`} {...props}>
		{error && <p>{initials}</p>}
		<img key={src} src={src} alt="avatar" onError={(e) => {
			e.target.style.display = 'none';
			setError(true);
		}}/>
		{status && <span style={`background-color: var(--${status}-color);`} />}
		{children && <div  className='avatar-children'>{children}</div>}
	</div>
}