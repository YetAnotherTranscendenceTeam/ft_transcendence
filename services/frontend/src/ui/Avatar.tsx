import Babact from "babact";

export default function Avatar({className = '', src, name, status, ...props}: {className?: string, src?: string, name?: string, status?: string, [key: string]: any}) {

	const initials = name.split(" ").map((n) => n[0]).join("");

	const [loading, setLoading] = Babact.useState(true);

	Babact.useEffect(() => {
		fetch(src).then((res) => {
			if(res.ok) setLoading(false);
		}).catch(() => {});
	
	}, [])

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
		{loading ? null : <img src={src} alt="avatar"/>}
		<span style={`background-color: green;`} />
	</div>
}