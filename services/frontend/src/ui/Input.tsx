import Babact from "babact";
import { useForm } from "../contexts/useForm";

export default function Input({ 
		label,
		field,
		type = 'text',
		error,
		onInput,
		matching,
		defaultValue,
		help,
		color,
		...props 
	}: {
		label?: string,
		field: string
		type?: string,
		error?: string,
		onInput?: Function,
		matching?: string,
		defaultValue?: string,
		help?: string,
		color?: string | ((fields: any) => string),
		[key: string]: any
	}) {

	const { updateField, updateFieldValidity, fields } = useForm();

	const handleChange = (e: any) => {
		if (onInput)
			onInput(e);
		updateField(field, e.target.value);
		const isValid = e.target.checkValidity() && (e.target.value === fields[matching]?.value || !matching)
		if (isValid !== fields[field].isValid)
			updateFieldValidity(field, isValid);
	}

	Babact.useEffect(() => {
		if (defaultValue)
			updateField(field, defaultValue);
	}, []);

	const isFieldValid = fields[field]?.isValid;

	return <div className='input-container'>
		{label &&
			<label>
				{label}
				{props.required && <span>*</span>}
			</label>
		}
		<input
			type={type}
			value={fields[field].value}
			onInput={handleChange}
			className={!isFieldValid ? 'invalid' : ''}
			style={`--input-color: ${color ? typeof color === 'function' ? color(fields) : color : ''}`}
			{...props}
		/>
		{error && <p className='input-error'>{!isFieldValid && error}</p>}
		{help && <p className='input-help'>{help}</p>}
	</div>
}