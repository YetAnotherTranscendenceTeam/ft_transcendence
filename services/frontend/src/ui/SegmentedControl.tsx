import Babact from "babact";

export type Segment = {
	label: string;
	value: string;
	disabled?: boolean;
}

export default function SegmentedControl({
		buttons,
		onChange,
		value,
		className,
		...props
	}: {
		buttons: Segment[];
		onChange: (value: string) => void;
		value: string;
		className?: string;
		[props: string]: any;
	}) {

	const [selected, setSelected] = Babact.useState<string>(value || buttons[0].value);

	Babact.useEffect(() => {
		if (value) {
			setSelected(value);
		}
	}, [value]);

	return <div className={`segmented-control ${className}`} style={`--segment-translate: ${100 / buttons.length * buttons.findIndex(b => b.value === selected)}%; --width: ${100 / buttons.length}%`} {...props}>
		{buttons.map((button, i) => {
			return <div
				onClick={() => {
					if (button.disabled || button.value === selected) return;
					onChange(button.value);
					setSelected(button.value);
				}}
				key={button.value}
				className={`segmented-control-button ${selected === button.value ? 'selected' : ''} ${button.disabled ? 'disabled' : ''}`}
			>
				{button.label}
			</div>
		})}
	</div>

}