import Babact from "babact";
import Button from "./Button";

export default function Editable({
		defaultValue = '',
		onEdit,
		disabled = false,
		maxLength = 100,
	}: {
		defaultValue?: string;
		onEdit: (value: string) => void;
		disabled?: boolean;
		maxLength?: number;
		[key: string]: any;
	}) {

	const [isEditing, setIsEditing] = Babact.useState<boolean>(false);
	const [value, setValue] = Babact.useState<string>(defaultValue);
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
			maxLength={maxLength}
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