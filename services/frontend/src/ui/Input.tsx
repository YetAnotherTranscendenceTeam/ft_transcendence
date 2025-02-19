import Babact from "babact";
import { useForm } from "../contexts/useForm";

export default function Input({ 
		label,
		type = 'text',
		errorMsg,
		onInput,
		fieldName,
		matchingField,
		...props 
	}: {
		label?: string,
		type?: string,
		errorMsg?: string,
		onInput?: Function
		fieldName?: string
		matchingField?: string
		[key: string]: any
	}) {

	const [isValid, setIsValid] = Babact.useState(true);
	const { setField, deleteField, fields } = useForm();

	const handleChange = (e: any) => {
		if (onInput) onInput(e.target.value);
		if (!e.target.checkValidity()) {
			if (isValid) {
				if (fieldName) deleteField(fieldName);
				setIsValid(false);
			}
		}
		else if (!isValid && (e.target.value === fields[matchingField] || !matchingField)) {
			if (fieldName) setField(fieldName, e.target.value);
			setIsValid(true);
		}

	}
	
	return <div className='input-container'>
		{label && <label>
			{label}
			{props.required && <span>*</span>}
		</label>}
		<input type={type} onInput={handleChange} className={!isValid ? 'invalid' : ''} {...props}/>
		<p className='input-error'>{!isValid && errorMsg}</p>
	</div>
}