import Babact from "babact";
import Button from "./Button";
import { useForm } from "../contexts/useForm";

export default function Submit({
		fields,
		className = "",
		children,
		...props
	}: {
		fields: any,
		className?: string,
		children?: any,
		[key: string]: any
	}) {

	const { checkValidity } = useForm();

	return <Button
		disabled={!checkValidity(fields)}
		className={`button primary ${className}`}
		{...props}
	>
		{children}
	</Button>
}