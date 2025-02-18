import Babact from "babact";
import Card from "../../ui/Card";
import "./auth.css"
import Button from "../../ui/Button";
import LoginForm from "./LoginForm";
import RemoteAuthButtons from "./RemoteAuthButtons";

export default function AuthCard() {

	const [selected, setSelected] = Babact.useState('login');

	return <Card className='auth-card'>
			<div className={`auth-card-body ${selected ? 'open' : ''} flex flex-col gap-4 w-full`}>
				<RemoteAuthButtons />
				{selected === 'login' && <LoginForm isOpened={selected === 'login'} />}
			</div>

			<div className='flex w-full justify-around items-center gap-4'>
				{ 
					(!selected || selected === 'login') &&
					<Button	
						className="auth-card-login button-primary"
						onClick={() => setSelected('login')}
					>
						Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
					</Button>
				}

				{!selected && <p>or</p>}

				{
					(!selected || selected === 'register') &&
					<Button
					className={`auth-card-register ${selected === 'register' ? 'button-primary' : ''}`}
					onClick={() => setSelected('register')}
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