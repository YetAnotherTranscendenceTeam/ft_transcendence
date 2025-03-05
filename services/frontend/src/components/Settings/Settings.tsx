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
	
	return <Card className={`settings right flex flex-col items-center h-full gap-8 w-full ${isOpen ? 'open' : ''}`}>
		<div className='flex justify-between w-full items-center'>
			<h1>Settings</h1>
			<Button onClick={onClose} className='button ghost'>
				<i className="fa-solid fa-times"></i>
			</Button>
		</div>
		<div className='settings-content flex scrollbar flex-col gap-8 w-full'>
			{me && <AccountForm onLogout={onClose} me={me} />}
			{me && <ProfileForm me={me} />}
		</div>
	</Card>
}