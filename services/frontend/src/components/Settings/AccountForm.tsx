import Babact from "babact";
import SettingsSection from "./SettingsSection";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import Button from "../../ui/Button";
import { useAuth } from "../../contexts/useAuth";

export default function AccountForm({
		me,
		onLogout
	}: {
		me: any,
		onLogout: Function
	}) {

	const { logout } = useAuth();

	if (!me)
		return null;
	return <SettingsSection name='Account'>
		<Form formFields={['account-email', 'account-password', 'account-confirm-password', 'account-current-password*']} className='gap-8'>
			<Input field="account-email" label='Edit your email' type='email' placeholder={me.username}/>
			<div className='flex flex-col gap-1'>
				<Input field="account-password" label='Edit your password' name='password' type='password' />
				<Input field="account-confirm-password" label='Confirm your new password' name='password' type='password' />
			</div>

			<Input
				field="account-current-password"
				label='Current Password'
				type='password'
				required
				help='You must enter your current password to save account changes'
			/>

			<div className='flex gap-4 justify-end'>
				<Button className="danger" onClick={() => {logout(); onLogout()} }>Logout<i className="fa-solid fa-arrow-right-from-bracket"></i></Button>
				<Submit fields={['account-email', 'account-password', 'account-confirm-password', 'account-current-password']}>
					Save
					<i className="fa-regular fa-floppy-disk"></i>
				</Submit>
			</div>
		</Form>
	</SettingsSection>
}