import Babact from "babact"
import ProfileCard from "../components/Profile/ProfileCard"
import AuthCard from "../components/Auth/AuthCard"
import useToast from "../hooks/useToast"
import Button from "../ui/Button"
import ConfirmProfileModal from "../components/Profile/ConfirmProfileModal"
import { useAuth } from "../contexts/useAuth"
import Menu from "../components/Menu/Menu"

export default function Home() {

	const { createToast, removeToast } = useToast()

	const [isOpen, setIsOpen] = Babact.useState(false)
	const { me } = useAuth()

	return <div>
		<Menu/>
		{
			me ? <ProfileCard me={me}/> : <AuthCard/>
		}
			{/* <button
				onClick={() => {
					createToast((id) => (
						<div className='flex justify-between items-center'>
							<p><b>lcottet</b> has request you to join</p>
							<Button onClick={() => removeToast(id)}>Join</Button>
						</div>
					), 'info', 0)
				}}
			>
				Info
			</button>
			<button
				onClick={() => {
					createToast('this is an error', 'danger', 2000)
				}}
			>
				Error
			</button>
			<button
				onClick={() => {
					createToast('this is a warning', 'warning', 5000)
				}}
			>
				Warning
			</button>
			<button
				onClick={() => {
					createToast('this is a success', 'success', 200)
				}}
			>
				Success
			</button>
			<ConfirmProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} closeOnEscape />
			<button onClick={() => setIsOpen(true)}>Modal</button> */}
	</div>
}