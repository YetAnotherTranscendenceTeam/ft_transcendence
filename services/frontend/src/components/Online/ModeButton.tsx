import Babact from "babact";

export default function ModeButton({mode, image, onSelect}) {

	return <div
		style={`--image: url(${image})`}
		className={`mode-button left`}
		onClick={() => onSelect(mode)}
	>
		<p>{mode}</p>
	</div>
}