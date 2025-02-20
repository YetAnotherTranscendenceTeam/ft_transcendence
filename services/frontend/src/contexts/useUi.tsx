import Babact from "babact";
import Toast from "../ui/Toast";

const UiContext = Babact.createContext();

export const UiProvider = ({ children } : {children?: any}) => {

	const [toaster, setToaster] = Babact.useState([]);

	Babact.useEffect(() => {
		console.log(toaster);
	}, [toaster]);

	return (
		<UiContext.Provider
			value={{
				toaster,
				setToaster
			}}
		>
			<div className='toaster'>
				{toaster.map((toast: any) => {
					return <Toast {...toast} />
				})}
			</div>
			{children}
		</UiContext.Provider>
	);
};

export const useUi = () => {
	return Babact.useContext(UiContext);
};