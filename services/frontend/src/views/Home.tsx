import Babact from "babact"
import ProfileCard from "../components/Profile/ProfileCard"
import AuthCard from "../components/Auth/AuthCard"
import { FormProvider } from "../contexts/useForm"
import useToast from "../hooks/useToast"
import Button from "../ui/Button"

export default function Home() {

	const { createToast, removeToast } = useToast()

	return <div>
		{/* <ProfileCard/> */}
		<FormProvider formFields={['login-email*', 'login-password*', 'register-email*', 'register-password*', 'register-confirm-password*', 'register-terms*']}>
			<AuthCard/>
		</FormProvider>
		<button
			onClick={() => {
				createToast((id) => (
					<div className='flex justify-between items-center'>
						<p><b>lcott et</b> has request you to join</p>
						<Button onClick={() => removeToast(id)}>Join</Button>
					</div>
				), 'info', 6000)
			}}
		>
			Info
		</button>
		<button
			onClick={() => {
				createToast('this is an error', 'danger', 6000)
			}}
		>
			Error
		</button>
		<button
			onClick={() => {
				createToast('this is a warning', 'warning', 6000)
			}}
		>
			Warning
		</button>
		<button
			onClick={() => {
				createToast('this is a success', 'success', 6000)
			}}
		>
			Success
		</button>
	</div>
}