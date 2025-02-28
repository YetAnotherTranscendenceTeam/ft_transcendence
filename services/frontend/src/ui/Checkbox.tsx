import Babact from "babact";
import { useForm } from "../contexts/useForm";

export default function Checkbox({ 
		label,
		field,
		required,
		onChange,
		...props 
	}: {
		label?: string,
		field: string
		required?: boolean,
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
		(document.getElementById(field) as HTMLInputElement).checked = fields[field] === true;
	}, [fields[field]]);
	
	const isFieldValid = fields[field]?.isValid;

	return <div className={`input-container checkbox`}>
		<div className='flex w-full gap-2 items-center'>
			<input type="checkbox" onChange={handleChange} id={field} className={!isFieldValid ? 'invalid' : ''} {...props}/>
			{label && <label for={field}>{label}</label>}
		</div>
	</div>
}