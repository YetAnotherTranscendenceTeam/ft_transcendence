import Babact from "babact";
import Toast from "../ui/Toast";
import { IToast } from "../hooks/useToast";

const UiContext = Babact.createContext<{
		toaster: IToast[],
		setToaster: (toaster: IToast[] | ((toaster: IToast[]) => IToast[])) => void,
	}>();

export const UiProvider = ({ children } : {children?: any}) => {

	const [toaster, setToaster] = Babact.useState<IToast[]>([]);

	return (
		<UiContext.Provider
			value={{
				toaster,
				setToaster,
			}}
		>
			<div className='toaster'>
				{toaster.map((toast: IToast) => {
					return <Toast {...toast} key={toast.id}/>
				})}
			</div>
			{children}
		</UiContext.Provider>
	);
};

export const useUi = () => {
	return Babact.useContext(UiContext);
};