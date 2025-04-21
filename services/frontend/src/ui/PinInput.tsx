import Babact from "babact";
import { useForm } from "../contexts/useForm";

export default function PinInput({
		length = 6,
		label,
		required = false,
		error,
		help,
		field
	}: {
		length?: number;
		label?: string;
		required?: boolean;
		error?: string;
		help?: string;
		field: string;
	}) {


	const [pin, setPin] = Babact.useState<string[]>(new Array(length).fill(''));
	const { updateField, updateFieldValidity, fields } = useForm();

	const handleChange = (index: number, value: string) => {
		if (value.length > 1) return;
		if (value && !/^\d$/.test(value)) {
			const target = document.getElementById(`pin-input-${index}`) as HTMLInputElement;
			target.value = '';
			return;
		};
		const newPin = [...pin];
		newPin[index] = value;
		setPin(newPin);
		updateField(field, newPin.join(''));
		updateFieldValidity(field, newPin.filter(c => c !== '').length === 6);
		if (value && index < length - 1) {
			const nextInput = document.getElementById(`pin-input-${index + 1}`) as HTMLInputElement;
			if (nextInput) {
				nextInput.focus();
			}
		}
		if (!value && index > 0) {
			const prevInput = document.getElementById(`pin-input-${index - 1}`) as HTMLInputElement;
			if (prevInput) {
				prevInput.focus();
			}
		}
		if (value && index === length - 1) {
			const target = document.getElementById(`pin-input-${index}`) as HTMLInputElement;
			target.blur();
		}
	}

	Babact.useEffect(() => {
		if (fields[field]?.value !== pin.join('')) {
			const newPin = (fields[field].value as string).split('');
			setPin([...newPin, ...new Array(length - newPin.length).fill('')]);
		}
	}, [fields[field]?.value]);

	const handleKeyDown = (event: KeyboardEvent) => {
		const target = event.target as HTMLInputElement;
		if (!target.value && event.key === 'Backspace') {
			event.preventDefault();
			const target = event.target as HTMLInputElement;
			const index = parseInt(target.id.split('-')[2]);
			if (index > 0) {
				const prevInput = document.getElementById(`pin-input-${index - 1}`) as HTMLInputElement;
				if (prevInput) {
					prevInput.focus();
				}
			}
		}
		else if (target.value && /^\d$/.test(event.key)) {
			event.preventDefault();
			target.value = event.key;
			const index = parseInt(target.id.split('-')[2]);
			if (index < length - 1) {
				const nextInput = document.getElementById(`pin-input-${index + 1}`) as HTMLInputElement;
				if (nextInput) {
					nextInput.focus();
				}
			}
		}
	}

	return <div
		className="input-container pin-input flex flex-col gap-2"
	>
		{label && <label>
			{label}
			{required && <span>*</span>}	
		</label>}
		<div
			className='flex gap-2'
		>
			{new Array(length).fill(null).map((_, i) => (
				<input
					key={i}
					id={`pin-input-${i}`}
					type="text"
					maxLength={1}
					value={pin[i]}
					onInput={(e) => handleChange(i, e.target.value)}
					onKeyDown={(e) => handleKeyDown(e)}
					pattern="[0-9]*"
					inputMode="numeric"
				/>
			))}
		</div>
		{error && <p className='input-error'>{error}</p>}
		{help && <p className='input-help'>{help}</p>}
	</div>
}