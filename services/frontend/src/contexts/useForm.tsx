import Babact from "babact";

const FormContext = Babact.createContext({});

export const Form = ({ formFields = {}, className, children } : {formFields?: any, className?: string, children?: any}) => {

	const initFields = (fields) => fields.reduce((acc, field) => {
		const required = field.endsWith('*');
		field = required ? field.slice(0, -1) : field;
		acc[field] = {
			value: '',
			isValid: true,
			required
		};
		return acc;
	}, {});

	const [fields, setFields] = Babact.useState(initFields(formFields));

	const updateField = (name, value) => {
		const newFields = {...fields};
		newFields[name].value = value;
		setFields(newFields);
	}

	const updateFieldValidity = (name, isValid) => {
		const newFields = {...fields};
		newFields[name].isValid = isValid;
		setFields(newFields);
	}

	const deleteField = (name) => {
		const newFields = {...fields};
		delete newFields[name];
		setFields(newFields);
	}

	const clearFields = (fieldsName = []) => {
		if (fieldsName.length === 0)
			setFields(initFields(formFields));
		else {
			const newFields = {...fields};
			const initialFields = initFields(formFields);
			for (let name of fieldsName) {
				console.log(name);
				newFields[name] = initialFields[name];
				//newFields[name].isValid = newFields[name].required;
			}
			console.log(newFields);
			setFields(newFields);
		}
	}

	const checkValidity = (fieldsName) => {
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
			<form className={`flex flex-col gap-4 ${className || ''}`}>
				{children}
			</form>
		</FormContext.Provider>
	);
};

export const useForm = () => {
	return Babact.useContext(FormContext);
};