import Babact from "babact"
import ProfileCard from "../components/Profile/ProfileCard"
import AuthCard from "../components/Auth/AuthCard"
import { FormProvider } from "../contexts/useForm"
import Toast from "../ui/Toast"
import useToast from "../hooks/useToast"

export default function Home() {

	const toast = useToast()

	return <div>
		{/* <ProfileCard/> */}
		<FormProvider formFields={['login-email*', 'login-password*', 'register-email*', 'register-password*', 'register-confirm-password*', 'register-terms*']}>
			<AuthCard/>
		</FormProvider>
		<button
			onClick={() => {
				toast('Hello World', 'info')
			}}
		>
			Test
		</button>
	</div>
}