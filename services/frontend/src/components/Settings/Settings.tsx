import Babact from "babact";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import AccountForm from "./AccountForm";
import ProfileForm from "./ProfileForm";
import useEscape from "../../hooks/useEscape";

export default function Settings({
		me,
		isOpen = false,
		onClose
	}: {
		me: any,
		isOpen?: boolean,
		onClose: Function
	}) {

	useEscape(isOpen, onClose);
	
	return <Card className={`settings right flex flex-col items-center h-full gap-4 w-full ${isOpen ? 'open' : ''}`}>
		<div className='settings-header flex justify-between w-full items-center'>
			<h1>Settings</h1>
			<Button onClick={onClose} className='button ghost'>
				<i className="fa-solid fa-times"></i>
			</Button>
		</div>
		<div className='settings-content flex flex-col gap-8 w-full'>
			{me && <ProfileForm me={me} />}
			{me && <AccountForm onLogout={onClose} me={me} />}
		</div>
	</Card>
}