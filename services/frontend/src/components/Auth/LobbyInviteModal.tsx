import Babact from "babact";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { useNavigate } from "babact-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";
import FortyTwoAuthButton from "./FortyTwoAuthButton";
import Separator from "../../ui/Separator";
import Avatar from "../../ui/Avatar";

export default function LobbyInviteModal({
			isOpen,
			onChoice,
		}: {
			isOpen: boolean,
			onChoice?: (choice: string) => void,
			[key: string]: any
		}) {

	const navigate = useNavigate();

	const query = new URLSearchParams(window.location.search);
	const username = query.get('username');
	const avatar = query.get('avatar');
	const gamemode = query.get('gamemode');

	return <Modal
		isOpen={isOpen}
		onClose={() => {
			navigate('/');
		}}
		closeButton={true}
		closeOnBackgroundClick={false}
		className="lobby-invite-modal flex flex-col gap-4 items-center justify-between"
	>
		<div
			className="lobby-invite-modal-content flex flex-col gap-4 items-center justify-center w-full"
		>
			<h1>Welcome</h1>
			{username && avatar && gamemode && <div
				className="flex flex-col gap-4 items-center justify-center w-full"
			>
				<p>
					Let's play pong  with
				</p>
				<div
					className="flex gap-1 items-center"
				>
					<Avatar
						name={username}
						src={avatar}
						// size="sm"
					/>
					<h2>
						{username} in {gamemode}
					</h2>
				</div>
			</div>}
			<p>
				Please login or register to join the fun !
			</p>
		</div>
		<div
			className='flex flex-col gap-4 w-full'
		>
			<GoogleAuthButton />
			<FortyTwoAuthButton
				isOpen={isOpen}
			/>
			<Separator/>
			<div
				className="flex gap-4 items-center w-full"
				>
				<Button
					onClick={() => {
						onChoice('login');
					}}
					className="primary"
					>
					Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
				</Button>
				<p>or</p>
				<Button
					onClick={() => {
						onChoice('register');
					}}
					>
					Register <i className="fa-regular fa-address-card"></i>
				</Button>
			</div>
		</div>
	</Modal>

}