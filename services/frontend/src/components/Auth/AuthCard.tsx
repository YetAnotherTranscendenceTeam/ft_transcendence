import Babact from "babact";
import Card from "../../ui/Card";
import "./auth.css"
import Button from "../../ui/Button";
import LoginForm from "./LoginForm";
import Separator from "../../ui/Separator";
import { useForm } from "../../contexts/useForm";
import RegisterForm from "./RegisterForm";

export default function AuthCard() {

	const [selected, setSelected] = Babact.useState(null);

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
	</Card>
}