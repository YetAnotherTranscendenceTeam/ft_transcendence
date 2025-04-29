import Babact from "babact";
import Card from "../../ui/Card";
import "./auth.css"
import Button from "../../ui/Button";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import useEscape from "../../hooks/useEscape";
import LobbyInviteModal from "./LobbyInviteModal";

export default function AuthCard() {

	const [selected, setSelected] = Babact.useState<string>(null);

	const lobbyModalInvite = window.location.pathname.startsWith('/lobby');
	const [isOpen, setIsOpen] = Babact.useState<boolean>(lobbyModalInvite);

	useEscape(selected, () => setSelected(null));

	return <Card className='auth-card left'>

			<RegisterForm isOpen={selected === 'register'} onClose={() => setSelected(null)}/>
				
			<LoginForm isOpen={selected === 'login'} onClose={() => setSelected(null)}/>

			{ !selected && <div className='auth-card-footer flex w-full justify-around items-center gap-4'>
				<Button
					className="auth-card-login primary"
					onClick={() => setSelected('login')}
				>
					Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
				</Button>


				<p>or</p>

				<Button
					className={`auth-card-register`}
					onClick={() => setSelected('register')}
				>
					Register <i className="fa-regular fa-address-card"></i>
				</Button>
				
			</div>}

			<LobbyInviteModal
				isOpen={selected === null && isOpen}
				onChoice={(choice: string) => {
					setIsOpen(false);
					setSelected(choice);
				}}
			/>
	</Card>
}