import Babact from "babact";

const FormContext = Babact.createContext();

export const FormProvider = ({ children } : {children?: any}) => {

	const [fields, setFields] = Babact.useState({});

	const setField = (name, value) => {
		setFields({...fields, [name]: value});
	}

	const getField = (name) => {
		return fields[name];
	}

	const deleteField = (name) => {
		const newFields = {...fields};
		delete newFields[name];
		setFields(newFields);
	}

	const clearFields = () => {
		setFields({});
	}

	const submitForm = async (params) => {
		fetch('https://z1r6p4:7979/api/auth', {
			method: 'POST',
			headers: {
				credentials: 'include',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(fields)
		})
		params.map(deleteField);
	}
  
	return (
	  <FormContext.Provider value={{
		setField,
		getField,
		deleteField,
		clearFields,
		submitForm,
		fields
	  }}>
		{children}
	  </FormContext.Provider>
	);
};

export const useForm = () => {
	return Babact.useContext(FormContext);
};