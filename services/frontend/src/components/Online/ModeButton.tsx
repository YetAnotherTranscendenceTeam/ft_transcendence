import Babact from "babact";

export default function ModeButton({mode, image, selected, onSelect}) {

	return <div
		style={`--image: url(${image})`}
		className={`mode-button ${selected === mode ? 'selected' : ''}`}
		onClick={() => onSelect(mode)}
	>
		<p>{mode}</p>
	</div>
}