import Babact from "babact";
import Button from "./Button";
import useToast from "../hooks/useToast";

export default function CopyButton({
		children,
		className,
		clipboardText,
	}: {
		children?: string;
		className?: string;
		clipboardText: string;
	}) {

	const { createToast } = useToast();
	const [disabled, setDisabled] = Babact.useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(clipboardText).then(() => {
			createToast("Copied to clipboard");
			setDisabled(true);
			setTimeout(() => {
				setDisabled(false);
			}, 2000);
		})
	}

	return <Button
		className={className}
		disabled={disabled}
		onClick={handleCopy}
	>
		{children}
	</Button>
}