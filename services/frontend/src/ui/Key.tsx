import Babact from "babact";

export default function Key({ key, children }: {
	key: string,
	children?: any,
	[key: string]: any
}) {

	const [pressed, setPressed] = Babact.useState(false);

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === key || event.key === key.toLowerCase()) {
			setPressed(true);
		}
	};
	const handleKeyUp = (event: KeyboardEvent) => {
		if (event.key === key || event.key === key.toLowerCase()) {
			setPressed(false);
		}
	};

	Babact.useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	return <span className={`key ${pressed ? "pressed" : ""}`}>
		<p>
			{children && children.length ? children : key}
		</p>
	</span>
}