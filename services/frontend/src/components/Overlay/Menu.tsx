import Babact from "babact";
import './overlay.css'
import { useAuth } from "../../contexts/useAuth";
import Card from "../../ui/Card";
import { Link } from "babact-router-dom";
import Button from "../../ui/Button";
import PopHover from "../../ui/PopHover";
import { useLobby } from "../../contexts/useLobby";

export default function Menu({
		selected,
		setSelected
	}: {
		selected: string,
		setSelected: (selected: string) => void
	}){

	const {me} = useAuth();

	const { lobby } = useLobby();

	const disabledMessage = () => {
		if (!me)
			return <div className='menu-pophover'>Log in to play online</div>;
		if (lobby && lobby.leader_account_id !== me.account_id)
			return <div className='menu-pophover'>You must be leader of the lobby</div>;
		if (lobby && !lobby.state?.joinable)
			return <div className='menu-pophover'>Cannot change mode while lobby is {lobby.state.type}</div>;
		return '';
	}

	return <Card className={`menu bottom flex items-center justify-center gap-2`}>

			<Link to='/' className={`button ghost ${window.location.pathname === '/' && !selected ? 'active' : ''}`}>
				<i className="fa-solid fa-house"></i><p>Home</p>
			</Link>
			{me && <Button
				className={`button ghost ${selected === 'settings' ? 'active' : ''}`}
				onClick={() => setSelected(selected !== 'settings' ? 'settings' : null)}
			>
				<i className="fa-solid fa-sliders"></i><p>Settings</p>
			</Button>}
			<Button
				disabled={!me || (lobby && lobby.leader_account_id !== me.account_id) || lobby && !lobby.state?.joinable}
				className={`button ghost ${selected === 'online' ? 'active' : ''}`}
				onClick={() => setSelected(selected !== 'online' ? 'online' : null)}
			>
				<PopHover content={disabledMessage()} className="flex items-center">
					<i className="fa-solid fa-globe"></i><p>Online</p>
				</PopHover>
			</Button>

			<Link to='/local' className={`button ghost ${window.location.pathname.startsWith('/local') && !selected ? 'active' : ''}`}>
				<i className="fa-solid fa-network-wired"></i><p>Local</p>
			</Link>
		</Card>
}