import Babact from "babact";
import { ToastType } from "../hooks/useToast";

export default function Alert({
		message,
		type = ToastType.INFO,
		icon
	}: {
		message: string;
		type?:  ToastType;
		icon?: any;
	}) {

	const getIcon = () => {
		if (icon)
			return icon;
		if (type === ToastType.DANGER) {
			return <i className="fas fa-exclamation-triangle"></i>;
		}
		if (type === ToastType.SUCCESS) {
			return <i className="fas fa-check-circle"></i>;
		}
		if (type === ToastType.INFO) {
			return <i className="fas fa-info-circle"></i>;
		}
		if (type === ToastType.WARNING) {
			return <i className="fas fa-exclamation-circle"></i>;
		}
	}

	return <div className={`alert ${type}`}>
		<span className="icon">{getIcon()}</span>
		<p>{message}</p>
	</div>

}