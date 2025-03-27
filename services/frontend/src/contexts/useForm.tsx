import Babact from "babact";

export interface FormField {
	value: string | number | boolean,
	isValid: boolean,
	required: boolean
}

export type Fields = {[key: string]: FormField};

const FormContext = Babact.createContext<{
		updateField: (name: string, value: string) => void,
		updateFieldValidity: (name: string, isValid: boolean) => void,
		deleteField: (name: string) => void,
		clearFields: (fieldsName?: string[]) => void,
		checkValidity: (fieldsName: string[]) => boolean,
		fields: Fields
	}>();

export const Form = ({ formFields = [], className, children } : {formFields: string[], className?: string, children?: any}) => {

	const initFields = (fields: string[]) => fields.reduce((acc, field) => {
		const required = field.endsWith('*');
		field = required ? field.slice(0, -1) : field;
		acc[field] = {
			value: '',
			isValid: true,
			required
		};
		return acc;
	}, {});

	const [fields, setFields] = Babact.useState<Fields>(initFields(formFields));

	const updateField = (name: string, value: string | boolean | number) => {
		const newFields = {...fields};
		newFields[name].value = value;
		setFields(newFields);
	}

	const updateFieldValidity = (name: string, isValid: boolean) => {
		const newFields = {...fields};
		newFields[name].isValid = isValid;
		setFields(newFields);
	}

	const deleteField = (name: string) => {
		const newFields = {...fields};
		delete newFields[name];
		setFields(newFields);
	}

	const clearFields = (fieldsName: string[] = []) => {
		if (fieldsName.length === 0)
			setFields(initFields(formFields));
		else {
			const newFields = {...fields};
			const initialFields = initFields(formFields);
			for (let name of fieldsName) {
				newFields[name] = initialFields[name];
			}
			setFields(newFields);
		}
	}

	const checkValidity = (fieldsName: string[]) => {
		for (let name of fieldsName) {
			const fieldValidity = fields[name]?.isValid && (fields[name]?.value || !fields[name]?.required);
			if (!fieldValidity) {
				return false;
			}
		};
		return true;
	}

	return (
		<FormContext.Provider
			value={{
				updateField,
				updateFieldValidity,
				deleteField,
				clearFields,
				checkValidity,
				fields
			}}
		>
			<form className={`form flex flex-col gap-4 ${className || ''}`} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	);
};

export const useForm = () => {
	return Babact.useContext(FormContext);
};