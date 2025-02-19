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

	const [selected, setSelected] = Babact.useState('login');
	
	const { fields, submitForm } = useForm();

	return <Card className='auth-card'>
			<div className={`auth-card-body ${selected ? 'open' : ''} flex flex-col gap-4 w-full`}>
				<RemoteAuthButtons />
				<Separator>or</Separator>
				{selected === 'login' ? <LoginForm/> : <RegisterForm/>}
			</div>

			<div className='auth-card-footer flex w-full justify-around items-center gap-4'>
				{ 
					(!selected || selected === 'login') &&
					<Button
						className="auth-card-login button-primary"
						disabled={selected && (!fields['login-email'] || !fields['login-password'])}
						onClick={ !selected ? () => setSelected('login') : () =>  submitForm(['login-email', 'login-password']) }
					>
						Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
					</Button>
				}

				{!selected && <p>or</p>}

				{
					(!selected || selected === 'register') &&
					<Button
						className={`auth-card-register ${selected === 'register' ? 'button-primary' : ''}`}
						disabled={selected && (!fields['register-email'] || !fields['register-password'] || !fields['register-confirm-password'] || fields['register-password'] !== fields['register-confirm-password'])}
						onClick={ !selected ? () => setSelected('register') : () =>  submitForm(['register-email', 'register-password', 'register-confirm-password']) }
					>
						Register <i className="fa-regular fa-address-card"></i>
					</Button>
				}
				{
					selected &&
					<Button
					className="auth-card-cancel"
					onClick={() => setSelected(null)}
					>
						<i className="fa-solid fa-xmark"></i>
					</Button>
				}
			</div>
	</Card>
}