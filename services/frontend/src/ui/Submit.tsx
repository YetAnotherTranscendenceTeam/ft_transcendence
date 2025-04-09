import Babact from "babact";
import Button from "./Button";
import { Fields, useForm } from "../contexts/useForm";

export default function Submit({
		fields,
		className = "",
		children,
		onSubmit,
		disabled,
		...props
	}: {
		fields: any,
		className?: string,
		children?: any,
		onSubmit?: (fields: Fields, clearFields: () => void) => void,
		disabled?: (fields: Fields) => boolean,
		[key: string]: any
	}) {

	const { checkValidity, fields: formFields, clearFields } = useForm();

	return <Button
		disabled={!checkValidity(fields) || (disabled && disabled(formFields))}
		className={`button primary ${className}`}
		onClick={() => onSubmit(formFields, clearFields)}
		{...props}
	>
		{children}
	</Button>
}