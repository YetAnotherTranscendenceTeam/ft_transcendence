import Babact from "babact";
import { useForm } from "../contexts/useForm";

export default function Checkbox({ 
		label,
		field,
		required,
		value,
		onChange,
		...props 
	}: {
		label?: string,
		field: string
		required?: boolean,
		value?: boolean,
		onChange?: Function,
		[key: string]: any
	}) {

	const { fields, updateField, updateFieldValidity } = useForm();

	const handleChange = (e: any) => {
		(document.getElementById(field) as HTMLInputElement).checked = e.target.checked;
		if (onChange)
			onChange(e);
		updateField(field, e.target.checked);
		if (required)
			updateFieldValidity(field, e.target.checked);
	}

	Babact.useEffect(() => {
		(document.getElementById(field) as HTMLInputElement).checked = fields[field].value === true;
	}, [fields[field]]);

	Babact.useEffect(() => {
		(document.getElementById(field) as HTMLInputElement).checked = value ?? false;
	}, [value]);
	
	const isFieldValid = fields[field]?.isValid;

	return <div className={`input-container checkbox`}>
		<div className='flex w-full gap-2 items-center'>
			{label && <label for={field}>{label}</label>}
			<input type="checkbox" onChange={handleChange} id={field} className={!isFieldValid ? 'invalid' : ''} {...props}/>
		</div>
	</div>
}