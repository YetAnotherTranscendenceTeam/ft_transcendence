import Babact from "babact";
import Toast from "../ui/Toast";
import { IToast } from "../hooks/useToast";
import JSConfetti from "js-confetti";

const UiContext = Babact.createContext<{
		toaster: IToast[],
		setToaster: (toaster: IToast[] | ((toaster: IToast[]) => IToast[])) => void,
		confetti: JSConfetti | null,
	}>();

export const UiProvider = ({ children } : {children?: any}) => {

	const [toaster, setToaster] = Babact.useState<IToast[]>([]);
	const confettiRef = Babact.useRef<JSConfetti | null>(null);

	Babact.useEffect(() => {
		confettiRef.current = new JSConfetti();
		return () => {
			confettiRef.current.clearCanvas();
		}
	}, [])

	return (
		<UiContext.Provider
			value={{
				toaster,
				setToaster,
				confetti: confettiRef.current,
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