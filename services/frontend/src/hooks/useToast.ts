import { useUi } from "../contexts/useUi";

export enum ToastType {
	INFO = 'info',
	SUCCESS = 'success',
	DANGER = 'danger',
	WARNING = 'warning',
}

export interface IToast {
	id: number,
	message: string,
	type: ToastType,
	timeout: number
}

export default function useToast() {

	const { setToaster } = useUi();

	const findFirstToast = (toaster: IToast[]) => {
		let min = toaster[0].id;
		toaster.forEach(toast => {
			if (toast.id < min) min = toast.id;
		});
		return min;
	};

	const removeToast = (id: number) => {
		setToaster((toaster) => toaster.filter((toast) => toast.id !== id));
	}

	const createToast = (
		message: string | ((id: number) => string),
		type: ToastType = ToastType.INFO,
		timeout = 3000
	) => {
		const id = Date.now();
		if (typeof message === 'function') message = message(id);
		timeout = timeout === 0 ? timeout : Math.max(timeout, 1000);
		setToaster(toaster => {
			if (toaster.find(toast=> toast.id === id)) return toaster;
			if (toaster.length >= 5) {
				const firstToast = findFirstToast(toaster);
				toaster = toaster.filter((toast) => toast.id !== firstToast);
			}
			const newToast: IToast = {
				id,
				message,
				type,
				timeout
			};
			return ([...toaster, newToast]);
		});
		if (timeout)
			setTimeout(() => removeToast(id), timeout);
	}

	return {createToast, removeToast};

}