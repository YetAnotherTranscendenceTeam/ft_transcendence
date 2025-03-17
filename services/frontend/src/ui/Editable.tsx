import Babact from "babact";
import Button from "./Button";

export default function Editable({
		defaultValue = '',
		onEdit,
		disabled = false
	}: {
		defaultValue?: string;
		onEdit: (value: string) => void;
		disabled?: boolean;
	}) {

	const [isEditing, setIsEditing] = Babact.useState(false);
	const [value, setValue] = Babact.useState(defaultValue);
	const isBlurred = Babact.useRef(false);

	Babact.useEffect(() => {
		setValue(defaultValue);
	}, [defaultValue]);

	const handleEdit = (e) => {
		onEdit(value);
		setIsEditing(false);
		isBlurred.current = false;
	}

	const handleFocusOut = () => {
		setTimeout(() => {
			if (!isBlurred.current) {
				setValue(defaultValue);
				setIsEditing(false);
			}
		}, 0);
	}

	return <div
		className="editable"
	>
		<input
			type="text"
			value={isEditing ? value : defaultValue}
			disabled={disabled}
			onInput={(e) => setValue(e.target.value)}
			onFocus={() => setIsEditing(true)}
			onBlur={handleFocusOut}
		/>
		{ isEditing &&
			<Button
				onClick={handleEdit}
				className="icon primary"
				disabled={value === defaultValue}
				onMouseDown={(e) => {
					if (!(value === defaultValue))
						isBlurred.current = true;
					else {
						e.preventDefault();
						e.stopPropagation();
					}
				}}
			>
				<i className="fa-solid fa-check"></i>
			</Button>
		}
	</div>
}