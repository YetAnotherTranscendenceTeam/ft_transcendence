import Babact from "babact"
import ProfileCard from "../components/Profile/ProfileCard"
import AuthCard from "../components/Auth/AuthCard"
import { FormProvider } from "../contexts/useForm"

export default function Home() {
	return <div>
		{/* <ProfileCard/> */}
		<FormProvider>
			<AuthCard/>
		</FormProvider>
	</div>
}