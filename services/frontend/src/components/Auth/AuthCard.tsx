import Babact from "babact";
import Card from "../../ui/Card";
import "./auth.css"
import Button from "../../ui/Button";
import LoginForm from "./LoginForm";
import RemoteAuthButtons from "./RemoteAuthButtons";
import Separator from "../../ui/Separator";
import { useForm } from "../../contexts/useForm";
import RegisterForm from "./RegisterForm";

export default function AuthCard() {

	const [selected, setSelected] = Babact.useState(null);
	
	const { checkValidity, clearFields } = useForm();

	const loginDisabled = selected && !checkValidity(['login-email', 'login-password']);
	const registerDisabled = selected && !checkValidity(['register-email', 'register-password', 'register-confirm-password', 'register-terms']);

	return <Card className='auth-card left'>
			<div className={`auth-card-body ${selected === 'login' ? 'open' : ''} flex flex-col gap-4 w-full`}>
				<RemoteAuthButtons isOpen={selected === 'login'} />
				<Separator>or</Separator>
				<LoginForm/>
			</div>
			<div className={`auth-card-body ${selected === 'register' ? 'open' : ''} flex flex-col gap-4 w-full`}>
				<RemoteAuthButtons isOpen={selected === 'register'}/>
				<Separator>or</Separator>
				<RegisterForm/>
			</div>

			<div className='auth-card-footer flex w-full justify-around items-center gap-4'>

				{/* Login Button */}
				{ 
					(!selected || selected === 'login') &&
					<Button
						className="auth-card-login button-primary"
						disabled={loginDisabled}
						onClick={
							!selected ? () => setSelected('login') : 
							() => clearFields()
						}
					>
						Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
					</Button>
				}

				{!selected && <p>or</p>}

				{/* Register Button */}
				{
					(!selected || selected === 'register') &&
					<Button
						className={`auth-card-register ${selected === 'register' ? 'button-primary' : ''}`}
						disabled={registerDisabled}
						onClick={
							!selected ? () => setSelected('register') :
							() =>  clearFields()
						}
					>
						Register <i className="fa-regular fa-address-card"></i>
					</Button>
				}

				{/* Cancel Button */}
				{
					selected &&
					<Button
						className="icon"
						onClick={() => setSelected(null)}
					>
						<i className="fa-solid fa-xmark"></i>
					</Button>
				}
			</div>
	</Card>
}